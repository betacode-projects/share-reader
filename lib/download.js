// トークン取得・設定
let send_token = getParam('sender');
let recv_token = $.cookie('reciever');
//console.log(recv_token);
if (recv_token === undefined){
    recv_token = '';
}


// 受信者トークンチェック
$(document).ready( function(){
    if (recv_token === undefined){
        $('#status').html('<p>エラー: 受信者トークンが設定されていません。</p>');
    }
    console.log(recv_token);
    
    $.ajax({
        url: CHECK_RECIEVER_PAGE,
        type: 'post',
        data: {token: recv_token}
    })
    .done(function(data) {
        console.log(data);
        if (data['data']['flag']){
            get_file_info();
            return;
        }
    
        $.removeCookie('reciever', { path: '/' });
        $('#status').html('<p>エラー: '+ data['messages'] +'</p>');
    
    }).fail(function(data){
        $.removeCookie('reciever', { path: '/' });
        $('#status').html('<p>APIサーバーに接続できませんでした。しばらくたってからアクセスしてください。</p>');
    });
});


// ファイル情報取得
function get_file_info(){
    $.ajax({
        url: GET_FILE_INFO_PAGE,
        type: 'post',
        data: {'send_token': send_token, 'recv_token': recv_token}
    })
    .done(function(data) {
        console.log(data);
        console.log(send_token);
        if (data['status'] === 'success'){
            let file_info = '<p> ファイル名: '+ data['data']['file_info']['file_name'] +'</p>';
            file_info += '<p> ファイルサイズ: '+ data['data']['file_info']['file_size'] +' バイト</p>';
            file_info += '<p> アップロード日時: '+ data['data']['file_info']['file_uploaded'] +'</p>';
            file_info += '<p> ハッシュ値(SHA256): '+ data['data']['file_info']['file_hash'] +'</p>';
            file_info += '<p> ダウンロード数: '+ data['data']['download_count'] +'</p>';
            $('#status').html('<p>ダウンロード準備が完了しました。ダウンロードをクリックすると、ダウンロードが開始されます。</p>');
            $('#file-info').html(file_info);
            $('#download-div').html('<a id="download-start" onclick="on_clicked_download();" href="#" id="download-start">ダウンロード</a>');
        }
        else if (data['code'] === 'DB') {
            alert(data['messages']);
        }
        else {

            $('#status').html('<p>エラー: '+ data['messages']+ '</p>');
        }

    }).fail(function(data){
        console.log(data);
    });
}


function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// ダウンロードボタンクリック
let download_flag = false;
function on_clicked_download() {
    if (download_flag) return;
    download_flag = true;

    $.ajax({
        url: GET_FILE_PAGE,
        type: 'post',
        data: {'recv_token': recv_token, 'send_token': send_token}
    })
    .done(function(data) {
        console.log(data);
        if (data['status'] === 'success'){
            $('#download-div').append('<a id="download-link" style="display:none" href="'+ data['data']['file_link'] +'" download></a>');
            document.getElementById('download-link').click();
            $('#download-link').remove();
            $.removeCookie('reciever', { path: '/' });

            $('#download-start').html('ダウンロード済み');
            $('#download-start').removeAttr('onclick');
        }
        else if (data['code'] === 'DB') {
            alert(data['messages']);
            download_flag = false;
        }
        else {
            $.removeCookie('reciever', { path: '/' });
            $('#status').html('<p>エラー: '+ data['messages'] +'</p>');

            $('#download-start').remove();
        }

    }).fail(function(data){
        console.log(data);
    });
}
