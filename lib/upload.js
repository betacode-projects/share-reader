let upload_flag = false;
document.addEventListener('DOMContentLoaded', (event) => {
    let sender_token = $.cookie('sender');
    if (sender_token !== undefined){
        window.location.href = './sender.html';
    }
});


$('#file').change(function(event) {
    // 多重送信を防ぐため通信完了までボタンをdisableにする
    event.preventDefault();

    let fd = new FormData($('#upload').get(0));
    $('#file').prop('disabled', true);

    if (fd === undefined || upload_flag){
        return;
    }
    upload_flag = true;

    $.ajax({
        url: UPLOAD_PAGE,
        type: "POST",
        data: fd,
        processData: false,
        contentType: false,
        dataType: 'json',
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    //console.log(percentComplete);
                    $('.progress').css({
                        width: percentComplete * 100 + '%'
                    });
                    var mb = 1024 ** 2;
                    
                    $('#status').html('アップロード中... - '+ Math.round((percentComplete * 100)) +'% | '+ Math.round((evt.loaded / mb) * 100) / 100 +'MB / '+ Math.round((evt.total / mb) * 100) / 100 +'MB');
                    if (percentComplete === 1) {
                        $('.progress').addClass('hide');
                        $('#status').html('データベース登録中...');
                    }
                }
            }, false);
            return xhr;
        },

    }).done(function(data) {
        console.log(data);
        
        if (data['status'] === 'success'){
            $('#status').html('読み込み中...');
            $.cookie('sender', data['data']['token'], {expires: 7, path: '/'});
            $.cookie('sender_secret', data['data']['secret_token'], {expires: 7, path: '/'});
            window.location.href = './sender.html';
        }
        else{
            $('#status').html('エラー: '+ data['messages']);
        }

    }).fail(function(data){
        $('#status').html('エラー: APIサーバーにアクセスできませんでした。');
    }).always(function(data){
        upload_flag = false;
        $('.progress').css('width', '0%');
        $('.progress').removeClass('hide');
        $('#file').prop('disabled', false);
        $('#file').val('');
    });
});