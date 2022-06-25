let express = require('express');
let router = express.Router();

/* Sanity check */
router.get('/ping', function(req, res, next) {
    res.send('Users: pong!');
})


module.exports = router;
