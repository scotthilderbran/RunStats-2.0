const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const db = require('./database/config/database');




const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port:${PORT}`));

db.authenticate()
    .then(()=> console.log("connected"))
    .catch(()=> console.log("Error"))

const files = fs.readdirSync(path.join(__dirname, "routes"));
files.forEach(file => {
	const router = require(path.join(__dirname, "./routes", file));

	if (!router.router) {
		console.log(`'${file}' did not export a 'router'. Skipped`);
		return;
	}
	if (!router.prefix) {
		console.log(`'${file}' did not export a 'prefix' path. Defaulting to '/'`);
	}

	app.use(router.prefix || "/", router.router);
	console.log(`registered '${file}' to route '${router.prefix || "/"}'`);
});


