// app.js
// alert green box and brown box
const  axios   =   require ( 'axios' ) ;
let WinPlaceOdds = {};
let QinOdds = {};
let QplOdds = {};
const color = ["正常", "大熱","綠格", "啡格"];
let pools = {};
let poolsdiff = {};
let raceno = 0;

// win odds and place odds
// api url: https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=<YYYY-MM-DD>&venue=<ST|HV>&start=<start_raceno>&end=<end_raceno>
// exmaple: https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=2022-09-11&venue=ST&start=1&end=10
// data exmaple
// HHMMSS@@@WIN;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0#PLA;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0
async function getWinPlaceOdds(date, venue, start, end, WinPlaceOdds) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        axios.get("https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=" + date + "&venue=" + venue + "&start=" + start + "&end=" + end)
            .then(response => {
            //     let example = "@@@WIN;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0#PLA;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=3";
            //     if (Object.keys(WinPlaceOdds).length === 0) {
            //         example = "@@@WIN;1=11=0;2=4.4=2;3=7.6=0;4=18=2;5=25=0;6=14=0;7=37=0;8=15=0;9=14=0;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0#PLA;1=11=0;2=4.4=1;3=7.6=0;4=18=0;5=25=0;6=14=0;7=37=0;8=15=0;9=14=1;10=16=0;11=11=0;12=13=0;13=24=0;14=5.5=0";
            // }
                const data = response.data['OUT'].split("@@@")[1];
                // split win and place
                const winPlaceOdds = data.split("#");
                // split <horseno>=<odds>=<isFav>
                const winOdds = winPlaceOdds[0].split(";");
                const placeOdds = winPlaceOdds[1].split(";");
                // remove @@@WIN; and @@@PLA;
                winOdds.shift();
                placeOdds.shift();
                // loop win odds
                for (let i = 0; i < winOdds.length; i++) {
                    // split <horseno>=<odds>=<isFav>
                    const winOddsSplit = winOdds[i].split("=");
                    const placeOddsSplit = placeOdds[i].split("=");
                    // if WinPlaceOdds[winOddsSplit[0]] is not empty, check if odds is different
                    if (WinPlaceOdds[winOddsSplit[0]] !== undefined) {
                        if (WinPlaceOdds[winOddsSplit[0]].isFavWin !== winOddsSplit[2]) {
                            console.log("timestamp:", Date.now());
                            console.log("獨贏落飛: " + winOddsSplit[0] + " 由 " + color[WinPlaceOdds[winOddsSplit[0]].isFavWin] + " 變 " + color[winOddsSplit[2]]);
                        }
                        if (WinPlaceOdds[winOddsSplit[0]].isFavPlace !== placeOddsSplit[2]) {
                            console.log("timestamp:", Date.now());
                            console.log("位置落飛: " + winOddsSplit[0] + " 由 " + color[WinPlaceOdds[winOddsSplit[0]].isFavPlace] + " 變 " + color[placeOddsSplit[2]]);
                        }
                    }
                    // push to array, using horse no as key
                    WinPlaceOdds[winOddsSplit[0]] = {
                        horseno: winOddsSplit[0],
                        winOdds: winOddsSplit[1],
                        isFavWin: winOddsSplit[2],
                        placeOdds: placeOddsSplit[1],
                        isFavPlace: placeOddsSplit[2]
                    };
                }
            })
            .catch(err => console.log(new Date(), err.message));
    } catch (e) {
        console.error('ERROR', e);
    }
}


// quinella odds
// api url: https://bet.hkjc.com/racing/getJSON.aspx?type=qin&date=<YYYY-MM-DD>&venue=<ST|HV>&raceno=<raceno>
// exmaple: https://bet.hkjc.com/racing/getJSON.aspx?type=qin&date=2022-09-11&venue=ST&raceno=2
// data exmaple
//OUT: "HHMMSS@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0"
    
