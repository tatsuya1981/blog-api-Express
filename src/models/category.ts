import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import Post from './post';
import PostCategory from './postCategory';

@Table({ tableName: 'categories' })
export default class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  key!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @BelongsToMany(() => Post, () => PostCategory)
  posts!: Post[];
}
