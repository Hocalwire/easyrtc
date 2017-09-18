"use strict";
var http = require('https');
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var Q = require("q");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var newsCountInPage = 20;
var newsCountInCatPage = 12;
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var partnerConfig = require("src/config/PartnerConfig");
var logger = require('src/libs/logger');
var extend = require("extend");
var commonContentController = require("src/controller/helpers/commonContentController");
var OAuth = require('oauth');
// https://api.twitter.com/1.1/trends/23424848.json
function searchTwitter(req, res, next) {

    var p = new Promise(function(resolve,reject){
        for(var k in req.body){
            req.query[k] = req.body[k];    
        }
        var app_key = req.body.tw_app_key || "4643457792-G9EpTjdw9wX6Xq8UGh3H5cugJg0Tevtd13qqn1O";
        var app_secret = req.body.tw_app_secret || "5fsZbwIQXWukOvvJJcJVphLawU5Z5xLIcbUsAtwCHia6d";
        var tokens = req.body.tw_access_token || 'pIiio7jLpdN9v4uc3Rj5G2FLa';
        var tokensSecret = req.body.tw_access_token_verifier || 'WzNcLFbWu06NA35BXfDiWxBG7yooK7zsMO9WtyG6Die48tYJTX';
        console.log(app_key);
        console.log(app_secret);
        console.log(tokens);
        console.log(tokensSecret);

        var search = req.query && req.query.search ? req.query.search : "";

        var twitterData = [];
        var t = new Date().getTime();
        console.log(t);
        var access = tokens;
        var secret  = tokensSecret;
        var oauth = new OAuth.OAuth(
          'https://api.twitter.com/oauth/request_token',
          'https://api.twitter.com/oauth/access_token',
          app_key,
          app_secret,
          '1.0A',
          null,
          'HMAC-SHA1'
        );
        oauth.get(
          'https://api.twitter.com/1.1/search/tweets.json?q='+search,
          access, //test user token
          secret, //test user secret            
          function (e, data, response){
            
          if (e) console.error(e);  
            try{
              if(data && !e){
                resolve(data)
              } else {
                reject([]);  
              }
            } catch(e){
              reject(e);
            }     
            
            
          });    
    });
    
    return p;
}
function getTwitterHTMLCode(req, res, next) {
    var p = new Promise(function(resolve,reject){
        for(var k in req.body){
            req.query[k] = req.body[k];    
        }
        var url = req.query.url;
        var finalUrl = "https://publish.twitter.com/oembed?url="+url+"&omit_script=true";
        http.get(finalUrl, function(response) {
            var body = '';

            response.on('data', function(chunk){
                console.log(chunk);
                body += chunk;
            });

            response.on('end', function(){
                console.log(body);
                try {
                    resolve(body);
                }catch(e){
                    reject("");
                }
            });
        }).on('error', function(e) {
          console.log("Got error: " + e.message);
          reject(e);
        });    
    });
    
    return p;
}

function getTwitterTagSearch(req,res,params){

}
function getTwitterUserSearch(req,res,params){
    
}
function getTwitterTweetSearch(req,res,params){

}
function getInternalSearch(req,res,params){ //domain urls 

}
function getExternalSearch(req,res,params){ //using google

}
function getInternalUrlType(req,res,next){
    
}
function getAllSearchData(req,res,next){
    for(var k in req.body){
        req.query[k] = req.body[k];    
    }
    var supportedSearchTypes = req.environment.partnerData.supported_search_types || "news";
    var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
    var buzzPromise = "";
    var newsPromise="";
    var search = req.query && req.query.search ? req.query.search : "";
    var promisses = [];
    var contentPropsOnIndex = [];
    var searchTypes = supportedSearchTypes.split(",");
    
    if(searchTypes.indexOf("news")>-1){
        newsPromise = getNewsSearch(req,res,next);
        promisses.push(newsPromise);
        contentPropsOnIndex.push({"type":"news","display":"News Items"})
    }
    if(searchTypes.indexOf("buzz")>-1){
        buzzPromise = getBuzzSearch(req,res,next);
        promisses.push(buzzPromise);
        console.log("buzz promise data:"+buzzPromise);
    }
    if(searchTypes.indexOf("content")>-1){
        var p = getContentSearch(req,res,next,contentPropsOnIndex);
        for(var i=0;i<p.length;i++){
            promisses.push(p[i]);
        }
    }
    var promise = Q.all(promisses);
    promise.then(function(result){
        var dataV = {};
        if(searchTypes.indexOf("news")>-1){
            dataV["news"] = {};
            dataV["news"]["data"] = commonController.getListingData(req,result[0]); 
            dataV["news"]["templateData"] = {"type":"search","search":search,"name":"news","heading":"News Items"};
        }
        if(searchTypes.indexOf("buzz")>-1){
            dataV["buzz"] = {};
            dataV["buzz"]["data"] = buzzPromise.data; 
            dataV["buzz"]["templateData"] = {"type":"search","search":search,"name":"buzz","heading":"Buzz Items"};
        }
        if(searchTypes.indexOf("content")>-1){
            var contentResultStartIndex;
            if(newsPromise){
                if(buzzPromise){
                    contentResultStartIndex=2
                } else {
                    contentResultStartIndex=1;
                }
            } else {
                if(buzzPromise){
                    contentResultStartIndex=1
                } else {
                    contentResultStartIndex=0;
                }
            }
            for(var i=contentResultStartIndex;i<result.length;i++){
                var props = contentPropsOnIndex[i];
                dataV["content"] = [];
                var o = {};
                o['templateData'] = {"type":"search","search":search,"name":"buzz","props":props,"heading":"Content Items"};
                var rdm = result[i];
                o['data'] = getContentData(rdm);
                dataV["content"].push(o);
            }

        }
        promise.data=dataV;


    },
    function(e){
        next(e);
    }).catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    }); 
    return promise;
    
}


