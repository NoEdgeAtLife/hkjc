import { component$, Resource, useWatch$} from "@builder.io/qwik";
import { RequestHandler, useEndpoint, useLocation } from "@builder.io/qwik-city";
import "./index.css";

type EndpointData = RaceData[] | null;

interface RaceData {
  raceNo: number;
  money: string;
  time: string;
  horseNo: number;
  qinMoneyRef: number;
  qinPercentChange: number;
}

export const getMaxRaceNo = async () => {
    const response = await fetch("http://localhost:3000/race/max");
    const data = await response.json();
    return data;
}

export const getCurrentRaceNo = async () => {
    const response = await fetch("http://localhost:3000/race/current");
    const data = await response.json();
    return data;
}

export const onGet: RequestHandler<EndpointData> = async ({ params, response }) => {
    const maxRaceNo = await getMaxRaceNo();
    const raceNo = Number(params.raceNo);
    if (raceNo > maxRaceNo || raceNo < 1 || isNaN(raceNo)) {
        response.status = 404;
        const currentRace = await getCurrentRaceNo();
        throw response.redirect("/qqp/" + currentRace);
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
                "oddtype": "qin"
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
        // racedata = [ { horsePair: [1,2] , money: 1.1, ... }, { horsePair: [1,3] , money: 1.2, ... }, ... ]
        // sum money to get qinMoney for each horse
        const qinMoney = racedata.reduce((acc, item) => {
            const horseNo1 = item.horsePair[0];
            const horseNo2 = item.horsePair[1];
            if (acc[horseNo1] === undefined) {
                acc[horseNo1] = 0;
            }
            if (acc[horseNo2] === undefined) {
                acc[horseNo2] = 0;
            }
            acc[horseNo1] += Number(item.money);
            acc[horseNo2] += Number(item.money);
            return acc;
        }, {});
        // qinMoney = { 1: 1.1, 2: 1.2, ... }
        // get qinMoneyRef
        response = await fetch('http://localhost:3000/odd/ref', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
            },
            body: JSON.stringify({
                "id": raceNo,
                // 30 min before now , utc+8
                "reftime": new Date(Date.now() - 10 * 60 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }),
                "oddtype": "qin"
            })
        });
        const refdata = await response.json();
        // refdata = [ { horsePair: [1,2] , money: 1.1, ... }, { horsePair: [1,3] , money: 1.2, ... }, ... ]
        const refmoney = refdata[0]['result'];
        // calculate qinMoneyRef
        const qinMoneyRef = refmoney.reduce((acc, item) => {
            const horseNo1 = item.horsePair[0];
            const horseNo2 = item.horsePair[1];
            if (acc[horseNo1] === undefined) {
                acc[horseNo1] = 0;
            }
            if (acc[horseNo2] === undefined) {
                acc[horseNo2] = 0;
            }
            acc[horseNo1] += Number(item.money);
            acc[horseNo2] += Number(item.money);
            return acc;
        }, {});
        // qinMoneyRef = { 1: 1.1, 2: 1.2, ... }
        // get qinPercentChange
        const qinPercentChange = Object.keys(qinMoney).reduce((acc, horseNo) => {
            acc[horseNo] = (qinMoney[horseNo] - qinMoneyRef[horseNo]) / qinMoneyRef[horseNo];
            return acc;
        }, {});
        // qinPercentChange = { 1: 0.1, 2: 0.2, ... }
        // return race data with qinMoneyRef and qinPercentChange
        const result = racedata.map((item) => {
            const horseNo1 = item.horsePair[0];
            return {
                raceNo: raceNo,
                money: item.money,
                time: item.time,
                horseNo: horseNo1,
                qinMoneyRef: qinMoneyRef[horseNo1],
                qinPercentChange: qinPercentChange[horseNo1]
            }
        }).concat(racedata.map((item) => {
            const horseNo2 = item.horsePair[1];
            return {
                raceNo: raceNo,
                money: item.money,
                time: item.time,
                horseNo: horseNo2,
                qinMoneyRef: qinMoneyRef[horseNo2],
                qinPercentChange: qinPercentChange[horseNo2]
            }
        }));
        return result;
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
                    buttons.push(<button><a href={"/qqp/" + i + "/"}>{i}</a></button>);
                }
                return buttons;
            })}
            <table>
                <tr>
                    <th>horseNo</th>
                    <th>money</th>
                    {/* <th>time</th> */}
                    <th>qinMoneyRef</th>
                    <th>qinPercentChange</th>
                </tr>
                { // convert to set based on horseNo
                race?.reduce((acc, cur) => {
                    if (!horseNoSet.has(cur.horseNo)) {
                        horseNoSet.add(cur.horseNo);
                        acc.push(cur);
                    }
                    return acc;
                }, []) // sort by qinPercentChange
                .sort((a, b) => { return b.qinPercentChange - a.qinPercentChange })
                // filter the top 6
                .filter((data, index) => index < 11)
                .map((data, index) => (
                    <tr>
                        <td>{data.horseNo}</td>
                        <td>{Math.trunc(data.money)}</td>
                        {/* <td>{data.time}</td> */}
                        <td>{data.qinMoneyRef}</td>
                        <td id = {"Q"+index.toString()}>{data.qinPercentChange}</td>
                    </tr>
                ))} 
            </table>
        </>
        )}
    />
    );
});
