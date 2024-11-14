import { ApiError } from "./ApiError.js";
const ErrorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {

      return res.status(err.statusCode).json({
        success: err.success,
        message: err.message,
        data: err.data,
        layer: err.layer,
        errors: err.errors,
      });
    }
}

export default ErrorHandler;