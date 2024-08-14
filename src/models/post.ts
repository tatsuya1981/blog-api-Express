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

  static createPost = async (data: {
    title: string;
    body: string;
    status: number;
    userId: number;
    categoryIds?: number[];
  }) => {
    const { title, body, status, userId, categoryIds } = data;
    const post = await Post.create({ title, body, status, userId, categoryIds });
    if (categoryIds && categoryIds.length > 0) {
      await post.$set('categories', categoryIds);
    }
    return post;
  };

  static postWithCategories = async (postId: number) => {
    return Post.findByPk(postId, {
      include: [
        {
          model: Category,
          through: { attributes: [] },
        },
      ],
    });
  };

  static validatePost = async (id: number, userId: number) => {
    const post = await Post.findByPk(id);

    if (!post) {
      throw new Error('記事は見つかりませんでした！');
    }
    if (post.userId !== userId) {
      throw new Error('操作する権限がありません！');
    }
    return post;
  };

  static updateWithCategories = async (
    id: number,
    userId: number,
    data: {
      title: string;
      body: string;
      status: number;
      categoryIds?: number[];
    },
  ) => {
    const post = await Post.validatePost(id, userId);
    const { title, body, status, categoryIds } = data;
    await post.update({ title, body, status });

    if (categoryIds) {
      await post.$set('categories', categoryIds);
    }
    return Post.updatePostWithCategories;
  };

  static updatePostWithCategories = async (id: number) => {
    return await Post.findByPk(id, {
      include: [{ model: Category, through: { attributes: [] } }],
    });
  };
}
