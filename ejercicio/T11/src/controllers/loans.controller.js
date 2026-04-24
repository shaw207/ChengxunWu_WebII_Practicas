import prisma from '../config/prisma.js';
import { markOverdueLoans } from '../utils/overdue.js';

const borrowedStatuses = ['ACTIVE', 'OVERDUE'];
const loanDurationInDays = 14;
const maxActiveLoans = 3;

const loanInclude = {
  book: {
    select: {
      id: true,
      isbn: true,
      title: true,
      author: true,
      genre: true,
      available: true,
    },
  },
};

const adminLoanInclude = {
  ...loanInclude,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  },
};

export const getMyLoans = async (req, res, next) => {
  try {
    await markOverdueLoans(prisma);

    const loans = await prisma.loan.findMany({
      where: {
        userId: req.user.id,
      },
      include: loanInclude,
      orderBy: {
        loanDate: 'desc',
      },
    });

    res.json({
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLoans = async (req, res, next) => {
  try {
    await markOverdueLoans(prisma);

    const loans = await prisma.loan.findMany({
      include: adminLoanInclude,
      orderBy: {
        loanDate: 'desc',
      },
    });

    res.json({
      data: loans,
    });
  } catch (error) {
    next(error);
  }
};

export const createLoan = async (req, res, next) => {
  try {
    const body = req.validated?.body ?? req.body;
    const { bookId } = body;
    const dueDate = new Date(Date.now() + loanDurationInDays * 24 * 60 * 60 * 1000);

    const loan = await prisma.$transaction(async (tx) => {
      const activeLoansCount = await tx.loan.count({
        where: {
          userId: req.user.id,
          status: {
            in: borrowedStatuses,
          },
        },
      });

      if (activeLoansCount >= maxActiveLoans) {
        return {
          error: {
            status: 400,
            message: 'No puedes tener mas de 3 prestamos activos',
          },
        };
      }

      const existingLoan = await tx.loan.findFirst({
        where: {
          userId: req.user.id,
          bookId,
          status: {
            in: borrowedStatuses,
          },
        },
      });

      if (existingLoan) {
        return {
          error: {
            status: 400,
            message: 'No puedes pedir prestado el mismo libro dos veces',
          },
        };
      }

      const book = await tx.book.findUnique({
        where: {
          id: bookId,
        },
      });

      if (!book) {
        return {
          error: {
            status: 404,
            message: 'Libro no encontrado',
          },
        };
      }

      if (book.available <= 0) {
        return {
          error: {
            status: 400,
            message: 'No hay ejemplares disponibles',
          },
        };
      }

      const inventoryUpdate = await tx.book.updateMany({
        where: {
          id: bookId,
          available: {
            gt: 0,
          },
        },
        data: {
          available: {
            decrement: 1,
          },
        },
      });

      if (inventoryUpdate.count === 0) {
        return {
          error: {
            status: 400,
            message: 'No hay ejemplares disponibles',
          },
        };
      }

      const createdLoan = await tx.loan.create({
        data: {
          userId: req.user.id,
          bookId,
          dueDate,
        },
        include: loanInclude,
      });

      return { data: createdLoan };
    });

    if (loan.error) {
      return res.status(loan.error.status).json({
        error: true,
        message: loan.error.message,
      });
    }

    return res.status(201).json({
      data: loan.data,
    });
  } catch (error) {
    return next(error);
  }
};

export const returnLoan = async (req, res, next) => {
  try {
    const params = req.validated?.params ?? req.params;
    const loanId = params.id;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: {
          id: loanId,
        },
        include: adminLoanInclude,
      });

      if (!loan) {
        return {
          error: {
            status: 404,
            message: 'Prestamo no encontrado',
          },
        };
      }

      const canReturn =
        loan.userId === req.user.id ||
        req.user.role === 'LIBRARIAN' ||
        req.user.role === 'ADMIN';

      if (!canReturn) {
        return {
          error: {
            status: 403,
            message: 'No autorizado para devolver este prestamo',
          },
        };
      }

      if (loan.status === 'RETURNED' || loan.returnDate) {
        return {
          error: {
            status: 400,
            message: 'El libro ya fue devuelto',
          },
        };
      }

      await tx.book.update({
        where: {
          id: loan.bookId,
        },
        data: {
          available: {
            increment: 1,
          },
        },
      });

      const returnedLoan = await tx.loan.update({
        where: {
          id: loanId,
        },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
        include: adminLoanInclude,
      });

      return { data: returnedLoan };
    });

    if (result.error) {
      return res.status(result.error.status).json({
        error: true,
        message: result.error.message,
      });
    }

    return res.json({
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};
