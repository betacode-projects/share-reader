// 送信者トークンチェック
function checkSenderTokenInterval(){
    startAjax(CHECK_SENDER_PAGE, {send_secret_token: $.cookie('sender_secret')}).catch(data => {
        $.removeCookie('sender', { path: '/' });
        $.removeCookie('sender_secret', { path: '/' });
        window.location.href = './upload.html?error=2';
    });
}

// ダウンロード推移グラフ設定
function setDownloadCountChart(){
    var ctx = document.getElementById('count_chart').getContext('2d');
    window.count_chart = new Chart(ctx, { // インスタンスをグローバル変数で生成
      type: 'line',
      data: { // ラベルとデータセット
        labels: download_counter,
        datasets: [{
            label: 'ダウンロード数',
            data: download_transition, // グラフデータ
            backgroundColor: '#5c9ee780', // 棒の塗りつぶし色
            borderColor: '#5c9de7', // 棒の枠線の色
            fontColor: "#aaa",
            borderWidth: 1, // 枠線の太さ
        }],
      },
      options: {
        elements: {
            point:{
                radius: 0
            },
        },
        scales: {
            xAxes: [{
              ticks: {
                stepSize: 1,
                beginAtZero: true
            },
            scaleLabel: {                 //軸ラベル設定
                display: true,             //表示設定
                labelString: '秒数(後)',  //ラベル
            },
            }],
            yAxes: [{
              ticks: {
                stepSize: 1,
                beginAtZero: true
              }
            }],
            xAxes: [{
                ticks: {
                  stepSize: 10,
                  beginAtZero: true
                }
              }]
          }
      }
    });
}


// 使用デバイスチャート初期化
function setUsingDeviceChart(){
    var ctx = document.getElementById("device_chart");
    window.device_chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: device_list,
        datasets: [{
            data: device_count//Object.values(device_dict)
        }]
      },
      options: {
        title: {
          display: true,
          text: 'ダウンロードしたデバイス'
        },
        plugins: {
            colorschemes: {
                scheme: 'tableau.Classic20'
            }
        }
      }
    });
}



// ダウンロードリスト取得
let download_list = [];
let download_transition = [];
let download_counter = [];
let start_point = new Date();
let device_list = [];
let device_count = [];
function getFileDownloadListInterval(){
    startAjax(GET_DOWNLOAD_LIST_PAGE, {send_secret_token: $.cookie('sender_secret'), offset: download_list.length}).then(data => {
        let len = data['data']['download_list'].length;
        for (let i = 0; i < len; i++){
            let row_data = data['data']['download_list'][i];
            let recv_token = row_data['recv_token'];
            if (download_list.indexOf(recv_token) === -1){
                download_list.push(recv_token);
                let agent = platform.parse(row_data['recv_agent']);
                let os = agent.os['family'];

                $('#history-all').append('<li><strong class="font-weight-bold" style="color: lightgreen">ダウンロード - '+ row_data['file_downloaded'] +'</strong><br><span style="font-style: italic;">'+ agent.description +'</span></li>');
                $('#history-download').append('<li><strong class="font-weight-bold" style="color: lightgreen">'+ row_data['file_downloaded'] +'</strong><br><span style="font-style: italic;">'+ agent.description +'</span></li>');
                $('.scroll-content').scrollTop($('.scroll-content').height());

                // デバイス
                let index = device_list.indexOf(os);
                if (index === -1){
                    device_list.push(os);
                    device_count.push(1);
                }
                else{
                    device_count[index]++;
                }
                window.device_chart.update();
                console.log(agent);
            }
        }

        // ダウンロード推移チャート描画
        const d = new Date(Date.now() - start_point);
        const m = String(d.getMinutes()).padStart(2, '0');
        const s = String(d.getSeconds()).padStart(2, '0');
        download_transition.push(download_list.length);
        download_counter.push(`${m}:${s}`);
        window.count_chart.update();

        $('#file_download').html(download_list.length);
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

        let now = new Date();
        let date_time = now.getFullYear() +'-'+ now.getMonth()+1 +'-'+ now.getDate() + ' '+ now.getHours()+':'+ now.getMinutes() +':'+ now.getSeconds();
        $('#history-all').append('<li><strong class="font-weight-bold" style="color: orange">QR読み取り - '+ date_time +'</strong><br><span style="font-style: italic;">'+ qr_data +'</span></li>');
        $('#history-reader').append('<li><strong class="font-weight-bold" style="color: orange">'+ date_time +'</strong><br><span style="font-style: italic;">'+ qr_data +'</span></li>');
        $('.scroll-content').scrollTop($('.scroll-content').height());
        qr_reader_flag = false;
    }).catch(data => {
        if (data['code'] === 'NG') reader_list.push(qr_data);
        qr_reader_flag = false;
    });
}


function main(){
    // ファイル情報取得
    startAjax(GET_FILE_INFO_PAGE,  {send_token: $.cookie('sender')}).then(data => {
        $('#file_name').html(data['data']['file_info']['file_name']);
        $('#file_size').html((Math.round((data['data']['file_info']['file_size'] / (1024 ** 2)) * 100) / 100) + ' MB　('+ data['data']['file_info']['file_size'] +' バイト)');
        $('#upload_date').html(data['data']['file_info']['file_uploaded']);
        $('#file_mime').html(data['data']['file_info']['file_format']);
        $('#file_hash').html(data['data']['file_info']['file_hash']);
        $('#file_download').html(data['data']['download_count']);

        // インターバル設定
        start_point = new Date();
        checkSenderTokenInterval();
        getFileDownloadListInterval();
        setInterval("checkSenderTokenInterval()", 2000);
        setInterval("getFileDownloadListInterval()", 10000);

        // チャート初期化
        setDownloadCountChart();
        setUsingDeviceChart();

        // オープンエフェクト解除
        hidePreloader();

    }).catch(data => {
        $.removeCookie('sender', { path: '/' });
        $.removeCookie('sender_secret', { path: '/' });
        window.location.href = './upload.html?error=1';
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
