'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var PartnerAuthorsModel = {};
var PartnerConfig = require("src/config/PartnerConfig");
var cacheExpireDuration = 24*60*60*1000;

PartnerAuthorsModel.fetch = function(partner) {
    return fetchPartnersAuthors(partner);
};
PartnerAuthorsModel.promises = {};
PartnerAuthorsModel.data = {};
PartnerAuthorsModel.publicdata = {};
PartnerAuthorsModel.lastFetchedTime = {};



function fetchPartnersAuthors(partner) {
    
    var currentTime = new Date().getTime();
    
    PartnerAuthorsModel.lastFetchedTime[partner] = PartnerAuthorsModel.lastFetchedTime[partner] || currentTime;

    // re-fetch in every 24 hours
    if ((currentTime - PartnerAuthorsModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerAuthorsModel.promises[partner]) {
        return PartnerAuthorsModel.promises[partner];
    }

    logger.info('fetching partner authors');
    PartnerAuthorsModel.publicdata = {};

    // change last fetch time to now
    PartnerAuthorsModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerAuthorsModel.promises[partner] = getPartnerAuthorsApi(partner);
        
        PartnerAuthorsModel.promises[partner].then(
            function(response){
                PartnerAuthorsModel.data[partner] = getPartnerAuthorsData(response,partner);
            },
            function(err){
                PartnerAuthorsModel.promises[partner] = null;
                PartnerAuthorsModel.data[partner] = null;
            });

    
    return PartnerAuthorsModel.promises[partner];
}


function getAuthorById(data,id){
    for(var i=0;i<data.length;i++){
        if(data[i].id==id){
            return data[i];
        }
    }
    return null;
}
function getPartnerAuthorsData(rdm,partner){
    var data = [];
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];

        }
        
        var hasPaidContent=false;
        var CDNUrl = "";
        for(var k in PartnerConfig){
            if(k==partner){
                hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                break;
            }
        }
       
        
        if(d['avatarId']) {
            if(!hasPaidContent && CDNUrl){
                d["imageUrl"] =  Constants.getImageServerURL(partner)+d['avatarId'];
            } else {
                d["imageUrl"] = Constants.getImageServerURL(partner)+"&type="+Constants.IMAGE_TYPE_PROFILE+"&uid="+d['avatarId'];
            }
        } else {
            d["imageUrl"] = "/images/authorplaceholder.jpg";
        }
         
        var index = d["url"] ? d.url.indexOf("/") : -1;
        if(index!=0){
            d["url"] = "/"+d["url"];    
        }
        if(d.total_news){
            d.total_news = parseInt(d.total_news);
        } else {
            d.total_news=0;
        }
        
        data.push(d);
    }
    
    data = data.sort(function(a,b){
        return (b.total_news - a.total_news);
    });
    
    return data;
};
function getPartnerAuthorsApi(partner){
    if(!partner){
        return;
    }
    
    var options = {
        rdm: apiHelper.getURL(Constants.getAuthorsUrl,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};
PartnerAuthorsModel.getPartnerAuthorsData = function(req){
    var data = PartnerAuthorsModel.data[req.environment.partner];
    if(!data){
        data = [];
    }
    return data;
};
PartnerAuthorsModel.getPartnerPublicAuthorsData = function(req){
    // console.log("getting public author data");
    var data = PartnerAuthorsModel.publicdata[req.environment.partner];
    // console.log("\n\n\n\n\n\n\n"+data);
    if(!data){
        var alldata = PartnerAuthorsModel.data[req.environment.partner];
        if(!alldata || !alldata.length){
            PartnerAuthorsModel.publicdata[req.environment.partner] = [];
            return PartnerAuthorsModel.publicdata[req.environment.partner];   
        }
        var userGroups = req.environment.partnerData.display_user_groups || "";
        // console.log("user groups"+userGroups);
        var authorData;
        if(!userGroups){
            authorData=alldata;
        } else {
            userGroups=userGroups.split(",");
            authorData = alldata.filter(function(item){ 
                if(item.groupId && userGroups.indexOf(item.groupId)>-1){
                    return true;
                }
                return false;

            });
        }
        // console.log("=====================================================");

        // console.log(authorData);
        // console.log("=====================================================");
        PartnerAuthorsModel.publicdata[req.environment.partner] = authorData;              
        data = authorData;
    }
    return data;
};
PartnerAuthorsModel.isAuthorUrl = function(req){
    var env =req.environment;
    var props = PartnerAuthorsModel.data[env.partner];
    var matchUrl = function(a,b){
        if(!a || !b || b.indexOf(a)!=0){

            // console.log("first fail"+"a:"+a+"b:"+b);
            return "false"; //pathname should start with catUrl
        }
        
        var replaced = b.replace(a,"");
        
        if(!replaced || replaced=="" || replaced=="/"){
            return "true";
        } else{
            if(replaced.indexOf("/")==0){ //either ends with "/" or a page url like /a/b/ or /a/b/2 or /a/b/2/
                var ar = replaced.split("/");
                if(ar.length>3){ //more than 2 / in remain part, wrong url
                    return "false";
                } else {
                    if(ar.length==2){

                        var nan = isNaN(ar[1]);
                        if(nan){
                            return "false";
                        } else {
                            return "page#"+ar[1];
                        }
                    } else if(ar.length==3){
                        var nan = isNaN(ar[1]);
                        if(nan){
                            return "false";
                        } else {
                            if(ar[2]){
                                return "false"
                            }
                            return "page#"+ar[1];
                        }
                    }
                }
            } else {
                return "false";
            }
        }
    }
    if(props){
        var data = props;
        for(var j=0;j<data.length;j++){
            var result = matchUrl(data[j].url,env.pathname);
            
            if(result && result!="false"){
                if(result.indexOf("page")==0){ //a page url, set query param
                    if(!req.query){
                        req.query = {};
                    }
                    var page = result.split("#")[1];
                    req.query.page=page;
                }
                req.authorId = data[j].id;
            return true;
            } 
        }        
    }

    
    return false;
};
PartnerAuthorsModel.getAuthorUrlProps = function(req){
    var env =req.environment;
    var props = PartnerAuthorsModel.data[env.partner];
    var urlProps = {};
    var data = props;

    for(var j=0;j<data.length;j++){
        if(data[j].url==env.pathname || (req.authorId && data[j].id==req.authorId)){
            urlProps = data[j];
            urlProps["theme"] = req.environment.partnerData.theme;
            urlProps["lang"] = req.lang;
            urlProps['title'] = props.name;
            // urlProps['description'] = props.description;
            break;
        }
    }        

    return urlProps;
};

module.exports = PartnerAuthorsModel;

