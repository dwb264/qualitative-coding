var codes = [];
var text = {};
var oldCode, selectedText;

// try to get cookie
if (document.cookie.replace(/(?:(?:^|.*;\s*)codes\s*\=\s*([^;]*).*$)|^.*$/, "$1")) {
    var codeVal = document.cookie.replace(/(?:(?:^|.*;\s*)codes\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    codes = JSON.parse(codeVal);
}
if (document.cookie.replace(/(?:(?:^|.*;\s*)text\s*\=\s*([^;]*).*$)|^.*$/, "$1")) {
    var textVal = document.cookie.replace(/(?:(?:^|.*;\s*)text\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    text = JSON.parse(textVal);
}

function setCookies() {
    var codesval = JSON.stringify(codes);
    var textval = JSON.stringify(text);
    document.cookie = "codes=" + codesval;
    document.cookie = "text=" + textval;
}

function showAllCodes() {
    var codelist = $("#codeList")[0];
    var codeSelect = $("#codeSelections")[0];

    codelist.innerHTML = "";
    codeSelect.innerHTML = "";

    codes.forEach(function(code) {
        $("#codeList").append("<div class='code'>" + code + "</div>");
        $("#codeSelections").append("<div class='code'>" + code + "</div>");
    });

}

function addCode() {
    // get code
    var code = $("#newCode").val();
    if (codes.indexOf(code) !== -1) {
        alert ("Code already exists");
        return;
    }

    // append code to codes
    codes.push(code);
    text[code] = [];

    // clear text box
    $("#newCode").val("");

    // append code to list
    $("#codeList").append("<div class='code'>" + code + "</div>");
    $("#codeSelections").append("<div class='code'>" + code + "</div>");

    setCookies();
}

function editCode(newCode) {
    // edit code in codes
    codes[codes.indexOf(oldCode)] = newCode;

    // replace old code with new code in text
    var newText = {};
    Object.keys(text).forEach(function(k) {
        if (k === oldCode) {
            newText[newCode] = text[k];
        } else {
            newText[k] = text[k];
        }
    });
    text = newText;

    // edit code in codeSelect menu
    $("#codeSelect .code").each(function() {
        if (this.innerHTML == oldCode) {
            this.innerHTML = newCode;
        }
    });

    // edit code in text
    $("#selectedCode")[0].innerHTML = newCode;

    setCookies();
}

function deleteCode(code) {
    // remove code from codes
    codes.splice(codes.indexOf(code),1);

    // remove code from text
    var newText = {};
    Object.keys(text).forEach(function(k) {
        if (k !== code) {
            newText[k] = text[k];
        }
    });
    text = newText;

    setCookies();
}

function assignCodeToText(c, t) {
    text[c].push(t);
    if ($("#selectedCode")[0].innerText === c) {
        $("#textList").append("<div class='text'>" + t + "</div>");
    }

    setCookies();
}

function removeCodeFromText(c, t) {
    text[c].splice(text[c].indexOf(t), 1);

    setCookies();
}

function showCodes(code) {
    $("#selectedCode")[0].innerText = code;

    $("#textList")[0].innerHTML = "";

    text[code].forEach(function(t) {
        $("#textList").append("<div class='text'>" + t + "</div>");
    });
}


$(document).ready(function() {
    $(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "data/survey.txt",
        dataType: "text",
        success: function(data) {
            data = data.split("|").join("<br>");
            $("#document")[0].innerHTML = data;
        }
     });

    showAllCodes();

    // Add code
    $("#addNewCode").on("click", function() {
        addCode();
    });

    // Show code
    $(document).on("click", "#codeList .code", function(e) {
        showCodes(this.innerHTML);
    });

    // Edit code
    $(document).on("dblclick", "#codeList .code", function(e) {
        oldCode = this.innerHTML;
        $(this).attr("contenteditable", true);
    });

    // Save edited code
    $(document).on("keydown", ".code", function(e) {
        if (e.which === 13) {
            // Save when you press enter
            var newCode = this.innerHTML;
            if (codes.indexOf(newCode) !== -1) {
                alert ("Code already exists");
                this.innerHTML = oldCode;
            } else {
                if (newCode.trim() !== "") {
                    editCode(newCode);
                } else {
                    deleteCode(oldCode);
                }
            }
            $(this).attr("contenteditable", false);
        }
    });

    // Display code selections
    $("#document").on("mouseup", function(e) {
        selectedText = window.getSelection().toString();
        $('#codeSelect').show();
        $('#codeSelect').css({
            left: Math.min(e.pageX, window.innerWidth - $("#codeSelect").width()-10),
            top: Math.min(e.pageY, window.innerHeight - $("#codeSelect").height()-10)
        });
    });

    // Assign code to selected text
    $(document).on("click", "#codeSelections .code", function() {
        assignCodeToText(this.innerHTML, selectedText);
        $("#codeSelect").hide();
        selectedText = "";
    });

    $(document).on("dblclick", "#textList .text", function() {
        removeCodeFromText($("#selectedCode")[0].innerHTML, this.innerHTML);
        this.remove();
    });

    $(document).on("click", "#export", function() {
        var tsv = "";
        Object.keys(text).forEach(function(t) {
            tsv += t + "\t" + text[t].join("\t") + "\n";
        });
        console.log(tsv);
        window.location.href = "data:text/tab-separated-values," + encodeURIComponent(tsv);

    })

});

});
