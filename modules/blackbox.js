/**
 * Created by JetBrains PhpStorm.
 * User: Keyston
 * Date: 7/10/11
 * Time: 10:45 PM
 * To change this template use File | Settings | File Templates.
 */
this.title = "Eat everything tell nothing";
this.name = "blackbox";
this.version = "0.1.0";
this.endpoint = "http://localhost:8080";
var ENV = process.env.NODE_ENV || "dev";

var density = require("../modules/keyworddensity");
density = new density.KeywordDensity();

var Aggregator = require('./aggregator').Aggregator;

var CommentAggregator = new Aggregator("comment");
var RatingAggregator = new Aggregator("rating");


var mongoose = require('mongoose')


var CONFIG = require("../config/auto").config[ENV];
var schemas = require("../config/schemas").schemas;


for (var schema in schemas) {
    mongoose.model(schema, schemas[schema]);
}
var db = mongoose.connect(CONFIG.mongodb);

var Queue = db.model("Queue");
var q = new Queue();
q.url = "http://www.dealerrater.com/dealer/Tom-Williams-BMW-review-187/";
q.site = "dealrrater.com";
//q.save();

exports.reviews = function(options, callback) {

    CommentAggregator.reset();
    RatingAggregator.reset();
    var commentDate,date,path;

    var metrics = db.collection("metrics");
    var locationId = options.location_id;

    if (options.rating) {

        RatingAggregator.process(locationId, options.rating);

        RatingAggregator.commitSet(metrics);


    }

    if (options.comments && options.comments.length) {


        var updates = {};
        for (var i in options.comments) {
            var comment = new CommentClass(options.comments[i]);
            var keywords = density.getDensity(comment.content, 2);


            CommentAggregator.process(comment.loc, comment);


        }
        CommentAggregator.commitInc(metrics);
    }

    callback("ok");

}
exports.reviews.description = "Yummy comments, all for me";

exports.social = function(options, callback) {

}

exports.social.description = "nasty social...";

exports.queue = function(options, callback) {

    var QueueClass = db.model("Queue");
    var queue = new QueueClass();

    queue.collection.findAndModify({processed:false,site:options.site},
            [
                ["priority","ascending"]

            ],
            {"$set":{processed:true,started:new Date()}},

            function(err, doc) {
                callback({job:doc});
            }

    )


}