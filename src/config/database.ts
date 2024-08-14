import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

import User from '../models/user';
import Post from '../models/post';
import Category from '../models/category';
import PostCategory from '../models/postCategory';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  models: [User, Post, Category, PostCategory], // 明示的にモデルを指定
});

export default sequelize;