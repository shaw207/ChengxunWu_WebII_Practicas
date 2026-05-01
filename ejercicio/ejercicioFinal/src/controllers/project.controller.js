import Client from '../models/Client.js';
import Project from '../models/Project.js';
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

const ensureClientBelongsToCompany = async (req, clientId) => {
  const client = await Client.findOne(companyFilter(req, { _id: clientId }));

  if (!client) {
    throw AppError.notFound('Cliente', 'CLIENT_NOT_FOUND');
  }

  return client;
};

const findProjectForCompany = async (req, id, options = {}) => {
  const query = options.withDeleted ? Project.findOneWithDeleted(companyFilter(req, { _id: id })) : Project.findOne(companyFilter(req, { _id: id }));
  const project = await query.populate('client');

  if (!project) {
    throw AppError.notFound('Proyecto', 'PROJECT_NOT_FOUND');
  }

  return project;
};

export const createProject = async (req, res, next) => {
  try {
    requireCompany(req.user);
    await ensureClientBelongsToCompany(req, req.body.client);

    const duplicated = await Project.findOne(companyFilter(req, { projectCode: req.body.projectCode }));

    if (duplicated) {
      throw AppError.conflict('Ya existe un proyecto con ese codigo en la compania', 'PROJECT_CODE_EXISTS');
    }

    const project = await Project.create({
      ...req.body,
      user: req.user._id,
      company: req.user.company
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const { page, limit, skip } = buildPagination(req.query);
    const filter = companyFilter(req);

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    if (req.query.active !== undefined) {
      filter.active = req.query.active;
    }

    const sort = buildSort(req.query, ['createdAt', 'name', 'projectCode']);
    const [projects, totalItems] = await Promise.all([
      Project.find(filter).populate('client').sort(sort).skip(skip).limit(limit),
      Project.countDocuments(filter)
    ]);

    res.json({
      projects,
      pagination: paginationMeta({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const listArchivedProjects = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const { page, limit, skip } = buildPagination(req.query);
    const filter = companyFilter(req, { deleted: true });
    const [projects, totalItems] = await Promise.all([
      Project.findDeleted(filter).populate('client').sort({ deletedAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(filter).setOptions({ withDeleted: true })
    ]);

    res.json({
      projects,
      pagination: paginationMeta({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const project = await findProjectForCompany(req, req.params.id);
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    requireCompany(req.user);

    if (req.body.client) {
      await ensureClientBelongsToCompany(req, req.body.client);
    }

    if (req.body.projectCode) {
      const duplicated = await Project.findOne(companyFilter(req, { projectCode: req.body.projectCode, _id: { $ne: req.params.id } }));

      if (duplicated) {
        throw AppError.conflict('Ya existe un proyecto con ese codigo en la compania', 'PROJECT_CODE_EXISTS');
      }
    }

    const project = await Project.findOneAndUpdate(companyFilter(req, { _id: req.params.id }), req.body, {
      new: true,
      runValidators: true
    }).populate('client');

    if (!project) {
      throw AppError.notFound('Proyecto', 'PROJECT_NOT_FOUND');
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const project = await findProjectForCompany(req, req.params.id, { withDeleted: true });

    if (req.query.soft) {
      await project.softDelete();
      return res.json({
        ack: true,
        deleted: true,
        soft: true
      });
    }

    await Project.deleteOne({ _id: project._id }).setOptions({ withDeleted: true });
    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const restoreProject = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const project = await findProjectForCompany(req, req.params.id, { withDeleted: true });

    if (!project.deleted) {
      return res.json({ project });
    }

    await project.restore();
    res.json({ project });
  } catch (error) {
    next(error);
  }
};
