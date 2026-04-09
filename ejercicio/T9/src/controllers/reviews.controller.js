const notImplemented = (res) => {
  res.status(501).json({
    error: true,
    message: 'Pendiente de implementar',
  });
};

export const getBookReviews = async (req, res) => {
  notImplemented(res);
};

export const createReview = async (req, res) => {
  notImplemented(res);
};

export const deleteReview = async (req, res) => {
  notImplemented(res);
};
