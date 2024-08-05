import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const PEPPER = process.env.MY_PEPPER;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('環境変数が設定されてません！');
}

router.post('/signup', async (req, res) => {
  try {
    const { loginId, name, iconUrl, password } = req.body.user;

    // 既存ユーザーのチェック
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      return res.status(400).json({ error: 'ユーザーが既に存在します' });
    }

    // パスワードのハッシュ化
    const pepperPassword = password + PEPPER;
    const hashedPassword = await bcrypt.hash(pepperPassword, 10);

    // ユーザーの作成
    const user = await User.create({
      loginId,
      name,
      iconUrl,
      authorize_token: hashedPassword, // ハッシュ化されたパスワードを保存
    });

    // JWTトークンの生成
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1d' });

    res.status(201).json({
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        iconUrl: user.iconUrl,
        authorize_token: token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'サーバー内部エラー' });
  }
});

router.post('/login', async (req, res) => {
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
    const pepperPassword = password + PEPPER;
    const isPasswordValid = await bcrypt.compare(pepperPassword, user.authorize_token);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'パスワードの認証に失敗しました！' });
    }

    // JWTトークンの生成
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1d' });

    res.json({
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        iconUrl: user.iconUrl,
        authorize_token: token,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'サーバー内部エラー' });
  }
});

export default router;