async function getQuinellaOdds(date, venue, raceno, QinOdds) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        axios.get('https://bet.hkjc.com/racing/getJSON.aspx?type=qin&date='+date+'&venue='+venue+'&raceno='+raceno)
            .then(response => {
                // split <horse1-horse2>=<odds>=<isFav>
                // let example = "133125@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=2;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=3";//response.data.split("@@@")[1];
                // if (Object.keys(QinOdds).length === 0) {
                //     example = "133125@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=3;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0";
                // }
                let data = response.data['OUT'].split("@@@")[1];
                const quinellaOdds = data.split(";");
                // remove first element
                quinellaOdds.shift();
                // loop quinella odds
                for (let i = 0; i < quinellaOdds.length; i++) {
                    // split <horse1-horse2>=<odds>=<isFav>
                    const quinellaOddsSplit = quinellaOdds[i].split("=");

                    // if QinOdds[quinellaOddsSplit[0]] is not empty, check if odds is different
                    if (QinOdds[quinellaOddsSplit[0]] !== undefined) {
                        // if (QinOdds[quinellaOddsSplit[0]].odds !== quinellaOddsSplit[1]) {
                        //     console.log(timestamp)
                        //     console.log("quinella: " + quinellaOddsSplit[0] + " odds changed from " + QinOdds[quinellaOddsSplit[0]].odds + " to " + quinellaOddsSplit[1]);
                        // }
                        if (QinOdds[quinellaOddsSplit[0]].isFav !== quinellaOddsSplit[2]) {
                            console.log("timestamp:", Date.now());
                            console.log("連贏落飛: " + quinellaOddsSplit[0] + " 由 " + color[QinOdds[quinellaOddsSplit[0]].isFav] + " 變 " + color[quinellaOddsSplit[2]]);
                        }
                    }
                    // push to array, using horse1-horse2 as key
                    QinOdds[quinellaOddsSplit[0]] = {
                        horseno: quinellaOddsSplit[0],
                        odds: quinellaOddsSplit[1],
                        isFav: quinellaOddsSplit[2]
                    };
                }
            })
            .catch(err => console.log(new Date(), err.message));
    } catch (e) {
        console.error('ERROR', e);
    }
}


// quinella place odds
// api url: https://bet.hkjc.com/racing/getJSON.aspx?type=qpl&date=<YYYY-MM-DD>&venue=<ST|HV>&raceno=<raceno>
// exmaple: https://bet.hkjc.com/racing/getJSON.aspx?type=qpl&date=2022-09-11&venue=ST&raceno=2
// data exmaple
//OUT: "HHMMSS@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0"

async function getQuinellaPlaceOdds(date, venue, raceno, QplOdds) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        axios.get('https://bet.hkjc.com/racing/getJSON.aspx?type=qpl&date='+date+'&venue='+venue+'&raceno='+raceno)
            .then(response => {
                // split <horse1-horse2>=<odds>=<isFav>
                // let example = "133125@@@;1-2=87=0;1-3=124=0;1-4=37=1;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=3;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=0;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=3";//response.data.split("@@@")[1];
                // if (Object.keys(QplOdds).length === 0) {
                //     example = "133125@@@;1-2=87=0;1-3=124=0;1-4=37=0;1-5=224=0;1-6=33=0;1-7=148=2;1-8=101=0;1-9=51=0;1-10=549=0;1-11=302=2;1-12=172=2;1-13=104=2;1-14=73=0;2-3=96=0;2-4=34=0;2-5=202=0;2-6=40=0;2-7=100=2;2-8=63=0;2-9=58=0;2-10=331=0;2-11=288=2;2-12=165=2;2-13=89=3;2-14=50=2;3-4=46=0;3-5=289=0;3-6=41=0;3-7=168=2;3-8=82=2;3-9=62=0;3-10=604=0;3-11=386=0;3-12=217=2;3-13=110=0;3-14=63=2;4-5=78=0;4-6=14=0;4-7=49=0;4-8=33=0;4-9=20=0;4-10=219=0;4-11=117=2;4-12=64=2;4-13=37=2;4-14=24=0;5-6=78=0;5-7=278=0;5-8=193=0;5-9=114=0;5-10=875=0;5-11=736=0;5-12=380=0;5-13=253=2;5-14=141=2;6-7=56=0;6-8=31=0;6-9=14=1;6-10=180=0;6-11=118=2;6-12=58=0;6-13=38=2;6-14=23=0;7-8=108=2;7-9=85=0;7-10=536=0;7-11=382=0;7-12=241=2;7-13=131=3;7-14=86=2;8-9=46=0;8-10=437=0;8-11=240=0;8-12=148=2;8-13=85=2;8-14=41=0;9-10=183=0;9-11=164=0;9-12=80=0;9-13=59=0;9-14=33=0;10-11=643=0;10-12=511=0;10-13=440=0;10-14=238=0;11-12=402=0;11-13=267=0;11-14=198=0;12-13=164=2;12-14=95=0;13-14=58=0";
                // }
                let data = response.data['OUT'].split("@@@")[1];
                const quinellaPlaceOdds = data.split(";");
                // remove first element
                quinellaPlaceOdds.shift();
                // loop quinella odds
                for (let i = 0; i < quinellaPlaceOdds.length; i++) {
                    // split <horse1-horse2>=<odds>=<isFav>
                    const quinellaPlaceOddsSplit = quinellaPlaceOdds[i].split("=");

                    // if QinOdds[quinellaOddsSplit[0]] is not empty, check if odds is different
                    if (QplOdds[quinellaPlaceOddsSplit[0]] !== undefined) {
                        // if (QplOdds[quinellaPlaceOddsSplit[0]].odds !== quinellaPlaceOddsSplit[1]) {
                        //     console.log(timestamp)
                        //     console.log("quinella Place: " + quinellaPlaceOddsSplit[0] + " odds changed from " + QplOdds[quinellaPlaceOddsSplit[0]].odds + " to " + quinellaOddsSplit[1]);
                        // }
                        if (QplOdds[quinellaPlaceOddsSplit[0]].isFav !== quinellaPlaceOddsSplit[2]) {
                            console.log("timestamp:", Date.now());
                            console.log("位置Q落飛: " + quinellaPlaceOddsSplit[0] + " 由 " + color[QplOdds[quinellaPlaceOddsSplit[0]].isFav] + " 變 " + color[quinellaPlaceOddsSplit[2]]);
                        }
                    }
                    // push to array, using horse1-horse2 as key
                    QplOdds[quinellaPlaceOddsSplit[0]] = {
                        horseno: quinellaPlaceOddsSplit[0],
                        odds: quinellaPlaceOddsSplit[1],
                        isFav: quinellaPlaceOddsSplit[2]
                    };
                }
            })
            .catch(err => console.log(new Date(), err.message));
    } catch (e) {
        console.error('ERROR', e);
    }
}

