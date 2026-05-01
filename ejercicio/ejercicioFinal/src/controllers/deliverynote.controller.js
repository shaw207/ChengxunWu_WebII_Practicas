import Client from '../models/Client.js';
import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import { optimizeSignatureImage } from '../services/image.service.js';
import { generateDeliveryNotePdf } from '../services/pdf.service.js';
import { uploadDeliveryNotePdf, uploadSignatureImage } from '../services/storage.service.js';
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

const populateDeliveryNote = (query) => {
  return query.populate('user', 'email name lastName').populate('client').populate('project');
};

const findProjectForCompany = async (req, projectId) => {
  const project = await Project.findOne(companyFilter(req, { _id: projectId }));

  if (!project) {
    throw AppError.notFound('Proyecto', 'PROJECT_NOT_FOUND');
  }

  const client = await Client.findOne(companyFilter(req, { _id: project.client }));

  if (!client) {
    throw AppError.notFound('Cliente', 'CLIENT_NOT_FOUND');
  }

  return project;
};

const findDeliveryNoteForCompany = async (req, id, options = {}) => {
  const query = options.withDeleted
    ? DeliveryNote.findOneWithDeleted(companyFilter(req, { _id: id }))
    : DeliveryNote.findOne(companyFilter(req, { _id: id }));
  const deliveryNote = await populateDeliveryNote(query);

  if (!deliveryNote) {
    throw AppError.notFound('Albaran', 'DELIVERY_NOTE_NOT_FOUND');
  }

  return deliveryNote;
};

export const createDeliveryNote = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const project = await findProjectForCompany(req, req.body.project);

    const deliveryNote = await DeliveryNote.create({
      ...req.body,
      user: req.user._id,
      company: req.user.company,
      client: project.client,
      project: project._id
    });

    res.status(201).json({ deliveryNote });
  } catch (error) {
    next(error);
  }
};

export const listDeliveryNotes = async (req, res, next) => {
  try {
    requireCompany(req.user);

    const { page, limit, skip } = buildPagination(req.query);
    const filter = companyFilter(req);

    if (req.query.project) {
      filter.project = req.query.project;
    }

    if (req.query.client) {
      filter.client = req.query.client;
    }

    if (req.query.format) {
      filter.format = req.query.format;
    }

    if (req.query.signed !== undefined) {
      filter.signed = req.query.signed;
    }

    if (req.query.from || req.query.to) {
      filter.workDate = {};
      if (req.query.from) filter.workDate.$gte = req.query.from;
      if (req.query.to) filter.workDate.$lte = req.query.to;
    }

    const sort = buildSort(req.query, ['workDate', 'createdAt']);
    const [deliveryNotes, totalItems] = await Promise.all([
      populateDeliveryNote(DeliveryNote.find(filter)).sort(sort).skip(skip).limit(limit),
      DeliveryNote.countDocuments(filter)
    ]);

    res.json({
      deliveryNotes,
      pagination: paginationMeta({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNote = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const deliveryNote = await findDeliveryNoteForCompany(req, req.params.id);
    res.json({ deliveryNote });
  } catch (error) {
    next(error);
  }
};

export const downloadDeliveryNotePdf = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const deliveryNote = await findDeliveryNoteForCompany(req, req.params.id);
    const pdf = await generateDeliveryNotePdf(deliveryNote);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=deliverynote-${deliveryNote._id}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

export const signDeliveryNote = async (req, res, next) => {
  try {
    requireCompany(req.user);

    if (!req.file) {
      throw AppError.badRequest('La firma es obligatoria', 'SIGNATURE_REQUIRED');
    }

    const deliveryNote = await findDeliveryNoteForCompany(req, req.params.id);

    if (deliveryNote.signed) {
      throw AppError.badRequest('El albaran ya esta firmado', 'DELIVERY_NOTE_ALREADY_SIGNED');
    }

    const optimizedSignature = await optimizeSignatureImage(req.file.buffer);
    const signature = await uploadSignatureImage({
      buffer: optimizedSignature,
      deliveryNoteId: deliveryNote._id.toString()
    });

    deliveryNote.signed = true;
    deliveryNote.signedAt = new Date();
    deliveryNote.signatureUrl = signature.url;
    await deliveryNote.save();

    const populatedDeliveryNote = await findDeliveryNoteForCompany(req, deliveryNote._id);
    const pdfBuffer = await generateDeliveryNotePdf(populatedDeliveryNote);
    const pdf = await uploadDeliveryNotePdf({
      buffer: pdfBuffer,
      deliveryNoteId: deliveryNote._id.toString()
    });

    populatedDeliveryNote.pdfUrl = pdf.url;
    await populatedDeliveryNote.save();

    res.json({
      deliveryNote: populatedDeliveryNote,
      signatureUrl: signature.url,
      pdfUrl: pdf.url
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    requireCompany(req.user);
    const deliveryNote = await findDeliveryNoteForCompany(req, req.params.id, { withDeleted: true });

    if (deliveryNote.signed) {
      throw AppError.badRequest('No se puede borrar un albaran firmado', 'SIGNED_DELIVERY_NOTE_LOCKED');
    }

    await DeliveryNote.deleteOne({ _id: deliveryNote._id }).setOptions({ withDeleted: true });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
