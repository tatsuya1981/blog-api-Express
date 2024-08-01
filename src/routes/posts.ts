import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Post from '../models/post';
import Category from '../models/category';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const status = req.query.status ? Number(req.query.status) : undefined;
    const where = status !== undefined ? { status } : {};
    const posts = await Post.findAll({
      where,
      include: [{ model: Category, through: { attributes: [] } }],
    });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: '投稿記事の一覧が取得できないよ！' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Category, through: { attributes: [] } }],
    });
    if (!post) {
      return res.status(404).json({ error: '記事が見つからないよ！' });
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: '記事の詳細を入手できませんでした！' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, body, status, categoryIds } = req.body.post;

    const post = await Post.create({
      title,
      body,
      status,
      userId: req.user?.id,
    });
    if (categoryIds && categoryIds.length > 0) {
      await (post as any).setCategories(categoryIds);
    }
    const postWithCategories = await Post.findByPk(post.id, {
      include: [{ model: Category, through: { attributes: [] } }],
    });
    res.status(201).json({ post: postWithCategories });
  } catch (error) {
    res.status(500).json({ error: '記事の作成に失敗・・・' });
  }
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: '探している記事は無さそうだよ！' });
    }
    if (post.userId !== req.user?.id) {
      return res.status(403).json({ error: '操作する権限がないよ！！' });
    }
    const { title, body, status, categoryIds } = req.body.post;
    await post.update({ title, body, status });
    if (categoryIds) {
      await post.$set('categories', categoryIds);
    }
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: '記事の更新に失敗・・・' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '記事が見つからないよ！' });
    }
    if (post.userId !== req.user?.id) {
      return res.status(403).json({ error: '操作する権限がないよ！！' });
    }
    await post.destroy();
    res.status(200).send(`記事が正常に削除されました！  ※※ 削除された記事ＩＤ：${post.id} ※※`);
  } catch (error) {
    res.status(500).json({ error: '記事の削除に失敗・・・' });
  }
});

export default router;
