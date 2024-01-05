import { BeforeInsert, Column, Entity } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { Provider } from './provider.enum';
import { InternalServerErrorException } from '@nestjs/common';
import * as gravatar from 'gravatar';

@Entity()
export class User extends CommonEntity {
  @Column()
  public name: string;

  @Column({ unique: true })
  public email: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.KAKAO,
  })
  public provider: Provider;

  @Column({ nullable: true })
  public profileImg?: string;

  @BeforeInsert()
  async beforeSaveFunction(): Promise<void> {
    try {
      this.profileImg = await gravatar.url(this.email, {
        s: '200',
        r: 'pg',
        d: 'mm',
        protocol: 'https',
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
