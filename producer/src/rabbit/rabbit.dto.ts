import { IsNotEmpty, IsString } from 'class-validator';

export class ChinaMqMessageDto {
  @IsString()
  @IsNotEmpty()
  routing_key: string;
}
