const fs = require('fs');

// variables
const dataPath = './data/artists.json';

// helper methods
const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            console.log(err);
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
};

const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            console.log(err);
        }

        callback();
    });
};

function isValidUrl(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }

    return true;
}

// CRUD methods
module.exports = {
    // READ artist
    read_artists: function(req, res) {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            } else {
                //sort data by the artist name
                var artists = Object.values(JSON.parse(data));
                artists.sort(function(a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    if (a > b)
                        return 1;
                    else if (a < b)
                        return -1;
                    return 0;
                });
                res.send(artists);
            }
        });
    },

    // CREATE artist
    create_artists: function(req, res) {

        readFile(data => {
                //check if fileds are valid
                for (var i in Object.keys(req.body)) {
                    var key = Object.keys(req.body)[i];
                    if (!(key == "id" || key == "name" || key == "birth_year" || key == "link_profile_picture" || key == "songs")) {
                        res.status(400).send("Bad-Request, filed invalid");
                        return;
                    }
                }
                // check if link_profile_picture is valid url
                if (!isValidUrl(req.body["link_profile_picture"])) {
                    res.status(400).send("Bad-Request, (add artist)");
                    return;
                }
                // check if id already exist
                var values = Object.values(data);
                for (var i in values) {
                    if (values[i]['id'] == req.body.id) {
                        res.send("ID already exists");
                        return;
                    }
                }
                //If it's OK
                data[req.body.id] = req.body;

                writeFile(JSON.stringify(data, null, 2), () => {
                    res.status(200).send('New artist added');
                });
            },
            true);
    },

    // CREATE song
    add_artist_song: function(req, res) {

        readFile(data => {
                const artID = req.params['id'];
                // check if the song already exists
                for (var song in data[artID]['songs']) {
                    if (data[artID]['songs'][song] == Object.keys(req.body)[0]) {
                        res.send("Song already exists");
                        return;
                    }
                }
                // if it's OK
                data[artID]['songs'].push(Object.keys(req.body)[0]);

                writeFile(JSON.stringify(data, null, 2), () => {
                    res.status(200).send(`new song for artist id: ${artID} is added`);
                });
            },
            true);
    },

    // DELETE artist
    delete_artists: function(req, res) {
        readFile(data => {

                const artID = req.params['id'];
                if (isNaN(artID)) {
                    res.status(400).send("Bad-Request in add song - id is invalid)");
                    return;
                }
                // check if id is exists
                var values = Object.values(data);
                var isExist = false;
                for (var i in values) {
                    if (values[i]['id'] == artID) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    res.status(400).send("Artist ID not found");
                    return;
                }
                // if it's OK
                delete data[artID];

                writeFile(JSON.stringify(data, null, 2), () => {
                    res.status(200).send(`artist id: ${artID} is removed`);
                });
            },
            true);
    },

    //DELETE song
    delete_artist_song: function(req, res) {

        readFile(data => {
                const artistId = req.params['id'];
                if (isNaN(artistId) || Object.keys(req.body)[0] == null) {
                    res.status(400).send("Bad-Request, (delete song, id is invalid)");
                    return;
                }
                // check if id exists
                var values = Object.values(data);
                var isExist = false;
                for (var i in values) {
                    if (values[i]['id'] == artistId) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    res.status(400).send("Artist ID not found");
                    return;
                }
                // check if the song exists
                isExist = false;

                // check for the song and remove from the array
                for (var song in data[artistId]['songs']) {
                    if (song == parseInt(Object.keys(req.body)[0])) {
                        data[artistId].songs.splice(song, 1);
                        isExist = true;
                        break;
                    }
                }
                if (Object.keys(req.body)[0] == "") {
                    data[artistId].songs = [];
                }
                // song not found
                if (!isExist) {
                    res.status(400).send("Song not found");
                    return;
                }
                // all right
                writeFile(JSON.stringify(data, null, 2), () => {
                    res.status(200).send(`song for artist id: ${artistId} updated`);
                });
            },
            true);
    }
};