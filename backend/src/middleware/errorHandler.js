const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    error: err.publicMessage || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.details = err.message;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorHandler,
};
