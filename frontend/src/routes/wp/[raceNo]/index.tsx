import { component$, Resource, useWatch$} from "@builder.io/qwik";
import { RequestHandler, useEndpoint, useLocation } from "@builder.io/qwik-city";

type EndpointData = RaceData[] | null;

interface RaceData {
  raceNo: number;
  money: string;
  time: string;
  horseNo: number;
  winOdd: number;
  winStatus: number;
}

export const getMaxRaceNo = async () => {
    const response = await fetch("http://localhost:3000/race/max");
    const data = await response.json();
    return data;
}

export const onGet: RequestHandler<EndpointData> = async ({ params, response }) => {
    const maxRaceNo = await getMaxRaceNo();
    const raceNo = Number(params.raceNo);
    if (raceNo > maxRaceNo || raceNo < 1 || isNaN(raceNo)) {
        response.status = 404;
        throw response.redirect("/wp/1");
    }
    else {
        const response = await fetch('http://localhost:3000/odd/win/' + params.raceNo);
        const data = await response.json();
        return data[0]['result'];
    }
};

export default component$(() => {
  const location = useLocation();
  const raceNo = location.params.raceNo;
  const resource = useEndpoint<EndpointData>();
  const horseNoSet = new Set();
  return (
    <Resource
      value={resource}
      onPending={() => <div>Loading...</div>}
      onError={() => <div>Error</div>}
      onResolved={(race) => (
        <>
          <h1>Race</h1>
            <div>raceNo: {raceNo}</div>
            <table>
                <tr>
                    <th>horseNo</th>
                    <th>money</th>
                    <th>time</th>
                    <th>winOdds</th>
                    <th>winStatus</th>
                </tr>
                { // convert to set based on horseNo
                race?.reduce((acc, cur) => {
                    if (!horseNoSet.has(cur.horseNo)) {
                        horseNoSet.add(cur.horseNo);
                        acc.push(cur);
                    }
                    return acc;
                }, []) // sort by horseNo
                .sort((a, b) => a.horseNo - b.horseNo)
                .map((data) => (
                    <tr>
                        <td>{data.horseNo}</td>
                        <td>{data.money}</td>
                        <td>{data.time}</td>
                        <td>{data.winOdd}</td>
                        <td>{data.winStatus}</td>
                    </tr>
                ))} 
            </table>
        </>
        )}
    />
    );
});
