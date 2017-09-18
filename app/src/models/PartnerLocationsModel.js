'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var partnerConfig = require('src/config/PartnerConfig');
var Utils = require('src/libs/Utils');
var PartnerLocationsModel = {};

var cacheExpireDuration = 24*60*60*1000;

PartnerLocationsModel.fetch = function(partner) {
    return fetchPartnersCats(partner);
};
PartnerLocationsModel.promises = {};
PartnerLocationsModel.data = {};
PartnerLocationsModel.lastFetchedTime = {};



function fetchPartnersCats(partner) {
    
    var currentTime = new Date().getTime();
    
    PartnerLocationsModel.lastFetchedTime[partner] = PartnerLocationsModel.lastFetchedTime[partner] || currentTime;

    // re-fetch in every 24 hours
    if ((currentTime - PartnerLocationsModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerLocationsModel.promises[partner]) {
        return PartnerLocationsModel.promises[partner];
    }

    logger.info('fetching partner cats');

    // change last fetch time to now
    PartnerLocationsModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerLocationsModel.promises[partner] = getPartnerCatsApi(partner);
        
        PartnerLocationsModel.promises[partner].then(
            function(response){
                var parentId = partnerConfig[partner].locationsParentId;
                PartnerLocationsModel.data[partner] = getPartnerCatsData(response,parentId);
                
                
            },
            function(err){
                PartnerLocationsModel.promises[partner] = null;
                PartnerLocationsModel.data[partner] = null;
            });

    
    return PartnerLocationsModel.promises[partner];
}
function getCatById(data,id){
    for(var i=0;i<data.length;i++){
        if(data[i].id==id){
            return data[i];
        }
    }
    return null;
}
function getPartnerCatsData(rdm,parentCategoryIdFromConfig){
    var data = [];
    
    var partner = rdm.getRDMAttribute("partner");
    
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];

        }
        // if(d.imageId && partner){
        //     d['partner'] = partner;
        //     d['mediaUrl'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
        // } else {
        //     d["mediaUrl"] = "/images/logo.png";
        // }
        // d.name = Utils.replaceHtmlEntities(d.name);
        d.childs = [];
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
    data["parentCategories"] = data.filter(function(item){
        if(item.parentId==parentCategoryIdFromConfig) {
            return true;
        }
        if(!item.parentId || item.parentId=="null" || item.parentId=="0"){
            return true;
        } else {
            return false;
        }
    });
    data["parentCategories"] = data["parentCategories"].sort(function(a,b){
            var a1 = a.sorting_order ? a.sorting_order :1;
            var b1 = b.sorting_order ? b.sorting_order : 1;
            if(a1!=b1){
                return parseInt(a1)-parseInt(b1);
            } else {
                return a.name > b.name ? 1 : -1;
            }
    });
    var catsWithparent = data.filter(function(item){
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
    for(var i=0;i<catsWithparent.length;i++){
        
        var parentCat = getCatById(data,catsWithparent[i].parentId);
        if(!parentCat){
            catsWithparent.splice(i,1);  
            i--;
            continue;
        } 
        
        parentCat.childs.push(catsWithparent[i]);
    }
    return data;
};
function getPartnerCatsApi(partner){
    if(!partner){
        return;
    }
    
    var options = {
        rdm: apiHelper.getURL(Constants.getLocationsUrl,partner)
    };
    var parentId = partnerConfig[partner].locationsParentId;
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","parentId",parentId);
    options.rdm.setRDMProperty("1","includeSubChild","true");
    
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};
PartnerLocationsModel.getPartnerLocationsData = function(req){
    var data = PartnerLocationsModel.data[req.environment.partner];
   
    return data;
};

module.exports = PartnerLocationsModel;

