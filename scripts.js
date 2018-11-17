var electron = require('electron');
const {
    clipboard
} = require('electron')
const Store = require('electron-store');
const store = new Store();
var ipc = electron.ipcRenderer;
var currentWindow = electron.remote.getCurrentWindow();
var deleted = false;
var clicked = false;
var expanded = false;
var list = [];
var hideDates = [];
var tags = [];
var color = "";
var addingTag = false;

var selectedTag = "General";
var removeTagIndex;
var toggleClicked = false;

var elements = ["html,body", ".daySeperator", ".dayHeader", "#addTag", "#removeTag", ".tagList", "#themes"];

var theme = store.get("theme");

if (theme == undefined) {
    theme = "light";
}

if (currentWindow.data.list != undefined) {
    list = currentWindow.data.list;
}

if (currentWindow.data.toggle != undefined) {
    hideDates = currentWindow.data.toggle;
}

if (currentWindow.data.tags != undefined) {
    tags = currentWindow.data.tags;
}

var d = new Date();
var time = d.toISOString().slice(0, 10).replace(/-/g, "-");

if (jQuery.isEmptyObject(list)) {
    $("#noObjects").show();
    $("#noObjects").fadeTo(1, 1);
}

setTheme(theme);
printList();

//get current
function printList() {

    list = store.get("items");
    if (list == undefined) {
        list = [];
    }

    hideDates = store.get("hide");

    if (hideDates == undefined) {
        hideDates = [];
    }
    $(".objektContainer").empty();

    list.forEach(function(entry) {

        var _date = entry.date.substr(0, entry.date.indexOf(' '));
        if (entry.tag == selectedTag) {

            if (_date == time) {
                if ($('#' + _date).length == 0) {
                    $("<div class='daySeparator' id=" + _date + "><p class='dayHeader' id='todayAnchor' value=" + _date + ">Today</p></div>").appendTo('.objektContainer');
                }

                $("<div class='objekt' id=" + entry.id + " style='background-color:" + color + "; color:" + color + "'>" + "<p class='date'>" + entry.date + "</p>" + "<p class='hasTag' id=" + entry.tag + ">" + entry.tag + "</p>" + "<textarea readonly=true class='content'>" + entry.content + "</textarea>" + "<div class='contentButtons'><div class='contentButton'><div class='contentBtn expand'>Expand</div></div><div class='contentButton'><div class='contentBtn delete'>Delete</div></div></div>" + "</div>").appendTo("#" + _date);

            } else {
                if ($('#' + _date).length == 0) {
                    $("<div class='daySeparator' id=" + _date + "><p class='dayHeader' value=" + _date + ">" + _date + "</p></div>").appendTo('.objektContainer');
                }
                $("<div class='objekt' id=" + entry.id + " style='background-color:" + color + "; color:" + color + "'>" + "<p class='date'>" + entry.date + "</p>" + "<p class='hasTag' id=" + entry.tag + ">" + entry.tag + "</p>" + "<textarea readonly=true class='content'>" + entry.content + "</textarea>" + "<div class='contentButtons'><div class='contentButton'><div class='contentBtn expand'>Expand</div></div><div class='contentButton'><div class='contentBtn delete'>Delete</div></div></div>" + "</div>").appendTo("#" + _date);
            }
        }
    })

    //Hide dates
    hideDates.forEach(function(entry) {
        $("#" + entry).children(".objekt").toggle();
    })

    checkEmpty();
}

//Print tags in container
tags.forEach(function(entry) {
    $("<div value=" + entry.name + " class='tag notSelected' style='background-color:" + entry.color + "; border:3px solid " + entry.color + "; color:" + entry.color + "' id=" + entry.id + ">" + entry.name + "</div>").appendTo('.tagContainer');
    $("<div value=" + entry.name + " class='tagInList' style='background-color:" + entry.color + ";' id=" + entry.id + ">" + entry.name + "</div>").appendTo(".tagList");
})

