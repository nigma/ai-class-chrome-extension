/* Copyright Filip Wasilewski <en@ig.ma>. All rights reserved.
 * Open Source software available under the MIT license terms.
 * More info at http://en.ig.ma/notebook/2011/chrome-extension-for-ai-class-forum
 */

var tagRegex = /(?:unit|hw)\d+\-\d+|midterm-\d+/;
var aiqusLinkId = "aiqus_discussion_link";
var aiqusContentSelector = "#listA";
var baseAiqusUrl = "http://www.aiqus.com/";
var baseTagUrl = "http://www.aiqus.com/tags/";
var contentContainerId = "aiqus_content";

// Additional tag matching (when not available directly from link)
var headerToTag = [
    {'re':/Midterm/, 'prefix':'midterm-'}
];

RegExp.escape = function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function rewriteLinks(html, baseUrl) {
    var from = [
        'href="/', "href='/", "href=/",
        'link="/', "link='/", "link=/",
        'src="/', "src='/", "src=/",
        'url("/', "url('/", "url(/"
    ];
    $.each(from, function (i, pattern) {
        var re = new RegExp(RegExp.escape(pattern), 'gi');
        var to = pattern.replace('/', baseUrl);
        html = html.replace(re, to);
    });
    return html;
}

function getCurrentTagFromLink() {
    // Extract tag from aiqus link
    var tag = "";
    var $link = $("#" + aiqusLinkId);
    if($link.size()) {
        var match = tagRegex.exec($link.html());
        if(match != null) {
            tag = match[0];
        }
    }
    return tag;
}

function getCurrentTagFromMenu() {
    // Try to guess tag based on active menu item
    var tag = "";
    var menuIndex = $('.ctree-current.active').parents('li').index();
    var headerText = $('.ctree-current.active').parents('.ctree-content').prev('.ctree-header').text();

    if(menuIndex >= 0 && headerText) {
        var matching = headerToTag.filter(function (elem) {
            return elem.re.exec(headerText) != null;
        });
        if(matching.length) {
            tag = matching[0].prefix + (menuIndex + 1);
        }
    }
    return tag;
}

function getTagUrl(tag) {
    return baseTagUrl + tag + "/";
}

function getContainer() {
    var $link = $("#" + aiqusLinkId);
    var $container = $("#" + contentContainerId);
    if(!$container.size()) {
        $container = $('<div></div>').attr('id', contentContainerId).insertAfter($link);
    }
    return $container;
}

function loadContent(tagFunction) {
    var $container = getContainer();
    $container.empty();
    var tag = "";

    if(tagFunction != undefined){
        tag = tagFunction();
    } else {
        tag = getCurrentTagFromLink();
        tag = tag ? tag : getCurrentTagFromMenu();
    }

    if(tag) {
        var url = getTagUrl(tag);
        $.get(url, function (data) {
            data = rewriteLinks(data, baseAiqusUrl);
            var content = $(data).find(aiqusContentSelector).detach();
            $container.append(content);
        }, 'text');
    }
}

// Load content when aiqus tag link changes
$("#" + aiqusLinkId).on("DOMSubtreeModified", function(){ loadContent(getCurrentTagFromLink); });

// Load content on menu action (only if tag link is not available)
$(".quiztrigger, .quizimgtrigger").on("click", function(){
    loadContent(function() {
        return getCurrentTagFromLink() ? "" : getCurrentTagFromMenu();
    })
});

// On page load
loadContent();
