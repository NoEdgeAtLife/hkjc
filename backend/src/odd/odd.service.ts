import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import { WinOdd, PlaceOdd, QinOdd, QplOdd } from './interface/odd.interface';
import Surreal from 'surrealdb.js';

@Injectable()
export class OddService {
  db = new Surreal('http://127.0.0.1:8000/rpc');

  constructor() {
    (async () => {
      await this.db.signin({
        user: 'root',
        pass: 'pass',
      });
    })();
  }

  date: string;
  venue: string;
  maxRaceNo: number;

  async updateDateVenue() {
    //select date, venue from races where id = races:current, sample [{"time":"218µs","status":"OK","result":[{"date":"2022-10-09T00:00:00Z","venue":"ST"}]}]
    await this.db.use('hkjc', 'races');
    const res = await this.db.query(
      'select date, venue from races where id = races:current',
    );
    const result = res[0].result[0];
    // date : 2022-10-09T00:00:00Z, parse to 2022-10-09
    this.date = result.date.split('T')[0];
    this.venue = result.venue;
  }

  async updateMaxRaceNo() {
    // select number from races where id = races:max, sample [{"time":"218µs","status":"OK","result":[{"number":12}]}]
    await this.db.use('hkjc', 'races');
    const res = await this.db.query(
      'select number from races where id = races:max',
    );
    const result = res[0].result[0];
    try {
      this.maxRaceNo = result.number;
    } catch (e) {
      console.log('getting max race number ... ' + e);
    }
  }

  // https://bet.hkjc.com/racing/getJSON.aspx?type=pooltot&date=<YYY-MM-DD>&venue=<venue>&raceno=<raceno>
  // sample response
  // {
  //     inv: [
  //     {
  //     pool: "WIN",
  //     value: "174645",
  //     pid: "95093"
  //     },
  //     {
  //     pool: "PLA",
  //     value: "114594"
  //     },
  //     {
  //     pool: "QIN",
  //     value: "151493"
  //     },
  //     {
  //     pool: "QPL",
  //     value: "215900"
  //     },
  //     {
  //     pool: "FCT",
  //     value: "38066",
  //     pid: "95072"
  //     },
  //     {
  //     pool: "CWA",
  //     value: "174645",
  //     pid: "95093"
  //     },
  //     {
  //     pool: "TCE",
  //     value: "17646"
  //     },
  //     {
  //     pool: "TRI",
  //     value: "38066",
  //     pid: "95072"
  //     },
  //     {
  //     pool: "F-F",
  //     value: "26538",
  //     pid: "95071"
  //     },
  //     {
  //     pool: "QTT",
  //     value: "26538",
  //     pid: "95071"
  //     },
  //     {
  //     pool: "DBL",
  //     value: "32990"
  //     },
  //     {
  //     pool: "D-T",
  //     value: "41447"
  //     },
  //     {
  //     pool: "6UP",
  //     value: "178773"
  //     }
  //     ],
  //     totalInv: "7723562",
  //     updateTime: "175223"
  //     }
  async getPoolSize(raceNo: number) {
    const res = await axios.get(
      `https://bet.hkjc.com/racing/getJSON.aspx?type=pooltot&date=${this.date}&venue=${this.venue}&raceno=${raceNo}`,
    );
    const result = res.data;
    return result;
  }

