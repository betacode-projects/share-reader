// GETデータのパース
function getUrlParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return undefined;
    if (!results[2]) return undefined;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// 入力値チェック
function checkParam(data_list){
    for(let i = 0; i < data_list.length; i++)
        if (data_list[i] === undefined) return false;
    return true;
}


// Ajax通信
function startAjax(url, data){
    return new Promise(function(resolve, reject) {
        $.ajax({
            'url': url,
            'type': 'post',
            'data': data
        })
        .done(function(data) {
            if (data['status'] === 'success'){
                resolve(data)
            }
            else {
                console.log(data);
                reject(data);
            }
        }).fail(function(data){
            console.log(data);
            let error_list = {messages: 'APIサーバーに接続できませんでした。しばらくたってからアクセスしてください。', code: 'API'};
            reject(error_list);
        });
    });
}

