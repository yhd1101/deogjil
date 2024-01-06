import { CommonEntity } from '../../common/entities/common.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
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

  @ManyToOne(() => User, (user: User) => user.content)
  @JoinColumn()
  public writer: User;
}
