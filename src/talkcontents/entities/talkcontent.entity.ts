import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { User } from '../../user/entities/user.entity';

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

  @ManyToOne(() => User, (user: User) => user.talkContent)
  public writer: User;
}
