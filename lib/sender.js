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
        $('#count').html(data['data']['download_list'].length);

        for (let i = 0; i < data['data']['download_list'].length; i++){
            let recv_token = data['data']['download_list'][i]['recv_token'];
            if (download_list.indexOf(recv_token) === -1){
                download_list.push(recv_token);
                $('#history').append('<p>'+ (download_list.length) +' - '+ recv_token +'</p>');
            }
        }
    });
}


// ファイルを破棄イベント
var clear_flag = true;
$('#clearFile').click(event => {
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
    if (reader_list.indexOf(qr_data) !== -1 || qr_reader_flag) return;
    qr_reader_flag = true;

    startAjax(SET_FILE_PAGE, {send_token: $.cookie('sender'), recv_token: qr_data}).then(data => {
        reader_list.push(qr_data);
        qr_reader_flag = false;
    }).catch(data => {
        if (data['code'] === 'NG') reader_list.push(qr_data);
        qr_reader_flag = false;
    });
}


// ボタンクリック処理
$(function(){
    var show_qr_flag = false;
    var move_permission_flag = false;
    var default_show_scanner = 'QRコードをスキャン';
    var default_download_qr = $('#downloadQR').html();
    var default_move_permission = $('#movePermission').html();
    // ダウンロード用QRコード表示
    $('#downloadQR').click(function(event){
        if (show_qr_flag){
            $('#qr-scanner').css('display', 'inline');
            $('#download-qr').css('display', 'none');
            $('#move-permission').css('display', 'none');
            move_permission_flag = false;
            show_qr_flag = false;
            $('#downloadQR').html(default_download_qr);
            $('#movePermission').html(default_move_permission);
        }
        // ダウンロードQR表示
        else{
            $('#qr-scanner').css('display', 'none');
            $('#download-qr').css('display', 'inline');
            $('#move-permission').css('display', 'none');
            move_permission_flag = false;
            show_qr_flag = true;
            $('#downloadQR').html(default_show_scanner);
            $('#movePermission').html(default_move_permission);
        }
    });
    $('#movePermission').click(function(event){
        if (move_permission_flag){
            $('#qr-scanner').css('display', 'inline');
            $('#download-qr').css('display', 'none');
            $('#move-permission').css('display', 'none');
            move_permission_flag = false;
            show_qr_flag = false;
            $('#downloadQR').html(default_download_qr);
            $('#movePermission').html(default_move_permission);
        }
        // ファイル権限移動QR表示
        else{
            $('#qr-scanner').css('display', 'none');
            $('#download-qr').css('display', 'none');
            $('#move-permission').css('display', 'inline');    
            $('#movePermission').html('QRコードをスキャン');
            move_permission_flag = true;
            show_qr_flag = false;
            $('#downloadQR').html(default_download_qr);
            $('#movePermission').html(default_show_scanner);
        }
    });
});


function main(){
    // ファイル情報取得
    startAjax(GET_FILE_INFO_PAGE,  {'send_secret_token': $.cookie('sender_secret')}).then(data => {
        let file_info = '<p> ファイル名: '+ data['data']['file_info']['file_name'] +'</p>';
        file_info += '<p> ファイルサイズ: '+ data['data']['file_info']['file_size'] +' バイト</p>';
        file_info += '<p> アップロード日時: '+ data['data']['file_info']['file_uploaded'] +'</p>';
        file_info += '<p> ハッシュ値(SHA256): '+ data['data']['file_info']['file_hash'] +'</p>';
        $('#file-info').html(file_info);
        $('#count').html(data['data']['download_count']);

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

    $('#download-qr').html('<a href="'+ download_link +'">ダウンロード</a>');
    $('#download-qr').qrcode({text: download_link, correctLevel : 2});
    $('#move-permission').html('<a href="'+ permission_link +'">ダウンロード</a>');
    $('#move-permission').qrcode({text: permission_link, correctLevel : 2});

    // QRコードリーダー設定
    let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
}

main();
