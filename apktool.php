<?php

if($_GET["function"]=="modify"){
	$oldPkgName = $_GET["old"];
	$newPkgName = $_GET["new"];
	
	chdir("file");
	
	file_put_contents("temp_prog","0");
	if(file_exists("signed.apk")) unlink("signed.apk");
	if(file_exists("dest")) deldir("dest");
	
	exec("apktool d dest.apk 2>&1",$out,$status);
	if($status==1) die("failed");
	file_put_contents("temp_prog","25");
	
	$replaceTextCmd = "sfk replace dest\\AndroidManifest.xml /".convertPkgName($oldPkgName)."/".convertPkgName($newPkgName)."/ -yes 2>&1";
	exec($replaceTextCmd,$out,$status);
	file_put_contents("temp_prog","51");
	
	exec("apktool b dest 2>&1",$out,$status);
	if($status==1) die("failed");
	file_put_contents("temp_prog","80");
	
	$signApkCmd = "signApk";
	exec($signApkCmd,$out,$status);
	if($status==1) die("failed");
	file_put_contents("temp_prog","99");
	echo "success";
}else if($_GET["function"]=="downloadFile"){
	$filePath = "file/signed.apk";
	//$file = fopen($filePath,"r");
	$buffer = 1024;
	
	header("Content-type:application/vnd.android.package-archive");
	header("Content-Disposition:attachment;filename=signed.apk");
	header("Cache-Control:public");
	header("Content-Transfer-Encoding:binary");
	header("Content-Length:".filesize($filePath));
	
	readfile($filePath);
	exit();
}

if($_POST["function"]=="uploadFile"){
	$file = $_FILES["file"];
	$temp = explode(".",$file["name"]);
	$fileSize = $file["size"];
	$extension = end($temp);
	if($extension=="apk"&&$fileSize<1024*1024*200&&$file["error"]==0){
		move_uploaded_file($file["tmp_name"],"file/dest.apk");
		echo "success";
	}else{
		echo "failed";
	}
}

function convertPkgName($name){
	return "package=\\\"".$name."\\\"";
}
	
function deldir($dir){
	//先删除目录下的文件：
  $dh=opendir($dir);
  while ($file=readdir($dh)) {
  	if($file!="." && $file!="..") {
      $fullpath=$dir."/".$file;
      if(!is_dir($fullpath)) {
      	unlink($fullpath);
      } else {
      	deldir($fullpath);
      }
    }
  }
  closedir($dh);
  //删除当前文件夹：
  if(rmdir($dir)) {
    return true;
  } else {
    return false;
  }
}
?>