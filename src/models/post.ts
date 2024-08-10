import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import User from './user';
import Category from './category';
import PostCategory from './postCategory';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';

@Table({ tableName: 'posts' })
export default class Post extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true,
      isInt: true,
      min: 1,
    },
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  declare body: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      notEmpty: true,
    },
  })
  declare status: number;

  @BelongsToMany(() => Category, () => PostCategory)
  declare categories: Category[];

  static async createCategories(
    data: {
      title: string;
      body: string;
      status: number;
      userId: number;
      categoryIds?: number[];
    },
    transaction?: Transaction,
  ) {
    const { title, body, status, userId, categoryIds } = data;

    return sequelize.transaction(async (t: Transaction) => {
      const tx = transaction || t;
      const post = await Post.create({ title, body, status, userId, categoryIds }, { transaction: tx });
      if (categoryIds && categoryIds.length > 0) {
        await post.$set('categories', categoryIds, { transaction: tx });
      }
      const postWithCategories = await Post.findByPk(post.id, {
        include: [
          {
            model: Category,
            through: { attributes: [] },
          },
        ],
        transaction: tx,
      });
      return postWithCategories;
    });
  }

  static async updateWithCategories(
    id: number,
    userId: number,
    data: {
      title: string;
      body: string;
      status: number;
      categoryIds?: number[];
    },
    transaction?: Transaction,
  ) {
    return sequelize.transaction(async (t: Transaction) => {
      const tx = transaction || t;
      const post = await Post.findByPk(id, { transaction: tx });

      if (!post) {
        throw new Error('記事は見つかりませんでした！');
      }
      if (post.userId !== userId) {
        throw new Error('操作する権限がありません！');
      }

      const { title, body, status, categoryIds } = data;
      await post.update({ title, body, status }, { transaction: tx });

      if (categoryIds) {
        await post.$set('categories', categoryIds, { transaction: tx });
      }

      const updatedPost = await Post.findByPk(post.id, {
        include: [{ model: Category, through: { attributes: [] } }],
        transaction: tx,
      });
      return updatedPost;
    });
  }
}
