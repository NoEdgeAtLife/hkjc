import { Controller, Get } from '@nestjs/common';
import { WinOdd, PlaceOdd, QinOdd, QplOdd } from './interface/odd.interface';

@Controller('odd')
export class OddController {
  @Get('win')
  getWinOdd(): WinOdd[] {
    return [];
  }

  @Get('place')
  getPlaceOdd(): PlaceOdd[] {
    return [];
  }

  @Get('qin')
  getQinOdd(): QinOdd[] {
    return [];
  }

  @Get('qpl')
  getQplOdd(): QplOdd[] {
    return [];
  }
}
