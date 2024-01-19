import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';
import { Provider } from './provider.enum';
import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import * as gravatar from 'gravatar';
import * as bcrypt from 'bcryptjs';
import { Content } from '../../contents/entities/content.entity';
import { Exclude } from 'class-transformer';
import { Like } from '../../likes/entities/like.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';
import { CommentContent } from '../../comment-content/entities/comment-content.entity';

@Entity()
export class User extends CommonEntity {
  @Column()
  public name: string;

  @Column({ unique: true })
  public email: string;

  @Column({
    type: 'enum',
    enum: Provider,
    default: Provider.LOCAL,
  })
  public provider: Provider;

  @Column({ nullable: true })
  public password?: string;

  @Column({ nullable: true })
  public profileImg?: string;

  @OneToMany(() => Content, (content: Content) => content.writer)
  public content: Content[];

  @OneToMany(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.writer,
  )
  public talkContent: Talkcontent[];

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @OneToMany(() => Like, (like: Like) => like.user)
  public like: Like[];

  @OneToMany(
    () => CommentContent,
    (commentContent: CommentContent) => commentContent.writer,
  )
  public commetComment: CommentContent[];

  @BeforeInsert()
  async beforeSaveFunction(): Promise<void> {
    try {
      if (this.provider !== Provider.LOCAL) {
        return;
      } else {
        const saltValue = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password, saltValue);
        this.profileImg = await gravatar.url(this.email, {
          s: '200',
          r: 'pg',
          d: 'mm',
          protocol: 'https',
        });
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async validatePassword(aPassword: string) {
    try {
      const isPasswordMatch = await bcrypt.compare(aPassword, this.password);
      return isPasswordMatch;
    } catch (err) {
      console.log(err);
      throw new HttpException(err.message, HttpStatus.CONFLICT);
    }
  }
}
