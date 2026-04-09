import prisma from '../config/prisma.js';

const borrowedStatuses = ['ACTIVE', 'OVERDUE'];

const parseBookPayload = (body) => {
  const data = { ...body };

  if (data.available === undefined && data.copies !== undefined) {
    data.available = data.copies;
  }

  return data;
};

export const getBooks = async (req, res, next) => {
  try {
    const query = req.validated?.query ?? req.query;
    const {
      author,
      available,
      genre,
      limit,
      page,
      search,
    } = query;

    const where = {
      ...(author && {
        author: {
          contains: author,
          mode: 'insensitive',
        },
      }),
      ...(genre && {
        genre: {
          contains: genre,
          mode: 'insensitive',
        },
      }),
      ...(available !== undefined && {
        available: available ? { gt: 0 } : { equals: 0 },
      }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            author: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            isbn: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: {
          title: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const bookId = params.id;

    const [book, ratingSummary] = await Promise.all([
      prisma.book.findUnique({
        where: { id: bookId },
      }),
      prisma.review.aggregate({
        where: { bookId },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    if (!book) {
      return res.status(404).json({
        error: true,
        message: 'Libro no encontrado',
      });
    }

    return res.json({
      data: {
        ...book,
        reviewSummary: {
          averageRating: ratingSummary._avg.rating,
          totalReviews: ratingSummary._count.id,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const body = req.validated?.body ?? req.body;
    const data = parseBookPayload(body);

    const book = await prisma.book.create({
      data,
    });

    res.status(201).json({
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const body = req.validated?.body ?? req.body;
    const bookId = params.id;
    const currentBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!currentBook) {
      return res.status(404).json({
        error: true,
        message: 'Libro no encontrado',
      });
    }

    const activeLoans = await prisma.loan.count({
      where: {
        bookId,
        status: {
          in: borrowedStatuses,
        },
      },
    });

    const nextCopies = body.copies ?? currentBook.copies;
    const nextAvailable =
      body.available ??
      (body.copies !== undefined
        ? nextCopies - activeLoans
        : currentBook.available);

    if (nextCopies < activeLoans) {
      return res.status(400).json({
        error: true,
        message: 'Las copias no pueden ser menores que los prestamos activos',
      });
    }

    if (nextAvailable < 0 || nextAvailable > nextCopies) {
      return res.status(400).json({
        error: true,
        message: 'Inventario invalido',
      });
    }

    if (activeLoans > 0 && nextAvailable !== nextCopies - activeLoans) {
      return res.status(400).json({
        error: true,
        message: 'El inventario debe respetar los prestamos activos',
      });
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...body,
        available: nextAvailable,
      },
    });

    return res.json({
      data: book,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const bookId = params.id;

    const currentBook = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!currentBook) {
      return res.status(404).json({
        error: true,
        message: 'Libro no encontrado',
      });
    }

    const activeLoans = await prisma.loan.count({
      where: {
        bookId,
        status: {
          in: borrowedStatuses,
        },
      },
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        error: true,
        message: 'No se puede eliminar un libro con prestamos activos',
      });
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    return res.json({
      message: 'Libro eliminado correctamente',
    });
  } catch (error) {
    return next(error);
  }
};
