import {
  BeforeInsert,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @BeforeInsert()
  updateTimestamps() {
    // 현재 시간을 얻어옴
    const currentDateTime = new Date();

    // 한국 시간대에 +9:00을 더함
    this.createdAt = new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000);
    this.updatedAt = new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000);
  }
}
