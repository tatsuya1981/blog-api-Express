import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Post from '../models/post';
import Category from '../models/category';
import User from '../models/user';
import sequelize from '../config/database';

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

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const post = await Post.postWithCategories(Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: '記事が見つからないよ！' });
  }
  res.json({ post });
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  if (!req.user?.id) {
    return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
  }
  const post = await Post.build({
    ...req.body.post,
    userId: req.user?.id,
  });
  await post.save();
  res.status(201).json(post);
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const t = await sequelize.transaction();
  if (!req.user?.id) {
    return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
  }
  if (!req.params.id) {
    return res.status(404).json({ error: '記事は見つかりませんでした！' });
  }
  const postUser = await Post.postWithCategories(Number(req.params.id), t);

  if (!postUser) {
    return res.status(404).json({ error: '記事は見つかりませんでした！' });
  }

  if (postUser.userId !== req.user.id) {
    return res.status(403).json({ error: '操作する権限がありません！' });
  }

  const updatedPost = await Post.updateWithCategories(Number(req.params.id), req.user.id, req.body.post, t);
  await t.commit();

  res.json({ post: updatedPost });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const post = await Post.postWithCategories(Number(req.params.id));
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
