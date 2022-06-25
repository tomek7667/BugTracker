let express = require('express');
let router = express.Router();
// Make example programs
let examplePrograms = [
    {
        id: 1,
        name: 'Example Program 1',
        description: 'This is an example program.',
        languages: [
            "JavaScript",
            "Python",
            "C++"
        ],
        createdAt: '2018-01-01T00:00:00.000Z',
        user: "janedoe",
        url: "/exampleprograms1"
    },
    {
        id: 2,
        name: 'Example Program 2',
        description: 'This is an example program.',
        language: [
            "C++"
        ],
        createdAt: '2018-01-01T00:00:00.000Z',
        user: "janedoe",
        url: "/exampleprogram2",
    },
    {
        id: 3,
        name: 'Example Program 3',
        description: 'This is an example program.',
        language: [
            "JavaScript",
            "C++"
        ],
        createdAt: '2018-01-01T00:00:00.000Z',
        user: "janedoe",
        url: "/exampleprogram3"
    }
];

router.get('/programs', function(req, res, next) {
    res.send(examplePrograms);
})

/* Sanity check */
router.get('/ping', function(req, res, next) {
    res.send('pong!');
})


module.exports = router;
