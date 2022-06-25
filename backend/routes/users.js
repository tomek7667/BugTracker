let express = require('express');
let router = express.Router();
let usersManager = require('../managers/users');

/* Sanity check */
router.get('/ping', (req, res) => {
    res.send('pong!');
})

router.post('/login',  (req, res) => {
    // Username can be an e-mail
    if (req.body.username && req.body.password) {
        usersManager.login(req.body.username, req.body.password).then((result) => {
            usersManager.updateLastLogged(req.body.username).then(() => {
                res.send(result);
            }).catch((err) => {
                res.send(err);
            });
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing username or password"});
    }
})

router.post('/register', (req, res) => {
    if (req.body.username && req.body.password && req.body.email) {
        usersManager.register(req.body.username, req.body.password, req.body.email).then((result) => {
            usersManager.updateLastLogged(req.body.username).then(() => {
                res.send(result);
            }).catch((err) => {
                res.send(err);
            });
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing username, password or email"});
    }
})

module.exports = router;
