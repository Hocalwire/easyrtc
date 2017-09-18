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
var partnerConfig = require("src/config/PartnerConfig");
var contentCatPage = require("src/controller/renderContentCatPage");

function renderCatPage(req, res, next,props) {
        var partner = req.partner;
        var config = partnerConfig[partner];
        var primaryContent = config.newsCategoryListingPrimaryContentType;
        if(primaryContent){
            commonController.setBreadcrumb(req,props.id);
            contentCatPage.renderCatPageFromOldNewsCategory(req,res,next,props);
            return;
        }

        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        setAsyncTenmplates(req,asyncTemplates);

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
        //get parent cat
        var parentCatId = commonController.getParentCatId(props.id,req.environment.partnerCatData);
        commonController.setBreadcrumb(req,props.id);
        req.environment.parentCatId = parentCatId;
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        promises.push(commonController.getMainCategoryNewsCats(req,res,mainNewsCatId,"",newsCountInCatPage)); 
        if(catIds){
            promises.push(commonController.getCategoryNews(req,res,catIds,newsCount));
        }
        
        Q.all(promises).then(function(result){
           
            var data = {};
            console.log(result);
            if(result.length >1){
                var allnews = commonController.getListingData(req,result[1]);
                var dataV = commonController.parseNewsByCateogires(allnews,syncNews);

            } else {
                dataV = {};
            }
            staticMixinController.getMixinData(req,res,syncTemplates,dataV); 
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV); 
            
            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
            
            var mainListingData = commonController.getListingData(req,result[0],mainNewsCatId);
            dataV['mainCatNewsCount'] =mainListingData.length;
            console.log("\n\n\n\n"+dataV['mainCatNewsCount']+"\n\n\n\n");
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]['all'] = mainListingData;
            dataV['mainCatNews']["data"]["first"] = [];
            dataV['mainCatNews']["data"]["second"] = [];
            dataV['mainCatNews']["data"]["third"] = [];
            dataV.newsCountInCatPage = newsCountInCatPage;
            // console.log(mainCatNews);
            
            console.log(mainListingData.length);
            for(var i=0;i<mainListingData.length;i++){
                if(i<4){
                   dataV['mainCatNews']["data"]["first"].push(mainListingData[i]); 
                } else if(i < 8){
                    dataV['mainCatNews']["data"]["second"].push(mainListingData[i]); 
                } else if(i<12){
                    dataV['mainCatNews']["data"]["third"].push(mainListingData[i]); 
                }
            }
            var path  = "/newsListing";
            console.log(dataV['mainCatNews']["data"]["first"].length);
            if(req.environment.partnerData.categoryTemplates && req.environment.partnerData.categoryTemplates[mainNewsCatId])
                path = "/"+req.environment.partnerData.categoryTemplates[mainNewsCatId];
            var finalPath = PartnerPropsModel.data[req.partner]["theme"]+path;
            if(props.isBulletin){
                finalPath = "common/liveBulletinCapture";
            }
            console.log(finalPath);
            res.render(finalPath, {
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
function setAsyncTenmplates(req,asyncTemplates){
    
    Utils.setAsyncTenmplates(req,asyncTemplates);

}
module.exports.renderCatPage = renderCatPage;