//add new
require('electron').ipcRenderer.on('ping', (event, message) => {

    var _date = message.date.substr(0, message.date.indexOf(' '));

    if (message.tag == selectedTag) {
        $("#noObjects").fadeTo(200, 0, function() {

            $("#noObjects").hide();


            if ($('#' + _date).length == 0) {
                $("<div class='daySeparator' id=" + _date + "><p class='dayHeader' id='todayAnchor' value=" + _date + ">Today</p></div>").prependTo('.objektContainer');
            }

            $("<div class='objekt popIn' id=" + message.id + ">" + "<p class='date'>" + message.date + "</p>" + "<p class='hasTag' id='general'>" + message.tag + "</p>" + "<textarea readonly=true class='content'>" + message.content + "</textarea>" + "<div class='contentButtons'><div class='contentButton'><div class='contentBtn expand'>Expand</div></div><div class='contentButton'><div class='contentBtn delete'>Delete</div></div></div>" + "</div>").insertAfter("#todayAnchor");

            setTimeout(() => {
                $(".objekt").removeClass("popIn");
            }, 550);


        });
    }
    list.unshift(message);

})

$(document).on('click', '.content', function() {
    if (!clicked) {

        clicked = true;
        var saved = $(this).val();
        clipboard.writeText(saved, 'selection');
        $(this).val("Copied to clipboard!");
        $(this).parent().addClass("copied");

        setTimeout(() => {
            $(this).val(saved);
            clicked = false;
            $(this).parent().removeClass("copied");
        }, 500);

    }
});

var selectedItem;

$(document).on('click', '.hasTag', function() {

    var top = $(this).parent().parent().position().top;
    var i = $(".tagInList[value=" + selectedTag + "]");
    selectedItem = $(this).parent().attr("id");

    $(i).parent().prepend(i);
    if (top >= 295) {
        top = 295
    } else {
        top += 65;
    }
    $(".tagList").css({
        top: top
    });
    $(".tagList").show();

});


$(document).on('click', '.tagInList', function() {

    var item = getIndex(list, selectedItem);

    if (list[item].tag != $(this).attr("value")) {
        list[item].tag = $(this).attr("value");

        $("#" + selectedItem).remove();

        store.set('items', list);
        ipc.send('updateList', list);

        if ($(".objekt").length == 0) {
            $(".daySeparator").remove();
            $("#noObjects").show();
            $("#noObjects").fadeTo(200, 1, function() {});

        }

        if ($('.tagList').is(':visible')) {
            $(".tagList").addClass("slideOutRight");
            setTimeout(() => {
                $(".tagList").removeClass("slideOutRight");
                $(".tagList").hide();
            }, 220);
        }
    }

});

$(document).on('click', '#tag_close', function() {
    addingTag = false;
    $("#addTag").hide();
});

$(document).on('click', '#remove_close', function() {
    $("#removeTag").hide();
});

$(document).on('click', '#theme_close', function() {
    $("#themes").hide();
});

$(document).on('click', '.tag', function() {
    toggleClicked = false;

    if (selectedTag != $(this).attr("value")) {
        $(".tag").removeClass("selected");
        $(".tag").addClass("notSelected");
        selectedTag = $(this).attr("value");

        if (selectedTag == "General") {
            color = "#7d5fff";
        } else {
            var index = getColor(tags, selectedTag);
            color = (tags[index].color);
        }

        printList();

        if ($(this).hasClass("notSelected")) {
            $(this).removeClass('notSelected');
            $(this).addClass('selected');
        } else {
            $(this).removeClass('selected');
            $(this).addClass('notSelected');
        }
    }
});


//Tag container scroll
//Kolla om det fungerar med touchpad scroll???
$(".tagContainer").on('mousewheel', function(e) {
    var scrolli = $(this).scrollLeft();
    if (e.originalEvent.deltaY == -100) {
        $(this).scrollLeft(scrolli -= 10);
    } else {
        $(this).scrollLeft(scrolli += 10);
    }
});


//göm tagList när man skrollar utanför
$(".objektContainer").on('mousewheel', function(e) {
    if ($('.tagList').is(':visible')) {
        $(".tagList").addClass("slideOutRight");
        setTimeout(() => {
            $(".tagList").removeClass("slideOutRight");
            $(".tagList").hide();
        }, 220);
    }
});

