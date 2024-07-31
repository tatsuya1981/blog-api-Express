import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import Post from './post';
import Category from './category';

@Table({ tableName: 'post_categories' })
export default class PostCategory extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  postId!: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId!: number;
}
