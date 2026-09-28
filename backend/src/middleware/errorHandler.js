export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: "server_error",
    message: err.message || "Unexpected server error",
  });
}
