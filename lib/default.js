const HOST_URL = 'http://localhost/share-reader-api';

const SET_RECEIVER_PAGE = HOST_URL + '/set_receiver.php';
const UPLOAD_PAGE = HOST_URL + '/upload_file.php';
const CHECK_SENDER_PAGE = HOST_URL + '/check_sender.php';
const REMOVE_SENDER_TOKEN_PAGE = HOST_URL + '/remove_sender.php';
const SET_FILE_PAGE = HOST_URL + '/set_file.php';
const GET_FILE_PAGE = HOST_URL + '/get_file.php';
const CHECK_FILE_PAGE = HOST_URL + '/check_file.php';
const GET_FILE_INFO_PAGE = HOST_URL +'/get_file_info.php';
const GET_DOWNLOAD_LIST_PAGE = HOST_URL +'/get_download_list.php';
const SET_PERMISSION_PAGE = HOST_URL +'/set_permission.php';

const URL_PAGE = location.protocol  +'//'+ location.host + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/';
