let socket;

$(() => {
    const Mode = Object.freeze({ multiplayerLocal: 0, multiplayer: 1 })

    let mode = Mode.multiplayer
    if (mode == Mode.multiplayerLocal)
        socket = io('http://localhost:8080');
    else if (mode == Mode.multiplayer)
        socket = io("18.188.135.254:8080");
    else
        throw "Unknown mode."

    socket.on("connect_error", function (e) {
        console.log(e)
    })
    socket.on('connect', function () {
        console.log("connect");
    });
    socket.on('get_id', function (data) {
        console.log("ID: " + data.id);
    });
    socket.on('disconnect', function () {
        console.log("disconnect");
    });
    socket.on("echo", (data) => {
        console.log("echo: " + data)
    })
    socket.on("get_num_players", data => {
        console.log("Number of players: " + data)
    })

    setTimeout(() => {
        if (!socket.connected) {
            socket.close()
            window.alert("Could not connect to server.")
        }
    }, 1000)
})

function getNumPlayers() {
    let password = $("#password").val()
    socket.emit("get_num_players", password)
}

function startGame() {
    let password = $("#password").val()
    socket.emit("start_game", password)
}

function resetGame() {
    let password = $("#password").val()
    socket.emit("reset_game", password)
}