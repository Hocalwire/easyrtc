"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var Utils = require("src/libs/Utils");
var url = require("url");

var FB = require('fb');
var Linkedin = require('node-linkedin');

var Twit = require('twit');
var twitter_timeout = 60*1000;
var staticMixinController = require("src/controller/helpers/staticMixinController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticDataController = require("src/controller/helpers/staticDataController");
var commonController = require("src/controller/helpers/commonController");
var partnerConfig = require("src/config/PartnerConfig");
var logger = require('src/libs/logger');
var http = require('http');
var Q = require("q");   
var Promise = require('promise');
var processUpdateSchedule  = {};

var processBucket = {};
checkProcessDieStates();
var PROCESS_STATE_UPDATE_DURATION_MILLIS = 10*1000;
// var toke = "EAACEdEose0cBAIv3IPqZA9VFpTeSNM6xvDyoprxZCBXURaj6OFXpyHM7LS423vSxDXbSHwrHicI8BHg3VTbVQL5ZCc88HtJlxGtpSFZCHIyw2VQy4CLU1Hv9jVPhZCZBQZCNLAAUe8ZC6cMaDDSFrqCmEKyC0kZC1WLgcoy4WhgEt5wZDZD";
function post(req,res,next) {
    var body = req.body && (req.body.access_token || req.body.type)  ? req.body :  req.query;
    var postingId = body.postingId || req.query.postingId;
    // body = {"access_token":"EAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDgrpId1462760533944790allytechEAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDallytechEAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDgrpId1462760533944790"};
    // body.heading = "राष्ट्रपति प्रणव मुखर्जी 3 दिन के नेपाल दौरे के लिए आज होंगे रवाना";
    // body.url = "/news/national-news/news-55356";
    // body.group_ids = "210293479012516allytech221544337906964";
    // body.group_access_token="EAABnTbFV8T8BAI6iB8GYmbrknGKHwPl8P3HFuK74ZBCdp4OZC6jdkYAbJZA6TmE6CNI5fJN1vYrQqbIz1SNQDw1oxKzdTPjeu0tx7x5hJtZCNPhWFIVCBZBVCwKTCqJoX7baMU4iqlB6P1Av7mHzRcapBiUEQahYZD";
    console.log(req.query);
    var type = body.type;
    logger.error("=============================================================================")
    console.log("inside post to social : "+body.type);
    if(type=="twitter"){
        handleTwitterPosting(req,res,next);
        return;
    }
    if(type=="linkedin"){
        var app_key = body.app;
        var app_secret = body.secret;
        var linkedinApp = new Linkedin(app_key,app_secret);//app_key,app_secret
        linkedinApp.state=req.query.state;
        console.log(linkedinApp.state);
        linkedinApp.req =req;
        linkedinApp.res=res;
        // Linkedin = linkedinApp;
        handleLinkedInPosting(req,res,next,linkedinApp);
        return;   
    }
    var accessToken = body.access_token;
    
    if(!accessToken){
        res.send(500,{"code":"-1","message":"No Access Token Specified"});
    }
    var tokens = accessToken ? accessToken.split("allytech") : [];
    var groupIds=[];
    for(var i=0;i<tokens.length;i++){
        if(tokens[i].indexOf("grpId")>-1) { //this is group id, remove it from array
            var item = tokens.splice(i,1);
            groupIds.push(item[0]);
            i--;
        }
    }
    logger.error(groupIds);
    var status = {};
    logger.error("access token passed :"+accessToken);
    
    var heading = body.heading;

    var link = body.url;
    if(link.indexOf("http://")==0 || link.indexOf("https://")==0){
        // link = link+"&shared_by="+req.partner;
    } else {
       link = req.environment.rootUrl +  link;
    }
    
    var partner = req.partner;
    logger.error("post to social request params :");
    
    var count = tokens.length;

    
    var groupCount = groupIds.length;
    console.log(groupIds);
    var postedCount=0;
    var totalCount=count+groupCount;
    if(count>0){ //there are page to post on
        logger.error("access token length is more than one so inside if condition");
        var callbackurl = function(countDone){
            isPostingOnFB=false; setTimeout(function(){checkPendingQueueRequest()},10);

            logger.error(" count done for pages : "+countDone + " total count :"+count);    
            if(countDone==count-1){
                logger.error("All Posted to facebook pages");
                if(groupCount>0){ //now post to groups
                    var arr = groupIds[0].split("grpId");
                    postToFacebookGroup(partner,arr[0],heading,link,0,callbackurlGroup,arr[1],postingId);
                }
            } else {
                logger.error("calling post to face book page for index:"+(countDone+1)+" and token: "+tokens[countDone+1]);
                postToFacebook(partner,tokens[countDone+1],heading,link,countDone+1,callbackurl,postingId);
            }
        };
        var callbackurlGroup = function(countDone){
            isPostingOnFB=false; setTimeout(function(){checkPendingQueueRequest()},10);

            logger.error(" count done for group : "+countDone + " total count :"+groupCount);    
            postedCount=postedCount+1;
            if(countDone==groupCount-1){
                logger.error("All Posted to facebook groups");
                if(groupCount>0){ //now post to groups

                }
            } else {
                var arr = groupIds[countDone+1].split("grpId");
                logger.error("calling post to face book group for index:"+(countDone+1)+" and token: "+arr[0]);
                postToFacebookGroup(partner,arr[0],heading,link,countDone+1,callbackurlGroup,arr[1],postingId);
            }
        };
        logger.error("calling post to face book page for index 0 and token: "+tokens[0]);
        postToFacebook(partner,tokens[0],heading,link,0,callbackurl,postingId);
    } else if(groupCount>0){
        logger.error("only group  token inside else if condition");
        var callbackurlGroup = function(countDone){
            isPostingOnFB=false; setTimeout(function(){checkPendingQueueRequest()},10);

            postedCount=postedCount+1;
            logger.error(" count done for pages : "+countDone + " total count :"+groupCount);   
            if(countDone==groupCount-1){
                logger.error("All Posted to facebook groups");
                if(groupCount>0){ //now post to groups

                }
            } else {
                var arr = groupIds[countDone+1].split("grpId");
                logger.error("calling post to face book group for index:"+(countDone+1)+" and token: "+arr[1]);
                postToFacebookGroup(partner,arr[0],heading,link,countDone+1,callbackurlGroup,arr[1],postingId);
            }
        };
        var arr = groupIds[0].split("grpId");
        logger.error("calling post to face book group for index 0 and token: "+arr[1]);

        postToFacebookGroup(partner,arr[0],heading,link,0,callbackurlGroup,arr[1],postingId);
        //only group to post on
    }
    
    res.send(200,{"code":"0","message":"Initiated Post To Social Requests"});

};
function handleLinkedInPosting(req,res,next,linkedInObject){
    var body = req.body && (req.body.access_token || req.body.type)  ? req.body :  req.query;
    var postingId = body.postingId || req.query.postingId;
    // body = {"access_token":"EAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDgrpId1462760533944790allytechEAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDallytechEAAEk7Eq6XZBwBAA3bExjnIBchYhPcLJfWEc6ChmVdFUM0mwJHBbFRYk2YdWcj6qNw2PZCBYKxenK1rxZCT2MYdha5N0WpkuDqujZBmsqaHVqerqkxOJkpRjY101RNI2s0IkdgIdtCaGXDGNqicwDeZAhfWcsZCcssZDgrpId1462760533944790"};
    // body.heading = "राष्ट्रपति प्रणव मुखर्जी 3 दिन के नेपाल दौरे के लिए आज होंगे रवाना";
    // body.url = "/news/national-news/news-55356";
    // body.group_ids = "210293479012516allytech221544337906964";
    // body.group_access_token="EAABnTbFV8T8BAI6iB8GYmbrknGKHwPl8P3HFuK74ZBCdp4OZC6jdkYAbJZA6TmE6CNI5fJN1vYrQqbIz1SNQDw1oxKzdTPjeu0tx7x5hJtZCNPhWFIVCBZBVCwKTCqJoX7baMU4iqlB6P1Av7mHzRcapBiUEQahYZD";
    console.log(req.query);
    var type = body.type;
    var accessToken = body.access_token;
    var groupIdsFromBody = body.groupIds;
    if(!accessToken){
        res.send(500,{"code":"-1","message":"No Access Token Specified for LinkedIn"});
    }
    var tokens = accessToken ? accessToken.split("allytech") : [];
    var groupIdsA = groupIdsFromBody ? groupIdsFromBody.split("allytech") : [];
    // for(var i=0;i<tokens.length;i++){
    //     if(tokens[i].indexOf("grpId")>-1) { //this is group id, remove it from array
    //         var item = tokens.splice(i,1);
    //         groupIds.push(item[0]);
    //         i--;
    //     }
    // }
    var groupIds = [];
    for(var i=0;i<groupIdsA.length;i++){
        groupIds.push(tokens[i]+"grpId"+groupIdsA[i]);
    }
    logger.error(groupIds);
    var status = {};
    logger.error("access token passed :"+accessToken);
    
    var heading = body.heading;

    var link = body.url;
    if(link.indexOf("http://")==0 || link.indexOf("https://")==0){
        // link = link+"&shared_by="+req.partner;
    } else {
       link = req.environment.rootUrl +  link;
    }
    
    var partner = req.partner;
    logger.error("post to social request params :");
    
    var count = tokens.length;
    if(groupIds.length){
        count=0;
    }
    
    var groupCount = groupIds.length;
    console.log(groupIds);
    var postedCount=0;
    var totalCount=count+groupCount;
    if(count>0){ //there are page to post on
        logger.error("access token length is more than one so inside if condition");
        var callbackurl = function(countDone){
            logger.error(" count done for pages : "+countDone + " total count :"+count);    
            if(countDone==count-1){

                logger.error("All Posted to Linked pages");
                if(groupCount>0){ //now post to groups
                    var arr = groupIds[0].split("grpId");
                    postToLinkedInGroup(partner,arr[0],heading,link,0,callbackurlGroup,arr[1],postingId,linkedInObject);
                }
            } else {
                logger.error("calling post to linked in page for index:"+(countDone+1)+" and token: "+tokens[countDone+1]);
                postToLinkedIn(partner,tokens[countDone+1],heading,link,countDone+1,callbackurl,postingId,linkedInObject);
            }
        };
        var callbackurlGroup = function(countDone){
            logger.error(" count done for group : "+countDone + " total count :"+groupCount);    
            postedCount=postedCount+1;
            if(countDone==groupCount-1){
                logger.error("All Posted to linkedin groups");
                if(groupCount>0){ //now post to groups

                }
            } else {
                var arr = groupIds[countDone+1].split("grpId");
                logger.error("calling post to linkedin group for index:"+(countDone+1)+" and token: "+arr[0]);
                postToLinkedInGroup(partner,arr[0],heading,link,countDone+1,callbackurlGroup,arr[1],postingId,linkedInObject);
            }
        };
        logger.error("calling post to LinkedIn page for index 0 and token: "+tokens[0]);
        postToLinkedIn(partner,tokens[0],heading,link,0,callbackurl,postingId,linkedInObject);
    } else if(groupCount>0){
        logger.error("only group  token inside else if condition");
        var callbackurlGroup = function(countDone){
            postedCount=postedCount+1;
            logger.error(" count done for pages : "+countDone + " total count :"+groupCount);   
            if(countDone==groupCount-1){
                logger.error("All Posted to linked groups");
                if(groupCount>0){ //now post to groups

                }
            } else {
                var arr = groupIds[countDone+1].split("grpId");
                logger.error("calling post to linkedin group for index:"+(countDone+1)+" and token: "+arr[1]);
                postToLinkedInGroup(partner,arr[0],heading,link,countDone+1,callbackurlGroup,arr[1],postingId,linkedInObject);
            }
        };
        var arr = groupIds[0].split("grpId");
        logger.error("calling post to linked group for index 0 and token: "+arr[1]);

        postToLinkedInGroup(partner,arr[0],heading,link,0,callbackurlGroup,arr[1],postingId,linkedInObject);
        //only group to post on
    }
    
    res.send(200,{"code":"0","message":"Initiated Post To Social linkedin Requests"});
}
function postToLinkedIn(partner,token,heading,postlink,count,callbackurl,postingId,linkedInObject){
        
        linkedInObject = linkedInObject.init(token);
        linkedInObject.people.share({
            "comment": heading +" "+postlink,
            "visibility": { "code": "anyone" }
          }, function(err, data){
            console.log(err);
            console.log(data);
            if(err){
                logger.error("post to social page error for partner :"+partner +" url: "+postlink);
                logger.error(err);
                sendPostError(partner,(err ? err : false) ,token,postlink,false,postingId);
                callbackurl(count);
                return;
            }
            sendPostError(partner,false ,token,postlink,true,postingId);
            logger.error("post to social pages success linked in timeline for partner :"+partner +" url: "+postlink +" token : "+token);
            callbackurl(count);
            logger.error("page post callback called for count:"+count +" callback:"+callbackurl);
        });
   
       // console.log(a);
        // linkedInObject.authenticate({"token":token});
        console.log(linkedInObject);
        // setTimeout(function(){console.log(linkedInObject);},10000);
        // linkedInObject.people.me( (err, user) => {
        //     console.log (user, "All user data attached to this.token");
        //     let resp = {response: user, error: null};
        //     if (err){ resp = {response: null, error: err}; console.log(err)}
        //     else {
              
        //     }

        //     // fullfil(resp)
        //   });
        
        
}
function postToLinkedInGroup(partner,token,heading,postlink,count,callbackurl,groupId,postingId,linkedInObject){
        console.log(token);
        console.log(groupId);
        linkedInObject = linkedInObject.init(token);
        // console.log(linkedInObject);
        linkedInObject.companies.share(groupId,{
            "comment": heading +" "+postlink,
            "visibility": { "code": "anyone" }
          }, function(err, data){
            console.log(err);
            console.log(data);
            if(err){
                logger.error("post to social page error for partner :"+partner +" url: "+postlink);
                logger.error(err);
                sendPostError(partner,(err ? err : false) ,token,postlink,false,postingId);
                callbackurl(count);
                return;
            }
            sendPostError(partner,false ,token,postlink,true,postingId);
            logger.error("post to social pages success for partner :"+partner +" url: "+postlink +" token : "+token);
            callbackurl(count);
            logger.error("page post callback called for count:"+count +" callback:"+callbackurl);
        });

}

function handleTwitterPosting(req,res,next){
    // var url = "type=twitter&app=skcKAD5R6BbiuiM16TJBgQH8M&secret=NPWdIGB2jSYnwd89OeUGNfIQvTJqGPW6gPBAryDoCpAillldYK&oauth_token=_m9XzwAAAAAAx16yAAABWD5Ws_U&oauth_verifier=86PzaNXcr8evQwRN97qa3jIwinlcPz4F&heading=This is ashwani Mishra&url=http://www.specialcoveragenews.in/news/national-news/news-55862";
    var body = req.body && (req.body.access_token || req.body.type)  ? req.body :  req.query;
    var app_key = body.app;
    var app_secret = body.secret;
    var tokens = body.oauth_token;
    var tokensSecret = body.oauth_verifier;
    var heading = body.heading;
    var link = req.environment.rootUrl + body.url;
    var partner = req.partner;

    if(!tokens) {
        res.send(500,{"code":"-1","message":"No Access Token Specified For Twitter"});
    }
    if(heading && heading.length>140){
        heading = heading.substring(0,137)+"..";
    }
    var postingId = body.postingId || req.query.postingId;
    var tokens = tokens.split("allytech");
    var tokensSecret = tokensSecret.split("allytech");
    var count = tokens.length;
    if(!count) {
        res.send(500,{"code":"-1","message":"No Access Token Specified For Twitter"});
    }
    if(count>0){ //there are page to post on
        logger.error("access token length is more than one so inside if condition for twitter");
        var callbackurl = function(countDone){
            logger.error(" count done for twitter : "+countDone + " total count :"+count);    
            if(countDone==count-1){
                logger.error("All Posted to twitter");
            } else {
                var t = [];
                t.push(app_key);
                t.push(app_secret);
                t.push(tokens[countDone+1]);
                t.push(tokensSecret[countDone+1]);
                logger.error("calling post to face book page for index:"+(countDone+1)+" and token: "+tokens[countDone+1]);
                postToTwitter(partner,t,heading,link,countDone+1,callbackurl,postingId);
            }
        };
        var t = [];
        t.push(app_key);
        t.push(app_secret);
        t.push(tokens[0]);
        t.push(tokensSecret[0]);
        postToTwitter(partner,t,heading,link,0,callbackurl,postingId);
    }
    res.send(200,{"code":"0","message":"Initiated Post To Twitter Requests"});
}
function postToTwitter(partner,tokens,heading,postlink,count,callbackurl,postingId){
        var T = new Twit({
          consumer_key:   tokens[0],
          consumer_secret: tokens[1],
          access_token:    tokens[2],
          access_token_secret:  tokens[3],
          timeout_ms:          twitter_timeout,  // optional HTTP request timeout to apply to all requests.
        })
        T.post('statuses/update', { status: heading+" "+postlink }, function(err, data, response) {
          logger.error("got response from facebook post to  page api  for index:"+count+" and token: "+tokens[2]);
          if(!response || err) {
            logger.error("post to social page error for partner :"+partner +" url: "+postlink);
            logger.error(response?response.error:"no response received"); 
            sendPostError(partner,(err ? err : false) ,tokens[2],postlink,false,postingId);
            callbackurl(count);
            return;
          }
          sendPostError(partner,false ,tokens[2],postlink,true,postingId);
          logger.error("post to social twitter success for partner :"+partner +" url: "+postlink +" token : "+tokens[2]);
          callbackurl(count);
          logger.error("page post callback called for count:"+count +" callback:"+callbackurl);
        })
        logger.error("calling post to twitter page api  for index:"+count+" and token: "+tokens[2]);
        

}
function postToFacebook(partner,token,heading,postlink,count,callbackurl,postingId){
        isPostingOnFB=true;
        FB.setAccessToken(token);
        logger.error("calling post to facebook page api  for index:"+count+" and token: "+token);
        FB.api('me/feed', 'post', { message: heading, link: postlink}, function (response) {
            logger.error("got response from facebook post to  page api  for index:"+count+" and token: "+token);
          if(!response || response.error) {
            logger.error("post to social page error for partner :"+partner +" url: "+postlink);
            logger.error(response?response.error:"no response received");
            sendPostError(partner,(response ? response.error : false) ,token,postlink,false,postingId,"");
            callbackurl(count);
            return;
          }
          sendPostError(partner,false ,token,postlink,true,postingId,response);
          logger.error("post to social pages success for partner :"+partner +" url: "+postlink +" token : "+token);
          callbackurl(count);
          logger.error("page post callback called for count:"+count +" callback:"+callbackurl);
    });

}
function postToFacebookGroup(partner,token,heading,postlink,count,callbackurl,groupId,postingId){
        isPostingOnFB=true;
        FB.setAccessToken(token);
        logger.error("calling post to facebook group api  for index:"+count+" and groupId: "+groupId);
        FB.api(groupId+'/feed', 'post', { message: heading, link: postlink}, function (response) {
            logger.error("got response from facebook group posting for index:"+count+" and groupId: "+groupId);
          if(!response || response.error) {
            logger.error("post to social group error for partner :"+partner +" url: "+postlink);
            logger.error(response?response.error:"no response received");
            sendPostError(partner,(response ? response.error : false) ,token,postlink,false,postingId,"");
            callbackurl(count);
            return;
          } else {

          }
          logger.error("post to social group success for partner :"+partner +" url: "+postlink +" token : "+token);
          sendPostError(partner,false ,token,postlink,true,postingId,response);
          callbackurl(count);
          logger.error("page group callback called for count:"+count +" callback:"+callbackurl);
    });

}
function sendPostError(partner,error,token,url,isSuccess,postingId,postId){
    logger.error("sending post error :"+error +" url:"+url);
    var options = {
            rdm : apiHelper.getURL(Constants.postSocialResult,partner)
    };
    options.rdm.setRDMProperty("1","access_token",token);
    options.rdm.setRDMProperty("1","url",url);
    if(postingId){
        options.rdm.setRDMProperty("1","postingId",postingId);
    } else {
        options.rdm.setRDMProperty("1","postingId","NONE");
    }
    if(postId){
        options.rdm.setRDMProperty("1","postId",postId);   
    }
    if(isSuccess){
        options.rdm.setRDMProperty("1","statusCode","0");    
    } else {
        options.rdm.setRDMProperty("1","statusCode","-1");    
    }
    
    if(error){
        options.rdm.setRDMProperty("1","errorstatus","known");
        for(var k in error){
            options.rdm.setRDMProperty("1",k,error[k]);
        }
    } else {
        if(isSuccess){
            options.rdm.setRDMProperty("1","errorstatus","success");
        } else {
            options.rdm.setRDMProperty("1","errorstatus","unknown");    
        }
        
    }
    console.log(options.rdm.toXML());
    apiHelper.get(options)
        .then(function(response) {
            logger.error("post to social error logged :"+partner +" url: "+url +" token : "+token);
        },
        function(e) {
          logger.error("post to social error not logged :"+partner +" url: "+url +" token : "+token);
        })
        .catch(function(e) {
          logger.error("post to social error not logged in exception:"+partner +" url: "+url +" token : "+token);
        });    
}

function scrapeUrl(req,res,next) {
    return;
    var lines = [];
    var token = "EAAVqt0WA5oQBALOZBZB5ZBdMfBnYlYrjwYuF7av1DQFy8Tt2147p9RVO1pm1ZBfowsWO8WkRZC2VF9nBK4EtIGMrvofYCPpfFLrQS1JnGFLGqzKH1WUHJZBu34xMH9zyvkZCWuWMXKxTzfPwqJcZAvWWvqAZBVuIWItwZD";
    FB.setAccessToken(token);

    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader('tahlkanews_urls.txt');

    lr.on('error', function (err) {
        // 'err' contains error object
    });

    lr.on('line', function (line) {
        lines.push("http://tahlkanews.com"+line);
        // console.log(line);
        
    });

    lr.on('end', function () {
        var total = lines.length;
        // console.log("total count is 88888888888888888"+total);
        if(total>0){ //there are page to post on
            var callbackurl = function(countDone){
                
                if(countDone==total-1){
                    logger.error("All scraped");
                    
                } else {
                    scrape(lines[countDone+1],callbackurl,countDone+1,total);
                }
            };
            scrape(lines[0],callbackurl,0,total);
        }
    }); 
   
    
}



function checkProcessDieStates(){
    var now = new Date().getTime();
    console.log("checking for process die evennt");
    for(var k in processBucket){
        var partner  = k;
        var data = processBucket[partner];
        for(var x in data){
            var item = data[x];
            var state=item.state;
            var p = item.processObject;
            var streamId = item.streamId;
            var lastUpdate = item.lastUpdate || 0;
            var delta = now.lastUpdate;
            if(streamId && delta > (2*PROCESS_STATE_UPDATE_DURATION_MILLIS) && state!="FINISHED" && state!="FALIED"){
               logger.error("FOUND A DEAD PROCESS"+processObject.pid+" streamid:"+streamId);
                try {
                    setProcessState(streamId,p,state,partner);
                } catch(e){

                }
            }
        }
    }
    setTimeout(checkProcessDieStates,2*PROCESS_STATE_UPDATE_DURATION_MILLIS);
}
function scrapFacebookUrlBeforePosting(url,callback){
    FB.api("/?id="+url+"&scrape=true", 'post', {}, function (response) {
      callback();
    });
}
function sendStateRDM(streamId,pid,state,partner,errorMessage,isIncoming){
    // logger.error("sending post error :"+error +" url:"+url);
     var options = {
            rdm : apiHelper.getURL((isIncoming ?Constants.updateLiveReporting : Constants.updateLiveStreamStatus),partner)
    };
    options.host = partnerConfig[partner]['domains'][0];
    console.log(partnerConfig[partner]['domains'][0]);
    console.log("==============================");
    options.rdm.setRDMProperty("1","streamId",streamId);
    options.rdm.setRDMProperty("1","processId",pid);
    options.rdm.setRDMProperty("1","state",state);
    if(errorMessage){
        options.rdm.setRDMProperty("1","error_message",errorMessage);
    }
    
    apiHelper.get(options)
    .then(function(response) {
        logger.error("process state updated" + streamId +"  process id"+pid);
    },
    function(e) {
      logger.error("process state updated - failed");
    })
    .catch(function(e) {
      logger.error("process state updated - failed");
    });    
}
function updateInputStreamState(streamId,processObject,state,partner){
    console.log("updatitng stream state"+state+ "stream id:"+streamId+" "+processObject.pid);
    if(!processObject || !processObject.pid || processObject.pid=="null"){
        console.log("process id is null -- returning");
    }
    if(!processBucket[partner]){
        processBucket[partner]={};
    }
    var oldState =  processBucket[partner][processObject.pid] ? processBucket[partner][processObject.pid].state : "";
    
    if(oldState && oldState=="FINISHED"){
        console.log("not updating and returning as process is finished"+oldState+" pid"+processObject.pid);
        return;
    }
    var now = new Date().getTime();
    var oldUpdate = processBucket[partner][processObject.pid] ? processBucket[partner][processObject.pid].lastUpdate : 0;
    var delta = now  - oldUpdate;
    console.log("old state-"+oldState+" new state:"+state+" delta:"+delta+" duration:"+PROCESS_STATE_UPDATE_DURATION_MILLIS);
    if(oldState==state){ //state not changing, check for schedule update
        if(delta<PROCESS_STATE_UPDATE_DURATION_MILLIS){
            return;
        }
    }
    processBucket[partner][processObject.pid] = {
        "state":state,
        'processObject' : processObject,
        streamId:streamId,
        lastUpdate : now
    };
    // console.log(processObject);
    sendStateRDM(streamId,processObject.pid,state,partner);

}
function setProcessState(streamId,processObject,state,partner,mesage){
    switch(state){
        case "FINISHED":
            console.log('kill');
            processObject.stdin.pause();
            processObject.kill();
            updateInputStreamState(streamId,processObject,"FINISHED",partner);   
            break;
        case "PAUSED" : 
            console.log('kill');
            processObject.stdin.pause();
            updateInputStreamState(streamId,processObject,"PAUSED",partner); 
            break;
        case "RESUME" : 
            console.log('kill');
            processObject.stdin.resume();
            updateInputStreamState(streamId,processObject,"PROCESSING",partner); 
            break;

    }
}
function setProcessStateFromCMS(req,res,next){
    if(!req.environment.partnerData.support_live){
        res.end(500,"<div>Partner Does Not Support Live Feature");
        return;
    }
    var data=req.query.processId ? req.query : req.body;
    var processId = req.query.processId;
    // console.log("=============================\n\n\n");
    // console.log(processBucket);
    // console.log("=============================\n\n\n");
    // console.log(processId);
    try {
        var processObject = processBucket[req.query.partner][processId].processObject;
        if(!processObject){
            res.send(500,"<div>Error</div>");
            return;
        }
        var streamId = data.streamId;
        setProcessState(streamId,processObject,data.state,req.query.partner);
        res.send(200,"<div>Success</div>");
    }catch(e){
        res.send(500,"<div>Error exception</div>");
    }
    
}

function runCommand(cmd,args,callback,streamId,partner){
    var spawn = require('child_process').spawn;
    var proc = spawn(cmd, args);
    console.log(proc);
    if(streamId){
        updateInputStreamState(streamId,proc,"PROCESSING",partner);    
    }
    
    proc.stdout.on('data', function(data) {
        console.log(data);
        if(streamId){
            updateInputStreamState(streamId,proc,"LIVE",partner);    
        }
        
    });

    proc.stderr.on('data', function(data) {
        if(streamId){
            updateInputStreamState(streamId,proc,"LIVE",partner);   
        }
        
    });

    proc.on('close', function() {
        console.log('finished');
        if(streamId){
            updateInputStreamState(streamId,proc,"FINISHED",partner);    
        }
        if(callback){
            callback();
        }
    });
    return proc;
}
function streamMP4ToRTMP(mp4path,rtmpurl,streamId,partner,callback){
    var spawn = require('child_process').spawn;
    logger.error(" ----"+mp4path+"---------");
    var cmd = 'ffmpeg';

    var args = [
        '-re', 
        '-i', mp4path,
        '-acodec','libmp3lame',
        '-s', '640x480', 
        '-ar','44100',
        '-b:a','128k',
        '-pix_fmt','yuv420p',
        '-profile:v','baseline',
        '-s','426x240',
        '-bufsize','6000k',
        '-vb','400k',
        '-maxrate','1500k', 
        '-deinterlace','-vcodec',
        'libx264','-preset', 
        'slow','-g', 
        '30','-r','30','-f', 'flv',rtmpurl
    ];
    var proc = spawn(cmd, args);
    if(streamId){
        updateInputStreamState(streamId,proc,"PROCESSING",partner);    
    }
    
    proc.stdout.on('data', function(data) {
        console.log(data);
        if(streamId){
            updateInputStreamState(streamId,proc,"LIVE",partner);    
        }
        
    });

    proc.stderr.on('data', function(data) {
        if(streamId){
            updateInputStreamState(streamId,proc,"LIVE",partner);  
        }
        
    });

    proc.on('close', function() {
        console.log('finished');
        if(streamId){
            updateInputStreamState(streamId,proc,"FINISHED",partner);    
        }
        if(callback){
            callback();
        }
    });
    return proc;
}

function dowloadYoutubeVideo(id,path){
 var promise  = new Promise(function(resolve,reject){
        var fs = require('fs');
        if (fs.existsSync(path)) { 
            console.log("path already existing so returning");
            resolve(path);
            return;
        } 
        if(id.length>20 || id.indexOf(":")>0 || id.indexOf("/")>0){
            reject("");
        }
        var index = path.lastIndexOf("/");
        var folderPath = path.substring(0,index);
        console.log("-----------------folder pathh:"+folderPath);
        var mkdirp = require('mkdirp');
        mkdirp(folderPath, function(err) { 
            if(err){
                logger.error("====================================Error in creating Folder path:"+folderPath);
                reject("");
                return;
            }

            var youtubedl = require('youtube-dl');
            
            var video = youtubedl('http://www.youtube.com/watch?v='+id,
              // Optional arguments passed to youtube-dl.
              ['--format=18'],
              // Additional options can be given for calling `child_process.execFile()`.
              { cwd: __dirname,maxBuffer: 100*1000*1024 });

            // Will be called when the download starts.
            video.on('info', function(info) {
              console.log('Download started');
              console.log('filename: ' + info.filename);
              console.log('size: ' + info.size);
            });
            video.on('end', function() {
              console.log('finished downloading!');
              resolve(path);
            });

            try {
                video.pipe(fs.createWriteStream(path));  
            }catch(e){
                console.log("error in pipping ownloaded output.");
            }
        });
    });
 return promise;
}
function dowloadVideos(ids){
    var promise  = new Promise(function(resolve,reject){
        var ytIds = ids;
        var p = [];
        var arr = ids.split(",");
        for(var i=0;i<arr.length;i++){
            p.push(dowloadYoutubeVideo(arr[i],"src/data/yt_videos/"+arr[i]+".mp4"));
        }
        var finalPromise = Q.all(p);
        finalPromise.then(function(paths){
            console.log("dowloaded all videos, paths are");
            console.log(paths);
            resolve(paths);
        },
        function(){
            reject();
        }).catch(function(e) {
        });
    }); 
    return promise; 
}
// function mergeVideos(p1,p2,o,callback,count){
//     console.log("merge video is called");
//     console.log("p1-"+p1+" p2 - "+p2+" o- "+o+" count - "+count);
//     var cmd = 'ffmpeg';
//     // var args = [
//     //     p1,
//     //     p2,
//     //     '|',
//     //     'perl','-ne', 
//     //     "'print \"file $_\"'",
//     //     '|', 
//     //     'ffmpeg',
//     //     -'f',
//     //     'concat', '-i', '-','-c','copy',
//     //     o
//     // ];
//     var args = [
//     "-i", p1, "-c", "copy", "-bsf:v", "h264_mp4toannexb", "-f", "mpegts", "intermediate1.ts","&&","ffmpeg", "-i", p2, "-c", "copy", "-bsf:v", "h264_mp4toannexb", "-f", "mpegts", "intermediate2.ts","&&","ffmpeg", "-i", '"concat:intermediate1.ts|intermediate2.ts"', "-c", "copy", "-bsf:a", "aac_adtstoasc", o
//     ];
//     var onEnd = function(){
//         console.log("onEnd is called");
//         callback(count,o);
//     }
    
//     var proc = runCommand(cmd,args,false,false,onEnd);
    
// }
// function mergeAllVideos(paths){
//     var totalCount = paths.length-1;
//     console.log("total files to merge"+totalCount);
//     var promise  = new Promise(function(resolve,reject){
//         var finalName;

//         var callback = function(count,name){
//             if(count==totalCount){
//                 console.log("downloaded and merge all videos");
//                 console.log("final output file name is:"+name);
//                 resolve(name);
//             } else {
//                 mergeVideos(paths[count],paths[count+1],"/opt/pwebsite/src/data/yt_videos/final_output_"+count+".mp4",callback,count+1);
//             }
//         }
//         mergeVideos(paths[0],paths[1],"final_output_0.mp4",callback,1);

//     });

//     return promise;
// }
function writeToFile(fileName,data,callback){
    var fs = require("fs");
    console.log("write to file called :"+fileName);
    var index = fileName.lastIndexOf("/");
    var folderPath = fileName.substring(0,index);
    var mkdirp = require('mkdirp');
    mkdirp(folderPath, function(err) { 
        
        if(err){
            logger.error("====================================Error in creating Folder path:"+folderPath);
            callback();  
            return;
        }
        // path exists unless there was an error    
        var stream = fs.createWriteStream(fileName);
        stream.once('open', function(fd) {
            console.log("writing data..........");
            stream.write(data);
            stream.end();
            logger.info("written to feed sitemap : "+fileName);
            callback();  
          
        });

    });
    
};

function dowloadAll(req,res){

    var data = {};
    var partner=req.query.partner;
    data.partner = partner;
    data.mediaIds = req.query.mediaIds.split(",");
    var c = partnerConfig[partner];
    if(!c){
        return;
    }
    var rootUrl = c.protocals[0]+"://"+c.domains[0];
    var allPromises = [];
    for(var i=0;i<data.mediaIds.length;i++){
        var mtype = Utils.getMediaType(data.mediaIds[i]);
        var dataurl  = Utils.getMediaUrl(data,false,rootUrl,i);

        if(mtype=="youtube"){
            var id = data.mediaIds[i].trim().substring(3,data.mediaIds[i].trim().length);
            allPromises.push(dowloadYoutubeVideo(id,"src/data/yt_videos/"+req.query.partner+"/"+id+".mp4"));
        } else {
            allPromises.push(downloadExternalVideo(dataurl));
        }
    }
    return Q.all(allPromises);
}
function downloadExternalVideo(url){
    var http = require('http');
    var fs = require('fs');
    var writePath = "src/data/yt_videos/"+new Date().getTime()+".mp4";
    var promise  = new Promise(function(resolve,reject){
    var index = writePath.lastIndexOf("/");
    var folderPath = writePath.substring(0,index);
    var mkdirp = require('mkdirp');
    mkdirp(folderPath, function(err) { 
        
        if(err){
            logger.error("====================================Error in creating Folder path:"+folderPath);
            reject("");
            return;
        }
        var file = fs.createWriteStream(writePath);
        var request = http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              file.close(function(){resolve(writePath);});  // close() is async, call cb after close completes.
            });
            }).on('error', function(err) { // Handle errors
                fs.unlink(writePath); // Delete the file async. (But we don't check the result)
                resolve(writePath);
            });
        });
       
    });
    return promise;
}
function makeVideoAvailable(req,res,next){
    var idata = req.query;
    var ids = idata.mediaIds;

}
function setupPollPage(req,res,data){
    var source = "src/data/poll-template";
    var destination = "src/public/polldata/"+data.partner+"/"+data.mediaId+"/";
    
    var folderPath = destination;
    var mkdirp = require('mkdirp');

    console.log("setting up poll page********************************************");
    var promise  = new Promise(function(resolve,reject){
        mkdirp(folderPath, function(err) { 
            if(err){
                reject();
                console.log("cnot not create folder");
                return;
            }
            var ncp = require('ncp').ncp;
         
            
            ncp(source, destination, function (err) {
                if (err) {
                   return console.error(err);
                }
                console.log('done!');
                var replace = require('replace-in-file');
                var options = {
                 
                      //Single file or glob 
                    files: destination+"index.html",
                     
                    from: [/@PAGE_BACKGROUND@/g, /@POLL_TITLE@/g,/@IMAGE_URL@/g,/@LOGO_URL@/g,/@REFRESH_TIME@/g,/@POLL_DESCRIPTION@/g],
                    to: [data.background || "#00cdb7",data.title,data.mediaUrl,data.logoUrl,10,data.description],
                     
                      //Specify if empty/invalid file paths are allowed (defaults to false) 
                      //If set to true these paths will fail silently and no error will be thrown. 
                      allowEmptyPaths: false,
                     
                      //Character encoding for reading/writing files (defaults to utf-8) 
                      encoding: 'utf8',
                };
                replace(options)
                  .then(function(changedFiles) {
                    console.log('Modified files:', changedFiles.join(', '));
                    resolve(destination+"index.html");
                  })
                  .catch(function(error){
                    console.error('Error occurred:', error);
                  });

            });    
        });
    });
    return promise;
       
}
var streamProcess;
var accessTokenGlobal;
var postIdGlobal;
function makeImagePollLiveOnFB(req,res,data){
    var promise  = new Promise(function(resolve,reject){

        var setupPromise = setupPollPage(req,res,data);
        setupPromise.then(function(webpageurl){
            var postId = data.id,
            accessToken=data.access_token;
            var postIdGlobal=postId;
                console.log("2222");
            var accessTokenGlobal=accessToken;
                console.log("3333");
            var debug=true;

            var url1 = '/polldata/'+data.partner+'/'+data.mediaId+'/index.html?accessToken=' + accessToken + '&postId=' + postId+"&streamId="+data.streamId+"&partner="+data.partner+"&mediaId="+data.mediaId;
            console.log(url1);
            resolve(url1);
        },function(e){
            reject("")
        })
        .catch(function(e){
            reject("");
        });
    });
    return promise;    

}
function exitHandler(options, err) {
  if (options.cleanup) {
    if (streamProcess) {
      streamProcess.kill('SIGINT');
    }
    if (accessTokenGlobal && postId) {
      fb.endLiveVideo({ accessTokenGlobal:accessTokenGlobal, postId:postId });
      // fb.deleteLiveVideo({ accessToken, postId });
    }
  }
  if (err) console.error(err.stack);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

function updateFacebookPostDescription(token,id,description){
    console.log("updating facebook post description"+id);
    FB.setAccessToken(token);
    FB.api(id, 'post',{message: "this is message for post", link: "http://hocalwire.com"}, function (response) {
        console.log("updated facebook");
        console.log(response);
        console.log("updated facebook");
    });
}
var requestBucket = [];
var isPostingOnFB=false; 


var rtmpBucket = {};
function addToQueue(partner,accessToken,streamId,path,ptitle,pdescription){
    var o = {"partner":partner,"accessToken":accessToken,"streamId":streamId,"path":path,"ptitle":ptitle,"pdescription":pdescription};
    requestBucket.push(o);
}
function getRTMPFromPostId(id){
    return rtmpBucket[id];

}
function checkPendingQueueRequest(){
    if(requestBucket.length){
        var o = requestBucket.shift();
        postMP4ToFacebook(o.partner,o.accessToken,o.streamId,o.path,o.ptitle,o.pdescription);
    }
}

function postMP4ToFacebook(partner,accessToken,streamId,path,ptitle,pdescription){
    if(isPostingOnFB){
        addToQueue(partner,accessToken,streamId,path,ptitle,pdescription);
        return;
    }
    isPostingOnFB=true;
    FB.setAccessToken(accessToken);
    FB.api('me/?fields=id,name', 'get', function (response1) {
        console.log("got responose from facebook");
        console.log(response1);
        if(response1.id){
            FB.api(response1.id+'/live_videos', 'post', {"published":true,title:ptitle,description:decodeURIComponent(pdescription || "")}, function (response) {
                
                if(response.id){
                    var streamUrl = response.stream_url;
                    var postId = response.id;
                    streamMP4ToRTMP(path,streamUrl,streamId,partner);                                  
                } else {
                    sendStateRDM(streamId,"","FAILED",partner,response.error  && response.error.message ? response.error.message : "Unknow");
                }
                isPostingOnFB=false; 
                setTimeout(function(){checkPendingQueueRequest()},10);

            });
        } else {
            isPostingOnFB=false; 
            setTimeout(function(){checkPendingQueueRequest()},10);

            sendStateRDM(streamId,"","FAILED",partner,response1.error  && response1.error.message ? response1.error.message : "Unknow");
        }
    });
}
function postVideoToFacebook(req,res,next){
    if(!req.environment.partnerData.support_live){
        res.end(500,"FAILED");
        return;
    }
    
    var path  = req.query.path;
    if(path) {
        path=decodeURIComponent(path);
    }
    var token = req.query.access_token || req.query.token || "EAAVqt0WA5oQBALOZBZB5ZBdMfBnYlYrjwYuF7av1DQFy8Tt2147p9RVO1pm1ZBfowsWO8WkRZC2VF9nBK4EtIGMrvofYCPpfFLrQS1JnGFLGqzKH1WUHJZBu34xMH9zyvkZCWuWMXKxTzfPwqJcZAvWWvqAZBVuIWItwZD";
    // FB.setAccessToken(token);
    var streamId=req.query.streamId;
    if(!req.query.mediaIds){
        req.query.mediaIds="";
    }
    var isImage = req.query.pollImageUrl || (req.query.mediaIds && req.query.mediaIds.indexOf("is_")!=0 && req.query.mediaIds.indexOf("video_")!=0 && req.query.mediaIds.indexOf("yt_")!=0 && req.query.mediaIds.indexOf("http://")!=0 && req.query.mediaIds.indexOf("https://")!=0);
    if(isImage) {
        //its a poll request with Image
        var pollData ={};
        var pollImage = req.query.pollImageUrl;
        var partner=req.query.partner;
        pollData.partner = partner;
        pollData.title = req.query.title;
        pollData.description = req.query.description;
        var c = partnerConfig[partner];
        if(!c){
            return;
        }
        var rootUrl = c.protocals[0]+"://"+c.domains[0];
        pollData['logoUrl']=rootUrl+"/images/logo.png";

        if(!pollImage){
            pollData.mediaIds = req.query.mediaIds.split(",");
            pollData.mediaUrl  = Utils.getMediaUrl(pollData,false,rootUrl,0);
            pollImage = pollData.mediaUrl;
            pollData['mediaId'] = pollData.mediaIds[0];
        } else {
            pollData['mediaId'] = new Date().getTime();
            pollData.mediaUrl  = pollImage;
        }
        pollData['streamId'] = req.query.streamId;
        pollData['access_token']=token;
        isPostingOnFB=true;
        FB.setAccessToken(token);
        FB.api('me/?fields=id,name', 'get', function (response1) {
            console.log("got responose from facebook");
            console.log(response1);
            if(response1.id){
                FB.api(response1.id+'/live_videos', 'post', {"published":true,title:req.query.title,description:decodeURIComponent(req.query.description || "")}, function (response) {
                    
                    if(response.id){
                        pollData['id']=response.id;  
                        rtmpBucket[response.id] = response.stream_url;
                        var resultPromimse = makeImagePollLiveOnFB(req,res,pollData);
                        resultPromimse.then(function(urlfinalpoll){
                            res.send(200, urlfinalpoll);
                        },function(){
                            res.send(500,"FAILED");
                        });
                                               
                    } else {
                        sendStateRDM(streamId,"","FAILED",partner,response.error  && response.error.message ? response.error.message : "Unknow");
                    }
                    isPostingOnFB=false; setTimeout(function(){checkPendingQueueRequest()},10);

                });
            } else {
                isPostingOnFB=false; setTimeout(function(){checkPendingQueueRequest()},10);

                sendStateRDM(streamId,"","FAILED",partner,response1.error  && response1.error.message ? response1.error.message : "Unknow");
            }
        });
                            
    }
    else if(req.query.mediaIds && req.query.mediaIds.indexOf("is_")!=0 && req.query.mediaIds.indexOf("video_")!=0){
        var finalPromise = dowloadAll(req,res,streamId);
        finalPromise.then(function(paths){
            console.log("all videos are downloaded now...streaming to facebook")
            postMP4ToFacebook(req.query.partner,token,streamId,paths[0],req.query.title,req.query.description);                            
        },
        function(){
            sendStateRDM(streamId,"","FAILED",req.query.partner,"Unknow");
        });
    } else if(req.query.yt_ids){
        var finalPromise = dowloadVideos(req.query.yt_ids,streamId);
        finalPromise.then(function(paths){
            console.log("all videos are downloaded now...streaming to facebook")
            postMP4ToFacebook(req.query.partner,token,streamId,paths[0],req.query.title,req.query.description);                            
        },
        function(){
            sendStateRDM(streamId,"","FAILED",req.query.partner,"Unknow");
        });
      
    } else if(req.query.inputStream || req.query.mediaIds.indexOf("is_")==0 || req.query.mediaIds.indexOf("video_")==0){
        var mediaId;
        if(req.query.mediaIds){
            mediaId = req.query.mediaIds.split(",")[0];
            if(mediaId.indexOf("is_")==0){
                mediaId = mediaId.substring(3,mediaId.length);    
            } else if(mediaId.indexOf("video_")==0){
                var data = {};
                var partner=req.query.partner;
                data.partner = partner;
                data.mediaIds = [mediaId];
                var c = partnerConfig[partner];
                if(!c){
                    return;
                }
                var rootUrl = c.protocals[0]+"://"+c.domains[0];
              
                mediaId = Utils.getMediaUrl(data,false,rootUrl,0);
                console.log("final stream url----"+mediaId);

            }
            console.log("========="+mediaId+"==================");
            
        } else {
            mediaId = req.query.inputStream;
        }
        postMP4ToFacebook(req.query.partner,token,streamId,mediaId,req.query.title,req.query.description);                            
    } else {
        postMP4ToFacebook(req.query.partner,token,streamId,req.query.path,req.query.title,req.query.description);                            
    }
    if(!isImage){
        res.send(200,"SUCCESS");    
    }
    
}
function getImageFromUrl(uri){
   var fs = require('fs'),
    request = require('request');
    var filename = "src/data/video_images/"+Math.random()+".jpeg";   
    console.log("downloading image---"+uri);
    var promise  = new Promise(function(resolve,reject){
        var callback = function(){
            console.log("image is dowload"+filename);
            resolve(filename);
        
    }
	console.log(uri);
	uri = uri + "&width=500&height=300";
	console.log(uri);
        request.head(uri, function(err, res, body){
            console.log("piping response");
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
          });

        
    });
    return promise;
    
}
function getImageFromUrl1(url){
   
    console.log(url);
    var promise  = new Promise(function(resolve,reject){
        http.request(url, function(response) {                                        
          var data = new Stream();                                                    
          response.on('data', function(chunk) {                                       
            data.push(chunk);                                                         
          });                                                                         

          response.on('end', function() {    
            var fName = "src/data/video_images/"+Math.random()+".png";     
            var fs = require("fs");
            fs.writeFile(fName, data.read(), "binary", function(err) {
              console.log(err); // writes out file without error, but it's not a valid image
              resolve(fName);
            });                                    
                                     
          });                                                                         
        })
    });
    return promise;
    
}

/*function makeVideoFromCategory(req,res,next){
    var catId = req.query.catId,count=req.query.count || 10;
    var videoshow  = require("videoshow");
    var callback = function(){

    };
    getCategoryNews(req,res,catId,count,req.query.partner).then(function(result){
            var fileName = req.query.file;
            var data =  commonController.getListingData(req,result,catId);
            var videoshow = require('videoshow')
            var images = [];
            var fdata = [];
            var imagesPaths = [];
            for(var i=0;i<data.length;i++){
                var p = data[i].mediaUrl;
                console.log(req.environment.rootUrl);
                console.log(p.indexOf(req.environment.rootUrl));
                if(p.indexOf(req.environment.rootUrl)==0) {

                        p = p.replace(req.environment.rootUrl,"");
                }
            q.then(function(allpaths){
                 console.log("all images are  downloaed");
                for(var i=0;i<allpaths.length;i++){
                    images.push({
                        path: allpaths[i],
                        caption: data[i].title,
                        loop:5
                    });
                }
                    
                
                var secondsToShowEachImage = 1
                var finalVideoPath = '/whatever_path_works_for_you'

                // setup videoshow options
                var videoOptions = {
                  fps: 24,
                  transition: false,
                  videoBitrate: 1024 ,
                  videoCodec: 'libx264', 
                  size: '640x640',
                  outputOptions: ['-pix_fmt yuv420p'],
                  format: 'mp4' 
                }

               console.log("running video show command");
		withFpsInput(30)
		console.log(images);
                videoshow(images, videoOptions)
                .save(fileName)
                .on('start', function (command) { 
                  console.log('encoding ' + fileName + ' with command ' + command) 
                })
                .on('error', function (err, stdout, stderr) {
                    console.log("error ouucrred");
                    console.log(err);
                  return Promise.reject(new Error(err)) 
                })
                .on('end', function (output) {
                  // do stuff here when done
                })
                res.end();
            },function(){

            }).catch(function(e){

            });

            

        },function(e){
           
        }).catch(function(e) {
           
        }); 
            
}*/
function getCategoryNews(req,res,catId,count,partner){
    var options = staticMixinController.getCategoryNews(req,res,partner);
        options.rdm.setRDMProperty("1","category",catId); 

        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");
        if(count) {
            options.rdm.setRDMProperty("1","counts",count);   
        } else {
            options.rdm.setRDMProperty("1","counts",newsCountInPage);
        }
        
        return apiHelper.get(options, req, res);
        
}
var  linkedinAppTest;
function handleCallback(req,res,next){
   linkedinAppTest.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
        if ( err )
            return console.error(err);

        console.log(results);
        return res.redirect('/');
    });
// });
}
function handleLinkedIn(req,res,next){
    var scope = ['r_basicprofile', 'r_emailaddress', 'w_share'];
    linkedinAppTest = new Linkedin("8163khxs8j9mp3","U1fmm3bGKY8coHHd","http://janshaktilocal.com:5001/oauth/linkedin/callback");
    linkedinAppTest.auth.authorize(res, scope); // scope will be an array of scopes from linkedin
}

module.exports.handleCallback=handleCallback;
module.exports.handleLinkedIn=handleLinkedIn;
module.exports.scrapeUrl = scrapeUrl;
module.exports.post = post;
module.exports.postVideoToFacebook=postVideoToFacebook;
module.exports.setProcessStateFromCMS=setProcessStateFromCMS;
module.exports.streamMP4ToRTMP = streamMP4ToRTMP;
module.exports.sendStateRDM=sendStateRDM;
module.exports.postMP4ToFacebook=postMP4ToFacebook;
module.exports.getRTMPFromPostId=getRTMPFromPostId;
//module.exports.makeVideoFromCategory=makeVideoFromCategory;
