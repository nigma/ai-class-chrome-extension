/* Copyright Filip Wasilewski <en@ig.ma>. All rights reserved.
 * Open Source software available under the MIT license terms.
 * More info at http://en.ig.ma/notebook/2011/chrome-extension-for-ai-class-forum
 */

var tagRegex = /(?:unit|hw)\d+\-\d+/;
var aiqusLinkId = "aiqus_discussion_link";
var aiqusContentSelector = "#listA";
var baseAiqusUrl = "http://www.aiqus.com/";
var baseTagUrl = "http://www.aiqus.com/tags/";
var contentContainerId = "aiqus_content";

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function rewriteLinks(html, baseUrl){
    var from = [
        'href="/', "href='/", "href=/", 
        'link="/', "link='/", "link=/",
        'src="/', "src='/", "src=/",
        'url("/', "url('/", "url(/"
    ];
    $.each(from, function(i, pattern){
        var re = new RegExp(RegExp.escape(pattern), 'gi');
        var to = pattern.replace('/', baseUrl);
        html = html.replace(re, to);
    });
    return html;
}

function getCurrentTag(){
    var tag = "";
    var $link = $("#" + aiqusLinkId);
    if($link.size()){
        var match = tagRegex.exec($link.html());
        if(match != null){
            tag = match[0];
        }
    }
    return tag;
}

function getTagUrl(tag){
    return baseTagUrl + tag + "/";
}

function getContainer(){
    var $link = $("#" + aiqusLinkId);
    var $container = $("#" + contentContainerId);
    if(!$container.size()){
        $container = $('<div></div>').attr('id', contentContainerId).insertAfter($link);
    }
    return $container;
}

function loadContent(){
    var $container = getContainer();
    $container.empty();
    var tag = getCurrentTag();
    if (tag) {
        var url = getTagUrl(tag);
        $.get(url, function(data) {
            data = rewriteLinks(data, baseAiqusUrl);
            var content = $(data).find(aiqusContentSelector).detach();
            $container.append(content);
        }, 'text');
    }
}

$("#" + aiqusLinkId).on("DOMSubtreeModified", loadContent);
loadContent();
