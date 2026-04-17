export const sendResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Note: Errors are largely handled by your existing errorHandler.js, 
// but this utility can be used for manual triggers.
export const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};