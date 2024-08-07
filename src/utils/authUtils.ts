import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const PEPPER = process.env.MY_PEPPER;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 環境変数が設定されてません');
}

export const hashPassword = async (password: string): Promise<string> => {
  const pepperPassword = password + PEPPER;
  return await bcrypt.hash(pepperPassword, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const pepperPassword = password + PEPPER;
  return await bcrypt.compare(pepperPassword, hashedPassword);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};
