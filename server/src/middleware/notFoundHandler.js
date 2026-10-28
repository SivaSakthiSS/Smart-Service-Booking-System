export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      path: req.originalUrl,
      method: req.method
    }
  });
};
