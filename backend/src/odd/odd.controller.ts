import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ConsoleLogger,
} from '@nestjs/common';
import { WinOdd, PlaceOdd, QinOdd, QplOdd } from './interface/odd.interface';
import Surreal from 'surrealdb.js';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { GetRefOddByTimeDto } from './dto/getRefOddByTime.dto';

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
  @ApiParam({ name: 'id', required: true })
  @Get('win/:id')
  async getWinOdd(@Param() params): Promise<any> {
    await this.db.use('hkjc', 'wpodds');
    const result = await this.db.query(
      'SELECT time, raceNo, horseNo, winOdd, money, winStatus FROM wpodds WHERE raceNo = ($raceId) and winOdd IS NOT NULL ORDER BY time DESC, horseNo ASC',
      { raceId: params.id },
    );
    return result;
  }

  // post method
  // id: raceNo
  // reftime: time
  // oddtype: win/place/qin/qpl
  // select the latest odd before reftime
  @ApiTags('odd')
  @Post('ref')
  async getWinOddByTime(
    @Body() getRefOddByTimeDto: GetRefOddByTimeDto,
  ): Promise<any> {
    const { id, reftime, oddtype } = getRefOddByTimeDto;
    await this.db.use('hkjc', 'wpodds');
    const maxHorseNoResult = await this.db.query(
      'SELECT horseNo from wpodds where raceNo = ($raceId) and winOdd IS NOT NULL Order By horseNo DESC LIMIT 1',
      { raceId: id },
    );
    const maxHorseNo = maxHorseNoResult[0].result[0].horseNo;
    if (oddtype === 'win') {
      await this.db.use('hkjc', 'wpodds');
      const result = await this.db.query(
        //select the latest odd before reftime
        'SELECT time, raceNo, horseNo, winOdd, money, winStatus FROM wpodds WHERE raceNo = ($raceId) and winOdd IS NOT NULL and time <= ($reftime) ORDER BY time DESC, horseNo ASC LIMIT ' +
          maxHorseNo,
        { raceId: id, reftime: reftime },
      );
      return result;
    } else if (oddtype === 'place') {
      await this.db.use('hkjc', 'wpodds');
      const result = await this.db.query(
        'SELECT time, raceNo, horseNo, placeOdd, money, placeStatus FROM wpodds WHERE raceNo = ($raceId) and placeOdd IS NOT NULL and time <= ($reftime) ORDER BY time DESC, horseNo ASC LIMIT ' +
          maxHorseNo,
        { raceId: id, reftime: reftime },
      );
      return result;
    } else if (oddtype === 'qin') {
      console.log(maxHorseNo);
      await this.db.use('hkjc', 'qinodds');
      const result = await this.db.query(
        'SELECT time, raceNo, horsePair, qinOdd, money, qinStatus FROM qinodds WHERE raceNo = ($raceId) and qinOdd IS NOT NULL and time <= ($reftime) ORDER BY time DESC, horsePair ASC LIMIT ' +
          (maxHorseNo * (maxHorseNo - 1)) / 2,
        {
          raceId: id,
          reftime: reftime,
        },
      );
      return result;
    } else if (oddtype === 'qpl') {
      await this.db.use('hkjc', 'qplodds');
      const result = await this.db.query(
        'SELECT time, raceNo, horsePair, qplOdd, money, qplStatus FROM qplodds WHERE raceNo = ($raceId) and qplOdd IS NOT NULL and time <= ($reftime) ORDER BY time DESC, horsePair ASC LIMIT ' +
          (maxHorseNo * (maxHorseNo - 1)) / 2,
        {
          raceId: id,
          reftime: reftime,
        },
      );
      return result;
    }
  }

  @ApiTags('place')
  @ApiParam({ name: 'id', required: true })
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
  @ApiParam({ name: 'id', required: true })
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
  @ApiParam({ name: 'id', required: true })
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
