var moveListener = [];
$(function() {
	initMoveBar();
});
function initMoveBar(listener) {
	var callback = typeof(listener)=="function"?
		listener:function(){};
	$(".move_bar").on("mousedown touchstart", function (event) {
		var dir = $(this).attr("data-dir");
		if (dir != "x" && dir != "y") return;
		var $point = $(this).find(".move-bar-point");
		var that = this;
		moveBarPoint(event, $(that), $point, dir)
		moveListener.push(function (event) {
			var per = moveBarPoint(event, $(that), $point, dir);
			if (per == null) return;
			callback(per-0, dir);
		});
	});
	$(document).on("mousemove", function (event) {
		for (var i=0; i < moveListener.length; i++) {
			moveListener[i](event);
		}
		if (moveListener.length > 0) {
			event.preventDefault();
			return false;
		}
	});
	document.addEventListener("touchmove", function (event) {
		for (var i=0; i < moveListener.length; i++) {
			moveListener[i](event);
		}
		if (moveListener.length > 0) {
			event.preventDefault();
			return false;
		}
	}, {passive: false});
	$(document).on("mouseup touchend", function (event) {
		moveListener = [];
	});
}

function setMoveBar(x, y) {
	$(".x .move-bar-point").css({
		left: x*100+"%"
	});
	$(".y .move-bar-point").css({
		top: y*100+"%"
	});
}

function moveX(per) {

}

function moveBarPoint(_event, $bar, $point, dir) {
	var loc = 0,
		range = 0,
		prop = "",
		event = _event;
	if (event.type.match("touch")) {
		event = _event.touches[0];
	}
	if (dir == "x") {
		loc = event.pageX-$bar.offset().left;
		range = $bar.width();
		prop = "left";
	}
	else if (dir == "y") {
		loc = event.pageY-$bar.offset().top;
		range = $bar.height();
		prop = "top";
	}
	var per = loc/range;
	if (per >= 0 && per <= 1) {
		$point.css(prop, per*100+"%");
		return per;
	}
	return null;
}

