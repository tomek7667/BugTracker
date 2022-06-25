// Basic express server setup
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const app = express();
const port = 3000;

// MySQL connection
const pool = mysql.createPool({
    host: 'localhost',
    user:  process.env.MYSQL_LOGIN || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: 'bugtracker'
});

// Managers import
const usersManager = require('./managers/users.js');
const programsManager = require('./managers/programs.js');

// Routers import
const usersRouter = require('./routes/users');
const programsRouter = require('./routes/programs');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../dist')));

// API routes
app.use('/api/users', usersRouter);
app.use('/api/programs', programsRouter);

app.get('/', (req, res) => {
    res.render("../dist/index.html");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
    usersManager.setCon(pool);
    programsManager.setCon(pool);
});

module.exports = app;
