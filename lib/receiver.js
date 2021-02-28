
// QRコードのスキャンチェック
let check_flag = false;
function checkScanInterval(){
    if (!check_flag){
        check_flag = true;
        startAjax(CHECK_FILE_PAGE, {recv_secret_token: $.cookie('receiver_secret')}).then(data => {
            $.cookie('sender_download_token', data['data']['token'], {expires: 7, path: '/'});
            window.location.href = './download.html';
            check_flag = false;
        }).catch(data => {
            check_flag = false;
        });
    }
}

// QRコード生成
function main(){
    startAjax(SET_RECEIVER_PAGE, {token: $.cookie('receiver'), secret_token: $.cookie('receiver_secret')}).then(data => {
        $.cookie('receiver', data['data']['token'], {expires: 7, path: '/'});
        $.cookie('receiver_secret', data['data']['secret_token'], {expires: 7, path: '/'});

        checkScanInterval();
        setInterval("checkScanInterval()", 2000);

        $('#download-qr-token').val(data['data']['token']);
        $('#qrcode').html('');
        $('#qrcode').qrcode({text: data['data']['token'], correctLevel : 2});

        hidePreloader();
    });
}

main();

