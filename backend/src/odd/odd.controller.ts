import { Controller, Get, Param } from '@nestjs/common';
import { WinOdd, PlaceOdd, QinOdd, QplOdd } from './interface/odd.interface';
import Surreal from 'surrealdb.js';
import { ApiTags } from '@nestjs/swagger';

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

  @ApiTags('win')
  @Get('win/:id')
  async getWinOdd(@Param() params): Promise<any> {
    await this.db.use('hkjc', 'wpodds');
    const result = await this.db.query(
      'SELECT time, raceNo, horseNo, winOdd, money, winStatus FROM wpodds WHERE raceNo = ($raceId) and winOdd IS NOT NULL ORDER BY time DESC, horseNo ASC',
      { raceId: params.id },
    );
    return result;
  }

  @ApiTags('place')
  @Get('place/:id')
  async getPlaceOdd(@Param() params): Promise<any> {
    await this.db.use('hkjc', 'wpodds');
    const result = await this.db.query(
      'SELECT time, raceNo, horseNo, placeOdd, money, placeStatus FROM wpodds WHERE raceNo = ($raceId) and placeOdd IS NOT NULL ORDER BY time DESC, horseNo ASC',
      { raceId: params.id },
    );
    return result;
  }

  @ApiTags('qin')
  @Get('qin/:id')
  async getQinOdd(@Param() params): Promise<any> {
    await this.db.use('hkjc', 'qinodds');
    const result = await this.db.query(
      'SELECT time, raceNo, horsePair, qinOdd, money, qinStatus FROM qinodds WHERE raceNo = ($raceId) ORDER BY time DESC, horsePair ASC',
      { raceId: params.id },
    );
    return result;
  }

  @ApiTags('qpl')
  @Get('qpl/:id')
  async getQplOdd(@Param() params): Promise<any> {
    await this.db.use('hkjc', 'qplodds');
    const result = await this.db.query(
      'SELECT time, raceNo, horsePair, qplOdd, money, qplStatus FROM qplodds WHERE raceNo = ($raceId) ORDER BY time DESC, horsePair ASC',
      { raceId: params.id },
    );
    return result;
  }
}
