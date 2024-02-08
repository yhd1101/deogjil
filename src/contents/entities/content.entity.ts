import { CommonEntity } from '../../common/entities/common.entity';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';
import { CommentContent } from '../../comment-content/entities/comment-content.entity';
@Entity()
export class Content extends CommonEntity {
  @Column()
  public title: string;

  @Column() //글
  public desc: string;

  @Column('text', {
    //text형태로 넣어줘야함 ex) number, object등있다.
    array: true,
    nullable: true,
  })
  public img?: string[];

  @Column('text', {
    array: true,
    nullable: true,
  })
  public tag?: string[];

  @ManyToOne(() => User, (user: User) => user.content, { onDelete: 'CASCADE' })
  @JoinColumn()
  public writer: User;

  @OneToMany(() => Like, (like: Like) => like.content, { cascade: true })
  public like: Like[];

  @OneToMany(
    () => CommentContent,
    (commentContent: CommentContent) => commentContent.content,
    { cascade: true },
  )
  public comment: CommentContent[];

  @Column({ default: 0 }) // 댓글 갯수를 나타내는 필드
  public commentCount: number;

  @Column({ default: 0 })
  public likeCount: number;
}
