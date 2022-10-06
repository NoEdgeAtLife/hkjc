export interface WinOdd {
  time: Date;
  raceNo: number;
  horseNo: number;
  winOdd: number;
  money: number;
  winStatus: number;
}
export interface PlaceOdd {
  time: Date;
  raceNo: number;
  horseNo: number;
  placeOdd: number;
  money: number;
  placeStatus: number;
}
export interface QinOdd {
  time: Date;
  raceNo: number;
  horsePair: number[];
  qinOdd: number;
  money: number;
  qinStatus: number;
}
export interface QplOdd {
  time: Date;
  raceNo: number;
  horsePair: number[];
  qplOdd: number;
  money: number;
  qplStatus: number;
}
