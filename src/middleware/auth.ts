import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('認証のヘッダーが無いよ！');
    }
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('トークンが無いみたいだよ〜！');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
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
