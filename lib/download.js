// ダウンロードリンククリック時の処理
let download_link = '';
let download_count = 0;
function onDownloadClick(){
    $.removeCookie('receiver', { path: '/' });
    $.removeCookie('receiver_secret', { path: '/' });
    $.removeCookie('sender_download_token', { path: '/' });

    $('#download-btn').removeClass('btn-solid-lg');
    $('#download-btn').addClass('btn-solid-lg-rev');
    $('#download-btn').removeAttr('onclick');
    $('#remove-btn').removeAttr('onclick');
    $('#download-msg').html('　ダウンロード済み');
    $('#remove-btn').html('<i class="far fa-arrow-alt-circle-left"></i>　受信者ページへ戻る');
    $('#remove-btn').attr('href', 'receiver.html');
    $('#remove-btn').removeClass('btn-solid-lg-red');
    $('#remove-btn').addClass('btn-solid-lg');
    $('#file_download').html(download_count + 1);

    window.location.href = download_link;
}

// 受信者トークン削除
function onRemoveClick(){
    $('#download-btn').removeClass('btn-solid-lg');
    $('#download-btn').addClass('btn-solid-lg-rev');
    $('#download-btn').removeAttr('onclick');
    $('#remove-btn').removeAttr('onclick');
    $('#remove-msg').html('　キャンセル中...');
    $('#download-msg').html('　受信者ページに戻る');
    $('#download-btn').attr('href', 'receiver.html');

    startAjax(REMOVE_RECEIVER_TOKEN_PAGE, {recv_secret_token: $.cookie('receiver_secret')}).then(data => {
        $.removeCookie('receiver', { path: '/' });
        $.removeCookie('receiver_secret', { path: '/' });
        $.removeCookie('sender_download_token', { path: '/' });

        window.location.href = './receiver.html';
    }).catch(data => {
        jumpErrorPage(data['messages']);
    });
}


// ファイルダウンロードの準備
function main(){
    // 入力値チェック
    if (!checkParam([$.cookie('receiver'), $.cookie('receiver_secret'), $.cookie('sender_download_token')])){
        jumpErrorPage('受信者または送信者トークンが設定されていません。');
        return;
    }

    // 受信者トークンチェック
    startAjax(GET_FILE_INFO_PAGE, {send_token: $.cookie('sender_download_token')}).then(data => {
        $('#file_name').html(data['data']['file_info']['file_name']);
        $('#file_size').html((Math.round((data['data']['file_info']['file_size'] / (1024 ** 2)) * 100) / 100) + ' MB　('+ data['data']['file_info']['file_size'] +' バイト)');
        $('#upload_date').html(data['data']['file_info']['file_uploaded']);
        $('#file_mime').html(data['data']['file_info']['file_format']);
        $('#file_hash').html(data['data']['file_info']['file_hash']);
        $('#file_download').html(data['data']['download_count']);
        download_count = data['data']['download_count'];

        //$('#download-btn').attr('href', HOST_URL +'/get_file.php?jump=1&recv_secret_token='+ $.cookie('receiver_secret'));
        download_link = HOST_URL +'/get_file.php?jump=1&recv_secret_token='+ $.cookie('receiver_secret');
        hidePreloader();
    }).catch(data => {
        jumpErrorPage(data['messages']);
    });
}

main();