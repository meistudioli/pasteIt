<?php
header("Access-Control-Allow-Origin: *");
header("Content-type: application/json; charset=utf-8");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("x-frame-options:sameorigin");
/*header("max-age: 1000");*/
import_request_variables("gp");
ini_set('display_errors', 0);
require_once './libs/cls_commom.php';
foreach ($_REQUEST as $k => $v) $$k = $v;

$libs = new CommonClass();

if (isset($callBack)) sleep(1);

$FilePath = './pasteItLog.inc';
$file_content = '';
foreach ($_POST as $key => $value) {
	if ($key == 'Filedata') continue;
	$file_content .= $key.': '.urldecode($value)."\n";
}//end for

switch ($action) {
	case 'drop':
		foreach ($_FILES as $Key => $Value) {
			$file_content .= 'ColName: '.$Key."\n";
			$file_content .= 'FileName: '.$Value['name']."\n";
			$file_content .= 'FileSize: '.$Value['size']."\n";
			$MovePath = str_replace('\\', '/', realpath("./").'/inputFiles/'.$Value['name']);
			$file_content .= 'RealPath: '.$MovePath."\n\n";
			move_uploaded_file($Value['tmp_name'], $MovePath);
		}//end for
		break;
	case 'paste':
		$ext = preg_replace('/^data:image\/([^;]*);base64,(.*)/', '$1', $Filedata);
		$image = preg_replace('/^data:image\/([^;]*);base64,(.*)/', '$2', $Filedata);
		$fileName = 'pasteIt_'.microtime(true).'.'.$ext;
		$MovePath = str_replace('\\', '/', realpath("./").'/inputFiles/'.$fileName);
		file_put_contents($MovePath, base64_decode($image));

		$file_content .= 'ColName: Filedata'."\n";
		$file_content .= 'FileName: '.$fileName."\n";
		$file_content .= 'FileSize: '.filesize($MovePath)."\n";
		$file_content .= 'RealPath: '.$MovePath."\n\n";
		break;
}//end switch

$FH = fopen($FilePath, "a+");
fwrite($FH, $file_content);
fclose($FH);

if (isset($jojo)) {
	$key = rand(0, 18);
	$DataArray = array();
	$DataArray[] = array(
						'icon' => '/Modules/img/illuTrans/shiseido_jojo_'.$key.'_150.jpg',//must have
						'preview' => '/Modules/img/illuTrans/shiseido_jojo_'.$key.'.jpg',//must have
						'id' => 'mei'
					);
} else {
	$key = rand(0, 8);
	// $key = 1;
	$DataArray = array();
	$DataArray[] = array(
						'icon' => '/Modules/img/illuTrans/anri_'.$key.'_150.jpg',//must have
						'preview' => '/Modules/img/illuTrans/anri_'.$key.'.jpg',//must have
						'id' => 'mei'
					);
}//end if

// $status = (rand(0, 1)) ? 'success' : 'fail';
// $status = 'success';
$status = (!isset($err)) ? 'success' : ((rand(0, 1)) ? 'success' : 'fail');
// $status = 'fail';
$libs->callBack($status, $DataArray);
/*中文*/
?>