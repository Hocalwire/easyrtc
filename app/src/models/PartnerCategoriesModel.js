'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var Utils = require('src/libs/Utils');
var PartnerCategoriesModel = {};

var cacheExpireDuration = 24*60*60*1000;

PartnerCategoriesModel.fetch = function(partner) {
    return fetchPartnersCats(partner);
};
PartnerCategoriesModel.promises = {};
PartnerCategoriesModel.data = {};
PartnerCategoriesModel.lastFetchedTime = {};



function fetchPartnersCats(partner) {
    
    var currentTime = new Date().getTime();
    
    PartnerCategoriesModel.lastFetchedTime[partner] = PartnerCategoriesModel.lastFetchedTime[partner] || currentTime;

    // re-fetch in every 24 hours
    if ((currentTime - PartnerCategoriesModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerCategoriesModel.promises[partner]) {
        return PartnerCategoriesModel.promises[partner];
    }

    logger.info('fetching partner cats');

    // change last fetch time to now
    PartnerCategoriesModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerCategoriesModel.promises[partner] = getPartnerCatsApi(partner);
        
        PartnerCategoriesModel.promises[partner].then(
            function(response){
                PartnerCategoriesModel.data[partner] = getPartnerCatsData(response);
                
                
            },
            function(err){
                PartnerCategoriesModel.promises[partner] = null;
                PartnerCategoriesModel.data[partner] = null;
            });

    
    return PartnerCategoriesModel.promises[partner];
}
PartnerCategoriesModel.parseCategoriesForheader = function(req,catData){
    var data = req.environment.partnerData;
    var allcats = catData;
    if(!data || !allcats || allcats.length==0){
        catData["topHeaderCats"] = [];
        catData["bottomFooterCats"] = [];
        catData["parentCategories"] = [];
        return;
    }
    catData["parentCategories"] = catData.filter(function(item){
        if(!item.parentId || item.parentId=="null" || item.parentId=="0"){
            return true;
        } else {
            return false;
        }
    });
    catData["parentCategories"] = catData["parentCategories"].sort(function(a,b){
            var a1 = a.sorting_order ? a.sorting_order :1;
            var b1 = b.sorting_order ? b.sorting_order : 1;
            // console.log(a.sorting_order +" " + b.sorting_order +  " "+a1 + " "+ b1);
            if(a1=="null" || a1=="undefined") a1=1000;
            if(b1=="null" || b1=="undefined") b1=1000;
            if(a1!=b1){
                return a1-b1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
    });
    var topCategories = data["top_header_categories"]
    var topCategoriesMobile = data["top_header_categories_mobile"];
    var topSubCategories = data["top_header_sub_categories"];
    
    for(var i=0;i<allcats.length;i++){
        allcats[i]["childs"] = [];
    }
    var catsWithparent = allcats.filter(function(item){
        return (item.parentId && item.parentId!="null");
    });
    
    catsWithparent = catsWithparent.sort(function(a,b){
           var a1 = a.sorting_order ? a.sorting_order :1;
            var b1 = b.sorting_order ? b.sorting_order : 1;
            if(a1!=b1){
                return a1-b1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
    });
    // console.log(catsWithparent);
    for(var i=0;i<catsWithparent.length;i++){
        if(catsWithparent[i].parentId==catsWithparent[i].id){ //ignore if self is parent
            continue;
        }
        var parentCat = getCatById(allcats,catsWithparent[i].parentId);
        if(!parentCat){
            catsWithparent.splice(i,1);  
            i--;
            continue;
        } 
        
        parentCat.childs.push(catsWithparent[i]);
    }
    var catHasGroups=false;

    var a = [];
    a =  topCategories ? topCategories.split(",") : [];     
    
    var aa = topSubCategories ? topSubCategories.split(",") : [];
    var topcats  = [];
    for(var i=0;i<a.length;i++){
        topcats.push(getCatById(allcats,a[i]));
    }
    var topsubcats  = [];
    for(var i=0;i<aa.length;i++){
        topsubcats.push(getCatById(allcats,aa[i]));
    }
    var mobileCats=[];
    var mobileCategories = topCategoriesMobile ? topCategoriesMobile.split(",") : [];
    if(!mobileCategories.length){
        mobileCats = topcats;
    } else {
        for(var i=0;i<mobileCategories.length;i++){
            mobileCats.push(getCatById(allcats,mobileCategories[i]));
        }
    }
    var bottomCategories = data["bottom_footer_categories"];
    if(bottomCategories){
        var o={};
        var x = bottomCategories.split("$$");
        for(var i=0;i<x.length;i++){
            var y = x[i].split("#");
            if(y.length==1){
                o['link'] = [];
                var ar = y[0].split(",");
                for(var k=0;k<ar.length;k++){
                    ar.push(getCatById(allcats,a[k]));
                }        
            } else {
                o[y[0]] = [];
                var ar = y[1].split(",");
                for(var k=0;k<ar.length;k++){
                    var categoryObject = getCatById(allcats,ar[k]);
                    o[y[0]].push(categoryObject);
                }    
            }
        }
        
        catData["bottomFooterCats"] = o;
    } else {
        catData["bottomFooterCats"] = [];
    }
    
    catData["topHeaderCats"] = topcats || [];
    catData["topHeaderCatsMobile"] = mobileCats || [];
    catData["topHeaderSubCats"] = topsubcats || [];
    // console.log("==============\n\n\n\n\n\n\n\n");
    // console.log(catData["topHeaderSubCats"]);
    // console.log("==============\n\n\n\n\n\n\n\n");
    
    
}
function getCatById(data,id){
    for(var i=0;i<data.length;i++){
        if(data[i].id==id){
            return data[i];
        }
    }
    return null;
}
function getPartnerCatsData(rdm){
    var data = [];
    
    var partner = rdm.getRDMAttribute("partner");
    
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];

        }
        if(d.imageId && partner){
            d['partner'] = partner;
            d['mediaUrl'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
        } else {
            d["mediaUrl"] = "/images/logo.png";
        }
        d.name = Utils.replaceHtmlEntities(d.name);
        data.push(d);
    }
    
    data = data.sort(function(a,b){
            var a1 = a.sorting_order ? a.sorting_order :1;
            var b1 = b.sorting_order ? b.sorting_order : 1;
            if(a1!=b1){
                return a1-b1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
            // var res = (a.sorting_order) 
            // return (a.sorting_order - b.sorting_order);
    });
    
    return data;
};
function getPartnerCatsApi(partner){
    if(!partner){
        return;
    }
    
    var options = {
        rdm: apiHelper.getURL(Constants.getCategoriesUrl,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};
PartnerCategoriesModel.getPartnerCatsData = function(req){
    var data = PartnerCategoriesModel.data[req.environment.partner];
    if(!data.topHeaderCats){
        PartnerCategoriesModel.parseCategoriesForheader(req,data);
    }
    
    return data;
};
PartnerCategoriesModel.isCatUrl = function(req){
    var env =req.environment;
    var props = PartnerCategoriesModel.data[env.partner];
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
                req.categoryId = data[j].id;
            return true;
            } else {
                var result = matchUrl("/bulletin"+data[j].url,env.pathname);
                if(result && result!="false"){
                    if(result.indexOf("page")==0){ //a page url, set query param
                        if(!req.query){
                            req.query = {};
                        }
                        var page = result.split("#")[1];
                        req.query.page=page;
                    }
                    req.categoryId = data[j].id;
                    req.isBulletin = true;
                return true;
                }
            }
        }        
    }

    
    return false;
};
PartnerCategoriesModel.getCatUrlProps = function(req){
    var env =req.environment;
    var props = PartnerCategoriesModel.data[env.partner];
    var urlProps = {};
    var data = props;
    var prefix = req.isBulletin ? "/bulletin":"";
    for(var j=0;j<data.length;j++){
        if(prefix+data[j].url==env.pathname || (req.categoryId && data[j].id==req.categoryId)){
            urlProps = data[j];
            urlProps["theme"] = req.environment.partnerData.theme;
            if(prefix){
                urlProps['isBulletin']=true;
            }
            break;
        }
    }        

    return urlProps;
};

module.exports = PartnerCategoriesModel;

