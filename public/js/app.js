// inspired by http://dribbble.com/shots/375854-Article-Search

function updateButton(parent) {
    var button = $(parent).find("button.te");
    var isHint = button.attr("data-hint-value");
    if( $(parent).find("input[type=text]").val() == "") {
    	if(isHint) {
	        button.text(isHint);
	    } else {
	        button.text("\u2716");
	    	button.attr("disabled", "");
	    }
    } else {
        button.text("\u2716");
    	button.removeAttr("disabled", "");
    }
}
$(document).on("click", "button.te", function() {
    $(this).parent().find("input[type=text],input[type=password]").val("");
    updateButton($(this).parent())
});

$(document).on("click", "button.close", function() {
    $(this).parent().hide();
});


$(document).on("input", "input[type=text].erasable,input[type=password].erasable", function() {
    updateButton($(this).parent());
});

$(function() {
	$("input[type=text].erasable,input[type=password].erasable").each(function() {
		updateButton($(this).parent());
	});
})