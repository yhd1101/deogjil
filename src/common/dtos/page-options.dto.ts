import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderConstants } from '../constants/order.constants';

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: OrderConstants, default: OrderConstants.ASC })
  @IsEnum(OrderConstants)
  @IsOptional()
  readonly order?: OrderConstants = OrderConstants.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 8;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
