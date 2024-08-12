import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Post from '../models/post';
import Category from '../models/category';
import User from '../models/user';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status ? Number(req.query.status) : undefined;
    const where = status !== undefined ? { status } : {};
    const posts = await Post.findAll({
      where,
      include: [
        { model: Category, through: { attributes: [] } },
        { model: User, attributes: ['id', 'loginId', 'name', 'iconUrl'] },
      ],
    });

    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  const post = await Post.findByPk(req.params.id, {
    include: [{ model: Category, through: { attributes: [] } }],
  });
  if (!post) {
    return res.status(404).json({ error: '記事が見つからないよ！' });
  }
  res.json({ post });
});

router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  if (!req.user?.id) {
    return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
  }
  const postWithCategories = await Post.createCategories({
    ...req.body.post,
    userId: req.user?.id,
  });

  res.status(201).json(postWithCategories);
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  if (!req.user?.id) {
    return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
  }

  const updatedPost = await Post.updateWithCategories(Number(req.params.id), req.user.id, req.body.post);

  res.json({ post: updatedPost });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ error: '記事が見つからないよ！' });
  }
  if (post.userId !== req.user?.id) {
    return res.status(403).json({ error: '操作する権限がないよ！！' });
  }
  await post.destroy();
  res.status(200).json({ delete: `記事が正常に削除されました！  ※※ 削除された記事ＩＤ：${post.id} ※※` });
});

export default router;
