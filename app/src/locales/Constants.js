var PartnerConfig = require("src/config/PartnerConfig");

var app;
module.exports = {
    devMode : false,
    servletRootPrefix : "",
    deploymentMode : "production",
    servletRootPrefixExternal : "/content",
    setup: function(expressApp) {
        app = expressApp;
        if(app.get('env')=="development"){
            this.servletRootPrefix = "/content";
            this.deploymentMode = "development";
            this.devMode = true;
        } else {
            this.servletRootPrefix = "/LONOTI";
        }
    },
    /*
        to be removed , only for development of payment flow
    */
    paymentPlans : {
        "all_region" : {
                        "single": {"cost":100,"duration":1},
                        "monthly": {"cost":4000,"duration":30},
                        "quarter": {"cost":6500,"duration":90},
                        "half_year": {"cost":10000,"duration":180},
                        "yearly": {"cost":15000,"duration":360}
                        },
        "south_region" : {"single": {"cost":200,"duration":1},
                        "monthly": {"cost":3000,"duration":30},
                        "quarter": {"cost":3500,"duration":90},
                        "half_year": {"cost":5000,"duration":180},
                        "yearly": {"cost":7000,"duration":360}
                    },
        "north_region" : {"single": {"cost":100,"duration":1},
                        "monthly": {"cost":1200,"duration":30},
                        "quarter": {"cost":2000,"duration":90},
                        "half_year": {"cost":3500,"duration":180},
                        "yearly": {"cost":5000,"duration":360}
                    },
        "east_region" : {"single": {"cost":100,"duration":1},
                        "monthly": {"cost":1000,"duration":30},
                        "quarter": {"cost":2500,"duration":90},
                        "half_year": {"cost":4000,"duration":180},
                        "yearly": {"cost":6000,"duration":360}
                    },
        "west_region" : {"single": {"cost":100,"duration":1},
                        "monthly": {"cost":1000,"duration":30},
                        "quarter": {"cost":2500,"duration":90},
                        "half_year": {"cost":4000,"duration":180},
                        "yearly": {"cost":6000,"duration":360}
                    }

    },


    "paymentsStatus" : {
        "123456" : {"plan":"monthly","region":"all_region","status":0,"message":"Your payment is success full","amount":4000,"method":"online","account_holder": "Ashwani Mishra"},
        "123456" : {"plan":"quarter","region":"west_region","status":2,"message":"Your payment is failed because of invalid details.","amount":2500,"method":"online","account_holder": "Suresh J"},
        "123456" : {"plan":"single","region":"north_region","status":0,"message":"Your payment is success full","amount":100,"method":"online","account_holder": "Vinoth Poovalingam"},
        "123456" : {"plan":"half_year","region":"west_region","status":0,"message":"Your payment is success full","amount":4000,"method":"online","account_holder": "Natasha Mahesh"},
        "123456" : {"plan":"yearly","region":"east_region","status":1,"message":"Your payment is failed as vendor throw and error. Contact the bank","amount":4000,"method":"online","account_holder": "Deepa Pandey"},
        "123456" : {"plan":"quarter","region":"north_region","status":0,"message":"Your payment is success full","amount":4000,"method":"online","account_holder": "Ashwani Mishra"},
        "123456" : {"plan":"single","region":"south_region","status":3,"message":"Your payment is failed for unknow reason","amount":4000,"method":"online","account_holder": "Ashwani Mishra"}

    },


    siteRootURL : "www.hocalwire.com",
    
    rdmGateway : "/servlet/RDESController?command=rdm.RDMGateway", //add content in produnction
    servletRoot : "/servlet/RDESController?", //add content in produnction
    androidAppUrl : "https://play.google.com/store/apps/details?id=com.ally.hocalwire",
    iOSAppUrl: 'https://itunes.apple.com/us/app/hocalwire-local-news-around/id1071457610?ls=1&mt=8',
    getNewsUrl : "com.rdes.engine.news.RDNewsEngine#getNewsWebsite",
    getNewsUrlOld : "com.rdes.engine.news.RDNewsEngine#getNews",
    getBlogUrl : "com.rdes.engine.news.RDNewsEngine#getBlogs",
    getCategoriesUrl : "com.rdes.engine.news.RDNewsEngine#getPartnerNewsCategories",
    getAuthorsUrl : "com.rdes.engine.news.RDNewsEngine#getPartnerAuthors",
    getEPaper : "com.rdes.engine.news.RDNewsEngine#getPartnerNewsAuthors",
    getAssignmentsUrl : "com.rdes.engine.news.RDNewsEngine#getPublicAssignments",
    getPartnerConfig : "com.rdes.engine.news.RDNewsEngine#getPartnerConfig",
    getPartnerDataContent : "com.rdes.engine.news.RDNewsEngine#getWebsiteContent",
    updateNewsState : "com.rdes.engine.news.RDNewsEngine#updateNewsState",
    validateURL : "com.rdes.engine.news.RDNewsEngine#validateURL",
    loginUrl  : "com.rdes.service.rdm.RDMessageHandler#loginPartner",
    createContentUrl : "com.rdes.engine.news.RDNewsEngine#createContent",
    registerUrl  : "com.rdes.service.rdm.RDMessageHandler#registerAsJournalist",
    forgotPasswordUrl  : "com.rdes.service.rdm.RDMessageHandler#login",
    validateOTPUrl  : "com.rdes.service.rdm.RDMessageHandler#validateOTP",
    validatePhoneUrl  : "com.rdes.service.rdm.RDMessageHandler#validatePhone",
    sendEmail  : "com.rdes.service.rdm.RDMessageHandler#sendEmail",
    getUserData  : "com.rdes.service.rdm.RDMessageHandler#getUserData",
    getPhotoGalleryUrl : "com.rdes.engine.news.RDNewsEngine#getEvents",
    updateUserUrl  : "com.rdes.service.rdm.RDMessageHandler#updateUser",
    getEPaperUrl : "com.rdes.engine.news.RDNewsEngine#getEPapers",
    getEPaperPublishDatesUrl : "com.rdes.engine.news.RDNewsEngine#getEPaperPublishDates",
    postSocialResult : "com.rdes.service.rdm.RDMessageHandler#updateSocialPostStatus",
    sessionId :"WEBXNONJSMKE1QNXIKROQNQU62XEEEGPR7C",
    validateLogin : "com.rdes.service.rdm.RDMessageHandler#validateLogin",
    logout : "com.rdes.service.rdm.RDMessageHandler#logout",
    getLocationDataUrl :"com.rdes.engine.news.RDNewsEngine#getLocationData",
    getSubscriptionPlanUrl : "com.rdes.service.rdm.RDMessageHandler#getSubscriptionPlans",
    getContentProps : "com.rdes.engine.news.RDNewsEngine#getContentProps",
    getContentCategories : "com.rdes.engine.news.RDNewsEngine#getContentCategories",
    getContentData : "com.rdes.engine.news.RDNewsEngine#getContent",
    getBuzzData : "com.rdes.engine.news.RDNewsEngine#getBuzz",
    getContentParamData : "com.rdes.engine.news.RDNewsEngine#getContentParam",
    getContentAutoComplete : "com.rdes.engine.news.RDNewsEngine#getContentAutoComplete",
    getContentFilterMetadata : "com.rdes.engine.news.RDNewsEngine#getContentFilterMetadata",
    submitSubscriptionDetailsUrl :"com.rdes.service.rdm.RDMessageHandler#submitSubscriptionDetails",
    getRecommendedContent : "com.rdes.engine.news.RDNewsEngine#getRecommendedContent",
    regenerateEmailCode : "com.rdes.service.rdm.RDMessageHandler#regenerateEmailCode",
    submitPayment : "com.rdes.service.rdm.RDMessageHandler#submitPayment",
    getPaymentStatus : "com.rdes.service.rdm.RDMessageHandler#getPaymentStatus",
    getSubscribeForUpdates : "com.rdes.service.rdm.RDMessageHandler#subscribeForUpdates",
    sendDesktopNotificationSubscription : "com.rdes.service.rdm.RDMessageHandler#subscribeForDesktopNotifications",
    getDesktopNotificationData : "com.rdes.service.rdm.RDMessageHandler#getDesktopNotificationData",
    shareContent : "com.rdes.engine.news.RDNewsEngine#shareContent",
    getPlanCartItems : "com.rdes.service.rdm.RDMessageHandler#getPlanCartItems",
    checkoutCart : "com.rdes.service.rdm.RDMessageHandler#checkoutCart",
    remindPassword : "com.rdes.service.rdm.RDMessageHandler#remindPassword",
    setNewPassword : "com.rdes.service.rdm.RDMessageHandler#resetPassword",
    getPaymentStatus : "com.rdes.service.rdm.RDMessageHandler#getPaymentStatus",
    getProfile : "com.rdes.service.rdm.RDMessageHandler#getUserInfo",
    getLocationsUrl : "com.rdes.engine.news.RDNewsEngine#getLocations",
    submitPaymentInfo : "com.rdes.service.rdm.RDMessageHandler#submitPaymentInfo",
    getPaymentHistory  : "com.rdes.service.rdm.RDMessageHandler#getPaymentHistory",
    getUserSubscriptionWebsite  : "com.rdes.service.rdm.RDMessageHandler#getUserSubscriptionWebsite",
    subscribeForEmailUpdates : "com.rdes.service.rdm.RDMessageHandler#subscribeForEmailUpdates",
    getUserSubscriptionFilter : "com.rdes.engine.news.RDNewsEngine#getUserSubscriptionFilter",
    requestForTrialPlan : "com.rdes.service.rdm.RDMessageHandler#requestForTrialPlan",
    updateLiveStreamStatus : "com.rdes.service.rdm.RDMessageHandler#updateLiveStreamStatus",
    updateLiveReporting : "com.rdes.service.rdm.RDMessageHandler#updateLiveReporting",
    getNewsComments : "com.rdes.engine.news.RDNewsEngine#getNewsComments",
    addNewsComment : "com.rdes.engine.news.RDNewsEngine#addNewsComment",
    validateCouponCode : "com.rdes.service.rdm.RDMessageHandler#validateCouponCode",
    getUserStatus  : "com.rdes.service.rdm.RDMessageHandler#getUserStatus",
    deviceType : "WEB",
    app : "rdes",
    partner : "hocal",
    YOUTUBE_MEDIA_ID_PREFIX : "yt_",
    VIDEO_ID_PREFIX : "video_",
    LOGO_SHARE : "http://www.hocalwire.com/images/logo_share.jpg",
    LOGO : "http://www.hocalwire.com/images/logo.png",
    IMAGE_TYPE_NEWS : 7,
    IMAGE_TYPE_PROFILE : 1,
    monthMap : { 
        "0" : "Jan",
        "1" : "Feb",
        "2" : "Mar",
        "3" : "April",
        "4" : "May",
        "5" : "June",
        "6" : "July",
        "7" : "Aug",
        "8" : "Sep",
        "9" : "Oct",
        "10" : "Nov",
        "11" : "Dec"
    },
    partners : ["nexges"],
    partnersLatLongRadius : {
        "nexges" : {"point_lat":28.6139,"point_long":77.209,"radius":50}
    },
    getMonthDisplay : function(month){
        return this.monthMap[month];
    },
    getString : function(key,defaultV) {
        "use strict";
        if(this[key]) {
            return this[key];
        } else{
             return defaultV;
        }
    },
    isValidString : function(str){
        if(str && str.trim().toLowerCase()!="null"){
            return true;
        }
        return false;
    },
    getRDMGetway : function(externalHost){
        if(externalHost){
            return this.servletRootPrefixExternal+this.rdmGateway;
        } else {
            return this.servletRootPrefix+this.rdmGateway;
        }
        
    },
    getServletRoot : function(prefix){
        return (this.deploymentMode =="development" ? "http://hocalwire.com" : "")+(prefix ? prefix : "/content")+this.servletRoot;
    },
    getImageServerURL : function(partner) {
        // var serverURL = "/content/servlet/RDESController?command=rdm.Picture"+
        // "&sessionId="+this.sessionId+"&app="+this.app+"&partner="+this.partner;
        var sessionId;
        var requestPartner;
        var hasPaidContent=false;
        var CDNUrl = "";
        for(var k in PartnerConfig){
            if(k==partner){
                sessionId = PartnerConfig[k].sessionId;
                requestPartner = k;
                hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                break;
            }
        }
        if(!sessionId) {
            sessionId = this.sessionId;
        }
        if(!requestPartner){
            requestPartner = this.partner;
        }
        if(this.devMode){
            requestPartner = "hocal";
        }
        if(!hasPaidContent && CDNUrl){
            return CDNUrl;
        }else {
            var prefix = (partner && partner=="specialcoveragehindi") ? "/cdncontent" : (partner && partner=="thehawk") ? "/hawkcontent"  : "/content";
            var serverURL = (this.deploymentMode =="development" ? "http://hocalwire.com" : "")+prefix+"/servlet/RDESController?command=rdm.Picture"+"&sessionId="+sessionId+"&app="+this.app+"&partner="+requestPartner;
            return serverURL;
        }
  },
  getPartnerSessionId : function(partner){
    var sessionId = PartnerConfig[partner].sessionId;
    return sessionId;
  }
    
    
};

