$(function() {
	initSvg();
	initOption();
	$(".note_open").on("click", function () {
		$(".note-area").fadeIn(300);
	});
	$(".note_close").on("click", function () {
		$(".note-area").fadeOut(300);
		if ($("#note_check").prop("checked")) {
			document.cookie = "note=ok";
		} else {
			document.cookie = "note=; expires="+new Date(new Date-1).toUTCString();
		}
	});
	checkNoteCookie();
});

function checkNoteCookie() {
	if (!document.cookie.match("note=")) {
		$(".note-area").fadeIn(300);
	} else {
		$("#note_check").prop("checked", true);
	}
}
