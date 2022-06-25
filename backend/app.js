// Basic express server setup
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
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
});

module.exports = app;
