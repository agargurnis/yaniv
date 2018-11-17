class Game {
    constructor() {
        this.cards = ['2-D', '2-C', '2-H', '3-S', '3-D', '3-C', '3-H', '3-S', '4-D', '4-C', '4-H', '4-S', '5-D', '5-C', '5-H', '5-S', '6-D', '6-C', '6-H', '6-S', '7-D', '7-C', '7-H', '7-S', '8-D', '8-C', '8-H', '8-S', '9-D', '9-C', '9-H', '9-S', '10-D', '10-C', '10-H', '10-S', 'jack-D', 'jack-C', 'jack-H', 'jack-S', 'queen-D', 'queen-C', 'queen-H', 'queen-S', 'king-D', 'king-C', 'king-H', 'king-S', 'ace-D', 'ace-C', 'ace-H', 'ace-S', 'joker-red', 'joker-red', 'joker-black', 'joker-black'];
        this.players = new Array(4);
    }
}
// instantiate a game object
const table = new Game();

$(document).ready(function () {
    // make connection
    var socket = io.connect('http://localhost:4000');
    // query dom buttons
    var sendBtn = $('#send-btn')[0];
    var createBtn = $('#create-btn')[0];
    // query form input fields
    var messageField = $('#message-input')[0];
    // query form output fields
    var chatOutput = $('#chat-output')[0];
    var gameOutput = $('#game-output')[0];
    var typingDetector = $('#typing-detector')[0];
    // retrieve player object from local storage
    var urlString = window.location.href;
    var url = new URL(urlString);
    var playerKey = url.searchParams.get("name");
    var player = JSON.parse(localStorage.getItem(playerKey));

    function createGame() {
        localStorage.setItem(player.username + '-table', JSON.stringify(table));
        var tableData = {
            "name": player["username"] + "-table",
            "nrOfPlayers": 1
        }
        axios
            .post('/api/game/create', tableData)
            .then(response => {
                window.location.href = "http://localhost:4000/game?table=" + player["username"] + "-table&name=" + player["username"];
            })
            .catch(error =>
                console.log(error)
            );
    }

    function joinGame(tableId, tableName) {
        var tableData = {
            "tableId": tableId
        }
        axios
            .post('/api/game/join', tableData)
            .then(response => {
                window.location.href = "http://localhost:4000/game?table=" + tableName + "&name=" + player["username"];
            })
            .catch(error =>
                console.log(error)
            );
    };

    function setGameButtons() {
        $('.game-button').each(function () {
            var tableName = $(this)[0].firstChild.textContent;
            var tableId = $(this)[0].id;

            $(this)[0].addEventListener('click', function () {
                joinGame(tableId, tableName);
            })
        })
    }

    function getGames() {
        axios
            .get('/api/game')
            .then(response => {
                response.data.map(table => {
                    gameOutput.innerHTML += '<p id="' + table._id + '" class="game-button pointer"><strong class="game-table-name">' + table.name + '</strong><br/>Players: ' + table.nrOfPlayers + '/4</p>';
                });
                setGameButtons();
            })
            .catch(error =>
                console.log(error)
            );
    };

    // load game tables 
    window.onload = getGames();

    createBtn.addEventListener('click', function () {
        // socket.emit('game-created', {
        //     tableName: player["username"] + " table",
        //     nrOfPlayers: '1'
        // });
        createGame();
    })

    // socket.on('game-created', function (data) {
    //     gameOutput.innerHTML += '<p class="game-button pointer"><strong class="game-table-name">' + data.tableName + '</strong><br/>Players: ' + data.nrOfPlayers + '/4</p>';
    // })

    sendBtn.addEventListener('click', function () {
        socket.emit('lobby-chat', {
            message: messageField.value,
            handle: player["username"]
        });
    })

    messageField.addEventListener('keypress', function () {
        socket.emit('typing', player["username"]);
    })

    socket.on('lobby-chat', function (data) {
        typingDetector.innerHTML = '';
        chatOutput.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
    })

    socket.on('typing', function (data) {
        typingDetector.innerHTML = '<p><em>' + data + ' is typing...</em></p>';
    })

});