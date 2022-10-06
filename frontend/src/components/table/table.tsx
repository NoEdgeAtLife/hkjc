import { component$, useStore, useStyles$ } from '@builder.io/qwik';

export const Table = component$(() => {
  useStyles$(`
  table, th, td {
    border: 1px solid;
  }`);

  const state = useStore({
    raceNo: 1,
  });
  // sample data
  const data = [
    {
      time: new Date(),
      horseNo: 1,
      winOdd: 2.1,
      placeOdd: 1.1,
      money: 1000,
      moneychange: 20,
    },
    {
      time: new Date(),
      horseNo: 2,
      winOdd: 2.2,
      placeOdd: 1.2,
      money: 2000,
      moneychange: 40,
    },
    {
      time: new Date(),
      horseNo: 3,
      winOdd: 2.3,
      placeOdd: 1.3,
      money: 3000,
      moneychange: 60,
    },
  ];
  return (
    <>
    <div>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Horse No</th>
          <th>Win Odd</th>
          <th>Place Odd</th>
          <th>Money</th>
          <th>Money Change</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr>
            <td>{item.time.toLocaleTimeString()}</td>
            <td>{item.horseNo}</td>
            <td>{item.winOdd}</td>
            <td>{item.placeOdd}</td>
            <td>{item.money}</td>
            <td>{item.moneychange}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </>
  );
});