import express from 'express';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import postsRoutes from './routes/posts';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

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
  try {
    await sequelize.authenticate();
    console.log('データベースの接続に成功したよ！！');
    app.listen(port, () => {
      console.log(`サーバーはhttp://localhost:${port}で起動中！`);
    });
  } catch {
    (error: unknown) => {
      console.error('Unable to connect to the database:', error);
    };
  }
};

listenDB();
