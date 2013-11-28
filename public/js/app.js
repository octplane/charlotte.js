// inspired by http://dribbble.com/shots/375854-Article-Search

function updateButton(parent) {
    var button = $(parent).find("button.te");
    if( $(parent).find("input[type=text]").val() == "") {
        button.text(button.attr("data-non-empty-value"));
    } else {
        button.text("\u2716");
    }
}
$(document).on("click", "button.te", function() {
    $(this).parent().find("input[type=text]").val("");
    updateButton($(this).parent())
});

$(document).on("input", "input[type=text].erasable", function() {
    updateButton($(this).parent());
});