var qr_reader_flag = false;
var reader_list = [];
var qr_count = 0;

// QRコード読み込み
var html5QrcodeScanner = new Html5QrcodeScanner(
	"reader", { fps: 10, qrbox: 250 });


function onScanSuccess(qrCodeMessage) {
    html5QrcodeScanner.clear();
    if (reader_list.indexOf(qrCodeMessage) !== -1 || qr_reader_flag){
        return;
    }

    console.log(qrCodeMessage);
    qr_reader_flag = true;

    $.ajax({
        url: SET_FILE_PAGE,
        type: 'post',
        data: {token: sender_token, recv_token: qrCodeMessage}
    })
    .done(function(data) {
        console.log(data);
        if (data['data']['flag']){
            reader_list.push(qrCodeMessage);
        }
        else{
            if (data['code'] === 'NG')
                reader_list.push(qrCodeMessage);
        }
    }).fail(function(data){
        console.log(data);
    }).always(function(data){
        qr_reader_flag = false;
    });
}
function onScanError(errorMessage) {
    // handle on error condition, with error message
}

html5QrcodeScanner.render(onScanSuccess, onScanError);
