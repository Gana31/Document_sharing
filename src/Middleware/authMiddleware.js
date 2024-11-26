import jwt from "jsonwebtoken";
import ServerConfig from "../../config/ServerConfig.js";
import { UserModel } from "../users/index.js";
import { generateTokensAndSetCookies } from "../../utils/jwtCookie.js";
import { ApiError } from "../../utils/ApiError.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, ServerConfig.ACCESS_TOKEN_SECRET);
        req.user = { id: decoded.userId };
        if (!refreshToken) {
          const user = await UserModel.findOne({ where: { id: decoded.userId} })
            if (!user) {
              throw new ApiError(401, "User not found", "AUTH_ERROR");
            }
            generateTokensAndSetCookies(user, res); // Set a new access token
        }
        return next();
      } catch (err) {
        throw new ApiError(401, "Access token expired or invalid", "AUTH_ERROR", err);
      }
    }

    // If no access token, check for refresh token
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, ServerConfig.REFRESH_TOKEN_SECRET);

        const user = await UserModel.findOne({ where: { id: decoded.userId} });
        if (!user) {
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          throw new ApiError(401, "Invalid refresh token", "AUTH_ERROR");
        }

        generateTokensAndSetCookies(user, res);
        req.user = { id: user.id };
        return next();
      } catch (err) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        throw new ApiError(401, "Session expired. Please log in again.", "AUTH_ERROR", err);
      }
    }

    throw new ApiError(401, "Session expired. Please log in again.", "AUTH_ERROR");
  } catch (error) {
    next(new ApiError(401, error.errors[0]?.message || error.message || "Error while authenticate", "From middleware Layer", error.errors || error));
  }
};
