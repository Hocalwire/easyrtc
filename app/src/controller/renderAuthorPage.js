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

function renderAuthorPage(req, res, next,props) {
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);

        var mainNewsCatId = props.authorId;
        

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
        setBreadcrumb(req,props);
        // req.environment.parentCatId = parentCatId;
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        promises.push(commonController.getMainCategoryNewsAuthor(req,res,mainNewsCatId,"",newsCountInCatPage)); 
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
            //set category listing and author listing data
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            if(props.authorId){
                var author = req.environment.partnerAuthorData.filter(function(item){
                    return item.authorId ==props.authorId;
                });    
                if(author && author.length){
                    props.author = author[0];
                }
            }
            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
            dataV['mainCatNews']["catData"]['pageType'] = "author";
            
          
            var mainListingData = commonController.getListingData(req,result[0]);
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]['all'] = mainListingData;
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

            
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/newsListing', {
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

function setBreadcrumb(req,props){
    req.environment.breadcrumb.unshift({"name":props.name,"url":props.url});
}
module.exports.renderAuthorPage = renderAuthorPage;
