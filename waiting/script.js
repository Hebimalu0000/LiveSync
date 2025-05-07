var chatElement = document.getElementById("chat");
var ws;
var currentAuth;
var currentPassword;
var myChatId; // LINEのdisplayNameが格納される

// WS接続
function connectChat(auth, password, displayName) {
    currentAuth = auth;
    currentPassword = password;
    myChatId = displayName;

    ws = new WebSocket("wss://cloud.achex.ca/live_sync");

    ws.onopen = function(e) {
        console.log('open');
        addChatMessage('system', 'You ID : ' + myChatId + '（' + getDateTime() + '）');
        // 認証
        ws.send(JSON.stringify({"auth": currentAuth, "password": currentPassword}));
        // ログイン通知 (IDとしてdisplayNameを使用)
        ws.send(JSON.stringify({"to": currentAuth, "id": myChatId, "message": 'Login'}));
    };

    ws.onmessage = function(e) {
        console.log('message');
        console.log(e);
        var obj = JSON.parse(e.data);
        if (obj.auth === 'OK') {
            // 認証OK
            return;
        }
        addChatMessage(obj.id, obj.message);
    };

    ws.onclose = function(e) {
        console.log('closed');
        ws.send(JSON.stringify({"to": currentAuth, "id": myChatId, "message": 'Logout'}));
    };

    ws.onerror = function(error) {
        console.error('WebSocket Error:', error);
        addChatMessage('system', 'WebSocket error occurred.');
    };
}

// メッセージ送信
function sendChat() {
    let msgElem = document.getElementById("msg");
    let msg = msgElem.value.trim();
    if (msg) {
        msgElem.value = "";
        ws.send(JSON.stringify({"to": currentAuth, "id": myChatId, "message": msg}));
    }
}

// チャットメッセージ追加
function addChatMessage(senderId, message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${senderId} : ${message}（${getDateTime()}）`;
    chatElement.insertBefore(messageDiv, chatElement.firstChild);
}

// 1桁の数字を0埋めで2桁にする
function toDoubleDigits(num) {
    num += "";
    if (num.length === 1) {
        num = "0" + num;
    }
    return num;
}

// 日時取得<ctrl98>/MM/DD HH:MM:SS形式で取得
function getDateTime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = toDoubleDigits(date.getMonth() + 1);
    const day = toDoubleDigits(date.getDate());
    const hour = toDoubleDigits(date.getHours());
    const min = toDoubleDigits(date.getMinutes());
    const sec = toDoubleDigits(date.getSeconds());
    return `${year}/${month}/${day} ${hour}:${min}:${sec}`;
}