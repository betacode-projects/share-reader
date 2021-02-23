// トークン取得・設定
let recv_token = $.cookie('reciever');
//console.log(recv_token);
if (recv_token === undefined){
    recv_token = '';
}

// 非同期処理部分
$.ajax({
    url: RECIEVER_TOKEN_PAGE,
    type: 'post',
    data: {token: recv_token}
})
.done(function(data) {

    if (data['status'] === 'success'){
        // クッキー登録
        //console.log(data);
        $.cookie('reciever', data['data']['token'], {expires: 7, path: '/'});
        recv_token = data['data']['token'];

        check_file_download();
        setInterval("check_file_download()", 2000);

        // QRコード生成
        $('#qrcode').html('');
        $('#qrcode').qrcode({text: data['data']['token'], correctLevel : 2});
        
    }
    else if(show_qr_flag){
        $('#qrcode').html('エラー: '+ data['messages']);
    }

}).fail(function(data){
    console.log(data);
    $('#qrcode').html('エラー: APIサーバーにアクセスできませんでした。');
});


// ファイルダウンロード
var interval_flag = false;
function check_file_download(){
    if (interval_flag)
        return;

    interval_flag = true;
    $.ajax({
        url: CHECK_FILE_PAGE,
        type: 'post',
        data: {token: recv_token}
    })
    .done(function(data) {
        console.log(data);
        if (data['status'] === 'success'){
            window.location.href = './download.html?sender=' + data['data']['token'];
        }
    }).fail(function(data){
        console.log(data);
    }).always(function(data){
        interval_flag = false;
    });
}

