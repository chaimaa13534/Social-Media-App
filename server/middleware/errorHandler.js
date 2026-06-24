/**
 * Global error handler — must be the LAST middleware registered.
 */
module.exports = function errorHandler(err, req, res, _next) {
  const status  = err.status  || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(status).json({ success: false, message });
};
