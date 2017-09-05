var svgW = 800,
	svgH = 300;
var fontUrl = "./font/NotoSansCJKjp-Black.min.woff";
var fontText = "@font-face{font-family:'NotoSans';src:url({URL})format('woff')}";
var fontBase64;
var ops = {
	text:   {val: "熱盛", on: updateText, type: "string"},
	sText:  {val: "アツモリ", on: updateText, type: "string"},
	sTextX: {val: 451, on: updateText, type: "number"},
	sTextY: {val: 168, on: updateText, type: "number"},
	sBackX: {val: 410, on: updateSubBack, type: "number"},
	sBackY: {val: 150, on: updateSubBack, type: "number"},
	sBackW: {val:  81, on: updateSubBack, type: "number"},
	sBackH: {val:  30, on: updateSubBack, type: "number"},
	pathX:  {val: 295, on: movePath, type: "number"},
	pathY:  {val:  84, on: movePath, type: "number"},
	pathW:  {val: 210, on: resizePath, type: "number"},
	pathH:  {val: 110, on: resizePath, type: "number"},
	pathR:  {val:  30},
	angle: {val:  -10, on: updateAngle, type: "number"}
};
var editMode = false;
var $p = {
	canvas: "#save_canvas",
	svg: "#view",
	g: "#am_g",
	path1: "#am_path_1",
	path2: "#am_path_2",
	text: "#am_text",
	sText: "#am_sub_text",
	sBack: "#am_sub_text_back"
};
var color = {
	main: "#ff4012",
	sub: "#fff",
	back: "#fff",
	edit: "rgba(0, 0, 0, 0.5)",
	save: "transparent"
};


function initSvg() {
	setDom($p);
	var bbox = $p.svg[0].getBBox();
	$p.svg.attr("viewBox", "0 0 "+svgW+" "+svgH);
	$p.svg.attr("width", svgW);
	$p.svg.attr("height", svgH);
	$p.text.attr("x", svgW/2);
	$p.text.attr("y", svgH/2);

	$(".ready").text("フォントの準備中・・・");
	$(".ready").fadeIn(200);
	convertFont(fontUrl, function (base64) {
		fontBase64 = base64;
		$("#svg_font").html(fontText.replace("{URL}", base64));
		$(".ready").text("準備完了！");
		setTimeout(function () {$(".ready").fadeOut(200)}, 1000);
		refreshSvg();
	});
}
function initOption() {
	$("#save").on("click", exportToImage);
	$(".am_option").each(function () {
		var key = $(this).attr("data-op");
		if (!ops.hasOwnProperty(key)) return;
		$(this).on("change keyup", ops[key].on);
	});
	$(".auto_button").on("click", autoAdjust);
	$("#edit_mode").on("change keyup", updateColor);
	$(".input_color").each(function () {
		var key = $(this).attr("data-op");
		if (!color.hasOwnProperty(key)) return;
		var that = this;
		$(this).spectrum({
			color: color[key],
			preferredFormat: "hex",
			showInput: true,
			showAlpha: true,
			allowEmpty: true,
			move: function () {
				updateColor.call(that);
			},
			change: function () {
				updateColor.call(that);
			},
			hide: function () {
				updateColor.call(that);
			}
		});
	});
	updateOptionInput();
}

function setDom(obj) {
	var keys = Object.keys(obj);
	for (var i=0; i < keys.length; i++) {
		obj[keys[i]] = $(obj[keys[i]]);
	}
}


function refreshSvg() {
	resizePath();
	updateText();
	updateSubBack();
	updateColor();
	updateAngle();
}

function updateOptionInput() {
	$(".am_option").each(function () {
		var key = $(this).attr("data-op");
		if (!ops.hasOwnProperty(key)) return;
		$(this).val(ops[key].val);
	});
}

function checkSender($sender) {
	var key = $sender.attr("data-op");
	if (ops.hasOwnProperty(key)) {
		var val = $sender.val();
		if (val != "" && ops[key].type == "number") {
			ops[key].val = $sender.val()-0;
		}
		else if (ops[key].type == "string") {
			ops[key].val = $sender.val();
		}
	};
}
function updateText() {
	checkSender($(this));
	$p.text.text(ops.text.val);
	$p.sText.text(ops.sText.val);
	$p.sText.attr("x", ops.sTextX.val);
	$p.sText.attr("y", ops.sTextY.val);
}

