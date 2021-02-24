
// QRコードのスキャンチェック
let check_flag = false;
function checkScanInterval(){
    if (!check_flag){
        check_flag = true;
        startAjax(CHECK_FILE_PAGE, {recv_secret_token: $.cookie('reciever_secret')}).then(data => {
            window.location.href = './download.html';
            check_flag = false;
        }).catch(data => {
            check_flag = false;
        });
    }
}

// QRコード生成
function main(){
    startAjax(RECIEVER_TOKEN_PAGE, {token: $.cookie('reciever'), secret_token: $.cookie('reciever_secret')}).then(data => {
        $.cookie('reciever', data['data']['token'], {expires: 7, path: '/'});
        $.cookie('reciever_secret', data['data']['secret_token'], {expires: 7, path: '/'});

        checkScanInterval();
        setInterval("checkScanInterval()", 2000);

        $('#qrcode').html('');
        $('#qrcode').qrcode({text: data['data']['token'], correctLevel : 2});
    });
}

main();