  @Interval(1000)
  async GetWinPlaceOdd() {
    // get date and venue from db if not exist
    if (!this.date || !this.venue) {
      await this.updateDateVenue();
    }
    // if maxRaceNo not exist, get maxRaceNo from db
    if (!this.maxRaceNo) {
      await this.updateMaxRaceNo();
    }
    await this.db.use('hkjc', 'wpodds');
    // api url: https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=<YYYY-MM-DD>&venue=<ST|HV>&start=<start_raceno>&end=<end_raceno>
    for (let i = 1; i <= this.maxRaceNo; i++) {
      // get pool size
      const poolSize = await this.getPoolSize(i);
      const winPoolSize = poolSize.inv.find(
        (item: { pool: string }) => item.pool === 'WIN',
      ).value;
      const placePoolSize = poolSize.inv.find(
        (item: { pool: string }) => item.pool === 'PLA',
      ).value;
      const url = `https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=${this.date}&venue=${this.venue}&start=${i}&end=${i}`;
      const res = await axios.get(url);
      const data = res.data['OUT'];
      // if data is empty, skip
      if (data.length === 0) {
        continue;
      }
      // if data is not empty, insert into db
      // Data sample : OUT: HHMMSS@@@WIN;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0#PLA;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0
      const winPlaceOdd = data.split('WIN')[1];
      const winOdd = winPlaceOdd.split('#')[0];
      const placeOdd = winPlaceOdd.split('#')[1];
      const winOddArray = winOdd.split(';');
      const placeOddArray = placeOdd.split(';');
      // winOddArray sample : ["WIN", "1=11=0", "2=4.4=1", "3=7.6=0", "4=18=0", "5=25=0", "6=14=0", "7=37=0", "8=15=0", "9=14=0", "10=16=0", "11=11=0", "12=13=0", "13=24=0", "14=5.5=0"]
      // placeOddArray sample : ["PLA", "1=11=0", "2=4.4=1", "3=7.6=0", "4=18=0", "5=25=0", "6=14=0", "7=37=0", "8=15=0", "9=14=0", "10=16=0", "11=11=0", "12=13=0", "13=24=0", "14=5.5=0"]
      const winOddSum = winOddArray //take out the first element
        .slice(1)
        .reduce((acc: number, cur: string) => {
          const odd = cur.split('=')[1];
          // if nan, skip
          if (isNaN(Number(odd))) {
            return acc;
          }
          return acc + parseFloat(odd);
        }, 0);
      const placeOddSum = placeOddArray //take out the first element
        .slice(1)
        .reduce((acc: number, cur: string) => {
          const odd = cur.split('=')[1];
          // if nan, skip
          if (isNaN(Number(odd))) {
            return acc;
          }
          return acc + parseFloat(odd);
        }, 0);
      for (let j = 1; j < winOddArray.length; j++) {
        const winOdd = winOddArray[j].split('=');
        await this.db.create('wpodds', {
          // timezone is current time, UTC +8
          time: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong',
          }),
          raceNo: i,
          horseNo: Number(winOdd[0]),
          winOdd: Number(winOdd[1]),
          money: (winPoolSize * 0.825) / Number(winOdd[1]),
          winStatus: Number(winOdd[2]),
        });
        const placeOdd = placeOddArray[j].split('=');
        await this.db.create('wpodds', {
          time: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong',
          }),
          raceNo: i,
          horseNo: Number(placeOdd[0]),
          placeOdd: Number(placeOdd[1]),
          money: (placePoolSize * 0.825) / Number(placeOdd[1]),
          placeStatus: Number(placeOdd[2]),
        });
      }
    }
  }

  @Interval(1000)
  async GetQinOdd() {
    // get date and venue from db if not exist
    if (!this.date || !this.venue) {
      await this.updateDateVenue();
    }
    // if maxRaceNo not exist, get maxRaceNo from db
    if (!this.maxRaceNo) {
      await this.updateMaxRaceNo();
    }
    await this.db.use('hkjc', 'qinodds');
    // api url: https://bet.hkjc.com/racing/getJSON.aspx?type=qin&date=<YYYY-MM-DD>&venue=<ST|HV>&raceno=<raceno>
    for (let i = 1; i <= this.maxRaceNo; i++) {
      // get pool size
      const poolSize = await this.getPoolSize(i);
      const qinPoolSize = poolSize.inv.find(
        (item: { pool: string }) => item.pool === 'QIN',
      ).value;
      const url = `https://bet.hkjc.com/racing/getJSON.aspx?type=qin&date=${this.date}&venue=${this.venue}&raceno=${i}`;
      const res = await axios.get(url);
      const data = res.data['OUT'];
      // if data is empty, skip
      if (data.length === 0) {
        continue;
      }
      // if data is not empty, insert into db
      //OUT: "HHMMSS@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0"
      const qinOddArray = data.split(';');
      const qinOddSum = qinOddArray
        .slice(1)
        .reduce((acc: number, cur: string) => {
          const odd = cur.split('=')[1];
          // if nan, skip
          if (isNaN(Number(odd))) {
            return acc;
          }
          return acc + parseFloat(odd);
        }, 0);
      for (let j = 1; j < qinOddArray.length; j++) {
        const qinOdd = qinOddArray[j].split('=');
        await this.db.create('qinodds', {
          time: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong',
          }),
          raceNo: i,
          horsePair: [
            Number(qinOdd[0].split('-')[0]),
            Number(qinOdd[0].split('-')[1]),
          ],
          qinOdd: Number(qinOdd[1]),
          money: (qinPoolSize * 0.825) / Number(qinOdd[1]),
          qinStatus: Number(qinOdd[2]),
        });
      }
    }
  }

  @Interval(1000)
  async GetQplOdd() {
    // get date and venue from db if not exist
    if (!this.date || !this.venue) {
      await this.updateDateVenue();
    }
    // if maxRaceNo not exist, get maxRaceNo from db
    if (!this.maxRaceNo) {
      await this.updateMaxRaceNo();
    }
    await this.db.use('hkjc', 'qplodds');
    // api url: https://bet.hkjc.com/racing/getJSON.aspx?type=qpl&date=<YYYY-MM-DD>&venue=<ST|HV>&raceno=<raceno>
    for (let i = 1; i <= this.maxRaceNo; i++) {
      // get pool size
      const poolSize = await this.getPoolSize(i);
      const qplPoolSize = poolSize.inv.find(
        (item: { pool: string }) => item.pool === 'QPL',
      ).value;
      const url = `https://bet.hkjc.com/racing/getJSON.aspx?type=qpl&date=${this.date}&venue=${this.venue}&raceno=${i}`;
      const res = await axios.get(url);
      const data = res.data['OUT'];
      // if data is empty, skip
      if (data.length === 0) {
        continue;
      }
      // if data is not empty, insert into db
      //OUT: "HHMMSS@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0"
      const qplOddArray = data.split(';');
      const qplOddSum = qplOddArray
        .slice(1)
        .reduce((acc: number, cur: string) => {
          const odd = cur.split('=')[1];
          // if nan, skip
          if (isNaN(Number(odd))) {
            return acc;
          }
          return acc + parseFloat(odd);
        }, 0);
      for (let j = 1; j < qplOddArray.length; j++) {
        const qplOdd = qplOddArray[j].split('=');
        await this.db.create('qplodds', {
          time: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Hong_Kong',
          }),
          raceNo: i,
          horsePair: [
            Number(qplOdd[0].split('-')[0]),
            Number(qplOdd[0].split('-')[1]),
          ],
          qplOdd: Number(qplOdd[1]),
          money: (qplPoolSize * 0.825) / Number(qplOdd[1]),
          qplStatus: Number(qplOdd[2]),
        });
      }
    }
  }
}
