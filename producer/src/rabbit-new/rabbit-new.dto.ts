import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class MsgDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   id: string;

  @IsNumber()
  @IsNotEmpty()
  code: number;
}

export class PublishReqDto {
  @IsString()
  @IsNotEmpty()
  exchange: string;

  @IsString()
  @IsNotEmpty()
  routing_key: string;

  @IsNumber()
  @IsOptional()
  num: number;

  @IsObject()
  @IsNotEmpty()
  message: MsgDto;
}
