import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  readonly name: string;

  @IsNumber()
  readonly cate: number;

  @IsOptional()
  @IsString()
  readonly add1?: string;

  @IsOptional()
  @IsString()
  readonly add2?: string;

  @IsOptional()
  @IsString()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly htel?: string;
}
