'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var Utils = require('src/libs/Utils');
var PartnerContentTemplateModel = {};
var cacheExpireDuration = 24*60*60*1000;

PartnerContentTemplateModel.fetch = function(partner) {
    return fetchPartnersProps(partner);
};
PartnerContentTemplateModel.promises = {};
PartnerContentTemplateModel.data = {};
PartnerContentTemplateModel.lastFetchedTime = {};



function fetchPartnersProps(partner) {
    var currentTime = new Date().getTime();

    PartnerContentTemplateModel.lastFetchedTime[partner] = PartnerContentTemplateModel.lastFetchedTime[partner] || currentTime;

    // re-fetch in every 24 hours
    if ((currentTime - PartnerContentTemplateModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerContentTemplateModel.promises[partner]) {
        return PartnerContentTemplateModel.promises[partner];
    }

    logger.info('fetching partner props'+partner);

    // change last fetch time to now
    PartnerContentTemplateModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerContentTemplateModel.promises[partner] = getPartnerTemplatesApi(partner);
        PartnerContentTemplateModel.promises[partner].then(
            function(response){
                PartnerContentTemplateModel.data[partner] = getPartneTemplatesData(response);
            },
            function(err){
                PartnerContentTemplateModel.promises[partner] = null;
                PartnerContentTemplateModel.data[partner] = null;
            });

    
    return PartnerContentTemplateModel.promises[partner];
}
function getPartneTemplatesData(rdm){
    
    var data = [];
    
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];
            if(j=="request_params"){
                d[j]=encodeURIComponent(d[j]); //encode request params
            }
        }
        d.heading = Utils.replaceHtmlEntities(d.heading);
        
        data.push(d);
    }
    return data;
};


function getPartnerTemplatesApi(partner){

    if(!partner){
        return;
    }
    var options = {
        rdm: apiHelper.getURL(Constants.getPartnerDataContent,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};
function addContentCategory(req,data){
 
    if(data.content_type=="CATEGORY_NEWS" && !data.currentCat){ //attach category opeb ject in data
        var items= [];
        if(req.environment.partnerCatData){
            items = req.environment.partnerCatData.filter(function(item){
                return item.id==data.categoryId;
            });
           
        }
        if(items.length>0){
            data.currentCat = items[0];
        }
    }
    return data;
};
PartnerContentTemplateModel.getAllPageTemplate = function(partner,page,theme){
    var data = PartnerContentTemplateModel.data[partner];
    
    var finalData = [];
    for(var i=0;i<data.length;i++){
        if(data[i].page==page && data[i].theme==theme){
            data[i] = addContentCategory(req,data[i]);
            finalData.push(data[i]);
        }
    }
    return finalData;
};
PartnerContentTemplateModel.getSyncPageTemplate = function(req,page,theme,fallbackPage){
    var partner=req.partner;
    var data = PartnerContentTemplateModel.data[partner];
    var finalData = [];
    if(!data) {
        return finalData;
    }
    for(var i=0;i<data.length;i++){
        if(!data[i].is_visible || data[i].is_visible=="false"){
            continue;
        }
        if((data[i].page==page || data[i].page==fallbackPage || data[i].page=="common") && data[i].theme==theme && data[i].is_sync=="true"){
            data[i] = addContentCategory(req,data[i]);
            var r = checkIfAdNeedsToLoad(req,page,data[i].element_id);
            if(r){
                finalData.push(r);
            } else {
                finalData.push(data[i]);    
            }
            // finalData.push(data[i]);
        }
    }
    finalData = filterDuplicateAndPriority(finalData);
    return finalData;
};
function checkIfAdNeedsToLoad(req,page,element){
    var c = req.environment.partnerData.ad_units_to_load;
    console.log(" page:"+page+" element:"+element);
    console.log(c);
    var cookie = "";//req.cookies["_NADI_AD_UNIT_LOADED_"];
    console.log(" cookie found============"+cookie);
    if(!cookie && c){
        if((c[page] && c[page][element]) || (c['common'] && c['common'][element])){
            var mName = (c['common'] && c['common'][element]) ? c['common'][element] : c[page][element];
            var similarNews = { id: "123434",
                mixinName: mName,
                theme: req.environment.partnerData.theme,
                categoryId: "",
                link: "",
                element_type: 'CONTENT',
                element_id: element,
                is_visible: 'true',
                content: '',
                default_content: '',
                is_sync: 'false',
                page: page,
                
                content_type: 'FILE',
                heading: 'Ad Unit',
                
                newsCount:  0
                
            };
            return similarNews;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

PartnerContentTemplateModel.getAsyncPageTemplate = function(req,page,theme,fallbackPage){
    var partner=req.partner;
    var data = PartnerContentTemplateModel.data[partner];
    var finalData = [];
    if(!data){
        return finalData;
    }
    for(var i=0;i<data.length;i++){
        if(!data[i].is_visible || data[i].is_visible=="false"){
            continue;
        }
        // console.log("matching page template type:  page type:"+data[i].page + " filter type:"+page +" is_sync"+data[i].is_sync +" theme :"+data[i].theme +" filter theme:"+theme);
        if((data[i].page==page || data[i].page==fallbackPage || data[i].page=="common") && data[i].theme==theme && data[i].is_sync=="false"){
            // console.log("matched");
            var r = checkIfAdNeedsToLoad(req,page,data[i].element_id);
            if(r){
                finalData.push(r);
            } else {
                finalData.push(data[i]);    
            }
            
        }
    }
    finalData = filterDuplicateAndPriority(finalData);
    return finalData;
};
PartnerContentTemplateModel.getAMPPageTemplate = function(req,theme,type){
    var partner=req.partner;
    var data = PartnerContentTemplateModel.data[partner];
    var finalData = [];
    if(!data){
        // console.log("no data so returning;")
        return finalData;
    }
    for(var i=0;i<data.length;i++){
        if(!data[i].is_visible || data[i].is_visible=="false"){
            continue;
        }
        // console.log(data[i].page + "theme "+data[i].theme + " paased"+theme);
        if((data[i].page=="amp_ad") && data[i].theme==theme){
            // console.log("found a match");
            var request_params = decodeURIComponent(data[i].request_params || "");
            var adType="adsense";
            // console.log(request_params);
            if(request_params){
                var arr = request_params.split(",");
                for(var j=0;j<arr.length;j++){
                    // console.log(arr[j]);
                    var tarr = arr[j].split("=");
                    // console.log(tarr);
                    if(tarr[0]=="ad_type"){
                        adType="iframe";
                        break;
                    }

                }    
            }
            data[i].adType=adType;
            finalData.push(data[i]);
            
        }
    }
    // console.log(finalData);
    finalData = filterDuplicateAndPriority(finalData);
    var d = {};
    for(var i=0;i<finalData.length;i++){
        d[finalData[i]['element_id']] = finalData[i];
    }
    return d;
};
function filterDuplicateAndPriority(data){
    var o = {};
    for(var i=0;i<data.length;i++){
        var elementId = data[i].element_id;
        if(!o[elementId]){
            o[elementId] = data[i];
        } else {
            if(data[i].page!="common"){
                o[elementId] = data[i];
            }
        }
    }
    var d = [];
    for(var k in o){
        d.push(o[k]);
    }
    return d;
}
PartnerContentTemplateModel.getPartnerTemplateContentData = function(req){
    return PartnerContentTemplateModel.data[req.environment.partner];
};

module.exports = PartnerContentTemplateModel;

