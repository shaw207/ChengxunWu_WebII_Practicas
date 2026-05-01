import Client from '../models/Client.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, buildSort, paginationMeta } from '../utils/query.js';

const requireCompany = (user) => {
  if (!user.company) {
    throw AppError.badRequest('El usuario no tiene compania asociada', 'COMPANY_REQUIRED');
  }
};

const companyFilter = (req, extra = {}) => ({
  company: req.user.company,
  ...extra
});

const findClientForCompany = async (req, id, options = {}) => {
  const query = options.withDeleted ? Client.findOneWithDeleted(companyFilter(req, { _id: id })) : Client.findOne(companyFilter(req, { _id: id }));
  const client = await query;

  if (!client) {
    throw AppError.notFound('Cliente', 'CLIENT_NOT_FOUND');
  }

  return client;
};

export const createClient = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const duplicated = await Client.findOne(companyFilter(req, { cif: req.body.cif }));

    if (duplicated) {
      throw AppError.conflict('Ya existe un cliente con ese CIF en la compania', 'CLIENT_CIF_EXISTS');
    }

    const client = await Client.create({
      ...req.body,
      user: req.user._id,
      company: req.user.company
    });

    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
};

export const listClients = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const { page, limit, skip } = buildPagination(req.query);
    const filter = companyFilter(req);

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    const sort = buildSort(req.query, ['createdAt', 'name', 'cif']);
    const [clients, totalItems] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(limit),
      Client.countDocuments(filter)
    ]);

    res.json({
      clients,
      pagination: paginationMeta({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const listArchivedClients = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const { page, limit, skip } = buildPagination(req.query);
    const filter = companyFilter(req, { deleted: true });
    const [clients, totalItems] = await Promise.all([
      Client.findDeleted(filter).sort({ deletedAt: -1 }).skip(skip).limit(limit),
      Client.countDocuments(filter).setOptions({ withDeleted: true })
    ]);

    res.json({
      clients,
      pagination: paginationMeta({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const client = await findClientForCompany(req, req.params.id);
    res.json({ client });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    requireCompany(req.user);

    if (req.body.cif) {
      const duplicated = await Client.findOne(companyFilter(req, { cif: req.body.cif, _id: { $ne: req.params.id } }));

      if (duplicated) {
        throw AppError.conflict('Ya existe un cliente con ese CIF en la compania', 'CLIENT_CIF_EXISTS');
      }
    }

    const client = await Client.findOneAndUpdate(companyFilter(req, { _id: req.params.id }), req.body, {
      new: true,
      runValidators: true
    });

    if (!client) {
      throw AppError.notFound('Cliente', 'CLIENT_NOT_FOUND');
    }

    res.json({ client });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const client = await findClientForCompany(req, req.params.id, { withDeleted: true });

    if (req.query.soft) {
      await client.softDelete();
      return res.json({
        ack: true,
        deleted: true,
        soft: true
      });
    }

    await Client.deleteOne({ _id: client._id }).setOptions({ withDeleted: true });
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const restoreClient = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const client = await findClientForCompany(req, req.params.id, { withDeleted: true });

    if (!client.deleted) {
      return res.json({ client });
    }

    await client.restore();
    res.json({ client });
  } catch (error) {
    next(error);
  }
};
