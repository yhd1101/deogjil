import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

@Entity()
export class CommentTalkContent extends CommonEntity {
  @ManyToOne(() => User, (user: User) => user.commentTalkComment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public writer: User;

  @ManyToOne(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.comment,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  public content: Talkcontent;

  @Column()
  public desc: string;
}
