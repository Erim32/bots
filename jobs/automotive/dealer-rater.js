/**
 * Created by JetBrains PhpStorm.
 * User: Keyston
 * Date: 6/9/11
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var METRICS = {

    2:"customer_service",
    3:"quality_of_work",
    4:"friendless",
    5:"overall_experience",
    6:"price"

}
var RATING_REGX = /ratings([0-9]+)',\s([0-9]+),\s([0-9]+),\s([0-9]+),\s([0-9]+),\s([0-9]+)/;

var core = require(__dirname + '/../core');


var methods = core.methods();


methods._parseRating = function($, data) {


    var doc = this.createDefaultRating();


    var html = $(data);
    // site is on a out of 10 scale, we put it to a 5 point scale
    doc.score = parseInt($("span.average").text(), 10) / 2;

    doc.rating = $("span.average").text();
    doc.count = $("span.count").text();
    this.debug(doc);
    return doc;
}
/**
 * @inherit
 *
 */
methods._parseComments = function($, data, page, callback, scope) {
    var comments = [];
    var self = this;

    var html = $(data);

    html.find("div.hreview").each(function() {
        if (!self.more()) return;
        self.debug("fetching comments");
        var comment = self.createDefaultComment();

        comment.date = new Date($("span.value-title", this).attr("title"));
        comment.content = $("span.description", this).text();
        comment.identity = $(".reviewer", this).text();
        comment.title = comment.content.substr(0, 40) + "...";
        var score = $('.userReviewTopRight img', this).attr("src").replace(/[^0-9]+/g, '');
        // self.debug(matches);
        comment.score = self.float(score);
        if (self.check(comment)) {
            comments.push(comment);
        }


    });
    callback.call(scope, comments);

}
/**
 * @inherit
 *
 */
methods._page = function(page) {
    return page == 1 ? this._currentURL : this._currentURL + "page" + page + "/";
}
methods._hasMore = function($, data) {
    try {

        return $('h3 a', data).attr("href").match(new RegExp("\/page" + (this._currentPage + 1) + "\/")) ? true : false;

    } catch(e) {
        return false;
    }


}
methods.init('automotive');
exports.job = core.job.extend({debug:false,site:"dealerrater.com",methods:methods}, {
    /* input: ["http://www.dealerrater.com/dealer/Tom-Williams-BMW-review-187/"]*/

});




