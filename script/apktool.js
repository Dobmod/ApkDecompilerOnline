var isApk = false,isTooLarge = false,isWorking = false,hasChoosen = false;

$(document).ready(function(){
	layx.msg("服务器连接成功!",{dialogIcon:"success"});
	$("#progressBarBox").hide();
	$("#downloadBtn").hide();
});

$("#chooseFileBtn").click(function(){
	$("#chooseFileInput").click();
});

$("#downloadBtn").click(function(){
	location.href = "../apktool.php?function=downloadFile";
});

$("#chooseFileInput").change(function(element){
	hasChoosen = true;
	var file = element.currentTarget.files[0];
	var name = file.name;
	$("#fileNameText").text(name);
	var temp = name.lastIndexOf(".apk");
	if((name.length-temp)==4){
		isApk = true;
		if(file.size>1024*1024*200){
			isTooLarge = true;
			layx.msg("文件过大！",{dialogIcon:"warn"});
		}else{
			uploadApkFile(file);
		}
	}
	else{
		isApk = false;
		layx.msg("非apk文件！",{dialogIcon:"warn"});
	}
});

$("#submitBtn").click(function(){
	var oldPkgName = $("#oldPkgNameInput").val();
	var newPkgName = $("#newPkgNameInput").val();
	if(oldPkgName==""||newPkgName==""){
		layx.msg("请填写必要数据！",{dialogIcon:"warn"});
		return;
	}else if(!hasChoosen){
		layx.msg("请选择一个apk文件！",{dialogIcon:"warn"});
		return;
	}else if(!isApk){
		layx.msg("非apk文件！",{dialogIcon:"warn"});
		return;
	}else if(isTooLarge){
		layx.msg("文件过大！",{dialogIcon:"warn"});
		return;
	}else if(isWorking){
		layx.msg("正在工作！",{dialogIcon:"warn"});
		return;
	}
	isWorking = true;
	var listener = setInterval(function(){
		$.get("../prog_listener.php",function(data,status){
			var rate = data;
			if(rate==0){
				upBar.text("正在准备");
			}else if(rate==25){
				upBar.text("正在解包");
			}else if(rate==51){
				upBar.text("正在替换包名");
			}else if(rate==80){
				upBar.text("正在打包");
			}else if(rate==99){
				upBar.text("正在签名");
			}
			upBar.css("width",data+"%");
		});
	},3000);
	
	var upBar =	$("#uploadProgressBar");
	upBar.css("width","0%");
	upBar.text("等待处理");
	upBar.removeClass("bg-success");
	$.get("../apktool.php?function=modify&old="+oldPkgName+"&new="+newPkgName,function(data,status){
		if(status=="success"){
			if(data=="success"){
				layx.msg("修改包名完成！",{dialogIcon:"success"});
				upBar.css("width","100%");
				upBar.addClass("bg-success");
				upBar.text("Success");
				$("#downloadBtn").show();
				clearInterval(listener);
			}else{
				layx.msg("遇到一个错误！",{dialogIcon:"error"});
				upBar.css("width","100%");
				upBar.addClass("bg-danger");
				upBar.text("Error");
				clearInterval(listener);
			}
		}
	});
	
});

function uploadApkFile(file){
	var formData = new FormData();
	formData.append("function","uploadFile");
	formData.append("file",file);
	
	$.ajax({
		url:"../apktool.php",
		type:"POST",
		processData:false,
		contentType:false,
		data:formData,
		xhr:function(){
			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress",function(element){
				var progressRate = Math.round((element.loaded/element.total)*100)+"%";
				$("#progressBarBox").show();
				$("#uploadProgressBar").css("width",progressRate);
				$("#uploadProgressBar").text(progressRate);
			});
			
			return xhr;
		},
		success:function(data,status){
			$("#uploadProgressBar").text("上传成功");
			$("#uploadProgressBar").addClass("bg-success");
		},
		error:function(xhr,status,e){
			$("#uploadProgressBar").text("上传失败");
			$("#uploadProgressBar").addClass("bg-danger");
		}
	});
}

