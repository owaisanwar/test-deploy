const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here

    if(req.method === "GET" && req.url === '/albums') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(albums));
    }



    // artists route handlers:

    //TODO Get all artists:
    if(req.method === 'GET' && req.url === '/artists') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(artists));
    }

    // TODO:  get specific artists:
    if(req.method === 'GET' && req.url.startsWith('/artists')) {
      const urlPath = req.url.split('/');
      if(urlPath.length === 3) {
        const artistId = urlPath[2];
        const artist = artists[artistId]
        console.log(artist);
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify(artist));
      }
    }
    // TODO create artist

    if(req.method === "POST" && req.url === '/artists') {
      const {name} = req.body;
      const artist = {
        artistId: getNewArtistId(),
        name
      }
      artists[artist['artistId']] = artist;
      res.statusCode = 200;
      res.setHeader('content-type', 'application/json');
      return res.end(JSON.stringify(artist));
    }

    // TODO -- edit a specified artist
    if((req.method === 'PUT' || req.method === 'PATCH') && req.url.startsWith('/artists')) {
      const {name} = req.body;
      const urlPath = req.url.split('/');
      if(urlPath.length === 3) {
        const artistId = urlPath[2];
        artists[artistId] = {
          name : name,
          artistId: Number(artistId)
        }
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify(artists[artistId]));
      }
    }
    // TODO delete a artist by artistId

    if(req.method === 'DELETE' && req.url.startsWith('/artists')) {
      const urlPath = req.url.split('/');
      if(urlPath.length === 3) {
        const artistId = urlPath[2];
        delete artists[artistId];
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify({message : "successfully deleted"}));
      }
    }

    // TODO get albums of artist based on artistId;
    if(req.method === 'GET' && req.url.startsWith('/artists')) {
      const urlPath = req.url.split('/');
      if(urlPath.length === 4) {
        const artistId = urlPath[2];
        res.statusCode = 200;
        const albumArr = Object.values(albums);
        const artistAlbums = albumArr.filter((ele) => ele.artistId === Number(artistId));
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        return res.end(JSON.stringify(artistAlbums));
      }
    }
    // TODO get detail of specified album
    if(req.method === 'GET' && req.url.startsWith('/albums')) {
      const urlPath = req.url.split('/');
      const artist = Object.values(artists);
      const albumId = Number(urlPath[2]);
      const albumArr = Object.values(albums);
      const songsArr = Object.values(songs);
      if(urlPath.length === 3) {
        const specificAlbum = albumArr.find((ele) => ele.albumId === albumId);
        const artistOfAlbum = artist.find(ele => ele.artistId === specificAlbum.artistId);
        specificAlbum['artist'] = artistOfAlbum;
        const songsOfAlbum = songsArr.filter((ele) => ele.albumId === specificAlbum.albumId);
        specificAlbum['songs'] = songsOfAlbum;
        res.statusCode = 200;
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify(specificAlbum));
      }
    }
    if(req.method === "POST" && req.url.startsWith('/artists')) {
      const urlPath = req.url.split('/');
      if(urlPath.length === 3) {
        const artistId = Number(urlPath[2]);
        const {name} = req.body;
        const newAlbum = {
          albumId : getNewAlbumId(),
          name,
          artistId
        }
        albums[newAlbum['albumId']] = newAlbum
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        return res.end(JSON.stringify(newAlbum));
      }
    }

    // TODO edit specific album by albumId;
    if(req.method === "PUT" && req.url.startsWith('/albums')) {
      const urlPath = req.url.split('/');
      if(urlPath.length === 3) {
        const {name} = req.body;
        const albumId = urlPath[2];
        artists[albumId] = {
          ...edited,
          ...artists[albumId]
        }
        console.log("🚀 ~ file: server.js ~ line 198 ~ req.on ~ artists", artists)
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        return res.end(JSON.stringify(artists[albumId]));
      }
    }
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(process.env.PORT || port, () => console.log('Server is listening on port', port));
