if(!Hocalwire.CommonJs) {
	Hocalwire.CommonJs = {};
}
if(!Hocalwire.CommonJs.init){
	Hocalwire.CommonJs.init = function(){
		var bindNewsPageTracking = function(){
			var prefix = Hocalwire.PageLoader.getCurrentActivePage()=="HomePage" ? "news-" : Hocalwire.PageLoader.getCurrentActivePage()=="AboutUsPage" ? "about-" : (Hocalwire.PageLoader.getCurrentActivePage()=="NewsDetailsPage" ? "details-" : "404-");
			//header tracking
			var $header = $("#header");
			$header.find(".top_nav a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"header","click",$(this).html());
			});
			$header.find(".brand-logo").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"header","click","logo");
			});
			$header.find(".android").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"header","click","download-app-android");
			});
			$header.find(".ios").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"header","click","download-app-ios");
			});
			$header.find(".js-select-filter").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"header","click","select-location");
			});


			var $navarea = $("#navArea");
			$navarea.find(".navbar-toggle").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"navarea","click","menu");
			});
			$navarea.find(".main_nav a.mobile-cats").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"navarea","click","cat-"+$(this).html());
			});
			$navarea.find(".share-btns").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"navarea","click","share-btn");
			});

			var $newsSection = $("#newsSection");

			$newsSection.find(".news_sticker a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"ticker","click","news");
			});
			$newsSection.find(".social_nav a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"ticker","click","social-"+$(this).attr("data-name"));
			});


			$("#sliderSection .latest_post a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"popular","click","news-top-right");
			});

			var $bottomContent = $("#contentSection .right_content");

			$bottomContent.find(".spost_nav li a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"exemplar","click","news-bottom-right");
			});
			$bottomContent.find(".nav-tabs li a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"tabs","click",$(this).html());
			});
			$bottomContent.find("#category li a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"category","click","tabs-right-"+$(this).html());
			});
			$bottomContent.find("select.catgArchive option a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"category","click","archive-right-"+$(this).html());
			});
			$bottomContent.find("li.feed-subscribe a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"feed","click","subscribe");
			});

			$("#footer tag_nav a").on("click",function(){
				Hocalwire.Services.AnalyticsService.sendGAEvent(prefix+"footer","click","link-"+$(this).html());
			});

		};
		var bindTracking = function(){
		        $("img.powered-by-image").on("click",function(){
		        	//powered by Hocalwire clicked, open hocalwire website in new tab;
		        	Hocalwire.Services.AnalyticsService.sendGAEvent("powered-by","click","partner");
		        	window.open("http://www.hocalwire.com","_blank");
		        });
		        /*************** Footer *****************/
		        $("#footer-facebook").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("footer","submit","facebook");
		        });
		        $("#footer-twitter").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("footer","submit","twitter");
		        });
		        $("#footer-linkedin").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("footer","submit","linkedin");
		        });

		        /*********** home page ***********/
		        
		        $(".js-playstore-android").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("home-page","click","store-android");
		        });
		        $(".js-playstore-ios").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("home-page","click","store-ios");
		        });
		        $(".mobile-cats").on("click",function(){
		        	Hocalwire.Services.AnalyticsService.sendGAEvent("Category","click",$(this).html());
		        });
		        $(".js-menu-btn").on("click",function(){
		        	var $el = $(this);
		        	var $navigation = $(".nav-collapse.collapse");
		        	if($navigation.css("height")=="0px"){  //menu is being opened, trigger
		        		$.addHash("catmenu",function(){
		        			// $navigation.attr("style","height:0px");
		        			$el.trigger("click");
		        		});
		        		$navigation.attr("style","height:"+(window.screen.height-200)+"px");
		        		Hocalwire.Services.AnalyticsService.sendGAEvent("Menu","click","open");

		        	} else {
		        		$.removeHash();
		        		$navigation.attr("style","height:0px");
		        		Hocalwire.Services.AnalyticsService.sendGAEvent("Menu","click","collapse");
		        	}
		        });
		       	$(".js-nav-report-news").on("click",function(){
		            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","report-news");
		        });
				        
		        
	    }
		
		$(window).off("resize");
		// $(window).off("scroll");
		bindTracking();
		bindNewsPageTracking();
		var lastId,
	    topMenu = $("#top-navigation"),
	    topMenuHeight = topMenu.outerHeight(),
	        // All list items
	        menuItems = topMenu.find("a"),
	        // Anchors corresponding to menu items
	        scrollItems = menuItems.map(function () {
	            var href = $(this).attr("href");
	            if(href.indexOf("#") === 0){
	                var item = $($(this).attr("href"));
	                if (item.length) {
	                    return item;
	                }
	            }
	        });
	    $("#popup-container").off("click");
	    $("#popup-container").on("click",".popup-overlay",function(){
	    	$.hidePopup();

	    });
	    $(".js-sing-up-btn").on("click",function(){
	    	Hocalwire.Services.AnalyticsService.sendGAEvent("download-app","click","mobile-footer");
	    });
	    $(".todays-date").html(Utils.getFormatedTodaysDate());
	   	var onPageLoadActions = function(){
			    var ignoreInterstitial = Hocalwire.Services.GlobalService.getCookie("IGNORE_INTERSTITIAL");
			    if(!ignoreInterstitial || ignoreInterstitial!="1"){
			    	//download interstitial here
			    	var xhrUrl = "/xhr/getInterstitial";
			    	Hocalwire.Services.get(xhrUrl)
		        		.then(function(data) {
		         			if(!data){
		         				return;
		         			}   
		         			
		         			$("#interstitial-content").html(data);
		         			// $.openPopup("#interstitial");
		        		},
				        function() {
				            
				        });
			    }
			};
			if(Hocalwire.MOBILE_DETAILS.Mobile){
				$.addPageLoad(onPageLoadActions,true);
			}
			var onPageLoadActionsRecuring = function(){
				var containerWidth = $('.section .container').width();
			    //Resize animated triangle
			    $(".triangle").css({
			        "border-left": containerWidth / 2 + 'px outset transparent',
			        "border-right": containerWidth / 2 + 'px outset transparent'
			    });
			};
	    
	 	$.addPageLoad(onPageLoadActionsRecuring);
	    
	    $("#content").on("click",".js-do-not-show-interstitial",function(){
	    	Hocalwire.Services.GlobalService.setCookie("IGNORE_INTERSTITIAL","1",{"max-age":(24*60*60*30),"path":"/"});
	    	Hocalwire.Services.AnalyticsService.sendGAEvent("interstitial","click","do-not-show");
	    	$('#interstitial-content').addClass('hide');
	    	// $.hidePopup();
	    });
	    
	   	$("#content").on("click",".download-app-interstitial",function(){
	    	// Hocalwire.Services.GlobalService.setCookie("IGNORE_INTERSTITIAL","1",{"max-age":(24*60*60*30),"path":"/"});
	    	$('#interstitial-content').addClass('hide');
	    	Hocalwire.Services.AnalyticsService.sendGAEvent("interstitial","click","download");
	    	// $.hidePopup();
	    });
	    
	    $("#content").on("click",".js-close-cross",function(){
	    	$('#interstitial-content').addClass('hide');
	    	Hocalwire.Services.AnalyticsService.sendGAEvent("interstitial","click","close");
	    });
	    //Get width of container
	    var containerWidth = $('.section .container').width();
	    //Resize animated triangle
	    // $(".triangle").css({
	    //     "border-left": containerWidth / 2 + 'px outset transparent',
	    //     "border-right": containerWidth / 2 + 'px outset transparent'
	    // });
	    $(window).resize(function () {
	        containerWidth = $('.container').width();
	        $(".triangle").css({
	            "border-left": containerWidth / 2 + 'px outset transparent',
	            "border-right": containerWidth / 2 + 'px outset transparent'
	        });
	    });
	    // Bind to scroll
	    $(window).scroll(function () {

	        //Display or hide scroll to top button 
	        if ($(this).scrollTop() > 100) {
	            $('.scrollup').fadeIn();
	        } else {
	            $('.scrollup').fadeOut();
	        }

	        if ($(this).scrollTop() > 130) {
	            $('.navbar').addClass('navbar-fixed-top animated fadeInDown');
	        } else {
	            $('.navbar').removeClass('navbar-fixed-top animated fadeInDown');
	        }

	        // Get container scroll position
	        var fromTop = $(this).scrollTop() + topMenuHeight + 10;

	        // Get id of current scroll item
	        var cur = scrollItems.map(function () {
	            if ($(this).offset().top < fromTop)
	                return this;
	        });

	        // Get the id of the current element
	        cur = cur[cur.length - 1];
	        var id = cur && cur.length ? cur[0].id : "";

	        if (lastId !== id) {
	            lastId = id;
	            // Set/remove active class
	            menuItems
	            .parent().removeClass("active")
	            .end().filter("[href=#" + id + "]").parent().addClass("active");
	        }
	    });
		
        $('#top-navigation a.nav_tab').each(function () {
            var $target = $($(this).attr("target-selector"));
                if ($target) {

                    $(this).click(function () {

                        //Hack collapse top navigation after clicking
                        topMenu.parent().attr('style', 'height:0px').removeClass('in'); //Close navigation
                        $('.navbar .btn-navbar').addClass('collapsed');

                        var targetOffset = $target.offset().top - 63;
                        $('html, body').animate({
                            scrollTop: targetOffset
                        }, 800);
                        return false;
                    });
                }
            
        });

        $(".js-sing-up-btn").on("click",function(){

            Hocalwire.Services.AnalyticsService.sendGAEvent("home-page","click","join-as-journalist");
            window.open($(this).attr("data-href"),"_blank");
        });
	}
}
if(!$.fn){
	$.fn = {};
}
if(!$.fn.showHide){
	
	//Function for show or hide portfolio desctiption.
    $.fn.showHide = function (options) {
        var defaults = {
            speed: 1000,
            easing: '',
            changeText: 0,
            showText: 'Show',
            hideText: 'Hide'
        };
        var options = $.extend(defaults, options);
        $(this).click(function () {
            $('.toggleDiv').slideUp(options.speed, options.easing);
            var toggleClick = $(this);
            var toggleDiv = $(this).attr('rel');
            $(toggleDiv).slideToggle(options.speed, options.easing, function () {
                if (options.changeText == 1) {
                    $(toggleDiv).is(":visible") ? toggleClick.text(options.hideText) : toggleClick.text(options.showText);
                }
            });
            return false;
        });
    };

}
