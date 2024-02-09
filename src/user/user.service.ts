import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as moment from 'moment-timezone';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async CreateUser(createUserDto: CreateUserDto) {
    const newSignup = await this.userRepository.create(createUserDto);
    // newSignup.provider = Provider.LOCAL;
    // 현재 시간을 얻어옴
    // const currentDateTime = new Date();
    // // 한국 시간대에 +9:00을 더함
    // const koreaTime = new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000);
    //
    // newSignup.createdAt = koreaTime;
    // newSignup.updatedAt = koreaTime;
    console.log(newSignup.createdAt);
    await this.userRepository.save(newSignup);
    return newSignup;
  }
  async getUserInfo(id: string) {
    const profile = await this.userRepository.findOne({
      where: { id },
      relations: ['content', 'talkContent'],
    });
    console.log(profile);
    return profile;
  }

  //user찾기 (by id)
  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('No user Id');
    }
    return user;
  }

  async deleteByUser(id: string) {
    const user = await this.userRepository.delete(id);
    if (!user) {
      throw new NotFoundException('No user');
    }

    return 'deleted';
  }

  //email로 찾기
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('No user Email');
    }
    return user;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const saltValue = await bcrypt.genSalt(10);
    const currentHashedRefreshToken = await bcrypt.hash(
      refreshToken,
      saltValue,
    );
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  //리프레시토큰 검증 함수
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) return user;
  }

  //로그아웃시 실행되는 함수
  async removeRefreshToken(userId: string) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }
}
