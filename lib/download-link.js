// ダウンロードリンクからファイルをダウンロード
function main(){
    // 受信者トークンチェック・生成
    startAjax(receiver_TOKEN_PAGE, {token: $.cookie('receiver'), secret_token: $.cookie('receiver_secret')}).then(data => {
        $.cookie('receiver', data['data']['token'], {expires: 7, path: '/'});
        $.cookie('receiver_secret', data['data']['secret_token'], {expires: 7, path: '/'});

        // QRコード読み取りリストに追加
        startAjax(SET_FILE_PAGE, {'send_token': getUrlParam('sender'), 'recv_token': data['data']['token']}).then(data => {
            window.location.href = './download.html';
        }).catch((data) => {
            $('#status').html('エラー: '+ data['messages']);
        });

    }).catch((data) => {
        $('#status').html('エラー: '+ data['messages']);
    });
}

main();