//göm taglist när man skrollar utanför
$("body").on('click', function(e) {
    if ($('.tagList').is(':visible')) {
        $(".tagList").addClass("slideOutRight");
        setTimeout(() => {
            $(".tagList").removeClass("slideOutRight");
            $(".tagList").hide();
        }, 220);
    }
});

$(document).on('click', '.dayHeader', function() {
    if (!toggleClicked) {
        toggleClicked = true;

        setTimeout(() => {
            toggleClicked = false;
        }, 560);

        var id = $(this).attr("value");

        var i = getDateIndex(hideDates, id);

        if (i == undefined) {
            hideDates.push(id);
            $(this).parent().children(".objekt").removeClass("popIn");
            $(this).parent().children(".objekt").addClass("popOut");
            setTimeout(() => {
                $(this).parent().children(".objekt").toggle();
            }, 550);
        } else {
            hideDates.splice(i, 1);
            $(this).parent().children(".objekt").toggle();
            $(this).parent().children(".objekt").removeClass("popOut");
            $(this).parent().children(".objekt").addClass("popIn");
        }

        ipc.send('setToggle', hideDates);
    }
});



$(document).on('click', '.delete', function() {
    if (!deleted) {
        deleted = true;

        var id = $(this).parent().parent().parent().attr("id");

        var index = getIndex(list, id);

        var date = list[index].date.substr(0, list[index].date.indexOf(' '));

        $('#' + id).remove();

        if ($("#today").children().length == 1) {
            $("#today").remove();
        }

        if ($('#' + date).children().length == 1) {
            $('#' + date).remove();
        }

        list.splice(index, 1);

        store.set('items', list);
        ipc.send('updateList', list);

        if (jQuery.isEmptyObject(list)) {

            $("#noObjects").show();
            $("#noObjects").fadeTo(200, 1, function() {});

        }
        setTimeout(() => {
            deleted = false;
        }, 300);
    }

    checkEmpty();

});

$(document).on('click', '.expand', function() {
    if (!expanded) {
        expanded = true;
        clicked = true;
        if ($(this).text() == "Expand") {

            $(this).parent().parent().parent().addClass('expanded');
            $(this).text("Shrink");

        } else {
            $(this).parent().parent().parent().removeClass('expanded');
            $(this).text("Expand");
        }
        setTimeout(() => {
            expanded = false;
            clicked = false;
        }, 300);
    }
});

$(document).on('click', '.addTag', function() {
    if (!addingTag) {
        $("#addTag").show();
    }
});

$(document).on('input', '#colorSelect', function() {

    var val = $(this).val();
    var isHex = /^#[0-9A-F]{6}$/i.test(val);

    if (isHex) {
        $(this).css({
            "box-shadow": "0px 0px 0px 3px " + val
        });
        $("#tag_add").removeClass("disabled");
    } else {
        $(this).css({
            "box-shadow": '0px 0px 0px 3px #d2dae2'
        });
        $("#tag_add").addClass("disabled");
    }

    if (val == "#ffffff" || val == "#FFFFFF") {
        $(this).css({
            "box-shadow": '0px 0px 0px 3px #d2dae2'
        });
    }

});

$(document).on('input', '#tagName', function() {

    var val = $("#colorSelect").val();
    var isHex = /^#[0-9A-F]{6}$/i.test(val);

    if (isHex) {
        if ($(this).val() != "") {
            $("#tag_add").removeClass("disabled");
            $("#exists").fadeOut();
        } else {
            $("#tag_add").addClass("disabled");
        }
    }
});


//right click tags to remove
$(document).on("contextmenu", ".tag", function(e) {

    if ($(this).attr("value") != "General") {
        $("#removeTag").show();
        $("#remove_tag_name").html("Remove " + $(this).attr("value") + "?");
    }

    selectedTag = getTagIndex(tags, $(this).attr("value"));

    return false;
});

$(document).on('click', '.colorPreset', function() {

    var val = $(this).attr("id");
    var isHex = /^#[0-9A-F]{6}$/i.test(val);

    if (isHex) {
        $("#colorSelect").css({
            "box-shadow": "0px 0px 0px 3px " + val
        });
        $("#colorSelect").val(val);
        if ($("#tagName").val() != "")
            $("#tag_add").removeClass("disabled");
    }

});

