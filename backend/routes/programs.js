let express = require('express');
let router = express.Router();

/* Sanity check */
router.get('/ping', function(req, res, next) {
    res.send('pong!');
})


module.exports = router;