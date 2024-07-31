import express, { Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

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

export default router;
