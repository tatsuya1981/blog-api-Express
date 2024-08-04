import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import Post from './post';
import PostCategory from './postCategory';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({ tableName: 'categories' })
export default class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare key: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255],
    },
  })
  declare name: string;

  @BelongsToMany(() => Post, () => PostCategory)
  declare posts?: Post[];
}
