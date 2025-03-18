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
import { CommentTalkContent } from '../../comment-talk-content/entities/comment-talk-content.entity';
import { LikeTalkContent } from '../../like-talk-content/entities/like-talk-content.entity';

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

  @OneToMany(() => Content, (content: Content) => content.writer, {
    cascade: true,
  })
  public content: Content[];

  @OneToMany(
    () => Talkcontent,
    (talkcontent: Talkcontent) => talkcontent.writer,
    { cascade: true },
  )
  public talkContent: Talkcontent[];

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @OneToMany(() => Like, (like: Like) => like.user, { cascade: true })
  public like: Like[];

  @OneToMany(
    () => LikeTalkContent,
    (likeTalkContent: LikeTalkContent) => likeTalkContent.user,
    { cascade: true },
  )
  public likeTalkContent: LikeTalkContent[];

  @OneToMany(
    () => CommentContent,
    (commentContent: CommentContent) => commentContent.writer,
    { cascade: true },
  )
  public commetComment: CommentContent[];

  @OneToMany(
    () => CommentTalkContent,
    (commentTalkContent: CommentTalkContent) => commentTalkContent.writer,
    { cascade: true },
  )
  public commentTalkComment: CommentTalkContent[];

  @Column({ nullable: true })
  public nickname?: string;

  @BeforeInsert()
  async beforeSaveFunction(): Promise<void> {
    try {
      if (this.provider !== Provider.LOCAL) {
        if (!this.nickname && this.name) {
          this.nickname = this.name;
        }
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
        if (this.name && !this.nickname) {
          this.nickname = this.name;
        }
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
      throw new HttpException(err.message, HttpStatus.CONFLICT);
    }
  }
}
