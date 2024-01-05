import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      //환경변수 불러오는 방법
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('POSTGRES_HOST'),
        port: cfg.get('POSTGRES_PORT'),
        username: cfg.get('POSTGRES_USERNAME'),
        password: cfg.get('POSTGRES_PASSWORD'),
        database: cfg.get('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], //entity기반으로 모델기반
        autoLoadEntities: true,
        synchronize: true,
        // logger: new DatabaseLogger(),
      }),
    }),
  ],
})
export class DatabaseModule {}
