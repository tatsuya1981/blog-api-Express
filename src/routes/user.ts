import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Post from '../models/post';
import Category from '../models/category';

const router = express.Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: 'ユーザーが見つからないよ！' });
  }
  res.json({
    user: {
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      iconURL: user.iconUrl,
    },
  });
});

router.get('/posts', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
    }
    const status = req.query.status ? Number(req.query.status) : undefined;
    const where = status !== undefined ? { userId: req.user.id, status } : { userId: req.user?.id };

    const posts = await Post.findAll({
      where,
      include: [{ model: Category, through: { attributes: [] } }],
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

export default router;
