const express = require('express'),
    path = require("path"),
    artRoutes = require('../js/artists_server');

var router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'html/index.html'));
});

router.get('/artists', artRoutes.read_artists);
router.post('/artists', artRoutes.create_artists);
router.put('/songs/:id', artRoutes.add_artist_song);
router.delete('/artists/:id', artRoutes.delete_artists);
router.delete('/songs/:id', artRoutes.delete_artist_song);

module.exports = router;