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

router.post('/verify', (req, res) => {
    if (req.body.token) {
        usersManager.verify(req.body.token).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing token"});
    }
})

router.post('/getUserInformation', (req, res) => {
    if (req.body.token) {
        usersManager.getUserInformation(req.body.token).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing token"});
    }
})

router.post('/getProfileInformation', (req, res) => {
    if (req.body.token && req.body.username) {
        usersManager.getProfileInformation(req.body.token, req.body.username).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing token or username"});
    }
})

router.post('/updateProfileInformation', (req, res) => {
    if (
        req.body.token !== null &&
        req.body.email !== null &&
        req.body.workplace !== null &&
        req.body.description !== null &&
        req.body.country !== null
    ) {
        // token && email && workplace && description && country
        usersManager.updateProfileInformation(req.body.token, req.body.email, req.body.workplace, req.body.description, req.body.country).then((result) => {
            res.send(result);
        }).catch((err) => {
            res.send(err);
        });
    } else {
        res.send({success: false, message: "Missing information"});
    }
})

module.exports = router;
