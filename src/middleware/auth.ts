import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { getEnv } from '../config/envValidation';

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: '認証が必要です！' });
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '有効な認証トークンが必要です！' });
  }
  try {
    const jwtSecret = getEnv('JWT_SECRET');
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
    };
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new Error('ユーザーが見つからないよ！');
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '認証に失敗！: ' + (error as Error).message });
  }
};
