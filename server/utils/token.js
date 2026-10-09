import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'drivego_jwt_super_secret_development_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
