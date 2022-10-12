import { ApiProperty } from '@nestjs/swagger';

export class GetRefOddByTimeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  reftime: string;

  @ApiProperty()
  oddtype: string;
}
