import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';

// POST /api/auth/register
export const registerCtrl = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 400);
    }

    const hashedPassword = await encrypt(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      token: tokenSign(user),
      user: user.toJSON()
    });
  } catch (err) {
    return handleHttpError(res, 'ERROR_REGISTER_USER');
  }
};

// POST /api/auth/login
export const loginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return handleHttpError(res, 'INVALID_CREDENTIALS', 401);
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return handleHttpError(res, 'INVALID_CREDENTIALS', 401);
    }

    res.status(201).json({
      token: tokenSign(user),
      user: user.toJSON()
    });
  } catch (err) {
    return handleHttpError(res, 'ERROR_LOGIN_USER');
  }
};

// GET /api/auth/me
export const getMeCtrl = async (req, res) => {
  try {
    return res.status(200).json(req.user.toJSON());
  } catch (err) {
    return handleHttpError(res, 'ERROR_GET_ME');
  }
};
