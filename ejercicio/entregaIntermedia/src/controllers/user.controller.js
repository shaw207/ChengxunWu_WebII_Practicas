import { randomInt } from 'node:crypto';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateTokenPair } from '../utils/token.js';
import { emitUserEvent } from '../services/notification.service.js';

const generateVerificationCode = () => {
  return randomInt(100000, 1000000).toString();
};

const userAuthData = (user) => ({
  id: user._id,
  email: user.email,
  status: user.status,
  role: user.role
});

const plainAddress = (address = {}) => ({
  street: address.street || null,
  number: address.number || null,
  postal: address.postal || null,
  city: address.city || null,
  province: address.province || null
});

const fullName = (user) => [user.name, user.lastName].filter(Boolean).join(' ');

const saveTokens = async (user) => {
  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.refreshTokenExpiresAt = tokens.refreshTokenExpiresAt;
  await user.save();

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const verifiedUser = await User.findOne({ email, status: 'verified' });

    if (verifiedUser) {
      throw AppError.conflict('El email ya esta registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    let user = await User.findOne({ email }).select('+password +verificationCode +refreshToken +refreshTokenExpiresAt');
    const isNewUser = !user;

    if (!user) {
      user = new User({
        email,
        password: hashedPassword,
        verificationCode,
        verificationAttempts: 3,
        role: 'admin',
        status: 'pending'
      });
    } else {
      user.password = hashedPassword;
      user.verificationCode = verificationCode;
      user.verificationAttempts = 3;
      user.role = 'admin';
      user.status = 'pending';
    }

    await user.save();
    const tokens = await saveTokens(user);

    emitUserEvent('user:registered', {
      userId: user._id.toString(),
      email: user.email
    });

    res.status(isNewUser ? 201 : 200).json({
      user: userAuthData(user),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const validateEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+verificationCode');

    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (user.status === 'verified') {
      return res.json({
        ack: true,
        message: 'Email validado'
      });
    }

    if (user.verificationAttempts <= 0) {
      throw AppError.tooManyRequests('Intentos agotados', 'VALIDATION_ATTEMPTS_EXHAUSTED');
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts = Math.max(user.verificationAttempts - 1, 0);
      await user.save();

      if (user.verificationAttempts === 0) {
        throw AppError.tooManyRequests('Intentos agotados', 'VALIDATION_ATTEMPTS_EXHAUSTED');
      }

      throw AppError.badRequest('Codigo incorrecto', 'INVALID_VERIFICATION_CODE');
    }

    user.status = 'verified';
    user.verificationCode = null;
    user.verificationAttempts = 3;
    await user.save();

    emitUserEvent('user:verified', {
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      ack: true,
      message: 'Email validado'
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken +refreshTokenExpiresAt');

    if (!user) {
      throw AppError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
    }

    const tokens = await saveTokens(user);

    res.json({
      user: userAuthData(user),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const updatePersonalData = async (req, res, next) => {
  try {
    const { name, lastName, nif, address } = req.body;

    req.user.name = name;
    req.user.lastName = lastName;
    req.user.nif = nif;

    if (address) {
      req.user.address = {
        ...plainAddress(req.user.address),
        ...address
      };
    }

    await req.user.save();

    res.json({
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const user = req.user;
    const data = req.body;
    let company;

    if (data.isFreelance) {
      if (!user.nif || !user.name || !user.lastName) {
        throw AppError.badRequest('Completa los datos personales antes de crear una compania de autonomo', 'PERSONAL_DATA_REQUIRED');
      }

      const freelanceData = {
        owner: user._id,
        name: fullName(user),
        cif: user.nif,
        address: plainAddress(user.address),
        isFreelance: true
      };

      company = await Company.findOne({ cif: freelanceData.cif });

      if (!company) {
        company = await Company.create(freelanceData);
        user.role = 'admin';
      } else {
        user.role = company.owner.toString() === user._id.toString() ? 'admin' : 'guest';
      }
    } else {
      company = await Company.findOne({ cif: data.cif });

      if (!company) {
        company = await Company.create({
          owner: user._id,
          name: data.name,
          cif: data.cif,
          address: data.address,
          isFreelance: false
        });
        user.role = 'admin';
      } else {
        user.role = company.owner.toString() === user._id.toString() ? 'admin' : 'guest';
      }
    }

    user.company = company._id;
    await user.save();

    res.json({
      user: userAuthData(user),
      company
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.user.company) {
      throw AppError.badRequest('El usuario no tiene compania asociada', 'COMPANY_REQUIRED');
    }

    if (!req.file) {
      throw AppError.badRequest('El logo es obligatorio', 'LOGO_REQUIRED');
    }

    const company = await Company.findById(req.user.company);

    if (!company) {
      throw AppError.notFound('Compania', 'COMPANY_NOT_FOUND');
    }

    company.logo = `/uploads/${req.file.filename}`;
    await company.save();

    res.json({
      ack: true,
      logo: company.logo,
      company
    });
  } catch (error) {
    next(error);
  }
};
