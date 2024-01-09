import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Content } from '../../contents/entities/content.entity';

@Entity()
export class Like extends CommonEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  public user: User;

  @ManyToOne(() => Content)
  @JoinColumn()
  public content: Content;
}
