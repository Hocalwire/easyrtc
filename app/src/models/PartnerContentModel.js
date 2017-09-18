'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var PartnerContentModel = {};
var Q = require("q");
var cacheExpireDuration = 24*60*60*1000;
var partnerConfig = require("src/config/PartnerConfig");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var commonContentController = require("src/controller/helpers/commonContentController");
PartnerContentModel.fetch = function(partner,req,res,next) {
    // console.log(req);
    return fetchPartnerContents(partner,req,res,next);
};

PartnerContentModel.promises = {};
PartnerContentModel.data = {};
PartnerContentModel.lastFetchedTime = {};


function getFilterMetadata(partner,content_name){
    var options = {
                rdm : apiHelper.getURL(Constants.getContentFilterMetadata,partner)
            };
    
    options.rdm.setRDMProperty("1","content_type_name",content_name);
    options.rdm.setRDMProperty("1","sendSync",true);
    return apiHelper.get(options);      
};
function parseContentData(req,rdm){
    var data = [];
    // console.log("parse Content Data called*******");
    // console.log(rdm.toXML());
    // console.log(rdm.rdRows);
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        // console.log("----------------");
        var d = commonContentController.getData(req,rdm,newsId);
        // console.log(d);
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_content);
        var d2 = new Date(b.date_content);
        return d2-d1;
    }    
    data.sort(sortFunction);
    // console.log(data);
    return data;

    
};
function getContentData(req,res,content_type,count,catId){
    
    var options = staticMixinController.getContentData(req,res);
    
    if(catId)
        options.rdm.setRDMProperty("1","category",catId); 
    options.rdm.setRDMProperty("1","sendSync","true");
    
    options.rdm.setRDMProperty("1","newsType","USER");
    if(count) {
        options.rdm.setRDMProperty("1","counts",count);   
    } else {
        options.rdm.setRDMProperty("1","counts",10);
    }
    
        options.rdm.setRDMProperty("1","content_type_name",content_type);
    
    return apiHelper.get(options);
        
}

