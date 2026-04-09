const notImplemented = (res) => {
  res.status(501).json({
    error: true,
    message: 'Pendiente de implementar',
  });
};

export const getBooks = async (req, res) => {
  notImplemented(res);
};

export const getBookById = async (req, res) => {
  notImplemented(res);
};

export const createBook = async (req, res) => {
  notImplemented(res);
};

export const updateBook = async (req, res) => {
  notImplemented(res);
};

export const deleteBook = async (req, res) => {
  notImplemented(res);
};
