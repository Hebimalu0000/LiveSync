document.addEventListener('DOMContentLoaded', () => {
    // 配信者用のボタン (例: ゲーム選択)
    const gameSelectionDiv = document.getElementById('game-selection');
    if (gameSelectionDiv) {
        // ここで配信者かどうかを判定するロジックが必要 (サーバーから role を受け取って判定するなど)
        let isOwner = false;
        // 例: WebSocket接続時にサーバーから自身の role を受け取り、isOwner を設定する
        // handleWebSocketMessage 関数内で処理するなど

        function updateOwnerUI() {
            if (isOwner && gameSelectionDiv.children.length === 0) {
                const select = document.createElement('select');
                const optionBeat = document.createElement('option');
                optionBeat.value = 'beat';
                optionBeat.innerText = 'Live Sync Beat';
                const optionMinecar = document.createElement('option');
                optionMinecar.value = 'minecar';
                optionMinecar.innerText = 'Live Sync Minecar';
                select.appendChild(optionBeat);
                select.appendChild(optionMinecar);

                const startButton = document.createElement('button');
                startButton.innerText = 'ゲーム開始';
                startButton.addEventListener('click', () => {
                    const selectedGame = select.value;
                    if (websocket && websocket.readyState === WebSocket.OPEN) {
                        websocket.send(JSON.stringify({ type: 'select-game', gameId: selectedGame }));
                        websocket.send(JSON.stringify({ type: 'start-game' }));
                    }
                });

                gameSelectionDiv.appendChild(select);
                gameSelectionDiv.appendChild(startButton);
            } else if (!isOwner && gameSelectionDiv.children.length > 0) {
                gameSelectionDiv.innerHTML = ''; // 参加者ならゲーム選択UIを削除
            }
        }

        // WebSocket から自身のロールを受け取る処理 (handleWebSocketMessage 内に追加)
        window.handleWebSocketMessage = (data) => {
            const originalHandle = scriptExports.handleWebSocketMessage || (() => {});
            originalHandle(data);

            if (data.type === 'join-response' && data.userId === liff.getProfileSync().userId) {
                isOwner = data.role === 'owner';
                updateOwnerUI();
            }
            // その他のメッセージ処理
        };

        // script.js の handleWebSocketMessage を拡張
        const scriptExports = window.scriptExports || {};
        scriptExports.handleWebSocketMessage = window.handleWebSocketMessage;
        window.handleWebSocketMessage = handleWebSocketMessageWrapper;
        function handleWebSocketMessageWrapper(data) {
            window.handleWebSocketMessage(data);
        }
    }
});

function loadOwnerUI() {
    const gameSelectionDiv = document.getElementById('game-selection');
    if (gameSelectionDiv && gameSelectionDiv.children.length === 0) {
        const select = document.createElement('select');
        const optionBeat = document.createElement('option');
        optionBeat.value = 'beat';
        optionBeat.innerText = 'Live Sync Beat';
        const optionMinecar = document.createElement('option');
        optionMinecar.value = 'minecar';
        optionMinecar.innerText = 'Live Sync Minecar';
        select.appendChild(optionBeat);
        select.appendChild(optionMinecar);

        const startButton = document.createElement('button');
        startButton.innerText = 'ゲーム開始';
        startButton.addEventListener('click', () => {
            const selectedGame = select.value;
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'select-game', gameId: selectedGame }));
                websocket.send(JSON.stringify({ type: 'start-game' }));
            }
        });

        gameSelectionDiv.appendChild(select);
        gameSelectionDiv.appendChild(startButton);
    }
}