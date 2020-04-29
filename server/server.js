var http = require('http');
var url = require('url');
var fs = require('fs');

const server = http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    // res.writeHead(200, {'Content-Type': 'text/html'});
    // res.write(filename);
    // return res.end();
    fs.readFile(filename, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

let gameStarted = false

var players = {};

let seed = Math.floor(Math.random() * 50000)

const io = require('socket.io')(server);
console.log("Started server. Listening for connections...")
io.on('connection', socket => {
    socket.on("request_join", data => {
        if (gameStarted) {
            socket.emit("reject_join", true)
        }
        else {
            players[socket.id] = {
                p: [0, 1, -10],
                q: [0, 0, 0, 1],
                t: 0,
                b: 0,
                alive: true
            }
            console.log("Connected: " + socket.id + ", # players: " + Object.keys(players).length)
            socket.emit("get_id", {
                id: socket.id,
                players: players,
                seed: seed,
                gameStarted: gameStarted
            })
            socket.broadcast.emit("player_connect", socket.id)
        }
    })

    socket.on('echo', data => {
        console.log("echo: " + data);
        socket.emit("echo", data);
    });
    socket.on('disconnect', () => {
        if (socket.id in players) {
            socket.broadcast.emit("player_disconnect", socket.id)
            delete players[socket.id]
            console.log("Disconnect: " + socket.id + ", # players: " + Object.keys(players).length)
        }
    });
    socket.on("updatePlayer", (data) => {
        //console.log(data)
        players[socket.id] = data
    })
    socket.on("get_num_players", data => {
        if (data != "27")
            return
        socket.emit("get_num_players", Object.keys(players).length)
    })
    socket.on("reset_game", data => {
        if (data != "27")
            return
        seed = Math.floor(Math.random() * 50000)
        gameStarted = false
        players = {}
        io.emit("reset_game", true)
        console.log("Resetting game...")
    })
    socket.on("start_game", data => {
        if (data != "27")
            return
        gameStarted = true
        io.emit("start_game", true)
    })
    socket.on("hit", data => {
        //players[data].alive = false
        //io.emit("updatePlayers", players)
        io.emit("hit", data)
    })
    socket.on("die", data => {
        io.emit("die", data)
    })
})

function sendPlayersToClients() {
    io.emit("updatePlayers", players)
}
setInterval(sendPlayersToClients, 16)

server.listen(8080);