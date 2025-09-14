const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accountFunction = require('./api/admin.js');

// Dynamically handle routes
app.all('/api/admin', (req, res) => {
	accountFunction(req, res);
});

app.listen(3000, () => {
	console.log('Express server running on http://localhost:3000');
});