function getNewsSearch(req,res,next){
        var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
        var options = staticMixinController.getCategoryNews(req,res);
        var search = req.query && req.query.search ? req.query.search : "";
        options.rdm.setRDMProperty("1","searchString",search); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","searchType",type);
        var pageNo = req.query.page?parseInt(req.query.page) : 1;
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="search";
        if(!req.query.search_type){
            req.query.search_type = type;
        }
        req.environment.query = req.query;

        var startIndex = (pageNo -1)*5;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",5);   
       
        
        return apiHelper.get(options, req, res);
        
}
function getContentSearch(req,res,next,contentPropsOnIndex){
    var env = req.environment;
    var partnerConfigData = partnerConfig[req.partner];
    var types = partnerConfigData.contentTypes;
    var promises = [];
    var searchableTypes = env.partnerData.searchable_content_types || "";
    var a = env.partnerData.searchable_content_types || "";
    var search = req.query && req.query.search ? req.query.search : "";
    if(a){
        a = a.split(",");
    } else {
        a = [];
    }
    var d = req.environment.partnerContentData;
    var nameTypes = [];
    if(a.length && d){
        for(var k in d){
            var props = d[k]['props'];
            if(a.indexOf(props.id)>-1){
                nameTypes.push(props.name);
                contentPropsOnIndex.push(props);
            }
        }
     
    } else {
        if(d){
            for(var k in d){
                var props = d[k]['props'];
                contentPropsOnIndex.push(props);
            }
        }
        nameTypes = types;
    }
    for(var i=0;i<nameTypes.length;i++){
        var options = staticMixinController.getContentData(req,res,{"content_type_name":nameTypes[i],"count":5});
        var  a = {"name" : "search","type":"like","value":search};
        
        options.rdm.setRDMProperty("1","searchString",search); 
        options.rdm.setRDMProperty("1","searchType","all");
        options.rdm.setRDMProperty("1","filterString",JSON.stringify(a));
        promises.push(apiHelper.get(options,req,res));

    }
   
    return promises;
}
function getBuzzSearch(req,res,next){
    var params = {};
    var search = req.query && req.query.search ? req.query.search : "";
    var request_params = "api_type=buzz,sendSync=true,data_parse_function=parseBuzzData,searchType=all,searchString="+search+"count=5";
    params.content_type="GENERIC";
    params['request_params'] = encodeURIComponent(request_params);
    params['end_point'] = encodeURIComponent(Constants.getBuzzData);
    var p = staticMixinController.getGenericApiRequest(req,res,next);
    return p;
}
function getContentData(rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d ;
        if(rdm.rdRows[k].content_type){
            d = commonContentController.getData(req,rdm,newsId);
        } else {
            d = commonController.getData(req,rdm,newsId);
        }
        
        
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_content);
        var d2 = new Date(b.date_content);
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
}
function getInternalSearchData(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    var env =req.environment;
    var p = getAllSearchData(req,res,next);
    p.then(
        function(rdm){
            var d = p.data;
            var news = d['news'] && d['news']['data'] ? d['news']['data'] : [];
            var buzz = d['buzz'] && d['buzz']['data'] ? d['buzz']['data'] : [];
            var content = d['content'] && d['content']['data'] ? d['content']['data'] : [];
            
            var finalItems = [];
            for(var i=0;i<(news.length>5 ? 5 : news.length);i++){
                finalItems.push({"url":env.rootUrl+news[i].newsUrl,'type':'artile','title':news[i].title,"id":news[i].newsId,'image':news[i].mediaUrl});
            }
            for(var i=0;i<(buzz.length>5 ? 5 : buzz.length);i++){
                finalItems.push({"url":env.rootUrl+news[i].url,'type':'artile','title':buzz[i].title,"id":buzz[i].id,'image':buzz[i].mediaUrl});
            }
            for(var i=0;i<(content.length>5 ? 5 : content.length);i++){
                finalItems.push({"url":env.rootUrl+news[i].url,'type':'artile','title':content[i].title,"id":content[i].id,'image':content[i].mediaUrl});
            }
            
            res.send(finalItems);
        },function(){
            next();
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function getTweetSearchData(req,res,next){
    console.log(res._headers);
    res.setHeader('Access-Control-Allow-Origin', '*');
    var p = searchTwitter(req,res,next);
    p.then(
        function(data){
            var d;
            var items = [];
            items.type="tweet";
            try{
                d = JSON.parse(data);
                d = d['statuses'];
                
                for(var i=0;i<d.length;i++){
                    var tweetUrl = "https://twitter.com/"+d[i].user.screen_name+"/status/"+d[i].id_str;
                    
                    items.push({'title':d[i].text,"id":d[i].id,"type":"tweet","url":encodeURIComponent(tweetUrl)});
                }
            }catch(e){
                d=[];
            }
            console.log(res._headers);
            console.log(items);
            res.send(items);
        },function(){
            next();
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function getTweetEmbedCode(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("888888888888888888888888888888888888888888888888888");
    var p = getTwitterHTMLCode(req,res,next);
    p.then(
        function(data){
            var d;
            var items = [];
            console.log(data);
            try{
                d = JSON.parse(data);
                console.log(d);
            }catch(e){
                d=[];
            }
            res.send(d);
        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
module.exports.getInternalSearchData = getInternalSearchData;
module.exports.getTweetSearchData = getTweetSearchData;
module.exports.getTweetEmbedCode = getTweetEmbedCode;