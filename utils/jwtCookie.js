
import jwt from "jsonwebtoken";
import ServerConfig from "../config/ServerConfig.js";


export const generateTokensAndSetCookies = (user1, res) => {

  const accessToken = jwt.sign({ userId: user1.id }, ServerConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: ServerConfig.ACCESS_TOKEN_EXPIRY || '1d', 
  });

  const refreshToken = jwt.sign({ userId: user1.id }, ServerConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: ServerConfig.REFRESH_TOKEN_EXPIRY || '7d', 
  });

  // Store refresh token in the database
  user1.refresh_token = refreshToken;
  user1.save(); 

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: parseDuration(ServerConfig.ACCESS_TOKEN_EXPIRY) || 24 * 60 * 60 * 1000, // Default to 1 day
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: parseDuration(ServerConfig.REFRESH_TOKEN_EXPIRY) || 7 * 24 * 60 * 60 * 1000, // Default to 7 days
  });
  console.log("form the jwtcookeis",user1)
  return {user1,accessToken} 
};


const parseDuration = (duration) => {
  const timeUnit = duration.slice(-1);
  const timeValue = parseInt(duration.slice(0, -1), 10);
  
  switch (timeUnit) {
    case 'd': return timeValue * 24 * 60 * 60 * 1000; 
    case 'h': return timeValue * 60 * 60 * 1000; 
    case 'm': return timeValue * 60 * 1000; 
    case 's': return timeValue * 1000; 
    default: return null; 
  }
};
