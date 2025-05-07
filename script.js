// LIFFの初期化は index.html で行う

let websocket;

function setupWebSocket() {
    websocket = new WebSocket('wss://cloud.achex.ca/live_sync');

    websocket.onopen = () => {
        console.log('WebSocket connection opened');
        sendUserInfo();
    };

    websocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        } catch (error) {
            console.error('Error parsing message:', event.data, error);
        }
    };

    websocket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

async function sendUserInfo() {
    if (liff.isLoggedIn() && websocket && websocket.readyState === WebSocket.OPEN) {
        try {
            const profile = await liff.getProfile();
            const userData = JSON.stringify({ type: 'join', role: 'participant', userId: profile.userId });
            websocket.send(userData);
            console.log('Sent user info to server:', userData);
        } catch (error) {
            console.error('Failed to get user profile for WebSocket:', error);
        }
    }
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'user-joined':
            console.log('User joined:', data.userId);
            updateParticipantList(data.userId, 'joined');
            break;
        case 'user-left':
            console.log('User left:', data.userId);
            updateParticipantList(data.userId, 'left');
            break;
        case 'game-started':
            console.log('Game started:', data.gameId);
            // ゲーム画面への遷移処理 (例: window.location.href = `${data.gameId}.html`;)
            break;
        // その他のメッセージ処理 (vote-results, ranking-update など)
    }
}

// 参加者リストの更新 (waiting.js で実装)
let participantsElement;
function updateParticipantList(userId, status) {
    if (!participantsElement) {
        participantsElement = document.getElementById('participants');
    }
    if (participantsElement) {
        const listItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (status === 'joined' && !listItem) {
            const newLi = document.createElement('li');
            newLi.innerText = userId; // ユーザー名を表示するなら profile.displayName を利用
            newLi.dataset.userId = userId;
            participantsElement.appendChild(newLi);
        } else if (status === 'left' && listItem) {
            participantsElement.removeChild(listItem);
        }
    }
}

// 配信者として接続する関数 (必要に応じて)
async function connectAsOwner() {
    try {
        await liff.init({ liffId: 'YOUR_LIFF_ID' });
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            const ownerData = JSON.stringify({ type: 'join', role: 'owner', userId: 'Owner' });
            websocket.send(ownerData);
            console.log('Sent owner info to server:', ownerData);
            // 配信者用のUI表示などの処理
            loadOwnerUI(); // waiting.js などで実装
        }
    } catch (error) {
        console.error('LIFF initialization failed for owner:', error);
    }
}

// スコア送信関数 (beat.js などで実装)
function submitScore(finalScore) {
    if (websocket && websocket.readyState === WebSocket.OPEN && liff.isLoggedIn()) {
        liff.getProfile()
            .then(profile => {
                const data = JSON.stringify({ type: 'submit-score', score: finalScore, userId: profile.userId, gameId: 'beat' });
                websocket.send(data);
                console.log('Sent score:', data);
            })
            .catch(error => console.error('Error getting profile for score submission:', error));
    }
}

// 投票送信関数 (minecar.js などで実装)
function sendVote(vote) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        const data = JSON.stringify({ type: 'vote', value: vote });
        websocket.send(data);
        console.log('Sent vote:', data);
    } else {
        console.error('WebSocket connection is not open.');
    }
}