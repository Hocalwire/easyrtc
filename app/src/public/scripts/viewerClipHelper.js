(function() {
    if(window.hasEPaperSmartTools){
        document.addEventListener("PDF_VIEWER_VIEW_LOADED", function(e) {
            init();
        });    
    }
        
    window.epaperData = {};
    window.epaperData.cords = {}; 
    window.epaperData.epaperId = $("#epaper-data-wrapper").data("id");
    function init(){

        var middleToolbar = $("#toolbarViewerMiddle");
        var myCustomToolbar = $("<div class='custom_toolbar'></div>");
        var btn = '<span class="js-clip-epaper-ear-btn clip-epaper-ear-btn nav-group hidden-xs clipbtn" style=""><img src="/images/scissor.png" style=""><a id="createclip" class="btn btn-default clip" type="button" style="">Clip</a></span>';
        middleToolbar.append($(btn));
        var a = $(".openFile");
        a.attr("title","Download Current Page");
        a.removeClass("openFile").addClass("save-current-page");
        a.attr("id","save-current-page");
        $("#openFile").off("click");
        $("#secondaryOpenFile").onclick = function(){
            return false;
        }
        $(".save-current-page").off("click");
        $(".save-current-page").find("*").off();
        $("body").off("click",".save-current-page");
        $("body").on("click",".save-current-page",function(e){
            e.stopPropagation();
            saveCurrentPage();   
        });

        // $(".openFile,#secondaryOpenFile").on("click",function(e){
        //     e.stopPropagation();
        //     saveCurrentPage();   
            
        // });
        $(".js-clip-epaper-ear-btn").on("click",function(e){
            e.stopPropagation();
            clipCurrentPage();
        });
    }
    function getSocialIcons(){
        var social='<div class="arcticle-social-share"><span class="shareArticle clearfix"><span class="newsSocialIcons clearfix"><ul class="blog-share-socials"><li class="facebook"><a title="Facebook" href="http://www.facebook.com/share.php?u=##NEWS_ABSOLUTE_URL##" target="_blank"><img src="/images/social/facebook_icon.png" class="fb_social_icon_image social_icon_image"></a></li><li class="twitter"><a title="Twitter" href="http://twitter.com/intent/tweet?url=##NEWS_ABSOLUTE_URL_ENCODED##&amp;text=##NEWS_ENCODED_TITLE##" target="_blank"><img src="/images/social/twitter_icon.png" class="twitter_social_icon_image social_icon_image"></a></li><li class="googleplus"><a title="Google Plus" href="https://plus.google.com/share?url=##NEWS_ABSOLUTE_URL##" target="_blank"><img src="/images/social/gplus_icon.png" class="gplus_social_icon_image social_icon_image"></a></li><li class="linkedin"><a title="LinkedIn" href="http://www.linkedin.com/shareArticle?mini=true&amp;url=##NEWS_ABSOLUTE_URL##&amp;title=##NEWS_TITLE##" target="_blank"><img src="/images/social/linkedin_icon.png" class="linkedin_social_icon_image social_icon_image"></a></li><li class="tumblr"><a title="Tumblr" href="http://www.tumblr.com/share/link?url=##NEWS_ABSOLUTE_URL##&amp;name=##NEWS_TITLE##" target="_blank"><img src="/images/social/tumblr_icon.png" class="tumblr_social_icon_image social_icon_image"></a></li><li class="pinterest"><a title="Pinterest" href="http://pinterest.com/pin/create/button/?url=##NEWS_ABSOLUTE_URL##" target="_blank"><img src="/images/social/pintrest_icon.png" class="pintrest_social_icon_image social_icon_image"></a></li><li class="email"><a href="javascript: void(0);" data-domain="##DOMAIN##" data-url="##NEWS_ABSOLUTE_URL##" title="Share by Email" class="js-share-article-by-email"><img src="/images/social/mail_icon.png"></a></li><li class="print"><a href="javascript: void(0)" title="Print" onclick="$('+"'#modal-container #modal_img'"+').print()"><img src="/images/social/print_icon.png"></a></li></ul></span></span><div class="clear-float"></div></div>';
        return social;
    }
    function insertSocialItems(modal,url,title) {
        var social = getSocialIcons();
        var domain = $("#content").attr("data-root");
        var encodedUrl = encodeURIComponent(url);
        var title = encodeURIComponent(title);
        social = social.replace(/##NEWS_ABSOLUTE_URL##/g, url);
        social = social.replace(/##NEWS_ABSOLUTE_URL_ENCODED##/g, encodedUrl);
        social = social.replace(/##DOMAIN##/g, domain);
        social = social.replace(/##NEWS_TITLE##/g, title);
        // social = social.replace(/##NEWS_TITLE_##/g, title);

        modal.find("#modal_social").html(social).removeClass("hide");
        modal.find("#modal_bottom").html("<span class='link-to-share'>Link : <a href='"+url+"'>"+url+"</a></span>").removeClass("hide");
    }
    function getModalHtml(url,title){
        if(!title){
            title = "Share you clip now"
        }
        var modal = '<div id="modal-container"><div id="epaper_modal" class="reveal-modal">';
        modal+='<span id="modal_close" class="close-btn model-item1">X</span>';
        modal+='<h4 id="modal_heading" class="hide model-item"></h4>';
        modal+='<p id="modal_desc" class="hide model-item"></p>';
        modal+='<div id="modal_img_parent"><img id="modal_img" class="hide model-item"></img></div>';
        modal+='<iframe id="modal_iframe" class="hide model-item"></iframe>';
        modal+='<div id="modal_bottom" class="hide model-item"></div>';
        modal+='<div id="modal_social" class="hide model-item"></div>';
        modal+="</div></div>";
        return modal;

    }
    function getMediaUrl(mediaId,rootUrl,partner,type,mediaRoot){
        var prefix = (partner && partner=="specialcoveragehindi") ? "/content" : (partner && partner=="thehawk") ? "/hawkcontent"  : "/content";
        var serverURL = prefix+"/servlet/RDESController?command=rdm.Picture"+"&sessionId="+$("#content").data("sessionid")+"&app=rdes&partner="+partner;
        var url = (rootUrl ? rootUrl : "")+serverURL+"&type=20&uid="+mediaId;
        if(type && type=="CLOUD"){
            url = mediaRoot+"/"+mediaId;
        }
        return url;
    }
    function getDownloaUrl(page){
        var rootUrl = $("#content").attr("data-root");
        var id = window.epaperData.epaperId;
        var partner = $("#content").data("partner");
        var prefix = (partner && partner=="specialcoveragehindi") ? "/content" : (partner && partner=="thehawk") ? "/hawkcontent"  : "/content";
        var serverURL = prefix+"/servlet/RDESController?command=rdm.ServletDownloadEPaper"+"&sessionId="+$("#content").data("sessionid")+"&app=rdes&partner="+partner;
        var url = (rootUrl ? rootUrl : "")+serverURL+"&type=20&epaperId="+window.epaperData.epaperId+"&pageNo="+page;
        return url;
    }
    function uploadImage(data,modal,title,canvas){
            var partner = $("#content").data("partner");
            var sessionid = $("#content").data("sessionid");
            var domain = $("#content").attr("data-root");
            var uploadurl = domain+"/content/servlet/RDESController?command=rdm.FileUpload&app=rdes&partner="+partner+"&uploadType=20&sessionId="+sessionid+"&disable_compress=true&contentId="+window.epaperData.epaperId;
        // window.open(data,"_blank");
        var formdata = new FormData();
        // var canvasImage = document.getElementById("c");
    
        var blobBin = atob(data.split(',')[1]);
        var array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file=new Blob([new Uint8Array(array)], {type: 'image/png'});

        formdata.append("epaper_clip_data", file);
        
       
        $.ajax({
            data: formdata,
            type: 'POST',
            async:true,
            
            url: uploadurl,
            cache: false,
            contentType: false,
            processData: false,
           
            xhr: function()
            {
             
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
                
            },
            // 19286eOV4cg5PVhUgv3eEx8bbr8qNAi3pBbIh0810806
            success: function(datax) {
                var domain = $("#content").attr("data-root");
                var url = domain+"/clip-preview/"+datax;
                var CDNURL=$("#content").attr("data-cdnurl");
                var mediaUrl=CDNURL && CDNURL!="undefined" ? getMediaUrl(datax,domain,partner,"CLOUD",CDNURL) : getMediaUrl(datax,domain,partner);
                insertSocialItems(modal,url,title);
                modal.find("#modal_img").attr("src",mediaUrl).removeClass("hide");
                sendEmailBind();
                console.log(datax);
            },
            error: function(error) {
                // var datax = "19286u0YZ2ruSw96Nk9W2db782iZgCeaAqjVv3432672";
                // var domain = $("#content").attr("data-root");
                // var url = domain+"/clip-preview/"+datax;
                // var CDNURL=$("#content").attr("data-cdnurl");
                // var mediaUrl=CDNURL && CDNURL!="undefined" ? getMediaUrl(datax,domain,partner,"CLOUD",CDNURL) : getMediaUrl(datax,domain,partner);
                // insertSocialItems(modal,url,title);
                // modal.find("#modal_img").attr("src",mediaUrl).removeClass("hide");
                // console.log(datax);
                // sendEmailBind();
                alert("error in saving clip");
                // var domain = $("#content").attr("data-root");
                // var datax="";
                // var url = domain+"/clip-preview/"+datax;
                // var mediaUrl="http://cloud.millenniumpost.in/"+datax;
                // insertSocialItems(modal,url,title);
                // modal.find("#modal_img").attr("src",mediaUrl).removeClass("hide");
            }
        });
            
    }
    function hideModal(){
        $("#modal-container").hide();
    }
    function showModal(img,canvas){
        
        if($("#modal-container").length){
            var modal = $("#modal-container");
            modal.show();
            modal.find(".model-item").addClass("hide");
            modal.show();
            modal.find("#modal_img").attr("src","/images/fancybox_loading.gif").removeClass("hide");
            modal.find("#modal_close").off("click");
            modal.find("#modal_close").on("click",function(){
                hideModal();
            });
            uploadImage(img,modal,title,canvas);
            return;
               
        }
        var title = "EPaper Clip";

        var modaldata = getModalHtml();

        $("#MODAL_DIALOG_PLACEHOLDER").html($(modaldata));
        var modal = $("#modal-container");
        modal.find("#modal_close").off("click");
        modal.find("#modal_close").on("click",function(){
            hideModal();
        });
        modal.show();
        modal.find("#modal_img").attr("src","/images/fancybox_loading.gif").removeClass("hide");
        uploadImage(img,modal,title,canvas);
        
    }
    function showTextLayer(){
        var currentPage = getCurrentPage();
        var pageCanvas = $("#page"+currentPage);
        var textLayer = pageCanvas.parent().parent().find(".textLayer");
        textLayer.show();
    }
    function sendEmailBind(){
        var $sendEmail = $(".js-share-article-by-email");
        if(!$sendEmail || !$sendEmail.length){
            return;
        }
        $sendEmail.off("click");
        $sendEmail.on("click",function(){
            var $e = $(this);
            var url = $e.data("url");
            var domain = $e.data("domain");
            if(url.indexOf(domain)==0){
                url = url.substring(url.indexOf(domain)+domain.length,url.length);    
            }
            
            var finalUrl = domain+"/share/send-article-by-email?url="+url;
            var height = 500;
            var width = 800;
            if(Hocalwire.isTabletSize){
                height=400;
                width=600;
            } else if(Hocalwire.isMobileSize){
                height=300;
                width=300;
            }
            
            if(url){
                window.open(finalUrl,"Share By Email","height="+height+",width="+width);
            }
        });
    }
    function clipCurrentPage(){
        var currentPage = getCurrentPage();
        var pageCanvas = $("#page"+currentPage);
        var textLayer = pageCanvas.parent().parent().find(".textLayer");
        textLayer.hide();
        var offset = pageCanvas.offset();
        var left = parseInt(pageCanvas.width()/2)-100;
        var top = parseInt(pageCanvas.height()/4)-100;
        var right = left+200;
        var bottom = top+200;
        PDFViewerApplication.pdfViewer._setScale("page-width");

        pageCanvas.Jcrop({
            onChange: function(a,b,c){ 
                window.epaperData.cords = a;
            },
            onSelect: function(a,b,c){ 
                // console.log(a);
            },
            okName : "Share",
            cancelName : "X",
            okCallback : function(){
                console.log("OK PRESSED");
                var cPagge = getCurrentPage();
                var pageCanvas = $("#page"+currentPage);

                var ctx=pageCanvas[0].getContext("2d");
                var canvas = document.createElement('canvas');
                var dx=0,dy=0,
                dw=window.epaperData.cords.w,
                dh=window.epaperData.cords.h;
                var sx=window.epaperData.cords.x,
                sy=window.epaperData.cords.y,
                sw=window.epaperData.cords.w,
                sh=window.epaperData.cords.h;

                canvas.width = dw;
                canvas.height = dh;
                canvas.getContext('2d').drawImage(pageCanvas[0],sx,sy,sw,sh,dx,dy,dw,dh);
                var result = canvas.toDataURL("image/png");
                // var img = ctx.getImageData(window.epaperData.cords.x1,window.epaperData.cords.y1,window.epaperData.cords.x2,window.epaperData.cords.y2);
                // window.open(result,"_blank");
                showTextLayer();
                showModal(result,canvas);
            },
            saveCallback : function(){
                var cPagge = getCurrentPage();
                var pageCanvas = $("#page"+currentPage);

                var ctx=pageCanvas[0].getContext("2d");
                var canvas = document.createElement('canvas');
                var dx=0,dy=0,
                dw=window.epaperData.cords.w,
                dh=window.epaperData.cords.h;
                var sx=window.epaperData.cords.x,
                sy=window.epaperData.cords.y,
                sw=window.epaperData.cords.w,
                sh=window.epaperData.cords.h;

                canvas.width = dw;
                canvas.height = dh;
                canvas.getContext('2d').drawImage(pageCanvas[0],sx,sy,sw,sh,dx,dy,dw,dh);
                var result = canvas.toDataURL("image/png");
                saveClip(result,"epaper-clip-page-no-"+currentPage);
            },
            cancelCallback : function(){
                console.log("Cancel Pressed");
                showTextLayer();
            },
            setSelect: [top, left,right, bottom],
            allowSelect: true,
            allowMove: true,
            allowResize: true,
            aspectRatio: 0
        });
        // var ias = pageCanvas.imgAreaSelect({
        //     handles: true,
        //     show:true,
        //     x1:left,y1:top,x2:right,y2:bottom,
        //     onSelectEnd: function(img,selection){
        //         window.epaperData.cords = selection;
        //     },
        //     loadCallback : function(){
                
        //     },
        //     okName : "Share",
        //     cancelName : "Close",
        //     okCallback : function(){
        //         console.log("OK PRESSED");
        //         var cPagge = getCurrentPage();
        //         var pageCanvas = $("#page"+currentPage);

        //         var ctx=pageCanvas[0].getContext("2d");
        //         var canvas = document.createElement('canvas');
        //         var dx=0,dy=0,
        //         dw=window.epaperData.cords.x2-window.epaperData.cords.x1,
        //         dh=window.epaperData.cords.y2-window.epaperData.cords.y1;;;
        //         var sx=window.epaperData.cords.x1,
        //         sy=window.epaperData.cords.y1,
        //         sw=window.epaperData.cords.width,
        //         sh=window.epaperData.cords.height;

        //         canvas.width = 3*dw;
        //         canvas.height = 3*dh;
        //         canvas.getContext('2d').drawImage(pageCanvas[0],sx,sy,sw,sh,dx,dy,3*dw,3*dh);
        //         var result = canvas.toDataURL("image/png");
        //         // var img = ctx.getImageData(window.epaperData.cords.x1,window.epaperData.cords.y1,window.epaperData.cords.x2,window.epaperData.cords.y2);
        //         // window.open(result,"_blank");
        //         showModal(result,canvas);
        //     },
        //     cancelCallback : function(){
        //         console.log("Cancel Pressed");
        //     }
        // });
        
    }
    function saveCurrentPage(){
        var currentPage = getCurrentPage();
        window.open(getDownloaUrl(currentPage),"_blank");
    }
    function saveClip(base64,fileName){
            var link = document.createElement("a");
            link.setAttribute("href", base64);
            link.setAttribute("download", fileName);
            link.click();
            window.open(base64,"_blank");
    }
    function getCurrentPage(){
        var bookmarkBtn = $("#viewBookmark");
        var hrefV = bookmarkBtn.attr("href");
        var page = -1;
        var i1 = hrefV.indexOf("page=");
        var i2 = hrefV.indexOf("&");
        if(i2<0){
            page = hrefV.substring(i1+5,hrefV.length);
        } else {
            page =hrefV.substring(i1+5,i2); 
        }
        console.log("page is:"+page);
        return page;
    }
})();