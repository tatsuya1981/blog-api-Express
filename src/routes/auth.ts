import express from 'express';
import User from '../models/user';
import { Op } from 'sequelize';
import { comparePassword, generateToken, hashPassword } from '../utils/authUtils';

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const { loginId, name, iconUrl, password } = req.body.user;

  // 既存ユーザーのチェック
  const existingUser = await User.findOne({ where: { loginId } });
  if (existingUser) {
    return res.status(400).json({ error: 'ユーザーが既に存在します' });
  }

  // パスワードのハッシュ化
  const hashedPassword = await hashPassword(password);

  // ユーザーの作成
  const user = await User.create({
    loginId,
    name,
    iconUrl,
    authorizeToken: hashedPassword, // ハッシュ化されたパスワードを保存
  });

  // JWTトークンの生成
  if (!user.id) {
    return res.status(400).json({ error: 'ユーザーＩＤがありません！' });
  }
  const token = generateToken(user.id);

  res.status(201).json({
    user: {
      id: user.id,
      loginId: user.loginId,
      name: user.name,
      iconUrl: user.iconUrl,
    },
    token: token,
  });
});

router.post('/login', async (req, res, next) => {
  try {
    const { loginId, password } = req.body;

    // ユーザーの検索
    const user = await User.findOne({
      where: {
        [Op.or]: [{ loginId: loginId }, { name: loginId }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'ユーザーの認証に失敗しました！' });
    }

    // パスワードの検証
    const isPasswordValid = await comparePassword(password, user.authorizeToken);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'パスワードの認証に失敗しました！' });
    }

    // JWTトークンの生成
    if (!user.id) {
      return res.status(400).json({ error: 'ユーザーＩＤがありません！' });
    }
    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        iconUrl: user.iconUrl,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
