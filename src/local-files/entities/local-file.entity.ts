import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../common/entities/common.entity';

@Entity()
export class LocalFile extends CommonEntity {
  @Column()
  filename: string;

  @Column()
  private: string;

  @Column()
  mimetype: string;
}
