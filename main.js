const axios = require('axios');
const Surreal = require('surrealdb.js');
const db = new Surreal('http://127.0.0.1:8000/rpc');

//test function
(async () => {

	// Signin as a namespace, database, or root user
	await db.signin({
		user: 'root',
		pass: 'pass',
	});

	// Select a specific namespace / database
	await db.use('hkjc', 'odds');
	setInterval(async () => {
	// Get data from url
	axios.get("https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=2022-09-14&venue=HV&start=1&end=1")
            .then(response => {
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
					// create object
					const winOddsObj = {
						"season": "2022",
						"raceDate": "2022-09-14",
						"venue": "HV",
						"raceNo": 1,
						"horseNo": winOddsSplit[0],
						"odds": winOddsSplit[1],
						"isFav": winOddsSplit[2],
						"timestamp": Math.floor(Date.now() / 1000),
					};
					const placeOddsObj = {
						"season": "2022",
						"raceDate": "2022-09-14",
						"venue": "HV",
						"raceNo": 1,
						"horseNo": placeOddsSplit[0],
						"odds": placeOddsSplit[1],
						"isFav": placeOddsSplit[2],
						"timestamp": Math.floor(Date.now() / 1000),
					};
					// insert into database
					db.create("winOdds", winOddsObj);
					db.create("placeOdds", placeOddsObj);
				}
			})
			.catch(err => console.log(new Date(), err.message));
	}, 1000);
})().catch(err => console.log(new Date(), err.message));