function updateSubBack() {
	checkSender($(this));
	$p.sBack.attr("x", ops.sBackX.val);
	$p.sBack.attr("y", ops.sBackY.val);
	$p.sBack.attr("width", ops.sBackW.val);
	$p.sBack.attr("height", ops.sBackH.val);
}

function resizePath() {
	checkSender($(this));
	var d = createRectPathD(
		ops.pathX.val, ops.pathY.val,
		ops.pathW.val, ops.pathH.val,
		ops.pathR.val);
	$p.path1.attr("d", d);
	$p.path2.attr("d", createJaggedPathD($p.path1));
}

function movePath() {
	checkSender($(this));
	$p.path1.attr("d", getMovePathD($p.path1, ops.pathX.val, ops.pathY.val));
	$p.path2.attr("d", getMovePathD($p.path2, ops.pathX.val, ops.pathY.val));
}

function updateColor() {
	var key = $(this).attr("data-op");
	if (color.hasOwnProperty(key)) {
		var _c = $(this).spectrum("get");
		if (_c) {
			color[key] = $(this).spectrum("get").toRgbString();
		} else {
			color[key] = "transparent";
		}
	}
	editMode = $("#edit_mode").prop("checked");
	if (editMode) {
		$p.sBack.attr("fill", color.edit);
	} else {
		$p.text.attr("fill", color.main);
		$p.text.attr("stroke", color.main);
		$p.sText.attr("fill", color.sub);
		$p.sText.attr("stroke", color.sub);
		$p.sBack.attr("fill", color.main);
		$p.path1.attr("fill", color.back);
		$p.path2.attr("stroke", color.main);
	}
}

function updateAngle() {
	checkSender($(this));
	$p.g.attr("transform",
		"rotate("+
		ops.angle.val+","+svgW/2+","+svgH/2+")");
}

function autoAdjust() {
	var key = $(this).attr("data-op");
	if (key == "main") {
		var bbox = $p.text[0].getBBox();
		ops.pathX.val = ~~bbox.x-5;
		ops.pathY.val = ~~bbox.y+23;
		ops.pathW.val = ~~bbox.width+10;
		ops.pathH.val = ~~bbox.height-38;
		resizePath();
	}
	else if (key == "sub") {
		var bbox = $p.sText[0].getBBox();
		ops.sBackX.val = ~~bbox.x-5;
		ops.sBackY.val = ~~bbox.y-1;
		ops.sBackW.val = ~~bbox.width+9;
		ops.sBackH.val = ~~bbox.height+3;
		updateSubBack();
	}
	updateOptionInput();
}

function createRectPathD(x, y, w, h, r) {
	var cmds = new Array(4*2+2);
	cmds[0] = "M"+
		(x+r)+","+y;
	cmds[1] = "l"+
		(w-r*2)+","+0;
	cmds[2] = "q"+
		r+","+0+" "+r+","+r;
	cmds[3] = "l"+
		0+","+(h-r*2);
	cmds[4] = "q"+
		0+","+r+" "+(-r)+","+r;
	cmds[5] = "l"+
		-(w-r*2)+","+0;
	cmds[6] = "q"+
		(-r)+","+0+" "+(-r)+","+(-r);
	cmds[7] = "l"+
		0+","+(-(h-r*2));
	cmds[8] = "q"+
		0+","+(-r)+" "+r+","+(-r);
	cmds[9] = "Z";
	return cmds.join(" ");
}

