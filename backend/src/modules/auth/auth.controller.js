const authService =
  require("./auth.service");

const register = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await authService.register(
        req.body
      );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await authService.verifyEmail(
        req.query.token
      );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
};