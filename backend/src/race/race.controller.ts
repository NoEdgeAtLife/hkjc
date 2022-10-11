import { Controller, Get } from '@nestjs/common';
import { RaceService } from './race.service';
import { Race } from './interface/race.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('race')
@Controller('race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Get()
  async getRaceNumber(): Promise<Race[]> {
    return this.raceService.getRaceNumber();
  }

  @Get('max')
  async getMaxRaceNumber(): Promise<number> {
    return this.raceService.getMaxRaceNumber();
  }
}
