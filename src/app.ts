import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import postsRoutes from './routes/posts';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkAllEnv } from './config/envValidation';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

checkAllEnv();

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: '入力で正しくない項目があるみたい！', details: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: '認証エラーが発生！' });
  }
  res.status(500).json({ error: 'サーバー内部エラー！' });
});

const listenDB = async () => {
  await sequelize.authenticate();
  console.log('データベースの接続に成功！！');
  try {
    app.listen(port, () => {
      console.log(`サーバーはhttp://localhost:${port}で起動中！`);
    });
  } catch (error: unknown) {
    console.error('サーバーの起動に失敗しました！:', error);
    return process.exit(1);
  }
};

listenDB();
