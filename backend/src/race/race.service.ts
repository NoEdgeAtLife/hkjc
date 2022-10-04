import { Injectable } from '@nestjs/common';
import { Race } from './interface/race.interface';

@Injectable()
export class RaceService {
  private readonly race: Race[] = [
    {
      id: 100,
    },
  ];

  getRaceNumber(): Race[] {
    return this.race;
  }
}
