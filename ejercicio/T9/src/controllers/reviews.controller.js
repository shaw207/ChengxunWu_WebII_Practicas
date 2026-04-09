import prisma from '../config/prisma.js';

const reviewInclude = {
  user: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
};

export const getBookReviews = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const bookId = params.id;

    const [book, reviews, summary] = await Promise.all([
      prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          title: true,
          author: true,
        },
      }),
      prisma.review.findMany({
        where: { bookId },
        include: reviewInclude,
        orderBy: {
          createdAt: 'desc',
        },
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
      data: reviews,
      summary: {
        book,
        averageRating: summary._avg.rating,
        totalReviews: summary._count.id,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const body = req.validated?.body ?? req.body;
    const bookId = params.id;
    const { rating, comment } = body;

    const [book, returnedLoan, existingReview] = await Promise.all([
      prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
        },
      }),
      prisma.loan.findFirst({
        where: {
          userId: req.user.id,
          bookId,
          status: 'RETURNED',
          returnDate: {
            not: null,
          },
        },
        select: {
          id: true,
        },
      }),
      prisma.review.findUnique({
        where: {
          userId_bookId: {
            userId: req.user.id,
            bookId,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!book) {
      return res.status(404).json({
        error: true,
        message: 'Libro no encontrado',
      });
    }

    if (!returnedLoan) {
      return res.status(400).json({
        error: true,
        message: 'Solo puedes reseñar libros que hayas leido y devuelto',
      });
    }

    if (existingReview) {
      return res.status(409).json({
        error: true,
        message: 'Ya existe una reseña para este libro',
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        bookId,
        rating,
        comment,
      },
      include: reviewInclude,
    });

    return res.status(201).json({
      data: review,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const reviewId = params.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        error: true,
        message: 'Reseña no encontrada',
      });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Solo puedes eliminar tu propia reseña',
      });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return res.json({
      message: 'Reseña eliminada correctamente',
    });
  } catch (error) {
    return next(error);
  }
};
