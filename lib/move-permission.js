// ファイル操作権限移行の設定
function main(){
    // 入力値チェック
    let send_secret = getUrlParam('secret');
    if (send_secret === undefined){
        $('#status').html('エラー: 送信者秘密トークンが指定されていません。');
        return;
    }

    // 権限移行処理
    startAjax(SET_PERMISSION_PAGE, {send_secret_token: send_secret}).then(data => {
        $.cookie('sender', data['data']['sender_token'], {expires: 7, path: '/'});
        $.cookie('sender_secret', data['data']['sender_secret_token'], {expires: 7, path: '/'});
        window.location.href = 'sender.html';

    }).catch(data => {
        $('#status').html('エラー: '+ data['messages']);
    });
}

main();
