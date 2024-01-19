import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

@Entity()
export class CommentTalkContent extends CommonEntity {
  @ManyToOne(() => User, (user: User) => user.commentTalkComment)
  @JoinColumn()
  public writer: User;

  @ManyToOne(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.comment,
  )
  @JoinColumn()
  public talkContent: Talkcontent;

  @Column()
  public desc: string;
}