$(document).on('click', '.themeBtn', function() {

    var val = $(this).attr("value");
    if (val != theme) {
        theme = val;
        store.set("theme", val);
        setTheme(theme);
        $("#themes").hide();
    }
});

$(document).on('click', '#tag_add', function() {

    var name = $("#tagName").val();
    var color = $("#colorSelect").val();
    var id = new Date().getTime();

    if (getTagIndex(tags, name) == undefined) {
        tags.push({
            name: name,
            color: color,
            id: id
        });
        store.set("tags", tags);
        $("<div value=" + name + " class='tagInList' style='background-color:" + color + ";' id=" + id + ">" + name + "</div>").appendTo(".tagList");
        $("#tagName").val("");
        $("#colorSelect").val("");
        addingTag = false;
        $("#addTag").hide();
        $("<div value=" + name + " class='tag notSelected' style='background-color:" + color + "; border:3px solid " + color + "; color:" + color + "' id=" + id + ">" + name + "</div>").appendTo('.tagContainer');
    } else {
        $("#exists").fadeIn();
    }

});


$(document).on('click', '#tag_remove', function() {
    var tagName = tags[selectedTag].name;

    removeClipboard(list, tagName);

});

$(document).on('click', '#tag_move', function() {

    var tagName = tags[selectedTag].name;

    moveClipboard(list, tagName);

});

$(document).on('click', '#settings', function() {

    $("#themes").show();

});

function getIndex(arr, value) {

    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i].id == value) return i;

    }
}


function getTagIndex(arr, value) {

    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i].name == value) return i;

    }
}

function getDateIndex(arr, value) {

    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i] == value) return i;
    }
}

function getColor(arr, value) {
    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i].name == value) return i;
    }
}

function checkEmpty() {
    if ($(".objektContainer").children().length == 0) {
        $("#noObjects").show();
        if (selectedTag != "General") {
            $("#noObjects").html("There are no clipboards for this tag!");
        } else {
            $("#noObjects").html("You don't have any saved clipboards!<br><br>Save your clipboards by pressing<br>Ctrl + B");
        }
        $("#noObjects").fadeTo(200, 1, function() {});
    } else {
        $("#noObjects").fadeTo(1, 0, function() {
            $("#noObjects").hide();
        });
    }
}


function switchToGeneral() {
    color = "#7d5fff";
    selectedTag = "General";
    $(".tag[value='General']").removeClass("notSelected");
    $(".tag[value='General']").addClass("selected");
    printList();
}


function moveClipboard(arr, value) {
    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i].tag == value) {
            arr[i].tag = "General";
        }
    }

    tags.splice(selectedTag, 1);
    store.set("tags", tags);
    store.set("items", list);
    switchToGeneral();
    $(".tag[value=" + value + "]").remove();
    $(".tagInList[value=" + value + "]").remove();
    $("#removeTag").hide();
}

function removeClipboard(arr, value) {
    for (var i = 0, iLen = arr.length; i < iLen; i++) {

        if (arr[i].tag == value) {
            list.splice(i, 1);
        }
    }

    tags.splice(selectedTag, 1);
    store.set("tags", tags);
    store.set("items", list);
    switchToGeneral();
    $(".tag[value=" + value + "]").remove();
    $(".tagInList[value=" + value + "]").remove();
    $("#removeTag").hide();
}

function setTheme(theme) {

    for (var i = 0, len = elements.length; i < len; i++) {
        $(elements[i]).removeClass("light");
        $(elements[i]).removeClass("dark");
        $(elements[i]).removeClass("darkStars");
        $("html,body").removeClass("darkStarsBG");
        $(elements[i]).addClass(theme);
    }

    if (theme == "darkStars") {
        $("html,body").addClass("darkStarsBG");
    }
    if (theme == "light") {
        $(".tagContainer").css({
            "color": "#373737"
        });
        $(".closeBtn").css({
            "color": "#373737"
        });
        $(".footer").css({
            "color": "#373737"
        });
    } else {
        $(".tagContainer").css({
            "color": "white"
        });
        $(".closeBtn").css({
            "color": "white"
        });
        $(".footer").css({
            "color": "white"
        });
    }

}