function createJaggedPathD($path) {
	var path = $path[0],
		len = path.getTotalLength(),
		splitNum = ~~(ops.pathW.val/2.5),
		splitLen = len/splitNum,
		shiftLimit = 12,
		cmds = new Array(splitNum+1);
	var prevPoint = path.getPointAtLength(0),
		nowPoint = path.getPointAtLength(0);
	var tmpX, tmpY;
	cmds[0] = "M"+nowPoint.x+","+nowPoint.y;
	cmds[splitNum] = "Z";
	for (var i=1; i< splitNum; i++) {
		nowPoint = path.getPointAtLength(splitLen*i);
		tmpX = nowPoint.x+getRandomShift(shiftLimit)/10;
		tmpY = nowPoint.y+getRandomShift(shiftLimit)/10;
		cmds[i] = "l"+
			(tmpX-prevPoint.x)
			+","+
			(tmpY-prevPoint.y);
		prevPoint.x = tmpX;
		prevPoint.y = tmpY;
	}
	return cmds.join(" ");
}

function getMovePathD($path_dom, x, y) {
	var d = $path_dom.attr("d")+"";
	return d.replace(/M[0-9\.]+,[0-9\.]+/, "M"+(x+ops.pathR.val)+","+y);
}

function getRandomShift(limit) {
	var n = ~~(Math.random()*(limit*2+1)-limit);
	n = n<=0 ? n-1 : n;
	return n;
}

function showSavePanel () {

}

function test() {
	var c = $p.canvas[0],
		ctx = c.getContext("2d"),
		mag = 2,
		margin = 20,
		x = ops.pathW.val,
		y = ops.pathH.val,
		r = Math.sqrt(x*x+y*y),
		rad = Math.atan2(x, y)+Math.abs(ops.angle.val)/180*Math.PI,
		w = Math.round(r * Math.sin(rad))*mag+margin,
		h = Math.round(r * Math.cos(rad))*mag+margin;
}
function exportToImage() {
	var c = $p.canvas[0],
		ctx = c.getContext("2d"),
		mag = 2;
	var svgBlob = new Blob(
		[new XMLSerializer().serializeToString($p.svg[0])],
		{type: "image/svg+xml"});
	var image = new Image();
	image.src = URL.createObjectURL(svgBlob);
	$(image).on("load", function () {
		var iw = image.width,
			ih = image.height,
			pLen = Math.sqrt(
				Math.pow(ops.pathW.val+80, 2) + Math.pow(ops.pathY.val+80, 2)
			);
		var cw = pLen*mag,
			ch = pLen*mag;
		c.width = cw;
		c.height = ch;
		ctx.clearRect(0, 0, cw, ch);
		ctx.fillStyle = color.back;
		ctx.fillRect(0, 0, c.width, c.height);
		ctx.drawImage(image, (iw-pLen)/2, (ih-pLen)/2, pLen, pLen, 0, 0, cw, ch);
		var cBlob = dataURLtoBlob(c.toDataURL());
		downloadFile(URL.createObjectURL(cBlob), new Date().getTime());
//		var x = pw,
//			y = ph,
//			r = Math.sqrt(x*x+y*y),
//			rad1 = Math.atan2(x, y),
//			rad2 = Math.abs(ops.angle.val*Math.PI/180),
//			w = Math.round(r * Math.sin(rad1+rad2))*2,
//			h = Math.round(r * Math.cos(rad1-rad2))*2;
	});
}
function convertFont(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.responseType = "blob";
	xhr.open("GET", url);
	xhr.addEventListener("load", function () {
		var reader = new FileReader();
		reader.readAsDataURL(this.response);
		reader.addEventListener("load", function () {
			console.log("convertFont: END");
			if (typeof(callback) == "function") {
				callback(reader.result);
			}
		})
	});
	xhr.send();
}

/**
 * 指定されたURLのダウンロードダイアログを表示する
 */
function downloadFile(url, name) {
	var $a = $("<a>aaaaaaaaaa</a>");
	$a.attr("href", url);
	$a.attr("download", name+".png" || "noname.png");
	var event = document.createEvent("MouseEvents");//Eventオブジェクトを追加
	event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);//イベントを設定
	$a[0].dispatchEvent(event);
}



/**
 * dataURLをBlobにする
 */
function dataURLtoBlob (dataURL) {
	var byteString = atob(dataURL.split(",")[1]),
		mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0],
		ab = new ArrayBuffer(byteString.length),
		ia = new Uint8Array(ab);
	for (var i=0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], {type: mimeString});
}



var workerScript = function() {

}


