import express from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { loginId, name, iconUrl, password } = req.body.user;

    // 既存ユーザーのチェック
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザーの作成
    const user = await User.create({
      loginId,
      name,
      iconUrl,
      authorize_token: "", // 後で更新
    });

    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // authorize_tokenの更新
    await user.update({ authorize_token: token });

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
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
