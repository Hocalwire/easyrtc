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
var newsCountInCatPage = 1000;
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var logger = require('src/libs/logger');
var extend = require("extend");

function renderBreakingNewsPage(req, res, next,props) {
        console.log("=============================\n\n\n===============================\n\n\n==============rendering breaking news=========\n\n");
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);

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

            if(mainListingData.length>0){
                res.locals.meta["title"] = mainListingData[0].title;    
            }
                
            res.locals.meta["image"] = req.environment.rootUrl + "/images/breaking.png";            
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]["first"] = [];
            dataV['mainCatNews']["data"]["second"] = [];
            dataV['mainCatNews']["data"]["third"] = [];

            for(var i=0;i<mainListingData.length;i++){
                if(i<15){
                   dataV['mainCatNews']["data"]["first"].push(mainListingData[i]); 
                } else  if(i < 30){
                    dataV['mainCatNews']["data"]["second"].push(mainListingData[i]); 
                } else {
                    dataV['mainCatNews']["data"]["third"].push(mainListingData[i]); 
                }
            }
          
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/breakingNewsListing', {
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

module.exports.renderBreakingNewsPage = renderBreakingNewsPage;