// get the pools' size and stoed in pools
// https://bet.hkjc.com/racing/getJSON.aspx?type=pooltot&date=<YYY-MM-DD>&venue=<venue>&raceno=<raceno>
// https://bet.hkjc.com/racing/getJSON.aspx?type=pooltot&date=2022-09-14&venue=HV&raceno=3
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

async function getPoolSize(date,venue,raceno,pools,poolsdiff) {
    try {
        const response = await axios.get('https://bet.hkjc.com/racing/getJSON.aspx?type=pooltot&date=' + date + '&venue=' + venue + '&raceno=' + raceno);
        // console.log(response.data); 
        // console.log(response.data.inv.length);
        for (let i = 0; i < response.data.inv.length; i++) {
            let pool = response.data.inv[i].pool;
            let value = response.data.inv[i].value;
            // store the diff of pool size in poolsdiff
            if (pools[pool] !== undefined) {
                poolsdiff[pool] = value - pools[pool];
                if (poolsdiff[pool] > 0) {
                console.log("timestamp:", Date.now());
                console.log(pool + " pool size changed from " + pools[pool] + " to " + value + ", diff: " + poolsdiff[pool]);
                }
            }
            pools[pool] = value;
        }
    } catch (e) {
        console.error('ERROR', e);
    }
}

// get current race no
// https://bet.hkjc.com/racing/getJSON.aspx?type=scratched&date=<YYYY-MM-DD>&venue=<venue>
// sample response
// {
//     RAN_RACE: "0",
//     SCR_LIST: "HV",
//     SR: "HV",
//     SS: ""
// }
async function checkRaceNo(date,venue){
    try {
        return await axios.get('https://bet.hkjc.com/racing/getJSON.aspx?type=scratched&date=' + date + '&venue=' + venue)
            .then(response => {
                return + response.data["RAN_RACE"]+1;
        })
    }
     catch (e) {
        console.error('ERROR', e);
    }
}

// get html from https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=en&dv=local
// search for this line : $.getScript("/racing/script/rsdata.js?lang=en&date=2022-09-14&venue=HV ...
// get date and venue code from this line
// then get odds and record the state of the odds every second , there are 4 states, 0, 1, 2, 3
// 0: normal, 1: hottest, 2: green box, 3: brown box
// send notification if the state of the odds changed to 2 or 3

async function getDateVenue() {
    return axios.get('https://bet.hkjc.com/racing/pages/odds_wp.aspx?lang=en&dv=local')
    .then(response => {
        const html = response.data;
        const regex = /date=(\d{4}-\d{2}-\d{2})&venue=(\w{2})/g;
        const match = regex.exec(html);
        const date = match[1];
        const venue = match[2];
        return {date, venue};
    })
    .catch(error => {
        console.log(error);
    }
    );
}

const main = async() => {
    const {date,venue} = await getDateVenue();
    console.log(date,venue, "大戶落飛追蹤中...");
    const refreshfeq = 1000; //1 second
        setInterval(async() => {
            // console.log("timestamp:", Date.now());
            let currentrace = await checkRaceNo(date,venue);
            if (currentrace !== raceno) {
                raceno = currentrace;
                console.log("壢次變更，現在場次: " + raceno);
            }
            getWinPlaceOdds(date,venue,raceno,raceno,WinPlaceOdds);
            getQuinellaOdds(date,venue,raceno,QinOdds);
            getQuinellaPlaceOdds(date,venue,raceno,QplOdds);
            // console.log("--------------------------------------------------");
            getPoolSize(date,venue,raceno,pools,poolsdiff);
            // console.log("--------------------------------------------------");
        }
        , refreshfeq);
};

main();