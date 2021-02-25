// 送信者トークンチェック
function checkSenderTokenInterval(){
    startAjax(CHECK_SENDER_PAGE, {send_secret_token: $.cookie('sender_secret')}).catch(data => {
        $.removeCookie('sender', { path: '/' });
        $.removeCookie('sender_secret', { path: '/' });
        window.location.href = './upload.html?error=2';
    });
}


// ダウンロードリスト取得
var download_list = [];
function getFileDownloadListInterval(){
    startAjax(GET_DOWNLOAD_LIST_PAGE, {send_secret_token: $.cookie('sender_secret')}).then(data => {
        $('#file_download').html(data['data']['download_list'].length);
        
        let len = data['data']['download_list'].length;
        for (let i = 0; i < len; i++){
            let row_data = data['data']['download_list'][i];
            let recv_token = row_data['recv_token'];
            if (download_list.indexOf(recv_token) === -1){
                download_list.push(recv_token);
                $('#history').append('<li><strong class="font-weight-bold" style="color: lightgreen">[ダウンロード - '+ row_data['file_downloaded'] +']: </strong><span style="font-style: italic;">'+ recv_token +'</span></li>');
                
                $('.box29').scrollTop($('.box29').height());
            }
        }
    });
}


// ファイルを破棄イベント
var clear_flag = true;
$('#clearFile').click(event => {
    if (!window.confirm('ファイルを削除しますか？')) {
        return;
    }

    if (!clear_flag) return false;
    clear_flag = false;
    $('#clearFile').html('削除中...');

    startAjax(REMOVE_SENDER_TOKEN_PAGE, {'send_secret_token': $.cookie('sender_secret')}).then(data => {
        $.removeCookie('sender', { path: '/' });
        $.removeCookie('sender_secret', { path: '/' });
        window.location.href = './upload.html';

    }).catch(data => {
        $('#status').html('エラー: '+ data['messages']);
        $('#clearFile').html('ファイルを破棄');
        clear_flag = true;
    });
});


// QRコード読み取り成功時の処理
let qr_reader_flag = false;
let reader_list = [];
function onScanSuccess(qr_data) {
    if (qr_data.length !== 64 || reader_list.indexOf(qr_data) !== -1 || qr_reader_flag) return;
    qr_reader_flag = true;

    startAjax(SET_FILE_PAGE, {send_token: $.cookie('sender'), recv_token: qr_data}).then(data => {
        reader_list.push(qr_data);
        let main_html = '<strong class="font-weight-bold" style="color: orange">読み取り完了: </strong><span style="font-style: italic;">'+ qr_data +'</span>';
        $('#reader-data').html(main_html);
        qr_reader_flag = false;
    }).catch(data => {
        if (data['code'] === 'NG') reader_list.push(qr_data);
        qr_reader_flag = false;
    });
}


function main(){
    // ファイル情報取得
    startAjax(GET_FILE_INFO_PAGE,  {'send_secret_token': $.cookie('sender_secret')}).then(data => {
        $('#file_name').html(data['data']['file_info']['file_name']);
        $('#file_size').html((Math.round((data['data']['file_info']['file_size'] / (1024 ** 2)) * 100) / 100) + ' MB　('+ data['data']['file_info']['file_size'] +' バイト)');
        $('#upload_date').html(data['data']['file_info']['file_uploaded']);
        $('#file_mime').html(data['data']['file_info']['file_format']);
        $('#file_hash').html(data['data']['file_info']['file_hash']);
        $('#file_download').html(data['data']['download_count']);

        // インターバル設定
        checkSenderTokenInterval();
        getFileDownloadListInterval()
        setInterval("checkSenderTokenInterval()", 2000);
        setInterval("getFileDownloadListInterval()", 10000);

    }).catch(data => {
        $.removeCookie('sender', { path: '/' });
        $.removeCookie('sender_secret', { path: '/' });
        window.location.href = './upload.html?error=2';
    });

    // QRコード設定
    let download_link = URL_PAGE +'download-link.html?sender='+ $.cookie('sender');
    let permission_link = URL_PAGE +'move-permission.html?secret='+ $.cookie('sender_secret');

    $('#download-qr').qrcode({text: download_link, correctLevel : 2});
    $('#download-qr-link').val(download_link);
    $('#move-permission').qrcode({text: permission_link, correctLevel : 2});
    $('#move-permission-link').val(permission_link);

    // QRコードリーダー設定
    let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
}

main();
