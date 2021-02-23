// トークン取得・設定
let secret_token = getParam('secret');
//console.log(recv_token);
if (secret_token === undefined){
    secret_token = '';
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


$.ajax({
    url: SET_PERMISSION_PAGE,
    type: 'post',
    data: {'secret_token': secret_token}
})
.done(function(data) {
    if (data['status'] === 'success'){
        $.cookie('sender', data['data']['token'], {expires: 7, path: '/'});
        $.cookie('secret', data['data']['secret_token'], {expires: 7, path: '/'});
        window.location.href = 'sender.html';
    }
    else {
        $('#status').html('<p>エラー: '+ data['messages']);
    }

}).fail(function(data){
    console.log(data);
});
