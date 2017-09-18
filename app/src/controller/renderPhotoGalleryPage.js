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

function renderPhotoGalleryPage(req, res, next,props) {
        console.log("====================== Inside renderPhotoGalleryPage =========================");
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);

        var mainNewsCatId = props.id;
        
        console.log("================================== 0");
        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
        });
        
        var catIds = [];        
        var newsCount = [];

        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        //get parent cat
        // var parentCatId = getParentCatId(props.id,req.environment.partnerCatData);
        // setBreadcrumb(req,props.id);
        // req.environment.parentCatId = parentCatId;
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        console.log("================================== 1");
        var promises = [];
        promises.push(getPhotoGalleryData(req,res,mainNewsCatId)); 
        if(catIds){
            promises.push(commonController.getCategoryNews(req,res,catIds,newsCount));
        }
        
        Q.all(promises).then(function(result){
           console.log("================================== 2");
            var data = {};
            if(result.length >1){
                var allnews = commonController.getListingData(req,result[1]);
                var dataV = commonController.parseNewsByCateogires(allnews,syncNews);
            } else {
                dataV = {};
            }
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            
            console.log("================================== 3");
            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
          
            var mainListingData = parsePhotoGalleryData(req,result[0]);
            
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

            
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/gallery', {
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


function parsePhotoGalleryData(req,rdm){
    var data = [];
    var eventData = {};
    console.log('------------------------parsePhotoGalleryData ---'+rdm.toXML());
    for(var k in rdm.rdRows){
        var galleryId = rdm.rdRows[k].id;
        var eventId = rdm.rdRows[k].eventId;
        var gallery = eventData[eventId];
        if(!gallery) {
            gallery = [];
        }
        eventData[eventId] = gallery;
        gallery.date = rdm.rdRows[k].date;
        gallery.eventName = rdm.rdRows[k].eventName;
        gallery.location = rdm.rdRows[k].location;
        var d = getPhotoGalleryItem(k,rdm);
        gallery.push(d);
    }
    for(var key in eventData) {
        data.push(eventData[key]);
    }

    var sortFunction = function(a,b){
        var d1 = new Date(a.date);
        var d2 = new Date(b.date);
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
};

function getPhotoGalleryItem(id,rdm) {
    var data  = {};
    var row = rdm.rdRows[id];
    data.mediaIds = row.mediaId.split(",");
    data.caption = row.caption;
    data.title = row.caption;
    data.partner = rdm.getRDMAttribute('partner');
    data.imageUrl = Utils.getMediaUrl(data);
    return data;
}

function getPhotoGalleryData(req,res,catId,page){
    
    var options = {
                    rdm : apiHelper.getURL(Constants.getPhotoGalleryUrl,req.partner)
                };
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","includeGallery","true");
        var pageNo = page ? page : req.query.page?parseInt(req.query.page) : 1;
        
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="cats";
        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",newsCountInCatPage);   
        console.log("================================== 212");
        return apiHelper.get(options, req, res);
        
}


module.exports.renderPhotoGalleryPage = renderPhotoGalleryPage;
