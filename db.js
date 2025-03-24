const mysql = require('mysql2');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'ety',
	password: 'dbpassword',
	database : 'etyWords'
});

db.connect((err) => {
	if (err) {
		consoel.error('MySQL connection error:',err);
	} else {
		console.log('connected to MySQL database.');
	}
});

module.exports = db;
