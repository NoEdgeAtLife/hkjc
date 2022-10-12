import { component$, Resource, useWatch$} from "@builder.io/qwik";
import { RequestHandler, useEndpoint, useLocation } from "@builder.io/qwik-city";
import "./index.css";

type EndpointData = RaceData[] | null;

interface RaceData {
  raceNo: number;
  money: string;
  time: string;
  horseNo: number;
  winOdd: number;
  winStatus: number;
  winMoneyRef: number;
  qinPercentChange: number;
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
        let response = await fetch('http://localhost:3000/odd/ref', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
            body: JSON.stringify({
                "id": raceNo,
                // 30 min before now , utc+8
                "reftime": new Date(Date.now()).toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }),
                "oddtype": "win"
            })
        });
        const data = await response.json();
        const racedata = data[0]['result'];
        // post /odd/ref 
        // body : {
        //     "id": raceId,
        //     "reftime": "string", e.g. 5 min before now , utc+8
        //     "oddtype": "string"  e.g. win
        //   }
        response = await fetch('http://localhost:3000/odd/ref', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
            body: JSON.stringify({
                "id": raceNo,
                // 30 min before now , utc+8
                "reftime": new Date(Date.now() - 30 * 60 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }),
                "oddtype": "win"
            })
        });
        const refdata = await response.json();
        const refmoney = refdata[0]['result'];
        // refmoney = [ { horseNo: 1, money: 1.1, ... }, { horseNo: 2, money: 1.2, ... }, ... ]
        // racedata = [ { horseNo: 1, money: 1.1, ... }, { horseNo: 2, money: 1.2, ... }, ... ]
        // merge refmoney and racedata, rename money of refmoney to winMoneyRef
        const mergedata = racedata.map((item) => {
            const refitem = refmoney.find((refitem) => refitem.horseNo === item.horseNo);
            return { ...item, winMoneyRef: refitem?.money || 0 };
        }
        );
        return mergedata;
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
            <div>Update Time : {race[0].time}</div>
            {/* get max race no and render button to wp/1..maxraceno */}
            {getMaxRaceNo().then((maxRaceNo) => {
                const buttons = [];
                for (let i = 1; i <= maxRaceNo; i++) {
                    buttons.push(<button><a href={"/wp/" + i + "/"}>{i}</a></button>);
                }
                return buttons;
            })}
            <table>
                <tr>
                    <th>horseNo</th>
                    <th>money</th>
                    {/* <th>time</th> */}
                    <th>winOdds</th>
                    <th>winStatus</th>
                    <th>winMoneyChange</th>
                </tr>
                {race // sort by money - winMoneyRef
                .sort((b, a) => a.money - b.money - (a.winMoneyRef - b.winMoneyRef))
                // filter the top 6
                .filter((data, index) => index < 11)
                .map((data, index) => (
                    <tr>
                        <td>{data.horseNo}</td>
                        <td>{Math.trunc(data.money)}</td>
                        {/* <td>{data.time}</td> */}
                        <td>{data.winOdd}</td>
                        <td>{data.winStatus}</td>
                        <td id = {'W'+index.toString()}>{Math.trunc(data.money - data.winMoneyRef)}</td>
                    </tr>
                ))} 
            </table>
        </>
        )}
    />
    );
});