function fetchPartnerContents(partner,req,res,next) {
    
    var currentTime = new Date().getTime();
    
    PartnerContentModel.lastFetchedTime[partner] = PartnerContentModel.lastFetchedTime[partner] || currentTime;

    // re-fetch in every 24 hours
    if ((currentTime - PartnerContentModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerContentModel.promises[partner]) {
        return PartnerContentModel.promises[partner];
    }

    logger.info('fetching partner contents');
    var partnerConfigData = partnerConfig[partner];
    // change last fetch time to now
    PartnerContentModel.lastFetchedTime[partner] = currentTime;
    var types = partnerConfigData.contentTypes;
    var promises = [];
    for(var i=0;i<types.length;i++){
        promises.push(getPartnerContentPropsApi(partner,types[i]));
    }
    for(var i=0;i<types.length;i++){
        promises.push(getFilterMetadata(partner,types[i]));
    }

    if(partnerConfigData.contentPreaLoadData){
        var preloadContent = partnerConfigData.contentPreaLoadData;
        for(var i=0;i<preloadContent.length;i++){
            promises.push(getContentData(req,res,preloadContent[i],10));
        }
    }
    // for(var i=0;i<types.length;i++){
    //     promises.push(getPartnerContentCategoriesApi(partner,types[i]));
    // }
    // console.log("promises for content props"+promises);
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerContentModel.promises[partner] = Q.all(promises);
    
    PartnerContentModel.promises[partner].then(
        function(response){
            
            var types = partnerConfigData.contentTypes;
            var count = 0;
            var contentTypes = {};

            for(var i=0;i<types.length;i++){
                if(!PartnerContentModel.data[partner]) {
                    PartnerContentModel.data[partner] = {};
                }
                if(!PartnerContentModel.data[partner][types[i]]) {
                    PartnerContentModel.data[partner][types[i]] = {};
                }
                PartnerContentModel.data[partner][types[i]]["props"] = getPartnerContentPropsData(response[count],partner);
                PartnerContentModel.data[partner][types[i]]["categories"] = [];
                // PartnerContentModel.data[partner][types[i]]["filters"] = [];
                contentTypes[types[i]] = PartnerContentModel.data[partner][types[i]]["props"].id;
                count++;
            }
            // for(var i=0;i<types.length;i++){
            //     if(!PartnerContentModel.data[partner]) {
            //         PartnerContentModel.data[partner] = {};
            //     }
            //     if(!PartnerContentModel.data[partner][types[i]]) {
            //         PartnerContentModel.data[partner][types[i]] = {};
            //     }
            //     PartnerContentModel.data[partner][types[i]]["categories"] = getPartnerContentCategoriesData(response[count],partner);
            //     count++;
            // }
            // console.log(PartnerContentModel.data[partner]);
            for(var i=0;i<types.length;i++){
                PartnerContentModel.data[partner][types[i]]["filters"] = getPartnerContentFiltersData(response[count],partner,contentTypes[types[i]]);
                // console.log("***************\n\n\n\n************************");
                // console.log(PartnerContentModel.data[partner][types[i]]["filters"]);
                // console.log("***************\n\n\n\n************************");
                count++;
                
            }
            // PartnerContentModel.data[partner]getAllContentFiltersParamsMap
            if(partnerConfigData.contentPreaLoadData){
                var preloadContent = partnerConfigData.contentPreaLoadData;
                for(var i=0;i<preloadContent.length;i++){
                    PartnerContentModel.data[partner][preloadContent[i]]["preloadData"] = parseContentData(req,response[count]);
                    count++;
                }
            }
            // console.log(PartnerContentModel.data[partner]);

        },
        function(err){
            PartnerContentModel.promises[partner] = null;
            PartnerContentModel.data[partner] = null;
        }).catch(function(e) {
            PartnerContentModel.promises[partner] = null;
            PartnerContentModel.data[partner] = null;
        });  

    
    return PartnerContentModel.promises[partner];
}

function getPartnerContentFiltersData(rdm,partner,contentType){
   
    var d = {};
    var filtersArray = [];
    // console.log(rdm.toXML());
    for(var k in rdm.rdRows){
        var item = rdm.rdRows[k];
        var id = item.id;
        var dataCount = item.options_count;
        
        item.content_type = contentType;
        item.param_display_name = item.display_name;
        
        if(item.auto_complete_type){
          item.auto_complete_content_type = item.auto_complete_type;
        } else {
          item.auto_complete_content_type = contentType;
        }
        
        var data = [];
        var htmlDisplayData = [];
        // console.log(contentType);
        var excludes = nonLoggedInFilterExcludes[contentType];
        // console.log("=====asasasa=============");
        // console.log(excludes );
        // console.log(item.param_name);
        // console.log("=====asasasa=============");
        if(excludes && excludes.indexOf(item.param_name)>-1){
            item['hideOnNotloggedIn']=true;
        } else {
            item['hideOnNotloggedIn']=false;
        }
        var htmlDisplayDataSelected = [];
        if(dataCount>0){
            if(item.input_type=="RADIO" && dataCount==2){
                item.input_type="CHECKBOX";
                dataCount=dataCount-1;            
            }

            for(var i=0;i<dataCount;i++){
                if(filtersStaticParamsHtmls && filtersStaticParamsHtmls[partner] && filtersStaticParamsHtmls[partner][item.param_name] && filtersStaticParamsHtmls[partner][item.param_name]["options_"+i]){
                    // console.log("\n\n\n\n found match ****");
                    var pdata = filtersStaticParamsHtmls[partner][item.param_name]["options_"+i];
                    var pdataselected = filtersStaticParamsHtmls[partner][item.param_name]["options_"+i+"_selected"];
                    htmlDisplayData.push(pdata);
                    htmlDisplayDataSelected.push(pdataselected);
                }
                if(rdm.rdRows[k]["options_"+i+"_count"]){

                    var c = rdm.rdRows[k]["options_"+i+"_count"];
                    if(item.input_type=="CHECKBOX_TREE" && (!c || c==0)){
                        continue;
                    }
                    var xx = [];
                    for(var j=0;j<c;j++){
                        xx.push(rdm.rdRows[k]["options_"+i+"_"+j]);
                    }
                    xx = xx.sort(function(a,b){
                          var a1 = a.sorting_order ? a.sorting_order :1;
                          var b1 = b.sorting_order ? b.sorting_order : 1;
                          // console.log(a1);
                          // console.log(b1);
                          if(a1!=b1){
                              return a1-b1;
                          } else {
                              return a.name > b.name ? 1 : -1;
                          }
                    });
                    var pdata = rdm.rdRows[k]["options_"+i];
                    
                    data.push({"data":pdata,"options":xx});
                } else {
                    var pdata = rdm.rdRows[k]["options_"+i];
                    // if(filtersStaticParamsHtmls && filtersStaticParamsHtmls[partner] && filtersStaticParamsHtmls[partner][item.param_name] && filtersStaticParamsHtmls[partner][item.param_name]["options_"+i]){
                    //     console.log("\n\n\n\n found match ****");
                    //     pdata = filtersStaticParamsHtmls[partner][item.param_name]["options_"+i];
                    // }
                    data.push(pdata);    
                }
                
            }
        }
        
        item.data = data;
        item.htmlDisplayData = htmlDisplayData;
        item.htmlDisplayDataSelected = htmlDisplayDataSelected;
        if(!d[item.input_type]){
            d[item.input_type]=[];
        }
        d[item.input_type].push(item);

        filtersArray.push(item);
        
        
    }

    filtersArray = filtersArray.sort(function(a,b){
          var a1 = a.sorting_order ? a.sorting_order :1;
          var b1 = b.sorting_order ? b.sorting_order : 1;

          if(a1!=b1){
              return a1-b1;
          } else {
              return a.name > b.name ? 1 : -1;
          }
    });
    
    d['content_type'] = contentType;
    d['filtersArray'] = filtersArray;
    d['params_map'] = getAllContentFiltersParamsMap();
    return d;


};
function getAllContentFiltersParamsMap(){
    var m = {
            "project_region" : "content_region",
            "project_industry" : "content_industry",
            "company_region" : "content_region",
            "company_industry" : "content_industry",
            "news_region" : "content_region",
            "news_industry" : "content_industry",
            "order_industry" : "content_industry",
            "order_execution_region" : "content_region",
    };
    return m;
};
function getPartnerContentPropsData(rdm,partner){
    var data = {};
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            data[j] = rdm.rdRows[k][j];

        }
        
    }
    
    return data;
};
function getPartnerContentCategoriesData(rdm,partner){
    var data = [];
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];
        }
        
        data.push(d);
    }
    data = data.sort(function(a,b){
            return (a.sorting_order - b.sorting_order);
    });
    return data;
};
function getPartnerContentPropsApi(partner,name){
    if(!partner){
        return;
    }
    
    var options = {
        rdm: apiHelper.getURL(Constants.getContentProps,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","name",name);
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};

function getPartnerContentCategoriesApi(partner,name){
    if(!partner){
        return;
    }
    
    var options = {
        rdm: apiHelper.getURL(Constants.getContentCategories,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","name",name);
    
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};


PartnerContentModel.parseCategoriesForheader = function(req,catData){
    var data = req.environment.partnerData;
    var allcats = catData;

    if(!data || !allcats || allcats.length==0){
        catData["topHeaderCats"] = [];
        catData["bottomFooterCats"] = [];
        return;
    }

    var topCategories = data["top_header_categories_content"];
    var topSubCategories = data["top_header_sub_categories_content"];
    var a = topCategories ? topCategories.split(",") : [];
    var aa = topSubCategories ? topSubCategories.split(",") : [];
    for(var i=0;i<allcats.length;i++){
        allcats[i]["childs"] = [];
    }
    var catsWithparent = allcats.filter(function(item){
        return (item.parentId && item.parentId!="null");
    });
    
    
    for(var i=0;i<catsWithparent.length;i++){
        // console.log(catsWithparent[i].parentId); 
        var parentCat = getCatById(allcats,catsWithparent[i].parentId);
        parentCat.childs.push(catsWithparent[i]);
    }
    var topcats  = [];
    for(var i=0;i<a.length;i++){
        topcats.push(getCatById(allcats,a[i]));
    }
    var topsubcats  = [];
    for(var i=0;i<aa.length;i++){
        topsubcats.push(getCatById(allcats,aa[i]));
    }
    var bottomCategories = data["bottom_footer_categories_content"];
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
    catData["topHeaderSubCats"] = topsubcats || [];
    
    
};
PartnerContentModel.getPartnerContentData = function(req){
    var data = PartnerContentModel.data[req.environment.partner];
    // data.getContentByName = function(name){
    //     for(var k in this){
           
    //     }
    // }
    // data.getContentById = function(id){
    //     for(var k in this){
    //         if(this[k].props.id==id){
    //             return this[k].props;
    //         }
    //     }
    // }
    // if(!data.topHeaderCats){
    //     PartnerContentModel.parseCategoriesForheader(req,data);
    // }
    return data;
};
PartnerContentModel.isCatUrl = function(req){
    
    var env =req.environment;
    var props = PartnerContentModel.data[env.partner];

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
    };

    if(props){
        var partnerConfigData = partnerConfig[env.partner];
        var types = partnerConfigData.contentTypes;
        var data = props;
        for(var i=0;i<types.length;i++){
            var propData = props[types[i]].props;
            var catData = props[types[i]].categories;
            // console.log("checking for content cat url **********************\n\n\n\n");
            var isXHR = false;
            var url = env.pathname;
            if(url.indexOf("/xhr/admin/")==0){
                isXHR=true;
                console.log("is XHR url ");
                url = url.substring(("/xhr/admin").length,url.length);
                console.log("final url \n\n\n"+url);
            }
            var result = matchUrl(propData.url,url);
            if(result && result!="false"){ //root url of content matchec
                if(result.indexOf("page")==0){ //a page url, set query param
                    if(!req.query){
                        req.query = {};
                    }
                    var page = result.split("#")[1];
                    req.query.page=page;
                }
                req.categoryId = "";
                env.partnerContentType = types[i];
                env.content_type = propData.id;
                env.contentXHRRequest = isXHR;
                return true;
            } else {
                for(var j=0;j<catData.length;j++){
                    var result = matchUrl(catData[j].url,env.pathname);
                    if(result && result!="false"){
                        if(result.indexOf("page")==0){ //a page url, set query param
                            if(!req.query){
                                req.query = {};
                            }
                            var page = result.split("#")[1];
                            req.query.page=page;
                        }
                        req.categoryId = catData[j].id;
                        env.partnerContentType = types[i];
                        env.contentXHRRequest = isXHR;
                        return true;
                    } 
                }       
            }
            
        }
        
    }
    env.contentXHRRequest = false;
    return false;
};
PartnerContentModel.getSearchUrl = function(req){
    
    var env =req.environment;
    var props = PartnerContentModel.data[env.partner];
    var content_type = req.query.content_type;
    var searchUrl = req.environment.partnerData.homePageRoot+"search?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);;
    if(!content_type){
        return req.environment.partnerData.homePageRoot+"search?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
    }
    if(props){
        var partnerConfigData = partnerConfig[env.partner];
        var types = partnerConfigData.contentTypes;
        var data = props;
        for(var i=0;i<types.length;i++){
            var propData = props[types[i]].props;
            var catData = props[types[i]].categories;
            var isXHR = false;
            var url = env.pathname;
            if(url.indexOf("/xhr/admin/")==0){
                isXHR=true;
                url = url.substring(("/xhr/admin").length,url.length);
                env.contentXHRRequest = true;
            }
            if(propData.id==content_type)    {
                searchUrl = req.environment.partnerData.homePageRoot+propData.url.substring(1,propData.url.length)+"/search?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
                env.content_type = content_type;
                break;
            }        
        }

        return searchUrl;    
    }

    env.contentXHRRequest = false;
    return false;

    
}
PartnerContentModel.isSearchUrl = function(req){
    // console.log("=======================================================checking for search url");
    var env =req.environment;
    var props = PartnerContentModel.data[env.partner];
    // console.log("checking for search url"+req.pathname);
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
    };
    if(props){
        var partnerConfigData = partnerConfig[env.partner];
        var types = partnerConfigData.contentTypes;
        var data = props;
        for(var i=0;i<types.length;i++){
            var propData = props[types[i]].props;
            var catData = props[types[i]].categories;
            var isXHR = false;
            var url = env.pathname;
            if(url.indexOf("/xhr/admin/")==0){
                isXHR=true;
                url = url.substring(("/xhr/admin").length,url.length);
            }
            // console.log("matching URL ================================"+propData.url+" url : "+url);
            var result = matchUrl(propData.url+"/search",url);
            console.log("result found"+result);
            if(result && result!="false"){ //root url of content matchec
                if(result.indexOf("page")==0){ //a page url, set query param
                    if(!req.query){
                        req.query = {};
                    }
                    var page = result.split("#")[1];
                    req.query.page=page;
                }
                req.categoryId = "";
                env.partnerContentType = types[i];
                env.contentXHRRequest = isXHR;
                env.content_type = propData.id;
                return true;
            } 
        }
        
    }
    env.contentXHRRequest = false;
    return false;
};
PartnerContentModel.isContentParamUrl = function(req){
    
    var env =req.environment;
    // console.log("checking for content param url========================");
    var props = PartnerContentModel.data[env.partner];
    var contentParamsProps = {};
    if(props){
        var partnerConfigData = partnerConfig[env.partner];
        var types = partnerConfigData.contentTypes;
        var data = props;
        for(var i=0;i<types.length;i++){
            var propData = props[types[i]].props;
            // console.log(propData);
            var isXHR = false;
            var url = env.pathname;
            // console.log("URL checkig ::::::::::"+url);
            if(url.indexOf("/xhr/admin/")==0){
                isXHR=true;
                url = url.substring(("/xhr/admin").length,url.length);
            }
            // console.log("create content url of props"+propData.create_url);
            if(propData.create_url){

                if(propData.create_url==url || propData.create_url==url+"/" || propData.create_url+"/"==url){
                    contentParamsProps['name']=propData.name;
                    contentParamsProps['dataPromise']="getReporterContentParams";
                    req.environment.content_param_name=propData.name;
                    contentParamsProps.template="/createContent";
                    contentParamsProps.pageType="create_content";
                    break;
                }
            }
        }
        
    }
    // console.log(contentParamsProps);
    if(!contentParamsProps.name){
        
        return false;
    }
    else return contentParamsProps;
};
function getFilters(){
    return "";
};
function getCatById(data,id){
    for(var i=0;i<data.length;i++){
        if(data[i].id==id){
            return data[i];
        }
    }
    return null;
}
var filtersStaticParamsHtmls = {
    "domex" : {
        "project_verified_by_domex" :  { 
            "options_0" : '<style>.content-filter-wrapper.has-filters .know-more {top: 104px !important;}</style><label class="filter-collapse know-more" for="know-more" style="display: inline;float: right;position: absolute;right: 60px;top: 75px;text-decoration:underline;">Know More</label><input id="know-more" class="filter-knowmore-input ignore-checkbox" type="checkbox"><span class="filter-verified-desc active1" style="background: #f6f6f6;padding: 2px;"> Domex verified means its verified and reaserched by domex</span><label class="muti-select-label clearfix"><div class="fLeft col-md-12 change_font no-padding multiselect-off"><input data-param-name="project_verified_by_domex" data-match-type="EQUAL" data-content-type="4" type="checkbox" name="Domex Verified" class="" value="Domex Verified"><span class="filter-verified-img"><img src="/theme_fish/images/verified.png" title="Verified By Domex" class="verified_icon" style="width: 36px;float: left !important;margin-top: -7px;"></span><span class=""></span><style>.filter-verified-img {margin-top:10px;} .filter-collapse{cursor: pointer;display: inline-block;background: #f5f7fa;}.filter-collapse + input.filter-knowmore-input{display: none; }.filter-collapse + input.filter-knowmore-input + .filter-verified-desc{display:none;}.filter-collapse + input.filter-knowmore-input:checked + .filter-verified-desc{display:block;}</style> </div></label>',
            "options_0_selected" : '<style>.content-filter-wrapper.has-filters .know-more {top: 104px !important;}</style><label class="filter-collapse know-more" for="know-more" style="display: inline;float: right;position: absolute;right: 60px;top: 75px;text-decoration:underline;">Know More</label><input id="know-more" class="filter-knowmore-input ignore-checkbox" type="checkbox"><span class="filter-verified-desc active1" style="background: #f6f6f6;padding: 2px;"> Domex verified means its verified and reaserched by domex</span><label class="muti-select-label clearfix"><div class="fLeft col-md-12 change_font no-padding multiselect-off"><input data-param-name="project_verified_by_domex" data-match-type="EQUAL" checked="true" data-content-type="4" type="checkbox" name="Domex Verified" class="" value="Domex Verified"><span class="filter-verified-img"><img src="/theme_fish/images/verified.png" title="Verified By Domex" class="verified_icon" style="width: 36px;float: left !important;margin-top: -7px;"></span><span class=""></span><style>.filter-verified-img {margin-top:10px;} .filter-collapse{cursor: pointer;display: inline-block;background: #f5f7fa;}.filter-collapse + input.filter-knowmore-input{display: none; }.filter-collapse + input.filter-knowmore-input + .filter-verified-desc{display:none;}.filter-collapse + input.filter-knowmore-input:checked + .filter-verified-desc{display:block;}</style> </div></label>'
        },

    }
};

var nonLoggedInFilterExcludes = {
    "4" : ["project_promoter_name","project_cost_amount"]
};
PartnerContentModel.getCatUrlProps = function(req){
    var env =req.environment;
    var props = PartnerContentModel.data[env.partner];
    var contentType = env.partnerContentType;
    var categoryId = req.categoryId;
    var urlProps = {};
    var data = props[contentType];
    urlProps["theme"] = req.environment.partnerData.theme;
    if(!categoryId){ //root url
        urlProps["props"] = data.props;
        urlProps['filters'] = getFilters();
        urlProps['filtersMetaData'] = data.filters;
        urlProps["categoryProps"] = "";
    } else {
        urlProps["props"] = data.props;
        urlProps['filters'] = getFilters();
        urlProps['filtersMetaData'] = data.filters;
        var cats = data.categories;
        urlProps["categoryProps"] = getCatById(cats,categoryId);
    }
    return urlProps;
};
PartnerContentModel.getFilterMetaData = function(partner,contentType) {

}
module.exports = PartnerContentModel;

