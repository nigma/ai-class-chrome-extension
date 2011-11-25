/* Copyright Filip Wasilewski <en@ig.ma>. All rights reserved.
 * Open Source software available under the MIT license terms.
 * More info at http://en.ig.ma/notebook/2011/chrome-extension-for-ai-class-forum
 */

var baseAiqusUrl = "http://www.aiqus.com/";
var aiqusContentUrl = "http://www.aiqus.com/";
var aiqusContentSelector = "#listA";
var contentContainerId = "aiqus_content";

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

function loadContent() {
    var $container = $("#" + contentContainerId);
    $container.html('<p id="loader">Loading questions...</p>');

    // Fetch content from aiqus
    $.get(aiqusContentUrl, function (data) {

        // Perform url rewrite and display it
        data = rewriteLinks(data, baseAiqusUrl);
        var content = $(data).find(aiqusContentSelector).detach();
        $container.empty();
        $container.append(content);

        // Attach callback to onclick anchor event
        $('a', $container).on('click', function(){
            var href = $(this).attr("href");
            // Open url in new chrome tab after current one
            chrome.tabs.getSelected(null, function(tab){
                chrome.tabs.create({ index: tab.index + 1, url: href });
            });
        });
    }, 'text');
}

$(document).ready(function(){
    loadContent();
});
