const defaultInterval = 60_000;

export const markOverdueLoans = async (prisma) => {
  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'ACTIVE',
      returnDate: null,
      dueDate: {
        lt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      book: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (overdueLoans.length === 0) {
    return [];
  }

  await prisma.loan.updateMany({
    where: {
      id: {
        in: overdueLoans.map((loan) => loan.id),
      },
    },
    data: {
      status: 'OVERDUE',
    },
  });

  return overdueLoans;
};

export const startOverdueNotifier = (prisma) => {
  const run = async () => {
    const overdueLoans = await markOverdueLoans(prisma);

    if (overdueLoans.length > 0) {
      console.log(
        JSON.stringify({
          type: 'overdue-loans',
          count: overdueLoans.length,
          loans: overdueLoans.map((loan) => ({
            loanId: loan.id,
            userEmail: loan.user.email,
            bookTitle: loan.book.title,
            dueDate: loan.dueDate,
          })),
        }),
      );
    }
  };

  void run();

  const interval = Number(process.env.OVERDUE_NOTIFICATION_INTERVAL_MS) || defaultInterval;
  const timer = setInterval(() => {
    void run();
  }, interval);

  timer.unref?.();

  return timer;
};
