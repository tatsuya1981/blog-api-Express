import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import Post from './post';
import Category from './category';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'post_categories' })
export default class PostCategory extends Model<InferAttributes<PostCategory>, InferCreationAttributes<PostCategory>> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
    },
  })
  declare postId: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
    },
  })
  declare categoryId: number;
}
