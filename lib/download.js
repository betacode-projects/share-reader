// ダウンロードリンククリック時の処理
function onDownloadClick(){
    $('#download-start').html('<a id="download-start" href="#">ダウンロード済み</a>');
}


// ファイルダウンロードの準備
function main(){
    // 入力値チェック
    if (!checkParam([$.cookie('reciever'), $.cookie('reciever_secret')])){
        $('#status').html('エラー: 必須トークンが設定されていません。  <a href="./reciever.html">戻る</a>');
        return;
    }

    // 受信者トークンチェック
    startAjax(GET_FILE_INFO_PAGE, {recv_secret_token: $.cookie('reciever_secret')}).then(data => {
        let file_info = '<p> ファイル名: '+ data['data']['file_info']['file_name'] +'</p>';
        file_info += '<p> ファイルサイズ: '+ data['data']['file_info']['file_size'] +' バイト</p>';
        file_info += '<p> アップロード日時: '+ data['data']['file_info']['file_uploaded'] +'</p>';
        file_info += '<p> ハッシュ値(SHA256): '+ data['data']['file_info']['file_hash'] +'</p>';
        file_info += '<p> ダウンロード数: '+ data['data']['download_count'] +'</p>';
        $('#status').html('<p>ダウンロード準備が完了しました。ダウンロードをクリックすると、ダウンロードが開始されます。</p>');
        $('#file-info').html(file_info);
        $('#download-div').html('<a id="download-start" onclick="onDownloadClick();" href="'+ HOST_URL +'/get_file.php?jump=1&recv_secret_token='+ $.cookie('reciever_secret') +'" id="download-start">ダウンロード</a>');
    }).catch(data => {
        if (data['code'] !== 'DB' && data['code'] !== 'API'){
            $.removeCookie('reciever', { path: '/' });
            $.removeCookie('reciever_secret', { path: '/' });
        }
        $('#status').html('エラー: '+ data['messages'] + '  <a href="./reciever.html">戻る</a>');
    });
}

main();