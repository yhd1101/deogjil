import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';
import { Content } from '../../contents/entities/content.entity';

@Entity()
export class CommentContent extends CommonEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  public writer: User;

  @Column()
  public desc: string;

  @ManyToOne(() => Content)
  @JoinColumn()
  public content: Content;
}
