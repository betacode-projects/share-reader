// ダウンロードリンクからファイルをダウンロード
function main(){
    if (getUrlParam('sender') === undefined){
        jumpErrorPage('有効なダウンロード専用リンクではありません。');
    }
    let sender_token = getUrlParam('sender');

    // 受信者トークンチェック・生成
    startAjax(SET_RECEIVER_PAGE, {token: $.cookie('receiver'), secret_token: $.cookie('receiver_secret')}).then(data => {
        $.cookie('receiver', data['data']['token'], {expires: 7, path: '/'});
        $.cookie('receiver_secret', data['data']['secret_token'], {expires: 7, path: '/'});

        // QRコード読み取りリストに追加
        startAjax(GET_FILE_INFO_PAGE, {'send_token': sender_token}).then(data => {
            startAjax(SET_FILE_PAGE, {'send_token': sender_token, 'recv_token': $.cookie('receiver')}).then(data => {
                $.cookie('sender_download_token', sender_token, {expires: 7, path: '/'});
                window.location.href = './download.html';
            }).catch((data) => {
                jumpErrorPage(data['messages']);
            });
        }).catch((data) => {
            jumpErrorPage(data['messages']);
        });
    }).catch((data) => {
        jumpErrorPage(data['messages']);
    });
}

main();