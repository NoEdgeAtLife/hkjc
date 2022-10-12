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
        throw response.redirect("/pro/" + currentRace);
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
        let data = await response.json();
        const winRaceData = data[0]['result'];
        // get ref win odd and append winMoneyRef to winRaceData
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
                "oddtype": "win",
            })
        });
        data = await response.json();
        const winRaceDataRef = data[0]['result'];
        const mergedata = winRaceData.map((item) => {
            const refitem = winRaceDataRef.find((refitem) => refitem.horseNo === item.horseNo);
            return { ...item, winMoneyRef: refitem?.money || 0 };
        }
        );
        // get qin percent change
        response = await fetch('http://localhost:3000/odd/ref', {
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
        data = await response.json();
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
        // get qinPercentChangeRank 
        const qinPercentChangeRank = Object.keys(qinPercentChange).sort((a, b) => qinPercentChange[b] - qinPercentChange[a]);
        // qinPercentChangeRank = [ 1, 2, ... ]
        // append qinPercentChange and qinPercentChangeRank to mergedata
        const returnData = mergedata.map((item) => {
            return { ...item, qinPercentChange: qinPercentChange[item.horseNo] || 0, qinPercentChangeRank: qinPercentChangeRank.indexOf(item.horseNo.toString()) + 1 };
        }
        );
        return returnData;
    }
};

export default component$(() => {
  const location = useLocation();
  const raceNo = location.params.raceNo;
  const resource = useEndpoint<EndpointData>();
  const horseNoSet = new Set<number>();
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
                    buttons.push(<button><a href={"/pro/" + i + "/"}>{i}</a></button>);
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
                    <th>qinPercentChange</th>
                </tr>
                {race?.reduce((acc, cur) => {
                    if (!horseNoSet.has(cur.horseNo)) {
                        horseNoSet.add(cur.horseNo);
                        acc.push(cur);
                    }
                    return acc;
                }, [])
                 // sort by money - winMoneyRef
                .sort((b, a) => a.money - b.money - (a.winMoneyRef - b.winMoneyRef))
                // filter the top 6
                .filter((data, index) => index < 12)
                .map((data, index) => (
                    <tr>
                        <td>{data.horseNo}</td>
                        <td>{Math.trunc(data.money)}</td>
                        {/* <td>{data.time}</td> */}
                        <td>{data.winOdd}</td>
                        <td>{data.winStatus}</td>
                        <td id = {'W'+index.toString()}>{Math.trunc(data.money - data.winMoneyRef)}</td>
                        <td id = {'QPer'+data.qinPercentChangeRank}>{Math.trunc(data.qinPercentChange * 100)}%</td>
                    </tr>
                ))} 
            </table>
        </>
        )}
    />
    );
});
