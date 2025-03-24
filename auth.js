const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const bodyParser = require('body-parser');

const template = require('./template.js');
const db = require('./db');
const logger = require('./../winston');

router.use(bodyParser.urlencoded({ extended: false}));

// Render login page
//
router.get('/login', (req, res) => {
	const title = 'login';
	const html = template.HTML(title, `
		<h2>Login</h2>
		<form action="/auth/login_process" method="post">
			<p><input class="login" type="text" name="username" placeholder="ID"></p>
			<p><input class="login" type="password" name="pwd" placeholder="PW"></p>
		</form>
		<p>Accout register: <a href="/auth/register">Register</a></p>
		`,'');
	res.send(html);
});

// Handle login
router.post('/login_process', async (req, res) => {
	const { username, pwd} = req.body;

	if (!username || !pwd) {
		return res.send(`<script>alert("Id and Pw required");document.location.href="/auth/login";</script>`);
	}

	try {
		const [results] = await db.promise().query('SELECT * FROM userTable WHERE username = ?', [username]);

		if(results.length >0) {
			const user = results[0];
			const passwordMatch = await bycrypt.compare(pwd, user.password);

			if (passwordMatch) {
				req.session.is_logined = true;
				req.session.nickname = username;
				req.session.groupname = user.groupname;

				loggger.verbose(`Login success: ${username} | group: ${user.groupname}`);
				return req.session.save(() => res.redirect('/'));
			}
		}

		res.send(`<script>alert("Login Fail");document.location.href="/auth/login";</script>`);
	} catch (err) {
		logger.error(err);
		res.status(500).send("Server Error");
	}
});

//Logout
router.get('/logout',(req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
});

//Render register page
router.get('/register', (req,res) => {
	const title = 'register';
	const html = template.HTML(title, `
	<h2>Register</h2>
	<h3> asdfasdf </h3>
	<form action="auth/register_process" method="post">
		<p><input class="login" type="text" name="username" placeholder="ID"></p>
		<p><input class="login" type="password" name="pwd" placeholder="PW"></p>
		<p><input class="login" type="password" name="pwd2" placeholder="PW CONFIRM"></p>
		<p><input class="btn" type="submit" value="submit"></p>

	</form>
	<p><a href="/auth/login">Login page</a></p>
	`,''):
	res.send(html);
});


// Handle register

router.post('/register_process', async (req, res) => {
	const {username, pwd, pwd2} = req.body;
	if (!username || !pwd || !pwd2) {
		return res.send(`<script>alert("all fields must be filled.");document.location.href="/auth/register";</script>`);
	}
	if (pwd!==pwd2) {
		return res.send(`<script>alert("incorrect password confirm");document.location.href="/auth/register";</script>`);
	}

	try {
		const [existing] = await db.promise().query('SELECT * FROM userTable WHERE usernae = ?', [username]);
		if (existing.length >0) {
			return res.send(`<script>alert("Used username");document.location.href="/auth/register";</script>`);
		}

		const hash = await bcrypt.hash(pwd, 10);

		await db.promise().query(
			'INSERT INTO userTable (username, password, groupname) VALUES (?, ?,?)',
			[username, hash, 'normal']
		);

		res.send(`<script>alert("register done");document.location.href="/auth/login";</script>`);
	} catch (err) {
		logger.error(err);
		res.status(500).send("server error");
	}
});
module.exports = router;

			
