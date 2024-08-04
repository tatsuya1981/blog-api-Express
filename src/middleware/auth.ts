import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export interface AuthRequest extends Request {
  user?: User;
}

const getJwt = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('環境変数にJWT_SECRETが設定されていません');
  }
  return secret;
};

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: '認証のヘッダーが無いよ！' });
  }
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'トークンが無いみたいだよ〜！' });
  }
  try {
    const JwtSecret = getJwt();
    const decoded = jwt.verify(token, JwtSecret) as {
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
