"use strict";

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
var logger = require('src/libs/logger');
var extend = require("extend");

function renderEPaperPage(req, res, next,props) {
        console.log("====================== Inside renderEPaperPage =========================");
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);
        // console.log(aTemplates);
        var mainNewsCatId = props.id;
        
        
        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
        });
        
        var catIds = [];        
        var newsCount = [];

        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        promises.push(getEPaperData(req,res,mainNewsCatId)); 
        var needCustomdates = false;
        var rootUrl = req.environment.epaperRootCurrent;
        var index = -1;
        if(req.environment.partnerData.ePaperRootUrlMuiltiple) {
            for(var k =0 ; k < req.environment.partnerData.ePaperRootUrl.length ; k++) {
                if(req.environment.partnerData.ePaperRootUrl[k].indexOf(rootUrl) == 0) {
                    index = k;
                    break;
                }
            }
        } else {
            if(req.environment.partnerData.ePaperRootUrl && req.environment.partnerData.ePaperRootUrl.indexOf(rootUrl) == 0) {
                index = 0;
            }
        }
        if(index > -1) {
            if(req.environment.partnerData.ePaperCustomDates && req.environment.partnerData.ePaperCustomDates.length > index) {
                var need = req.environment.partnerData.ePaperCustomDates[index];
                if(need && need == 'true') {
                    needCustomdates = true;
                }
            } 
        }
        if(needCustomdates) {
            promises.push(getEPaperPublishDates(req,res));
        } 
        Q.all(promises).then(function(result){
            var data = {};
            var dataV = {};
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);

            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
          
            var mainListingData = parseEPaperData(req,result[0]);
            var customDates = [];
            if(needCustomdates && result.length >1) {
                customDates = parseEPaperPublishDates(req,result[1]);
                dataV['mainCatNews']["customDates"] = customDates;
            }
            console.log(mainListingData);
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]["first"] = [];
            dataV['mainCatNews']["data"]["second"] = [];
            dataV['mainCatNews']["data"]["third"] = [];
            for(var i=0;i<mainListingData.length;i++){
                if(i<4){
                   dataV['mainCatNews']["data"]["first"].push(mainListingData[i]); 
                } else  if(i < 8){
                    dataV['mainCatNews']["data"]["second"].push(mainListingData[i]); 
                } else if(i<12){
                    dataV['mainCatNews']["data"]["third"].push(mainListingData[i]); 
                }
            }

            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/epaper', {
                data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
        
        
}


function parseEPaperData(req,rdm){
    console.log("================ parseEPaperData = "+rdm.toXML());
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d = getEPaperItem(k,rdm);
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date);
        var d2 = new Date(b.date);
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
};
function parseEPaperPublishDates(req,rdm){
    var data = [];
    for(var k in rdm.rdRows){
        data.push(rdm.rdRows[k]);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_paper);
        var d2 = new Date(b.date_paper);
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
};


function getEPaperItem(id,rdm) {
    var data  = {};
    var row = rdm.rdRows[id];
    for(var k in row){
        data[k] = row[k];
    }
    data.mediaIds = row.thumbId.split(",");
    data.partner = rdm.getRDMAttribute('partner');
    data.thumbUrl = Utils.getMediaUrl(data);
    return data;
}

function getEPaperData(req,res,catId,page){
    console.log("================================== 211");
    var options = {
                    rdm : apiHelper.getURL(Constants.getEPaperUrl,req.partner)
                };
        options.rdm.setRDMProperty("1","sendSync","true");
        if(req.environment.ePaperDate){
            options.rdm.setRDMProperty("1","date",req.environment.ePaperDate);
        }  
        if(req.environment.ePaperLocation){
            options.rdm.setRDMProperty("1","location",req.environment.ePaperLocation);
        } 
        if(req.environment.epaperRootCurrent){
            options.rdm.setRDMProperty("1","epaperRoot",req.environment.epaperRootCurrent);
        }        
        
        return apiHelper.get(options, req, res);
        
}

function getEPaperPublishDates(req,res){
    console.log("================================== 211");
    var options = {
                    rdm : apiHelper.getURL(Constants.getEPaperPublishDatesUrl,req.partner)
                };
        options.rdm.setRDMProperty("1","sendSync","true");
        if(req.environment.epaperRootCurrent){
            options.rdm.setRDMProperty("1","epaperRoot",req.environment.epaperRootCurrent);
        }        
        
        return apiHelper.get(options, req, res);
        
}


module.exports.renderEPaperPage = renderEPaperPage;
