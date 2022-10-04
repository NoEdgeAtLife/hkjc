import { Controller, Get } from '@nestjs/common';
import { RaceService } from './race.service';
import { Race } from './interface/race.interface';

@Controller('race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Get()
  async getRaceNumber(): Promise<Race[]> {
    return this.raceService.getRaceNumber();
  }
}
