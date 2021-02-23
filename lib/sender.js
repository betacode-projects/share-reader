// 送信者トークンチェック
$(document).ready( function(){
    check_sender_token();
    get_file_info();
});


// ファイル情報取得
function get_file_info(){
    $.ajax({
        url: GET_FILE_INFO_PAGE,
        type: 'post',
        data: {'send_token': $.cookie('sender')}
    })
    .done(function(data) {
        console.log(data);
        if (data['status'] === 'success'){
            let file_info = '<p> ファイル名: '+ data['data']['file_info']['file_name'] +'</p>';
            file_info += '<p> ファイルサイズ: '+ data['data']['file_info']['file_size'] +' バイト</p>';
            file_info += '<p> アップロード日時: '+ data['data']['file_info']['file_uploaded'] +'</p>';
            file_info += '<p> ハッシュ値(SHA256): '+ data['data']['file_info']['file_hash'] +'</p>';
            $('#status').html('<p>ダウンロード準備が完了しました。ダウンロードをクリックすると、ダウンロードが開始されます。</p>');
            $('#file-info').html(file_info);
            $('#count').html(data['data']['download_count']);

            get_download_list();
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


// ダウンロード数取得
function get_download_list(){
    $.ajax({
        url: GET_DOWNLOAD_LIST_PAGE,
        type: 'post',
        data: {'send_token': $.cookie('sender'), 'secret_token': $.cookie('secret')}
    })
    .done(function(data) {
        console.log(data);
        if (data['status'] === 'success'){
            $('#count').html(data['data']['download_list'].length);

            for (let i = 0; i < data['data']['download_list'].length; i++){
                let recv_token = data['data']['download_list'][i]['recv_token'];
                if (download_list.indexOf(recv_token) === -1){
                    download_list.push(recv_token);
                    $('#history').append('<p>'+ (download_list.length) +' - '+ recv_token +'</p>');
                }
            }
        }
    }).fail(function(data){
        console.log(data);
    });
}


// 送信者チェック
function check_sender_token(){
    // 送信者トークンチェック
    let sender_token = $.cookie('sender');
    if (sender_token === undefined){
        window.location.href = './upload.html?error=1';
    }
    
    $.ajax({
        url: CHECK_SENDER_PAGE,
        type: 'post',
        data: {token: sender_token}
    })
    .done(function(data) {
        console.log(data);
        if (data['data']['flag']){
            return;
        }
    
        $.removeCookie('sender', { path: '/' });
        window.location.href = './upload.html?error=2';
    
    }).fail(function(data){
        $.removeCookie('sender', { path: '/' });
        window.location.href = './upload.html?error=3';
    });
}


setInterval("check_sender_token()", 2000);
setInterval("get_download_list()", 10000);

let dir = location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/';
let url = location.protocol  +'//'+ location.host + dir;
$('#download-qr').html('<a href="'+ url +'download-link.html?sender='+ $.cookie('sender') +'">ダウンロード</a>');
$('#move-permission').html('<a href="'+ url +'move-permission.html?secret='+ $.cookie('secret') +'">ダウンロード</a>');
$('#download-qr').qrcode({text: url +'download-link.html?sender='+ $.cookie('sender'), correctLevel : 2});
$('#move-permission').qrcode({text: url +'move-permission.html?secret='+ $.cookie('secret'), correctLevel : 2});

var sender_token = $.cookie('sender');
var link_flag = true;
var download_list = [];


$(function(){
    // アップロードファイル削除
    $('#clearFile').click(function(event){
        if (!link_flag)
            return false;
        link_flag = false;
        $inner_html = $('#clearFile').html();
        $('#clearFile').html('削除中...');

        $.ajax({
            url: REMOVE_SENDER_TOKEN_PAGE,
            type: 'post',
            data: {token: sender_token}
        })
        .done(function(data) {
            console.log(data);
            if (data['data']['flag']){
                $.removeCookie('sender', { path: '/' });
                window.location.href = './upload.html';
            }
            else{
                alert(data['messages']);
            }
        }).fail(function(data){
            $.removeCookie('sender', { path: '/' });
            window.location.href = './upload.html?error=3';
        }).always(function(data){
            link_flag = true;
            $('#clearFile').html($inner_html);
        });
    });


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


