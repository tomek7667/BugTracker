// Basic express server setup
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
// Express routers
let usersRouter = require('./routes/users');
let programsRouter = require('./routes/programs');

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', usersRouter);
app.use('/programs', programsRouter);

module.exports = app;
