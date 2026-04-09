const notImplemented = (res) => {
  res.status(501).json({
    error: true,
    message: 'Pendiente de implementar',
  });
};

export const getMyLoans = async (req, res) => {
  notImplemented(res);
};

export const getAllLoans = async (req, res) => {
  notImplemented(res);
};

export const createLoan = async (req, res) => {
  notImplemented(res);
};

export const returnLoan = async (req, res) => {
  notImplemented(res);
};
