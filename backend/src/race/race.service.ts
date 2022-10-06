import { Injectable } from '@nestjs/common';
import { Race } from './interface/race.interface';
import Surreal from 'surrealdb.js';
import axios from 'axios';

@Injectable()
export class RaceService {
  db = new Surreal('http://127.0.0.1:8000/rpc');
  private readonly race: Race[] = [
    {
      number: 0,
      date: '',
      venue: '',
    },
  ];

  // get html from https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=en&dv=local
  // search for this line : $.getScript("/racing/script/rsdata.js?lang=en&date=2022-09-14&venue=HV ...
  // get date and venue code from this line

  async getDateVenue(): Promise<any> {
    const res = await axios.get(
      'https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=en&dv=local',
    );
    const html = res.data;
    const date = html.match(/date=(\d{4}-\d{2}-\d{2})/)[1];
    const venue = html.match(/venue=(\w+)/)[1];
    return { date, venue };
  }

  async init() {
    await this.getDateVenue().then((res) => {
      this.race[0].date = res.date;
      this.race[0].venue = res.venue;
    });
  }

  constructor() {
    (async () => {
      await this.init();
      this.db.signin({
        user: 'root',
        pass: 'pass',
      });
      await this.db.use('hkjc', 'races');
      await this.db
        .create('races:current', {
          number: this.race[0].number,
          date: this.race[0].date,
          venue: this.race[0].venue,
        })
        .catch(async (_err) => {
          console.log(_err);
          this.updateRaceNo();
        });
      // get number of races and corresponding time from https://bet.hkjc.com/racing/index.aspx?lang=ch
      for (let i = 1; ; i++) {
        try {
          // try to match <div id="raceSel${i}" class="raceNoOn_${i}" or <div id="raceSel${i}" class="raceNoOff_${i}"
          const res = await axios.get(
            `https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=ch&dv=local`,
          );
          const html = res.data;
          const raceSel = html.match(new RegExp(`<div id="raceSel${i}"`));
          if (raceSel !== null) {
            // if success, go to https://bet.hkjc.com/racing/index.aspx?lang=ch&date=${this.race[0].date}&venue=${this.race[0].venue}&raceno=${i}
            const res = await axios.get(
              `https://bet.hkjc.com/racing/index.aspx?lang=ch&date=${this.race[0].date}&venue=${this.race[0].venue}&raceno=${i}`,
            );
            const html = res.data;
            // <nobr>13:00</nobr>
            const time = html.match(/<nobr>(\d{2}:\d{2})<\/nobr>/)[1];
            // update to db
            await this.db.use('hkjc', 'races');
            await this.db.update(`races:${i}`, {
              number: i,
              time: time,
            });
          }
        } catch (err) {
          console.log('error:' + err);
          break;
        }
      }
    })();
  }

  // get current race no and update to db
  // https://bet.hkjc.com/racing/getJSON.aspx?type=scratched&date=<YYYY-MM-DD>&venue=<venue>
  // sample response
  // {
  //     RAN_RACE: "0",
  //     SCR_LIST: "HV",
  //     SR: "HV",
  //     SS: ""
  // }
  async updateRaceNo(): Promise<void> {
    const res = await axios.get(
      'https://bet.hkjc.com/racing/getJSON.aspx?type=scratched&date=' +
        this.race[0].date +
        '&venue=' +
        this.race[0].venue,
    );
    const data = res.data;
    this.race[0].number = +data.RAN_RACE + 1;
    await this.db.use('hkjc', 'races');
    await this.db.update('races:current', {
      number: this.race[0].number,
      date: this.race[0].date,
      venue: this.race[0].venue,
    });
  }

  async getRaceNumberFromDB(): Promise<Race[]> {
    await this.db.use('hkjc', 'races');
    return await this.db.select('races');
  }

  //getRaceNumber(), return the Race from db
  async getRaceNumber(): Promise<Race[]> {
    await this.updateRaceNo();
    return await this.getRaceNumberFromDB();
  }
}
