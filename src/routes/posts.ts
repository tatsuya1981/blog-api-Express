import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Post from '../models/post';
import Category from '../models/category';
import User from '../models/user';
import { Transaction } from 'sequelize';
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

router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Category, through: { attributes: [] } }],
    });
    if (!post) {
      return res.status(404).json({ error: '記事が見つからないよ！' });
    }
    res.json({ post });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

    const { title, body, status, categoryIds } = req.body.post;

    if (!req.user?.id) {
      await transaction.rollback();
      return res.status(400).json({ error: 'ユーザーＩＤが見つかりません！' });
    }
    const post = await Post.create(
      {
        title,
        body,
        status,
        userId: req.user?.id,
      },
      { transaction },
    );
    if (categoryIds && categoryIds.length > 0) {
      await (post as any).setCategories(categoryIds, { transaction });
    }
    const postWithCategories = await Post.findByPk(post.id, {
      include: [{ model: Category, through: { attributes: [] } }],
      transaction,
    });
    await transaction.commit();

    res.status(201).json({});
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  let transaction: Transaction | null = null;
  try {
    transaction = await sequelize.transaction();

    const post = await Post.findByPk(req.params.id, { transaction });

    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ error: '探している記事は無さそうだよ！' });
    }
    if (post.userId !== req.user?.id) {
      await transaction.rollback();
      return res.status(403).json({ error: '操作する権限がないよ！！' });
    }
    const { title, body, status, categoryIds } = req.body.post;
    await post.update({ title, body, status }, { transaction });
    if (categoryIds) {
      await post.$set('categories', categoryIds, { transaction });
    }
    await transaction.commit();

    const updatedPost = await Post.findByPk(post.id, {
      include: [{ model: Category, through: { attributes: [] } }],
    });

    res.json({ post });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: '記事が見つからないよ！' });
    }
    if (post.userId !== req.user?.id) {
      return res.status(403).json({ error: '操作する権限がないよ！！' });
    }
    await post.destroy();
    res.status(200).json({ delete: `記事が正常に削除されました！  ※※ 削除された記事ＩＤ：${post.id} ※※` });
  } catch (error) {
    next(error);
  }
});

export default router;
