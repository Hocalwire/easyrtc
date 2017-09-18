"use strict";

var request = require("request"),
    cheerio = require("cheerio"),
    url = "https://www.google.com/search?q=",
    
    corpus = {},
    totalResults = 0,
    resultsDownloaded = 0;

var logger = require('src/libs/logger');
var wordList;
var finalList = {"error":true};
module.exports.setup = function(app) {
    app.get("/xhr/admin/scrapData", scrapData);
};

function scrapData(req, res, next) {
    var category = req.query.category || "PR+Agencies";
    var alphas = [1,2,3,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z];
    var urls = [];
    var rootUrl = "http://resources.afaqs.com/index.html?";
    var total = alphas.length;
    var fetched = 0;
    for(var i=0;i<total;i++){
        var url = rootUrl+"category="+category+"&alphas="+alphas[i];
        request(url, function (error, response, body) {
            var $ = cheerio.load(body),
                links = $(".agency.big_btmargin odd a");
            console.log("================================== linkes length:"+links.length);
                for(var j=0;j<links.length;j++){
                    urls.push($links[j].attr("href"));
                }
            console.log(urls);
        });
    }
    
}