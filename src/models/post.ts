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

  async post(categoryIds: number[], transaction: Transaction) {
    const t = transaction || (await sequelize.transaction());
    await this.save({ transaction: t });
    if (categoryIds) {
      await this.$set('categories', categoryIds, { transaction: t });
    }
    if (!transaction) await t.commit();
  }

  static postWithCategories = async (postId: number, transaction?: Transaction) => {
    return await Post.findByPk(postId, {
      include: [
        {
          model: Category,
          through: { attributes: [] },
        },
      ],
      transaction,
    });
  };

  async updateWithCategories(
    data: {
      title: string;
      body: string;
      status: number;
      categoryIds?: number[];
    },
    transaction?: Transaction,
  ) {
    const t = transaction || (await sequelize.transaction());
    await this.update({ title: data.title, body: data.body, status: data.status }, { transaction: t });
    if (data.categoryIds) {
      await this.$set('categories', data.categoryIds, { transaction: t });
    }
    if (!transaction) await t.commit();
  }
}
