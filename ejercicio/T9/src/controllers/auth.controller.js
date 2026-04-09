const notImplemented = (res) => {
  res.status(501).json({
    error: true,
    message: 'Pendiente de implementar',
  });
};

export const register = async (req, res) => {
  notImplemented(res);
};

export const login = async (req, res) => {
  notImplemented(res);
};

export const getMe = async (req, res) => {
  notImplemented(res);
};
