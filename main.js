const axios = require('axios');
const Surreal = require('surrealdb.js');
const db = new Surreal('http://127.0.0.1:8000/rpc');


async function get_data(url) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    axios.get(url)
      .then(res => {
        console.log(res.data)
        console.log(timestamp)
      })
      .catch(err => console.log(new Date(), err.message));

		// Signin as a namespace, database, or root user
		await db.signin({
			user: 'root',
			pass: 'root',
		});

		// Select a specific namespace / database
		await db.use('test', 'test');

		// Create a new person with a random id
		let created = await db.create("person", {
			title: 'Founder & CEO',
			name: {
				first: 'Tobie',
				last: 'Morgan Hitchcock',
			},
			marketing: true,
			identifier: Math.random().toString(36).substr(2, 10),
		});

		// Update a person record with a specific id
		let updated = await db.change("person:jaime", {
			marketing: true,
		});

		// Select all people records
		let people = await db.select("person");

		// Perform a custom advanced query
		let groups = await db.query('SELECT marketing, count() FROM type::table(tb) GROUP BY marketing', {
			tb: 'person',
		});

	} catch (e) {

		console.error('ERROR', e);

	}

}


// every 2 seconds, send a request to the server
setInterval(() => {
  get_data("https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=2022-09-11&venue=ST&start=1&end=10");
}, 2000);

setInterval(() => {
  get_data("https://bet.hkjc.com/racing/getJSON.aspx?type=winplaodds&date=2022-09-11&venue=HV&start=1&end=10");
}
, 2000);