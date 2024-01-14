import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Content } from '../../contents/entities/content.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

@Entity()
export class Like extends CommonEntity {
  @ManyToOne(() => User, (user: User) => user.like)
  @JoinColumn()
  public user: User;

  @ManyToOne(() => Content, (content: Content) => content.like, {
    nullable: true,
  })
  @JoinColumn()
  public content: Content;

  @ManyToOne(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.like,
    { nullable: true },
  )
  @JoinColumn()
  public talkContent: Talkcontent;
}
