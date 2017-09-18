"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var commonContentController = require("src/controller/helpers/commonContentController");
var Utils = require("src/libs/Utils");
var url = require("url");


var logger = require('src/libs/logger');
var dateFormat = require('dateformat');

function profileData(req,res,next){
  var options = {
            rdm : apiHelper.getURL(Constants.getUserData,req.partner)
        }; 
    options.rdm.setRDMProperty("1","sendSync",true);
    var promise = apiHelper.get(options, req, res);
    promise.then(function(rdm) {
            promise.data = {};
            for(var k in rdm.rdRows){
                promise.data  = rdm.rdRows[k];
            }
        
        },
        function(e) {
            logger.error('error caching page', e.message);
            next(e);
        })
        .catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        });   
    return promise;
}
function recommendedContent(req,res,next){
  var options = {
            rdm : apiHelper.getURL(Constants.getRecommendedContent,req.partner)
        }; 
    options.rdm.setRDMProperty("1","sendSync",true);
    options.rdm.setRDMProperty("1","count",(req.query.count || 6));
    var promise = apiHelper.get(options, req, res);
    promise.then(function(rdm) {

            var partner = req.partner;
            promise.data = [];
            for(var k in rdm.rdRows){
                var d = {};
                var id = rdm.rdRows[k].id;
                for(var j in rdm.rdRows[k]){
                    d[j] = rdm.rdRows[k][j];

                }
                d['title'] = d['heading'];
                d['mediaIds'] = d['mediaIds'] ? d['mediaIds'].split(",") : [];
                // if(d.mediaIds && partner){
                d['partner'] = partner;
                d["mediaType"] = d.mediaIds && d.mediaIds.length ? Utils.getMediaType(d.mediaIds[0])  : "image";
                d['mediaUrl'] = d["mediaType"]=="youtube" || d["mediaType"]=="external" || d["mediaType"]=="externalNoProtocol" ? Utils.getMediaUrl(d) : Utils.getMediaUrl(d,"",req.environment.rootUrl); //env.rootUrl+
                if(d.mediaType=="youtube"){
                    var mediaId = d.mediaIds[0];
                    mediaId = mediaId.trim().substring(3,mediaId.trim().length);
                    d["videoId"] = mediaId;
                    d["thumbUrl"] = "/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;"https://img.youtube.com/vi/"+mediaId+"/0.jpg"; //"http://hocalwire.com/admin/downloadYoutubeThumb?videoId="+mediaId;
                    d["thumbUrlShare"] = "/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;
                }   
                if(d.mediaType=="video"){ //video, access thumb url
                    var mediaId = data.mediaIds[0];
                    var id = mediaId.trim().substring(6,mediaId.trim().length);
                    d["videoId"] = id;
                    var d1 = {"mediaIds" : []};
                    d1.partner=req.partner;
                    d1.mediaIds.push("thumb_"+id);
                    d["thumbUrl"] = Utils.getMediaUrl(d1);
                    d["thumbId"] = "thumb_"+id;
                }

                d['showThumbForVideo']=true;
                promise.data.push(d);
            }
            
        },
        function(e) {
            logger.error('error caching page', e.message);
            next(e);
        })
        .catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        });   
    return promise;
}
function getReporterContentParams(req,res,next){
  var options = {
            rdm : apiHelper.getURL(Constants.getContentParamData,req.partner)
        }; 
    console.log("calling content params===============:"+req.environment.content_param_name);
    options.rdm.setRDMProperty("1","sendSync",true);
    options.rdm.setRDMProperty("1","content_type_name",req.environment.content_param_name || req.environment.partnerData.register_us_content_name || "reporter");
    var promise = apiHelper.get(options, req, res);
    promise.then(function(rdm) {

            console.log("=========================================>>>>>>>>");
            console.log(rdm);
            var partner = req.partner;
            promise.data = [];
            console.log(rdm.toXML());
            var data = [];

            for(var k in rdm.rdRows){
                var o = rdm.rdRows[k];
                console.log(o);
                var newsId = rdm.rdRows[k].id;
                var option = rdm.rdRows[k].option_count;
                console.log(k);
                if(option && option!="null"){
                    o.options = [];
                    option = parseInt(option);
                    for(var i=0;i<option;i++){
                        o.options.push({"display_name":rdm.rdRows[k]["option_name_"+i],"name":rdm.rdRows[k]["option_tag_"+i]});
                    }
                }

                promise.data.push(o);
            }
            promise.data=promise.data.sort(function(a,b){
                var a1 = a.sorting_order ? a.sorting_order :1;
                var b1 = b.sorting_order ? b.sorting_order : 1;
                if(a1!=b1){
                    return a1-b1;
                } else {
                    return a.name > b.name ? 1 : -1;
                }
            });
            promise.data.content_type_name = req.environment.content_param_name || req.environment.partnerData.register_us_content_name || "reporter";
            console.log(promise.data);
            return data;
            
        },
        function(e) {
            logger.error('error caching page', e.message);
            next(e);
        })
        .catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        });   
    return promise;
}
function loginData(req,res,next){
  var isLoggedIn = false;
  if(req.environment.isLoggedInUser){
    res.redirect(302, "/");
    return  "redirect";
    
  } else {
    return null;
  }
}
function registerData(req,res,next){
    var isLoggedIn = false;
    if(req.environment.isLoggedInUser){
        res.redirect(302, "/");
        return  "redirect";

    } else {
        return null;
    } 
}
function verifyData(req,res,next){
    var isLoggedIn = false;
    if(req.environment.isLoggedInUser){
        res.redirect(302, "/");
        return  "redirect";

    } else {
        return null;
    } 
}
function forgotPasswordData(req,res,next){
    var isLoggedIn = false;
    if(req.environment.isLoggedInUser){
        res.redirect(302, "/");
        return  "redirect";

    } else {
        return null;
    } 
}
function parseBuzzData(req,res,rdm,request_params){
    
    console.log("parsing buzz data");
    var d = [];
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var data =  commonContentController.getData(req,rdm,id,true);
        var date = data["date_content"] || data["date_buzz"];
        data['date'] = date;
        data['date_published'] = date ? Utils.getPublishedDate(date) : "";
        data['date_string'] = date;
        
        if(data.linked_news_count){
            data.news = [];
            for(var i=0;i<data.linked_news_count;i++){
                var o = {};
                o['id'] = data['newsId_'+i];
                o['heading'] = data['news_heading_'+i];
                o['mediaIds'] = data['news_mediaIds_'+i];
                o['mediaIds'] = o['mediaIds']  ? o['mediaIds'].split(",") : [];
                o['title'] = o['heading'];
                o['time'] = data['news_time_'+i];
                o['newsUrl'] = data['news_url_'+i];
                data.news.push(o);
            }
        }
        d.push(data);
    }
    var sortFunction =  function(a,b){
            var d1 = new Date(a["date_buzz"]);
            var d2 = new Date(b["date_buzz"]);
            return d2-d1;
        };
    // d.total_buzz_count = rdm.getRDMAttribute("total_count");
    d.sort(sortFunction);
    return d;
};


module.exports.profileData = profileData;
module.exports.recommendedContent = recommendedContent;
module.exports.loginData = loginData;
module.exports.registerData = registerData;
module.exports.verifyData = verifyData;
module.exports.forgotPasswordData = forgotPasswordData;
module.exports.getReporterContentParams = getReporterContentParams;
module.exports.parseBuzzData=parseBuzzData;