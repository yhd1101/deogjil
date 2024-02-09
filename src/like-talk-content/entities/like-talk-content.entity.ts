import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

@Entity()
export class LikeTalkContent extends CommonEntity {
  @ManyToOne(() => User, (user: User) => user.likeTalkContent, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public user: User;

  @ManyToOne(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.like,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn()
  public talkContent: Talkcontent;
}
