/**
 * Created by JetBrains PhpStorm.
 * User: Keyston
 * Date: 7/13/11
 * Time: 1:44 AM
 */

var core = require('../core');
var request = require("request");
var methods = core.methods();
methods._parseRating = function($, data) {


    var doc = this.createDefaultRating();

    doc.count = this.int($("span.reviewCount .count").text());
    // site is on a out of 10 scale, we put it to a 5 point scale
    doc.score = $("span.big_stars img").attr("alt").replace(/[^0-9.]+/, "");
    doc.score = this.float(doc.score);

    return doc;
}
methods._parseComments = function($, data, page, callback) {
    var comments = [];
    var self = this;


    $("div.review").each(function() {
        var $el = $(this);
        var comment = self.createDefaultComment();

        comment.date = new Date($el.find(".ratingReviews h4").text());
        comment.score = $el.find("span.big_stars img").attr("alt");
        comment.score = self.float(comment.score.replace(/[^0-9]+/, ""));
        comment.title = self.filter($el.find("h2").text()).trim();
        comment.identity = $el.find("h3 a").text();
        comment.content = self.filter($el.find("p").text()).trim();
        if (self.check(comment)) {
            self.debug(comment);
            comments.push(comment);
        }

    });
    callback(comments);


}
methods._page = function(page) {
    if (page == 1)return this._currentURL;
    return this._currentURL + "/page/" + (page - 1);

}
methods._hasMore = function($, data, page) {
    // paging is done as so
    // 1 == /review/<id>
    // 2 = /review/<id>/page/1
    // 3 = /review/<id>/page/2
    return $('div.paging a[href^="/review/' + this.id + '/page/' + page + '"]').length;


}
methods._save = function() {
    this.debug("Total Comments", this._comments.length);
}
exports.job = core.job.extend({debug:false,site:"citysearch.com",methods:methods}, {
    input: ["http://sanantonio.citysearch.com/profile/10106034/san_antonio_tx/tom_benson_chevrolet.html"],
    run:function(url) {

        this.id = url.replace(/[^0-9]+/g, "");
        this.host = require("url").parse(url).host;

        url = "http://" + this.host + "/review/" + this.id;

        core.job.run.call(this, url);
    }
});
