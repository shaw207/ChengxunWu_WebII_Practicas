// src/controllers/task.controller.js
import { tasks } from '../data/task.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/task
export const getAll = (req, res) => {
  let result = [...tasks];
  const { priority, completed, limit, offset, sortBy } = req.query;

  if (priority) {
    result = result.filter(t => t.priority === priority);
  }

  if (completed !== undefined) {
    result = result.filter(t => t.completed === (completed === 'true'));
  }

  if (sortBy === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'dueDate') {
    result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  const off = parseInt(offset) || 0;
  const lim = parseInt(limit) || result.length;

  res.json(result.slice(off, off + lim));
};

// GET /api/task/:id
export const getById = (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) throw ApiError.notFound(`Task with ID ${id} not found`);

  res.json(task);
};

// POST /api/task
export const create = (req, res) => {
  const { title, description, priority, completed, dueDate, tags } = req.body;

  const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newTask = {
    id: newId,
    title,
    description: description || null,
    priority: priority || 'low',
    completed: !!completed,
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
};

// PUT /api/task/:id
export const update = (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) throw ApiError.notFound(`Task with ID ${id} not found`);

  const { title, description, priority, completed, dueDate, tags } = req.body;
  const createdAt = tasks[index].createdAt;
  const updatedAt = new Date().toISOString();

  const updated = {
    id,
    title,
    description: description || null,
    priority: priority || 'low',
    completed: !!completed,
    dueDate: dueDate || null,
    tags: Array.isArray(tags) ? tags : [],
    createdAt,
    updatedAt,
  };

  tasks[index] = updated;
  res.json(updated);
};

// PATCH /api/task/:id
export const partialUpdate = (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) throw ApiError.notFound(`Task with ID ${id} not found`);

  const updatedAt = new Date().toISOString();
  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt,
  };

  res.json(tasks[index]);
};

// PATCH /api/task/:id/toggle
export const toggle = (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) throw ApiError.notFound(`Task with ID ${id} not found`);

  tasks[index].completed = !tasks[index].completed;
  tasks[index].updatedAt = new Date().toISOString();

  res.json(tasks[index]);
};

// DELETE /api/task/:id
export const remove = (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) throw ApiError.notFound(`Task with ID ${id} not found`);

  tasks.splice(index, 1);
  res.status(204).end();
};
