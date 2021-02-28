
// エラー表示処理
function main(){
    // URLチェック
    let error_content = getUrlParam('error');
    if (error_content !== undefined){
        $.cookie('error', getUrlParam('error'), {expires: 1, path: '/'});
        window.location.href = './error.html';
        return;
    }

    // エラーチェック
    let error = $.cookie('error');
    if (error === undefined){
        window.location.href = './index.html';
        return;
    }

    // 表示
    $.removeCookie('error', { path: '/' });
    $('#status').html(error);
    hidePreloader();
}

main();