/**
 * REGEX for url match
 * @type {Object}
 */
var REGEX = {
    NEWS_DETAIL: ':newsTitle([\\w-]+)\\-:newsId([0-9]+)',
    NEWS_LISTING_SINGLE: ':catName([\\w]+)',
    NEWS_LISTING: ':catName([\\w]+)\\-:catType([\\w]+)',
    USER_REFERRER: 'refer-:userId([0-9]+)',
    ORG_INVITE: 'org-:userId([0-9]+)',
    BLOG_DETAILS: ':blogTitle([\\w-]+)\\-:blogId([0-9]+)',
    READ_NEWS_DETAIL: ':newsId([0-9]+)-:referrerId([0-9]+)',
    ASSIGNMENT_DETAIL: 'assignments/:assignmentId([0-9]+)',
};

module.exports.REGEX = REGEX;


module.exports.URL = {
    HOME: {urlStructure: '/', type: 'hocalwire.home'},
    HOME_HINDI: {urlStructure: '/hindi', type: 'hocalwire.home'},
    ABOUT_US: {urlStructure: '/aboutus', type: 'hocalwire.aboutus'},
    CAREERS: {urlStructure: '/careers', type: 'hocalwire.careers'},
    REFERRAL_MAILER: {urlStructure: '/press/referral-mailer', type: 'hocalwire.referral.page'},
    REFERRAL_MAILER_ADWORDS: {urlStructure: '/report-news', type: 'hocalwire.adword.referral.page'},
    USER_REFERRER_DOWNLOAD: {urlStructure: "/"+REGEX.USER_REFERRER, type: 'hocalwire.feferrer'},
    ORG_INVITE_DOWNLOAD: {urlStructure: "/"+REGEX.ORG_INVITE, type: 'hocalwire.feferrer'},
    APP_DOWNLOAD: {urlStructure: "/downloadApp", type: 'hocalwire.news.details'},
    ASSIGNMENT_RELEASE: {urlStructure: '/press/assignment-release', type: 'hocalwire.home'},
    
    NEWS_DETAILS_PAGE: {urlStructure: '/'+REGEX.NEWS_DETAIL, type: 'hocalwire.news.details',cache:true},
    ASSIGNMENTS_DETAILS_PAGE: {urlStructure: '/'+REGEX.ASSIGNMENT_DETAIL, type: 'hocalwire.assignment.details',cache:true},
    NEWS_LISTING_PAGE_SINGLE: {urlStructure: '/'+REGEX.NEWS_LISTING_SINGLE, type: 'hocalwire.news.listing',cache:true},
    NEWS_LISTING_PAGE: {urlStructure: '/'+REGEX.NEWS_LISTING, type: 'hocalwire.news.listing',cache:true},
    NEWS_LISTING_HINDI_PAGE_SINGLE: {urlStructure: '/hindi/'+REGEX.NEWS_LISTING_SINGLE, type: 'hocalwire.news.listing',cache:true},
    NEWS_LISTING_HINDI_PAGE: {urlStructure: '/hindi/'+REGEX.NEWS_LISTING, type: 'hocalwire.news.listing',cache:true},

    NEWS_DETAILS_PAGE_CACHE: {urlStructure: '/admin/news/'+REGEX.NEWS_DETAIL, type: 'hocalwire.news.details.cache'},
    NEWS_LANDING_PAGE_GHAZIABAD: {urlStructure: '/ghaziabad-news', type: 'hocalwire.news.landing'},
    NEWS_LANDING_PAGE_NOIDA: {urlStructure: '/noida-news', type: 'hocalwire.news.landing'},
    NEWS_LANDING_PAGE_GURGAON: {urlStructure: '/gurgaon-news', type: 'hocalwire.news.landing'},
    NEWS_LANDING_PAGE_DELHI: {urlStructure: '/delhi-news', type: 'hocalwire.news.landing'},
    HALL_OF_FAME: {urlStructure: '/hall-of-fame', type: 'hocalwire.hall-of-fame'},
    
    ASSIGNMENTS_LISTING_PAGE: {urlStructure: '/assignments/all-assignments', type: 'hocalwire.assignment.listing',cache:true},
    ASSIGNMENTS_LISTING_PAGE_HINDI: {urlStructure: '/assignments/hindi/all-assignments', type: 'hocalwire.assignment.listing',cache:true},
    
    SMS_MODULE: {urlStructure: '/sms', type: 'hocalwire.home'},
    IMAGE_DOWNLOAD: {urlStructure: '/assignmentImage1', type: 'hocalwire.home'},
    EMAIL_IMAGE_DOWNLOAD: {urlStructure: '/email_logo', type: 'hocalwire.home'}, 
    EMAIL_IMAGE_DOWNLOAD_DANCING: {urlStructure: '/email_dancing_lady', type: 'hocalwire.home'}, 
    PARTNERS_PAGE: {urlStructure: '/partners', type: 'hocalwire.home'},
    BLOG_DETAILS_PAGE: {urlStructure: '/blogs/'+REGEX.BLOG_DETAILS, type: 'hocalwire.blog.details',cache:true},
    BLOG_LISTING_PAGE: {urlStructure: '/blogs', type: 'hocalwire.blog.listing',cache:true},
    READ_NEWS_DETAILS_PAGE: {urlStructure: '/news/'+REGEX.READ_NEWS_DETAIL, type: 'hocalwire.news.details',cache:true},
    POLICIES: {urlStructure: '/policies', type: 'hocalwire.home'},
    PRIVACY_POLICY: {urlStructure: '/privacy-policy', type: 'hocalwire.home'},
    TERMS_CONDITIONS: {urlStructure: '/terms-conditions', type: 'hocalwire.home'},
    PAYMENT_POLICY: {urlStructure: '/payment-policy', type: 'hocalwire.home'},


};
