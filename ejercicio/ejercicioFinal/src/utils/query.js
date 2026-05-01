export const buildPagination = ({ page = 1, limit = 10 }) => {
  const currentPage = Number(page);
  const perPage = Number(limit);

  return {
    page: currentPage,
    limit: perPage,
    skip: (currentPage - 1) * perPage
  };
};

export const buildSort = ({ sort = 'createdAt', sortBy, order = 'desc' }, allowedFields = []) => {
  const rawSort = sortBy || sort;
  const directionFromPrefix = rawSort?.startsWith('-') ? -1 : 1;
  const field = rawSort?.replace(/^-/, '') || 'createdAt';

  if (!allowedFields.includes(field)) {
    return { createdAt: -1 };
  }

  const direction = sortBy ? (order === 'asc' ? 1 : -1) : directionFromPrefix;
  return { [field]: direction };
};

export const paginationMeta = ({ totalItems, page, limit }) => ({
  totalItems,
  totalPages: Math.ceil(totalItems / limit) || 1,
  currentPage: page,
  limit
});
