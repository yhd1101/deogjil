import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';
import { CommentTalkContent } from '../../comment-talk-content/entities/comment-talk-content.entity';

@Entity()
export class Talkcontent extends CommonEntity {
  @Column()
  public title: string;

  @Column()
  public desc: string;

  @Column('text', {
    array: true,
    nullable: true,
  })
  public img?: string[];

  @Column('text', {
    array: true,
    nullable: true,
  })
  public tag?: string[];

  @ManyToOne(() => User, (user: User) => user.talkContent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public writer: User;

  @OneToMany(
    () => CommentTalkContent,
    (commentTalkContent: CommentTalkContent) => commentTalkContent.talkContent,
  )
  public comment: CommentTalkContent[];
}
