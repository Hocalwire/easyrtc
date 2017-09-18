"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var staticDataController = require("src/controller/helpers/staticDataController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var staticPageHandler = require('src/controller/renderStaticPage');
var request = require("request");
var Promise = require('promise');
var extend = require("extend");
var Q = require("q");   
function getPlanById(req,res,optionsPassed){
    var f = function(resolve,reject){
        
    }
    var promise  = new Promise(function(resolve,reject){
        resolve("");
    });
    // setTimeout(function(){

    // },10);
    promise.then(function(data){
        promise.data = [];
        promise.data.push({"id":optionsPassed.planIds});
    },
    function(e) {
        logger.error('error caching page', e.message);
        next(e);
    })
    .catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    }); 
    return promise;
    
    
}
function getAllPlans(req,res,optionsPassed){
    var env = req.environment;
    console.log("==================================");
    console.log(req.parentPartner);
    console.log("==================================");
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.getSubscriptionPlanUrl,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    
    // console.log(optionsPassed);
    // console.log(options.rdm.toXML());
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            // console.log("promise first resolve111111111");
            var parseSubscriptionPlanItem = function (id,rdm) {
                var data  = {};
                var row = rdm.rdRows[id];
                for(var k in row){
                    data[k] = row[k];
                }
                data.partner = rdm.getRDMAttribute('partner');
                return data;
            };

            promise.data = [];
        
            for(var k in rdm.rdRows){
                var d = parseSubscriptionPlanItem(k,rdm);
                promise.data.push(d);
            }
            // console.log("promise first resolve1111111111111111111111111111111111111111");
            // console.log(promise.data);
            
        },function(){
            //Fail
            promise.data = [];
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
    return promise;
}
function getGroups(req,res,optionsPassed){
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.getSubscriptionPlanUrl,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            
            promise.data = [];
            promise.data.push({"name":"category","max-count":"5","display_name":"Categories For Subscription"});
            promise.data.push({"name":"region","max-count":"5","display_name":"Regions For Subscription"});
            
        },function(){
            //Fail
            promise.data = [];
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
    return promise;
}
function getItems(req,res,optionsPassed){
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.getPlanCartItems,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    if(optionsPassed.itemIds) {
        options.rdm.setRDMProperty("1","itemId",optionsPassed.itemIds);
    }
    if(optionsPassed.planIds) {
        options.rdm.setRDMProperty("1","planId",optionsPassed.planIds);
    }
    // console.log(optionsPassed);
    // console.log(options.rdm.toXML());
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            var data = [];
    
            var partner = rdm.getRDMAttribute("partner");
            
            for(var k in rdm.rdRows){
                var d = {};
                var id = rdm.rdRows[k].id;
                for(var j in rdm.rdRows[k]){
                    d[j] = rdm.rdRows[k][j];

                }
                console.log(d.imageId);
                if(d.imageId && partner){
                    d['partner'] = partner;
                    d['image'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
                } else {
                    d["image"] = "";
                }
                // d.name = Utils.replaceHtmlEntities(d.name);
                d.groupName = d.group;
                d.itemId = d.id || d.uid;

                data.push(d);
            }
            
            
            promise.data = data;
        
            consosle.log(promise.data);
        },function(){
            //Fail
            promise.data = [];
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
    return promise;
}
function parseCartItems(req,res,arr,props){
    var options = props && props.options ? props.options : [];
    var data = {};
    // console.log("array passe is");
    // console.log(arr);
    data["allPlans"] = arr[0].data;
    data["planById"] = arr[1].data;
    // data["groups"] = arr[2].data;
    data["items"] = arr[2].data;
    var groups = [];
    var tempGroups = {};
    for(var i=0;i<data['items'].length;i++){
        var gname = data['items'][i].group;

        if(gname && !tempGroups[gname]){
            tempGroups[gname] = true;
        }
    }
    for(var k in tempGroups){
        groups.push({"name":k,"max-count":"1","display_name":"Add Your Subscription Items"});
    }
    data.groups=groups;
    data["cartItems"] = [];
    var getItemsByGroup = function(items,groupType,includeOthers){
        var d = items.filter(function(it){
            if(includeOthers){
                return (it.groupName==groupType || it.group==groupType) || !it.group;
            } else {
                return (it.groupName==groupType || it.group==groupType);    
            }
            
        });
        return d;
    }
    for(var i=0;i<data.groups.length;i++){
        var its = getItemsByGroup(data.items,data.groups[i]['name'],true); 
        its["group"] = data.groups[i];
        data["cartItems"].push(its);
    }
    return data;
};
function loadCart(req,res,next){
    var data = req.query;
    var planId = data.planId;
    var itemId = data.itemId;
    var promisses  = [];
    promisses.push(getAllPlans(req,res,{}));
    promisses.push(getPlanById(req,res,{"planIds":planId}));
    // promisses.push(getGroups(req,res,{}));
    promisses.push(getItems(req,res,{"planIds":planId,"itemIds":itemId}));
 
    var xx = [];
    for(var i=0;i<promisses.length;i++){
        xx.push(promisses[i]);
    }
    var p = Q.all(promisses);
    p.then(
        function(rdm){
            var o = [];
            o.push({"type":"all_plans"});
            o.push({"type":"plan_by_id","id":planId});
            // o.push({"type":"groups"});
            o.push({"type":"items"});
           
            var data = parseCartItems(req,res,xx,{"options":o});
            // console.log(data);
            var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
            var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
            var aTemplates = [];
            var aTemplates = extend(true,aTemplates,asyncTemplates);
            var dataV =data;
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            Utils.setAsyncTenmplates(req,aTemplates);

            var renderUrl = "common/cartPage";
            if(req.environment.isStaticUrl){
                var props = req.environment.staticUrlProps;
                renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
            }
            console.log("rending cart page(*8****************\n\n\n\nn\n\nasfdadfasdfasdfad==========**"+renderUrl);
            Utils.render(req,res,renderUrl,{"data":data},function(err, html){
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
            });
        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in getting cart page', e.message);
        next(e);
    });
}

function getCartValue(req,res,next){
    var data=req.body;
    var cartItems = data.itemIds;
    var planIds = data.planId;
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.checkoutCart,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","itemIds",cartItems);
    options.rdm.setRDMProperty("1","planId",planIds);
    
    if(data.userId){
        options.rdm.setRDMProperty("1","userId",userId);
    }
    if(data.contentId){
        options.rdm.setRDMProperty("1","contentId",contentId);
    }
    
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            console.log(rdm.toXML());
            res.send({"errorCode":0,"data":rdm.toXML()});
        },function(){
            res.send({"errorCode":-1,"data":""});
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
    
}
function checkoutCart(req,rest,next){
    var data = req.body;
    // console.log(data);
    res.end();
}
function showCheckoutPage(req,res,next){

    var planId = req.query.planId;
    var renderUrl = "common/cartCheckoutPage";
    // var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData.theme);
    // Utils.setAsyncTenmplates(req,asyncTemplates);
    if(req.environment.isStaticUrl){
        var props = req.environment.staticUrlProps;
        renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
    }
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);
    var dataV = {"planId":planId};
    staticMixinController.getMixinData(req,res,syncTemplates,dataV);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
    Utils.setAsyncTenmplates(req,aTemplates);


    Utils.render(req,res,renderUrl,{"data":dataV},function(err, html){
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    });
}
function parsePaymentData(req,res,rdm){
    console.log(rdm.toXML());
    var data  = {};
    var rows = rdm.rdRows;
    for(var k in rows){
        var row = rows[k];
        for(var j in row){
            data[j] = row[j];    
        }
        break;
        
    }
    data.partner = rdm.getRDMAttribute('partner');
    return data;
}
function getCheckoutPageData(req,res,next){
    console.log("calling get checkout page data *************");
    var data = req.body;
    if(!req.body){
        data = req.query;
    }
    var planId = data.planId;
    var promisses  = [];
    promisses.push(getAllPlans(req,res,{}));
    promisses.push(getPlanById(req,res,{"planIds":planId}));
    
    var cartItems = [];
    try {
        cartItems = JSON.parse(data.items);
    } catch(e){
        cartItems = [];
    }
    // console.log(cartItems);
    var itemIds = "";
    for(var i=0;i<cartItems.length;i++){
        if(i<cartItems.length-1){
            itemIds+=cartItems[i].id+",";
        } else {
            itemIds+=cartItems[i].id;
        }
    }
    console.log("item ids are:"+itemIds);
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.checkoutCart,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","itemIds",itemIds);
    options.rdm.setRDMProperty("1","planId",planId);
    if(data.userId){
        options.rdm.setRDMProperty("1","userId",data.userId);
    }
    if(data.contentId){
        options.rdm.setRDMProperty("1","contentId",data.contentId);
    }
    
    var promise = apiHelper.get(options,req,res);
    promisses.push(promise);
    var xx = [];
    for(var i=0;i<promisses.length;i++){
        xx.push(promisses[i]);
    }
    var p = Q.all(promisses);
    p.then(
        function(rdm){
            
            var dataLocal = {};
            // console.log("array passe is");
            // console.log(arr);
            dataLocal["allPlans"] = xx[0].data;
            dataLocal["planById"] = xx[1].data;
            var plan = dataLocal["allPlans"].filter(function(itemLocal){
                return itemLocal.id==dataLocal["planById"][0].id;
            });
            if(plan.length){
                plan=plan[0];
            } else {
                plan={};
            }
            logger.error("planType:"+plan["type"]);
            if(plan["type"]=="GENERIC"){ //generic plan - full cart selected, dont show items list, an clear cart
                cartItems = [];
                logger.error("loaded GENERIC plan");
            }
            console.log(plan);
            // data["groups"] = arr[2].data;
            dataLocal["paymentData"] = parsePaymentData(req,res,rdm[2]);
            dataLocal["items"] = cartItems;
            console.log("\n\n\n\n\n\n\n==================11111111111111111111");
            console.log(dataLocal);
            var groups = [];
            var tempGroups = {};
            for(var i=0;i<dataLocal['items'].length;i++){
                var gname = dataLocal['items'][i].group || dataLocal['items'][i].groupName;

                if(gname && !tempGroups[gname]){
                    tempGroups[gname] = true;
                }
            }
            for(var k in tempGroups){
                groups.push({"name":k,"max-count":"1","display_name":"Add Your Subscription Items"});
            }
            console.log("=================");
            console.log(groups);
            dataLocal.groups=groups;
            dataLocal["cartItems"] = [];
            var getItemsByGroup = function(items,groupType,includeOthers){
                var d = items.filter(function(it){
                    if(includeOthers){
                        return (it.groupName==groupType || it.group==groupType) || !it.group;
                    } else {
                        return (it.groupName==groupType || it.group==groupType);    
                    }
                    
                });
                return d;
            }
            for(var i=0;i<dataLocal.groups.length;i++){
                var its = getItemsByGroup(dataLocal.items,dataLocal.groups[i]['name'],true); 
                its["group"] = dataLocal.groups[i];
                dataLocal["cartItems"].push(its);
            }
            // var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData.theme);
            // Utils.setAsyncTenmplates(req,asyncTemplates);
            var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
            var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
            var aTemplates = [];
            var aTemplates = extend(true,aTemplates,asyncTemplates);
            var dataV = dataLocal;
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);

            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            Utils.setAsyncTenmplates(req,aTemplates);
            Utils.render(req,res,"common/cartCheckoutPageData",{"data":dataLocal},function(err, html){
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                var o = {};
                    o["planId"] = planId;
                    o['totalPrice'] = "2000";
                    data['viewData'] = html;
                    res.send(200, data);
                
            });
        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in getting cart page', e.message);
        next(e);
    });

    
}
function showPaymentStatusPage(req,res,next){
    var id = req.query.txnid || req.query.txnId;
    console.log("ttransaction id:"+id);
    if(!id){
        res.status(404);
        next();
        return;
    }
    var options = {
                    rdm : apiHelper.getURL(Constants.getPaymentStatus,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","txnId",id); 
    
    apiHelper.get(options, req, res).then(
        function(rdm){

            var d = parsePaymentData(req,res,rdm);
            console.log(d);
            var planId = d.planId;
            var promise = getAllPlans(req,res,{"planIds":planId});
            var tpromise = promise;
            promise.then(function(planrdm){
                console.log("fetching plan data");
                console.log(tpromise.data);
                console.log(planrdm);
                var allPlans = tpromise.data;
                var myPlan;
                for(var i=0;i<allPlans.length;i++){
                    if(allPlans[i].id==planId){
                        myPlan = allPlans[i];
                        break;
                    }
                }
                var fd = {};
                fd['planData'] = myPlan;
                fd['txnData'] = {"txnId":id,"state":d.state,"amount":d.amount,"currency":d.currency};
                var renderUrl = "common/cartPaymentStatusPage";
                var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
                var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
                var aTemplates = [];
                var aTemplates = extend(true,aTemplates,asyncTemplates);
                var dataV = fd;
                staticMixinController.getMixinData(req,res,syncTemplates,dataV);
                staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
                Utils.setAsyncTenmplates(req,aTemplates);
                // var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData.theme);
                // Utils.setAsyncTenmplates(req,asyncTemplates);
                if(req.environment.isStaticUrl){
                    var props = req.environment.staticUrlProps;
                    renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
                }
                Utils.render(req,res,renderUrl,{"data":fd},function(err, html){
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(html);
                });
            },function(e){
                next(e);
            }).catch(function(e){
                logger.error('error in get plans data:', e.message);
                next(e);
            });
            
        },function(){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });

}
function showPlanDetailsPage(req,res,next){
    var planId = req.query.planId || req.body.planId;
    var promise = getAllPlans(req,res,{"planIds":planId});
    var tpromise = promise;
    promise.then(function(planrdm){
        var allPlans = tpromise.data;
        var myPlan;
        for(var i=0;i<allPlans.length;i++){
            if(allPlans[i].id==planId){
                myPlan = allPlans[i];
                break;
            }
        }
        var dataV = {};
        dataV['data'] = myPlan;
        var renderUrl = "common/planDetails";
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData.theme);
        Utils.setAsyncTenmplates(req,asyncTemplates);
        if(req.environment.isStaticUrl){
            var props = req.environment.staticUrlProps;
            renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
        }
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        
        staticMixinController.getMixinData(req,res,syncTemplates,dataV);
        staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
        Utils.setAsyncTenmplates(req,aTemplates);
        Utils.render(req,res,renderUrl,{"data":dataV},function(err, html){
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        });
    },function(e){
        next(e);
    }).catch(function(e){
        logger.error('error in get plans data:', e.message);
        next(e);
    });
            

}
function parsePaymentHistoryDetails(req,res,rdm){
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
            // d['mediaUrl'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
        } else {
            // d["mediaUrl"] = "/images/logo.png";
        }
        // d.name = Utils.replaceHtmlEntities(d.name);
        data.push(d);
    }
    
    data = data.sort(function(a,b){
            var d1 = new Date(a["date_created"]);
            var d2 = new Date(b["date_created"]);
            return d2-d1;
    });
    
    return data;

}
function showProfilePage(req,res,next){
    var promisses = [];
    var options = {
            rdm : apiHelper.getURL(Constants.getProfile,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    promisses.push(apiHelper.get(options, req, res));

    var options1 = {
            rdm : apiHelper.getURL(Constants.getUserSubscriptionWebsite,req.parentPartner || req.partner)
    };
    options1.rdm.setRDMProperty("1","sendSync","true");
    promisses.push(apiHelper.get(options1, req, res));
    
    var options2 = {
            rdm : apiHelper.getURL(Constants.getPaymentHistory,req.parentPartner || req.partner)
    };
    options2.rdm.setRDMProperty("1","sendSync","true");
    promisses.push(apiHelper.get(options2, req, res));
    
    var p = Q.all(promisses);
    p.then(
        function(rdms){
            var d = parsePaymentData(req,res,rdms[0]);
            console.log(d);
            var planId = d.planId;
            var promise = getAllPlans(req,res,{"planIds":planId});
            var tpromise = promise;
            console.log(rdms);
            promise.then(function(planrdm){
                var allPlans = tpromise.data;
                var myPlan;
                for(var i=0;i<allPlans.length;i++){
                    if(allPlans[i].id==planId){
                        myPlan = allPlans[i];
                        break;
                    }
                }
                var fd = {};
                fd['planData'] = myPlan;
                fd['profileData'] = d;
                fd['subscriptionData'] = parsePaymentData(req,res,rdms[1]);;
                fd['paymentData'] = parsePaymentHistoryDetails(req,res,rdms[2]);;
                
                var renderUrl = "common/profilePage";
                var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
                var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",req.environment.partnerData ?  req.environment.partnerData["theme"] : "");
                var aTemplates = [];
                var aTemplates = extend(true,aTemplates,asyncTemplates);
                var dataV =fd;
                staticMixinController.getMixinData(req,res,syncTemplates,dataV);
                staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
                Utils.setAsyncTenmplates(req,aTemplates);


                if(req.environment.isStaticUrl){
                    var props = req.environment.staticUrlProps;
                    renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
                }
                Utils.render(req,res,renderUrl,{"data":fd},function(err, html){
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(html);
                });
            },function(e){
                next(e);
            }).catch(function(e){
                logger.error('error in get plans data:', e.message);
                next(e);
            });
            
        },function(){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });

}
function submitPaymentInfo(req,res,next){
    var data=req.body;
    var txnId = data.txnid;
    // var planId = data.planId;

    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.submitPaymentInfo,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    
    for(var k in data){
        options.rdm.setRDMProperty("1",k,data[k]);    
    }
    if(data.userId){
        options.rdm.setRDMProperty("1","userId",data.userId);
    }
    if(data.contentId){
        options.rdm.setRDMProperty("1","contentId",data.contentId);
    }
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            console.log(rdm.toXML());
            res.send({"errorCode":rdm.getRDMAttribute("errorCode"),"data":JSON.stringify(parsePaymentData(req,res,rdm))});
        },function(){
            res.send({"errorCode":-1,"data":""});
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
}
function submitAgentInfo(req,res,next){
    var data=req.query;
    var txnId = data.txnid;
    var uid = data.code;
    var planId = data.planId;
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.getProfile,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","txnId",txnId);
    options.rdm.setRDMProperty("1","userId",uid);
    options.rdm.setRDMProperty("1","planId",planId);
    
    
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            console.log(rdm);
            // console.log(rdm.toXML());
            res.send({"errorCode":rdm.getRDMAttribute("errorCode"),"data":JSON.stringify(parsePaymentData(req,res,rdm))});
        },function(){
            res.send({"errorCode":-1,"data":JSON.stringify({"error":true})});
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
}
function submitCouponInfo(req,res,next){
    var data=req.query;
    var txnId = data.txnid;
    var uid = data.code;
    var planId = data.planId;
    var env = req.environment;
    var isLoggedInUser = env.isLoggedInUser;

    var options = {
                rdm : apiHelper.getURL(Constants.validateCouponCode,req.parentPartner || req.partner)
            };
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","txnId",txnId);
    options.rdm.setRDMProperty("1","coupon_code",uid);
    options.rdm.setRDMProperty("1","planId",planId);
    
    
    var promise = apiHelper.get(options,req,res);
    promise.then(
        function(rdm){
            console.log(rdm);
            // console.log(rdm.toXML());
            res.send({"errorCode":rdm.getRDMAttribute("errorCode"),"data":JSON.stringify(parsePaymentData(req,res,rdm))});
        },function(){
            res.send({"errorCode":-1,"data":JSON.stringify({"error":true})});
        }
    ).catch(function(e){
        logger.error('error in geting plan ids:', e.message);
        next(e);
    });
}
function saveProfileDetails(req,res,next){

}
function locationSetupPage(req,res,next){
    var lat=req.query.lat;
    var lng=req.query.lng;
    var location = {
        "lat":lat,
        "lng":lng,
        "partner":req.partner
    };
    Utils.addLocation(lat,lng,req.partner);
    var renderUrl = "common/locationSettingsPageForPartner";
    if(req.environment.isStaticUrl){
        var props = req.environment.staticUrlProps;
        renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
    }
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",req.environment.partnerData.theme);
    Utils.setAsyncTenmplates(req,asyncTemplates);
    Utils.render(req,res,renderUrl,{"data":location},function(err, html){
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    });

}
function showheatmap(req,res,next){
    Utils.getVisitorsLocations(req.partner).then(function(response){
        var renderUrl = "common/heatmap";
        if(req.environment.isStaticUrl){
            var props = req.environment.staticUrlProps;
            renderUrl = props.template.indexOf("/")==0 ? req.environment.partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
        }
        var dataV = {};
        dataV["data"] = response && response.length?response:[];
        Utils.render(req,res,renderUrl,{"data":dataV},function(err, html){
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
        });
    },function(e){
        next(e);
    }).catch(function(e){
        logger.error('error in get plans data:', e.message);
        next(e);
    });
            
        
}
function handleRequest(req,res,next){

    var pathname = req.pathname;
    console.log("inside handleRequest ======================================="+pathname);
    if(pathname=="/user/user-cart"){
        loadCart(req,res,next);
    } 
    else if(pathname=="/xhr/admin/user/checkoutCart"){
        checkoutCart(req,res,next);
    } else if(pathname=="/user/checkout"){
        showCheckoutPage(req,res,next);
    }
    else if(pathname=="/user/payment-status"){
        showPaymentStatusPage(req,res,next);
    }
    else if(pathname=="/xhr/admin/user/getCartValue"){
        getCartValue(req,res,next);
    }
    else if(pathname=="/xhr/admin/user/updateProfileData"){
        saveProfileDetails(req,res,next);
    }
    else if(pathname=="/user/profile"){
        showProfilePage(req,res,next);
    }else if(pathname=="/user/set-my-location"){
        locationSetupPage(req,res,next);
    }
    else if(pathname=="/xhr/admin/user/getCartCheckoutPageData"){
        getCheckoutPageData(req,res,next);
    } 
    else if(pathname=="/user/show-heatmap"){
        showheatmap(req,res,next);
    } 
    else if(pathname=="/user/plan-details"){
        showPlanDetailsPage(req,res,next);
    } else if(pathname=="/xhr/admin/user/submit-agent-code"){
        submitAgentInfo(req,res,next);
    } else if(pathname=="/xhr/admin/user/submit-coupon-code"){
        submitCouponInfo(req,res,next);
    } else if(pathname=="/xhr/admin/user/submitPaymentInfo"){
        submitPaymentInfo(req,res,next);
    } else {
        if(req.environment.isStaticUrl) {
            var props = req.environment.staticUrlProps;
            staticPageHandler.renderStaticPage(req,res,next,props);
            return;
        }
        res.status(404);
        next();
    }
    
}


module.exports.handleRequest = handleRequest;

