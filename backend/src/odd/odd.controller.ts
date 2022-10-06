import { Controller, Get, Param } from '@nestjs/common';
import { WinOdd, PlaceOdd, QinOdd, QplOdd } from './interface/odd.interface';
import Surreal from 'surrealdb.js';

@Controller('odd')
export class OddController {
  db = new Surreal('http://127.0.0.1:8000/rpc');

  constructor() {
    (async () => {
      await this.db.signin({
        user: 'root',
        pass: 'pass',
      });
    })();
  }

  @Get('win/:id')
  getWinOdd(@Param() params): WinOdd[] {
    return [
      {
        time: new Date(),
        raceNo: params.id,
        horseNo: 1,
        winOdd: 1,
        money: 1,
        winStatus: 1,
      },
    ];
  }

  @Get('place/:id')
  getPlaceOdd(): PlaceOdd[] {
    return [];
  }

  @Get('qin/:id')
  getQinOdd(): QinOdd[] {
    return [];
  }

  @Get('qpl/:id')
  getQplOdd(): QplOdd[] {
    return [];
  }
}
