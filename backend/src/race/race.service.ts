import { Injectable } from '@nestjs/common';
import { Race } from './interface/race.interface';
import Surreal from 'surrealdb.js';

@Injectable()
export class RaceService {
  db = new Surreal('http://127.0.0.1:8000/rpc');
  private readonly race: Race[] = [
    {
      number: 100,
    },
  ];

  constructor() {
    const id = this.race[0].number;

    this.db.signin({
      user: 'root',
      pass: 'pass',
    });

    this.db.use('hkjc', 'races');

    this.db.create('races:' + id, {
      number: id,
    });
  }

  async getRaceNumberFromDB(): Promise<Race[]> {
    await this.db.use('hkjc', 'races');
    return await this.db.select('races');
  }

  //getRaceNumber(), return the Race from redis
  async getRaceNumber(): Promise<Race[]> {
    return await this.getRaceNumberFromDB();
  }
}
