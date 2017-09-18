// Generated on 2014-04-28 using generator-mobile 1.0.0-alpha.1
'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 5000;


module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        src: 'src/public',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        // TODO: Make this conditional
        watch: {
            compass: {
                files: ['<%= yeoman.src %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.src %>/*.html',
                    '{.tmp,<%= yeoman.src %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.src %>}/scripts/{,*/}*.js',
                    '<%= yeoman.src %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        autoshot: {
            dist: {
                options: {
                    path: '/screenshots/',
                    remote : {
                        files: [
                            { src: 'http://localhost:<%= express.options.port %>', dest: 'app.jpg'}
                        ]
                    },
                    viewport: ['320x480','480x320','384x640','640x384','602x963','963x602','600x960','960x600','800x1280','1280x800','768x1024','1024x768']
                }
            }
        },

        responsive_images: {
            dev: {
                options: {
                    sizes: [
                        {
                            width: 320,
                        },
                        {
                            width: 640
                        },
                        {
                            width: 1024
                        }
                    ]
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.src %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= express.options.port %>'
            },
            nexus4:{
                path: 'http://www.browserstack.com/start#os=android&os_version=4.2&device=LG+Nexus+4&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
            },
            nexus7:{
                path: 'http://www.browserstack.com/start#os=android&os_version=4.1&device=Google+Nexus+7&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
            },
            iphone5:{
                path: 'http://www.browserstack.com/start#os=ios&os_version=6.0&device=iPhone+5&speed=1&start=true&url=http://rnikitin.github.io/examples/jumbotron/'
            }

        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*',
                        '<%= yeoman.src %>/styles/*.min.*.css',
                        '<%= yeoman.src %>/styles/themespecialcoverage.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoverageinline.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoveragefile.min.css',
                        '<%= yeoman.src %>/styles/themefox.min.css',
                        '<%= yeoman.src %>/styles/themedragon.min.css',
                        '<%= yeoman.src %>/styles/themezebra.min.css',
                        '<%= yeoman.src %>/styles/themeloon.min.css',
                        '<%= yeoman.src %>/styles/themelooninline.min.css',
                        '<%= yeoman.src %>/styles/themeloonfile.min.css',
                        '<%= yeoman.src %>/styles/themeeagle.min.css',
                        '<%= yeoman.src %>/styles/themeape.min.css',
                        '<%= yeoman.src %>/styles/themeduck.min.css',
                        '<%= yeoman.src %>/styles/thememouse.min.css',
                        '<%= yeoman.src %>/styles/themedolphin.min.css',
                        '<%= yeoman.src %>/styles/themedolphininline.min.css',
                        '<%= yeoman.src %>/styles/themedolphinfile.min.css',
                        '<%= yeoman.src %>/styles/themekangarooinline.min.css',
                        '<%= yeoman.src %>/styles/themekangaroofile.min.css',
                        '<%= yeoman.src %>/styles/themekangaroo.min.css',
                        '<%= yeoman.src %>/styles/themebatinline.min.css',
                        '<%= yeoman.src %>/styles/themebatfile.min.css',
                        '<%= yeoman.src %>/styles/themebat.min.css',
                        '<%= yeoman.src %>/styles/themebeeinline.min.css',
                        '<%= yeoman.src %>/styles/themebeefile.min.css',
                        '<%= yeoman.src %>/styles/themebee.min.css',
                        '<%= yeoman.src %>/styles/themebearinline.min.css',
                        '<%= yeoman.src %>/styles/themebearfile.min.css',
                        '<%= yeoman.src %>/styles/themebear.min.css',
                        '<%= yeoman.src %>/styles/themewolfinline.min.css',
                        '<%= yeoman.src %>/styles/themewolffile.min.css',
                        '<%= yeoman.src %>/styles/themewolf.min.css',
                        '<%= yeoman.src %>/styles/themecobrainline.min.css',
                        '<%= yeoman.src %>/styles/themecobrafile.min.css',
                        '<%= yeoman.src %>/styles/themecobra.min.css',
                        '<%= yeoman.src %>/styles/themesnakeinline.min.css',
                        '<%= yeoman.src %>/styles/themesnakefile.min.css',
                        '<%= yeoman.src %>/styles/themesnake.min.css',
                        '<%= yeoman.src %>/styles/themefish.min.css',
                        '<%= yeoman.src %>/styles/themeservice.min.css',
                        '<%= yeoman.src %>/styles/commoncss.min.css',
                        '<%= yeoman.src %>/styles/reporterform.min.css',
                        '<%= yeoman.src %>/styles/pdfviewer.min.css',
                        '<%= yeoman.src %>/styles/cartpage.min.css',
                        '<%= yeoman.src %>/styles/cartpagewithoutbootstrap.min.css',
                        '<%= yeoman.src %>/styles/recommended.min.css',
                        '<%= yeoman.src %>/styles/allgallery.min.css',
                        '<%= yeoman.src %>/styles/sendemail.min.css',
                        '<%= yeoman.src %>/scripts/*.min.*.js',
			            '<%= yeoman.src %>/styles/themeelephantinle.min.css',
                        '<%= yeoman.src %>/styles/themeelephantfile.min.css',
                        '<%= yeoman.src %>/styles/themeturtle.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedinline.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedfile.min.css',
                        
                    ]
                }]
            },
            server: '.tmp',
            dist_final: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.src %>/styles/themebatinline.min.css',
                        '<%= yeoman.src %>/styles/themebatfile.min.css',
                        '<%= yeoman.src %>/styles/themebat.min.css',
                        '<%= yeoman.src %>/styles/themebeeinline.min.css',
                        '<%= yeoman.src %>/styles/themebeefile.min.css',
                        '<%= yeoman.src %>/styles/themebee.min.css',
                        '<%= yeoman.src %>/styles/themebearinline.min.css',
                        '<%= yeoman.src %>/styles/themebearfile.min.css',
                        '<%= yeoman.src %>/styles/themebear.min.css',
                        '<%= yeoman.src %>/styles/themewolfinline.min.css',
                        '<%= yeoman.src %>/styles/themewolffile.min.css',
                        '<%= yeoman.src %>/styles/themewolf.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoverage.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoverageinline.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoveragefile.min.css',
                        '<%= yeoman.src %>/styles/themefox.min.css',
                        '<%= yeoman.src %>/styles/themedragon.min.css',
                        '<%= yeoman.src %>/styles/themezebra.min.css',
                        '<%= yeoman.src %>/styles/themeloon.min.css',
                        '<%= yeoman.src %>/styles/themelooninline.min.css',
                        '<%= yeoman.src %>/styles/themeloonfile.min.css',
                        '<%= yeoman.src %>/styles/themekangarooinline.min.css',
                        '<%= yeoman.src %>/styles/themekangaroofile.min.css',
                        '<%= yeoman.src %>/styles/themekangaroo.min.css',
                        '<%= yeoman.src %>/styles/themeeagle.min.css',
                        '<%= yeoman.src %>/styles/thememouse.min.css',
                        '<%= yeoman.src %>/styles/themeape.min.css',
                        '<%= yeoman.src %>/styles/themeduck.min.css',
                        '<%= yeoman.src %>/styles/themecow.min.css',
                        '<%= yeoman.src %>/styles/themedolphin.min.css',
                        '<%= yeoman.src %>/styles/themedolphininline.min.css',
                        '<%= yeoman.src %>/styles/themedolphinfile.min.css',
                         '<%= yeoman.src %>/styles/themecobrainline.min.css',
                        '<%= yeoman.src %>/styles/themecobrafile.min.css',
                        '<%= yeoman.src %>/styles/themecobra.min.css',
                        '<%= yeoman.src %>/styles/themesnakeinline.min.css',
                        '<%= yeoman.src %>/styles/themesnakefile.min.css',
                        '<%= yeoman.src %>/styles/themesnake.min.css',
                        '<%= yeoman.src %>/styles/themefish.min.css',
                        '<%= yeoman.src %>/styles/themeservice.min.css',
                        '<%= yeoman.src %>/styles/commoncss.min.css',
                        '<%= yeoman.src %>/styles/reporterform.min.css',
                        '<%= yeoman.src %>/styles/pdfviewer.min.css',
                        '<%= yeoman.src %>/styles/cartpage.min.css',
                        '<%= yeoman.src %>/styles/cartpagewithoutbootstrap.min.css',
                        '<%= yeoman.src %>/styles/recommended.min.css',
                        '<%= yeoman.src %>/styles/allgallery.min.css',
                        '<%= yeoman.src %>/styles/sendemail.min.css',
                        '<%= yeoman.src %>/styles/themeelephantinline.min.css',
                        '<%= yeoman.src %>/styles/themeelephantfile.min.css',
                        '<%= yeoman.src %>/styles/themepandainline.min.css',
                        '<%= yeoman.src %>/styles/themepandafile.min.css',
                        '<%= yeoman.src %>/styles/themepanda.min.css',
                        '<%= yeoman.src %>/styles/themeturtle.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedinline.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedfile.min.css',
                    ]
                }]
            }
        },
        browser_sync: {
            dev: {
                bsFiles: {
                    src : '<%= yeoman.src %>/styles/style.css'
                },
                options: {
                    watchTask: false,
                    debugInfo: true,
                    // Change to 0.0.0.0 to access externally
                    host: 'http://localhost:<%= express.options.port %>',
                    server: {
                        baseDir: '<%= yeoman.src %>'
                    },
                    ghostMode: {
                        clicks: true,
                        scroll: true,
                        links: true,
                        forms: true
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                '<%= yeoman.src %>/scripts/{,*/}*.js',
                '!<%= yeoman.src %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= express.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.src %>',
                cssDir: '.tmp',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.src %>/images',
                javascriptsDir: '<%= yeoman.src %>/scripts',
                /*fontsDir: '<%= yeoman.src %>/styles/fonts',*/
                importPath: '<%= yeoman.src %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                // relativeAssets: false
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: yeomanConfig.app + '/scripts',
                    optimize: 'none',
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        filerev: {
            styles: {
                src: [
                    '.tmp/styles/{,*/}*.min.css'
                    //'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    //'<%= yeoman.dist %>/fonts/*'
                ],
                dest :'<%= yeoman.src %>/styles/'
            },
            scripts: {
                src: [
                    '.tmp/scripts/{,*/}*.min.js',
                ],
                dest :'<%= yeoman.src %>/scripts/'
            }
        },
        clean_final: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.src %>/styles/themebatinline.min.css',
                        '<%= yeoman.src %>/styles/themebatfile.min.css',
                        '<%= yeoman.src %>/styles/themebat.min.css',
                        '<%= yeoman.src %>/styles/themebeeinline.min.css',
                        '<%= yeoman.src %>/styles/themebeefile.min.css',
                        '<%= yeoman.src %>/styles/themebee.min.css',
                        '<%= yeoman.src %>/styles/themebearinline.min.css',
                        '<%= yeoman.src %>/styles/themebearfile.min.css',
                        '<%= yeoman.src %>/styles/themebear.min.css',
                        '<%= yeoman.src %>/styles/themewolfinline.min.css',
                        '<%= yeoman.src %>/styles/themewolffile.min.css',
                        '<%= yeoman.src %>/styles/themewolf.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoverage.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoverageinline.min.css',
                        '<%= yeoman.src %>/styles/themespecialcoveragefile.min.css',
                        '<%= yeoman.src %>/styles/themefox.min.css',
                        '<%= yeoman.src %>/styles/themedragon.min.css',
                        '<%= yeoman.src %>/styles/themezebra.min.css',
                        '<%= yeoman.src %>/styles/themeloon.min.css',
                        '<%= yeoman.src %>/styles/themelooninline.min.css',
                        '<%= yeoman.src %>/styles/themeloonfile.min.css',
                        '<%= yeoman.src %>/styles/themeeagle.min.css',
                        '<%= yeoman.src %>/styles/thememouse.min.css',
                        '<%= yeoman.src %>/styles/themeape.min.css',
                        '<%= yeoman.src %>/styles/themeduck.min.css',
                        '<%= yeoman.src %>/styles/themecow.min.css',
                        '<%= yeoman.src %>/styles/themedolphin.min.css',
                        '<%= yeoman.src %>/styles/themedolphininline.min.css',
                        '<%= yeoman.src %>/styles/themedolphinfile.min.css',
                        '<%= yeoman.src %>/styles/themekangarooinline.min.css',
                        '<%= yeoman.src %>/styles/themekangaroofile.min.css',
                        '<%= yeoman.src %>/styles/themekangaroo.min.css',
                        '<%= yeoman.src %>/styles/themecobrainline.min.css',
                        '<%= yeoman.src %>/styles/themecobrafile.min.css',
                        '<%= yeoman.src %>/styles/themecobra.min.css',
                        '<%= yeoman.src %>/styles/themesnakeinline.min.css',
                        '<%= yeoman.src %>/styles/themesnakefile.min.css',
                        '<%= yeoman.src %>/styles/themesnake.min.css',
                        '<%= yeoman.src %>/styles/themefish.min.css',
                        '<%= yeoman.src %>/styles/themeservice.min.css',
                        '<%= yeoman.src %>/styles/commoncss.min.css',
                        '<%= yeoman.src %>/styles/reporterform.min.css',
                        '<%= yeoman.src %>/styles/pdfviewer.min.css',
                        '<%= yeoman.src %>/styles/cartpage.min.css',
                        '<%= yeoman.src %>/styles/cartpagewithoutbootstrap.min.css',
                        '<%= yeoman.src %>/styles/recommended.min.css',
                        '<%= yeoman.src %>/styles/allgallery.min.css',
                        '<%= yeoman.src %>/styles/sendemail.min.css',
                        '<%= yeoman.src %>/styles/themeelephantinline.min.css',
                        '<%= yeoman.src %>/styles/themeelephantfile.min.css',
                        '<%= yeoman.src %>/styles/themepandainline.min.css',
                        '<%= yeoman.src %>/styles/themepandafile.min.css',
                        '<%= yeoman.src %>/styles/themepanda.min.css',
                        '<%= yeoman.src %>/styles/themeturtle.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedinline.min.css',
                        '<%= yeoman.src %>/styles/themefishwolfcombinedfile.min.css',
                        
                    ]
                }]
            }
            
        },
        replace: {
            dist : {
                src : ['src/templates/**/*.jade'],
                overwrite: true,
                replacements: [{
                    from : /[a-zA-Z0-9\-]*\.min[.a-zA-z0-9]*\.js/g,
                    to : function (filename) {
                        grunt.log.write("replacing JS files")
                        var files = grunt.file.expand('src/public/**/*.min*.js');
                        var found = false;
                        for(var i = 0; i < files.length; i++) {
                          var file = files[i];
                          var f, file1 = file.split('/');
                          var file2 = filename.split('/');
                          f = file1[file1.length-1];

                          if (filename === f) { continue; }

                          file1 = f.split('.')[0];
                          file2 = file2[file2.length-1].split('.')[0];
                          if(file1 === file2) {
                            found = true;
                            grunt.log.warn(f);
                            return f;
                          }
                        }
                        if(!found){
                          return filename;
                        }
                    }
                },
                {
                    from : /[a-zA-Z0-9\-]*\.min[.a-zA-z0-9]*\.css/g,
                    to : function (filename) {
                        grunt.log.write("replacing css files : filename\n"+filename)
                        var files = grunt.file.expand('src/public/**/*.min*.css');
                        var found = false;
                        for(var i = 0; i < files.length; i++) {

                          var file = files[i];
                          var f, file1 = file.split('/');
                          var file2 = filename.split('/');
                          f = file1[file1.length-1];
                          if (filename === f) { continue; }
                          file1 = f.split('.')[0];
                          file2 = file2[file2.length-1].split('.')[0];
                          grunt.log.write(file1+"    ")
                          grunt.log.write(file2+"\n")
                          if(file1 === file2) {
                            found = true;
                            grunt.log.write("found")
                            grunt.log.warn(f);
                            return f;
                          }
                        }
                        if(!found){
                          return filename;
                        }
                    }
                }]
            }
        },
        modernizr: {

            // Path to the build you're using for development.
            "devFile" : "<%= yeoman.src %>/bower_components/modernizr/modernizr.js",

            // Path to save out the built file.
            "outputFile" : "<%= yeoman.dist %>/scripts/modernizr.js",

            // Based on default settings on http://modernizr.com/download/
            "extra" : {
                "shiv" : true,
                "printshiv" : false,
                "load" : true,
                "mq" : false,
                "cssclasses" : true
            },

            // Based on default settings on http://modernizr.com/download/
            "extensibility" : {
                "addtest" : false,
                "prefixed" : false,
                "teststyles" : false,
                "testprops" : false,
                "testallprops" : false,
                "hasevents" : false,
                "prefixes" : false,
                "domprefixes" : false
            },

            // By default, source is uglified before saving
            "uglify" : true,

            // Define any tests you want to impliticly include.
            "tests" : [],

            // By default, this task will crawl your project for references to Modernizr tests.
            // Set to false to disable.
            "parseFiles" : true,

            // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
            // You can override this by defining a "files" array below.
            // "files" : [],

            // When parseFiles = true, matchCommunityTests = true will attempt to
            // match user-contributed tests.
            "matchCommunityTests" : false,

            // Have custom Modernizr tests? Add paths to their location here.
            "customTests" : []
        },

        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '<%= yeoman.src %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },

        uglify : {
            options: {
                mangle: false,
                preserveComments : false
            },
            dist : {
                files : {
                    '.tmp/scripts/hocalwirecommon.min.js' : [
                        '<%= yeoman.src %>/bower_components/jquery/dist/jquery-1.11.2.min.js',
                        '<%= yeoman.src %>/scripts/main.js',
                        '<%= yeoman.src %>/scripts/promise.js',
                        '<%= yeoman.src %>/scripts/ajaxHelper.js',
                        '<%= yeoman.src %>/scripts/AnalyticsService.js',
                        '<%= yeoman.src %>/scripts/UniversalGlobalService.js',
                        '<%= yeoman.src %>/scripts/Utils.js',
                        '<%= yeoman.src %>/scripts/classie.js',
                        '<%= yeoman.src %>/scripts/uisearch.js',
                        '<%= yeoman.src %>/scripts/jquery.unveil.js',
                        '<%= yeoman.src %>/scripts/contactus.js',
                        '<%= yeoman.src %>/scripts/jquery.popup.js',
                        '<%= yeoman.src %>/scripts/jquery-print.js',
                        '<%= yeoman.src %>/scripts/pageTemplates.js'
                        ],
                    '.tmp/scripts/hocalwirecommonlogin.min.js' : [
                        '<%= yeoman.src %>/scripts/verify.js',
                        '<%= yeoman.src %>/scripts/login.js',
                        '<%= yeoman.src %>/scripts/register.js',
                        '<%= yeoman.src %>/scripts/forgotPassword.js',
                        '<%= yeoman.src %>/scripts/subscribeDetails.js',
                        '<%= yeoman.src %>/scripts/headerSlider.js'
                        
                        ],
                    '.tmp/scripts/pdfviewerjs.min.js' : [
                        '<%= yeoman.src %>/scripts/pdf.js',
                        '<%= yeoman.src %>/scripts/pdf.worker.js',
                        '<%= yeoman.src %>/scripts/i18n.js',
                        '<%= yeoman.src %>/scripts/viewerClipHelper.js',
                        '<%= yeoman.src %>/scripts/canvasToPDF.js',
                        '<%= yeoman.src %>/scripts/jquery.Jcrop.js',
                        '<%= yeoman.src %>/scripts/viewer.js'
                        ],
                    '.tmp/scripts/notificationcommonjs.min.js' : [
                        '<%= yeoman.src %>/scripts/noti.js',
                        ],
                    '.tmp/scripts/locationcommonjs.min.js' : [
                        '<%= yeoman.src %>/scripts/location.js',
                        ],
                    '.tmp/scripts/cartpagejs.min.js' : [
                        '<%= yeoman.src %>/scripts/cart/bootstrap.js',
                        '<%= yeoman.src %>/scripts/cart/jquery.mycart.js',
                        '<%= yeoman.src %>/scripts/cart/custom.js',
                        ],
                    '.tmp/scripts/cartpagejswithoutbootstrap.min.js' : [ 
                       '<%= yeoman.src %>/scripts/cart/jquery.mycart.js',
                        '<%= yeoman.src %>/scripts/cart/custom.js',
                        ],
                    '.tmp/scripts/themeSpecialCoveragejs.min.js' : [
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.flexslider-min.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.prettyPhoto.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.validate.min.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.carouFredSel-6.0.4-packed.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.easing.min.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/jquery.easy-ticker.min.js',
                        '<%= yeoman.src %>/theme_specialcoverage/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/themefoxjs.min.js' : [
                        '<%= yeoman.src %>/theme_fox/scripts/jquery-migrate-1.2.1.min.js',
                        '<%= yeoman.src %>/theme_fox/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_fox/scripts/materialize.min.js',
                        '<%= yeoman.src %>/theme_fox/scripts/owl.carousel.min.js',
                        '<%= yeoman.src %>/theme_fox/scripts/jquery.prettyPhoto.js',
                        '<%= yeoman.src %>/theme_fox/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_fox/scripts/isotope.pkgd.min.js',
                        '<%= yeoman.src %>/theme_fox/scripts/isotop.js',
                        '<%= yeoman.src %>/theme_fox/scripts/custom.js'

                    ],
                    '.tmp/scripts/themezebrajs.min.js' : [
                        '<%= yeoman.src %>/theme_zebra/scripts/wow.min.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/slick.min.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/jquery.newsTicker.min.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/jquery.fancybox.pack.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_zebra/scripts/custom.js'
                        

                    ],
                    
                    '.tmp/scripts/themecobrajs.min.js' : [
                        
                        '<%= yeoman.src %>/theme_cobra/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/aqpb.js',
                        // '<%= yeoman.src %>/theme_cobra/scripts/mediaelement-and-player.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/owl.carousel.min.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/Carousel.js',
                        '<%= yeoman.src %>/theme_cobra/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/thememousejs.min.js' : [
                        
                        '<%= yeoman.src %>/theme_mouse/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/modernizr.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/jquery.fancybox.pack.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/materialize.js',
                        '<%= yeoman.src %>/theme_mouse/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/themekangaroojs.min.js' : [
                        
                        '<%= yeoman.src %>/theme_kangaroo/scripts/plugins.js',
                        '<%= yeoman.src %>/theme_kangaroo/scripts/functions.js',
                        '<%= yeoman.src %>/theme_kangaroo/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/themecowjs.min.js' : [
                        '<%= yeoman.src %>/theme_cow/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_cow/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_cow/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_cow/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/themesnakejs.min.js' : [
                        
                        '<%= yeoman.src %>/theme_snake/scripts/jquery-migrate-1.2.1.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.ba-bbq.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/superfish.js',
                        
                        '<%= yeoman.src %>/theme_snake/scripts/jquery-ui-1.11.1.custom.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.easing.1.3.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.carouFredSel-6.2.1-packed.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.touchSwipe.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.transit.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.sliderControl.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.timeago.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.jquery.hint.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.prettyPhoto.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.qtip.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/jquery.blockUI.js',
                        '<%= yeoman.src %>/theme_snake/scripts/odometer.min.js',
                        '<%= yeoman.src %>/theme_snake/scripts/owl.carousel.js',
                        '<%= yeoman.src %>/theme_snake/scripts/custom.js'
                        

                    ],
                    '.tmp/scripts/themefishjs.min.js' : [
                        '<%= yeoman.src %>/theme_fish/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_fish/scripts/material.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/material-kit.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.parallax.js',
                        '<%= yeoman.src %>/theme_fish/scripts/owl.carousel.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/wow.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.counterup.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/waypoints.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jasny-bootstrap.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/form-validator.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/contact-form-script.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.themepunch.revolution.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.themepunch.tools.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.auto-complete.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/bootstrap-select.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/chosen.js',
                        '<%= yeoman.src %>/scripts/pickaday.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/nouislider.min.js',
                        '<%= yeoman.src %>/scripts/highchecktree.js',
                        '<%= yeoman.src %>/theme_fish/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_fish/scripts/filters.js',
                        '<%= yeoman.src %>/theme_fish/scripts/custom.js'

                        

                    ],
                    '.tmp/scripts/themeloonjs.min.js' : [
                        '<%= yeoman.src %>/theme_loon/scripts/lightbox.js',
                        '<%= yeoman.src %>/theme_loon/scripts/owl.carousel.min.js',
                        '<%= yeoman.src %>/theme_loon/scripts/custom.js'
                    ],
                    '.tmp/scripts/themeeaglejs.min.js' : [
                        '<%= yeoman.src %>/theme_eagle/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_eagle/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_eagle/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_eagle/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_eagle/scripts/custom.js'
                    ],
                    '.tmp/scripts/themeapejs.min.js' : [
                        '<%= yeoman.src %>/theme_ape/scripts/jquery-migrate.min.js',
                        '<%= yeoman.src %>/theme_ape/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_ape/scripts/scripts1.js',
                        '<%= yeoman.src %>/theme_ape/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_ape/scripts/wp-embed.min.js',
                        '<%= yeoman.src %>/theme_ape/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_ape/scripts/custom.js'
                    ],
                    
                    '.tmp/scripts/themeduckjs.min.js' : [
                        '<%= yeoman.src %>/theme_duck/scripts/modernizr.custom.js',
                        '<%= yeoman.src %>/theme_duck/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_duck/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_duck/scripts/custom.js'

                    ],
                    '.tmp/scripts/themedolphinjs.min.js' : [
                        '<%= yeoman.src %>/theme_dolphin/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_dolphin/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_dolphin/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_dolphin/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_dolphin/scripts/custom.js'
                    ],
                    '.tmp/scripts/themeservicejs.min.js' : [
                        '<%= yeoman.src %>/theme_service/scripts/bootstrap.min.js',
                        '<%= yeoman.src %>/theme_service/scripts/jquery.prettyPhoto.js',
                        '<%= yeoman.src %>/theme_service/scripts/jquery.isotope.min.js',
                        '<%= yeoman.src %>/theme_service/scripts/pinterest_grid.js',
                        '<%= yeoman.src %>/theme_service/scripts/wow.min.js',
                        '<%= yeoman.src %>/theme_service/scripts/jquery.mixitup.min.js',
                        '<%= yeoman.src %>/theme_service/scripts/custom.js'

                    ],
                    '.tmp/scripts/themedragonjs.min.js' : [
                        '<%= yeoman.src %>/theme_dragon/scripts/jquery-ui.min.js',
                        '<%= yeoman.src %>/theme_dragon/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_dragon/scripts/vTicker.js',
                        '<%= yeoman.src %>/theme_dragon/scripts/scripts.js'
                    ],
                    
                    '.tmp/scripts/themebatjs.min.js' : [
                        '<%= yeoman.src %>/theme_bat/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_bat/scripts/modernizr.js',
                        '<%= yeoman.src %>/theme_bat/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_bat/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_bat/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_bat/scripts/custom.js',

                    ],
                    '.tmp/scripts/themeelephantjs.min.js' : [
                        '<%= yeoman.src %>/theme_elephant/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_elephant/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_elephant/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_elephant/scripts/jquery.li-scroller.1.0.js',
                        '<%= yeoman.src %>/theme_elephant/scripts/custom.js',

                    ],
                    '.tmp/scripts/themebeejs.min.js' : [
                        '<%= yeoman.src %>/theme_bee/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_bee/scripts/custom.js'
                    ],
                    '.tmp/scripts/themebearjs.min.js' : [
                        '<%= yeoman.src %>/theme_bear/scripts/modernizr.js',
                        '<%= yeoman.src %>/theme_bear/scripts/main.js',
                        '<%= yeoman.src %>/theme_bear/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_bear/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_bear/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_bear/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_bear/scripts/custom.js'
                    ],
                    '.tmp/scripts/themewolfjs.min.js' : [
                        '<%= yeoman.src %>/theme_wolf/scripts/modernizr.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/flexmenu.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/main.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/custom.js'
                    ],
                    '.tmp/scripts/epaperjs.min.js' : [     
                        '<%= yeoman.src %>/scripts/pickaday.min.js', 
                        '<%= yeoman.src %>/scripts/epaper.js'
                    ],
                    '.tmp/scripts/themecatjs.min.js' : [
                        '<%= yeoman.src %>/theme_cat/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_cat/scripts/jquery.bxslider.js',
                        '<%= yeoman.src %>/theme_cat/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_cat/scripts/main.js',
                        '<%= yeoman.src %>/theme_cat/scripts/nav-hover.js',
                    ],
                    '.tmp/scripts/allgalleryjs.min.js' : [
                        '<%= yeoman.src %>/scripts/gallery/allgallery.js'
                    ],
                    '.tmp/scripts/sendemailjs.min.js' : [
                        '<%= yeoman.src %>/scripts/sendemail.js'
                    ],
                    '.tmp/scripts/reporterformjs.min.js' : [
                        '<%= yeoman.src %>/scripts/reporter/main.js',
                        '<%= yeoman.src %>/scripts/reporter/jquery.fileupload.min.js',
                        '<%= yeoman.src %>/scripts/reporter/zebra_datePicker.js'
                    ],
                    '.tmp/scripts/themepandajs.min.js' : [
                        '<%= yeoman.src %>/theme_panda/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_panda/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_panda/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_panda/scripts/newsTicker.js',
                        '<%= yeoman.src %>/theme_panda/scripts/custom.js',
                    ],
                    '.tmp/scripts/themefishwolfcombinedjs.min.js' : [
                        '<%= yeoman.src %>/theme_fish/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_fish/scripts/material.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/material-kit.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.parallax.js',
                        '<%= yeoman.src %>/theme_fish/scripts/wow.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.counterup.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/waypoints.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/waypoints.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jasny-bootstrap.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.themepunch.revolution.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.themepunch.tools.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/jquery.auto-complete.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/chosen.js',
                        '<%= yeoman.src %>/scripts/highchecktree.js',
                        '<%= yeoman.src %>/theme_fish/scripts/nouislider.min.js',
                        '<%= yeoman.src %>/scripts/pickaday.min.js',
                        '<%= yeoman.src %>/theme_fish/scripts/filters.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/modernizr.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/flexmenu.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/main.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/theia-sticky-sidebar.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/jquery-page-slide.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/lightslider.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/superfish.js',
                        '<%= yeoman.src %>/theme_wolf/scripts/custom.js'
                    ],
                    '.tmp/scripts/themeturtlejs.min.js' : [
                        '<%= yeoman.src %>/theme_turtle/scripts/bootstrap.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/classie.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/countUp.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/jquery.appear.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/jquery.easing.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/jquery.flexslider.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/jquery.isotope.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/jquery.knob.js',
                        '<%= yeoman.src %>/theme_turtle/scripts/site.js'
                    ]
                    
                }
            }
        },
        concat : {
            dist : {
                options : {
                    separator : ';'
                },
                files : {
                    
                }
            }
        },


        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.src %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            minify: {
                expand : true,
                cwd : '.tmp/styles',
                src : ['*.css', '!*.min.css'],
                dest : '.tmp/styles',
                ext : '.min.css'
            },
            
            dist: {
                files: {
                    '.tmp/styles/themespecialcoverageinline.min.css': [
                        'src/public/styles/bootstrap-light.css',
                        'src/public/theme_specialcoverage/styles/style.css',
                        'src/public/theme_specialcoverage/styles/bootstrap-responsive.min.css',
                        'src/public/theme_specialcoverage/styles/responsive.css',
                        
                    ],
                    '.tmp/styles/themespecialcoveragefile.min.css': [

                        'src/public/theme_specialcoverage/styles/superfish.css',
                        'src/public/theme_specialcoverage/styles/icoMoon.css',
                        'src/public/theme_specialcoverage/styles/flexslider.css',
                        'src/public/theme_specialcoverage/styles/prettyPhoto.css',
                        'src/public/theme_specialcoverage/styles/colors/default.css'
                    ],
                    '.tmp/styles/themebatinline.min.css': [
                        'src/public/theme_bat/styles/bootstrap.css',
                        'src/public/theme_bat/styles/style.css',
                        'src/public/theme_bat/styles/responsive.css',
                        
                    ],
                    '.tmp/styles/themebatfile.min.css': [

                        'src/public/theme_bat/styles/font-awesome.min.css',
                        'src/public/theme_bat/styles/mega-menu.css',
                        'src/public/theme_bat/styles/superfish.css',
                        'src/public/theme_bat/styles/lightslider.css',
                       
                    ],
                    '.tmp/styles/themecatfile.min.css': [

                        'src/public/theme_cat/styles/bootstrap.css',
                        'src/public/theme_cat/styles/demo.css',
                        'src/public/theme_cat/styles/font-awesome.css',
                        'src/public/theme_cat/styles/style.css',
                        'src/public/theme_cat/styles/lightslider.css',
                        'src/public/theme_cat/styles/testimonial.css',
                       
                    ],
                    '.tmp/styles/themebeeinline.min.css': [
                        'src/public/theme_bee/styles/style.css',
                        'src/public/theme_bee/styles/responsive.css',
                        
                    ],
                    '.tmp/styles/themebeefile.min.css': [

                        'src/public/theme_bee/styles/font-awesome.css',
                        'src/public/theme_bee/styles/mega-menu.css',
                        'src/public/theme_bee/styles/superfish.css',
                       
                    ],
                    '.tmp/styles/themefox.min.css': [
                        'src/public/theme_fox/styles/color.css',
                        'src/public/theme_fox/styles/mega-menu.css',
                        'src/public/theme_fox/styles/bootstrap.css',
                        'src/public/theme_fox/styles/bootstrap-theme.min.css',
                        'src/public/theme_fox/styles/materialize.css',
                        'src/public/theme_fox/styles/font-awesome.min.css',
                        'src/public/theme_fox/styles//owl.slider.css',
                        'src/public/theme_fox/styles/prettyPhoto.css',
                        'src/public/theme_fox/styles/li-scroller.css',
                        'src/public/theme_fox/styles/custom.css',
                        'src/public/theme_fox/styles/extra.css'
                    ],
                    '.tmp/styles/themedragon.min.css': [
                        'src/public/theme_dragon/styles/reset.css',
                        'src/public/theme_dragon/styles/main-stylesheet.css',
                        'src/public/theme_dragon/styles/shortcode.css',
                        'src/public/theme_dragon/styles/fonts.css',
                        'src/public/theme_dragon/styles/retina.css',
                        'src/public/theme_dragon/styles/responsive.css',
                        'src/public/theme_dragon/styles/lightslider.css',
                        'src/public/theme_dragon/styles/extra.css'
                        
                    ],
                    '.tmp/styles/themezebra.min.css': [
                        'src/public/theme_zebra/styles/bootstrap.min.css',
                        'src/public/theme_zebra/styles/font-awesome.min.css',
                        'src/public/theme_zebra/styles/animate.css',
                        'src/public/theme_zebra/styles/slick.css',
                        'src/public/theme_zebra/styles/li-scroller.css',
                        'src/public/theme_zebra/styles/jquery.fancybox.css',
                        'src/public/theme_zebra/styles/superfish.css',
                        'src/public/theme_zebra/styles/theme.css',
                        'src/public/theme_zebra/styles/style.css',
                        'src/public/theme_zebra/styles/responsive.css',
                        'src/public/theme_zebra/styles/extra.css',

                    ],
                    '.tmp/styles/themelooninline.min.css': [
                        'src/public/theme_loon/styles/reset.css',
                        'src/public/theme_loon/styles/main-stylesheet.css',
                        'src/public/theme_loon/styles/lightbox.css',
                        'src/public/theme_loon/styles/shortcode.css',
                        'src/public/theme_loon/styles/fonts.css',
                        'src/public/theme_loon/styles/colors.css',
                        'src/public/theme_loon/styles/responsive.css',
                        'src/public/theme_loon/styles/owl.slider.css',
                        'src/public/theme_loon/styles/extra.css',
                    ],
                    

                    '.tmp/styles/commoncss.min.css': [
                        'src/public/styles/common.css'
                    ],
                    '.tmp/styles/reporterform.min.css': [
                        'src/public/styles/reporter/main.css',
                        'src/public/styles/bootstrap-light.css'
                    ],
                    '.tmp/styles/pdfviewer.min.css': [
                        'src/public/styles/pdfviewer.css',
                        'src/public/styles/jquery.Jcrop.css',
                    ],
                    '.tmp/styles/cartpage.min.css': [
                        'src/public/styles/cart/bootstrap.css',
                        'src/public/styles/cart/cartpage.css'
                    ],
                    '.tmp/styles/cartpagewithoutbootstrap.min.css': [
                        'src/public/styles/cart/cartpage.css'
                    ],
                    '.tmp/styles/recommended.min.css': [
                        'src/public/recommended/styles/style.css'
                    ],
                    '.tmp/styles/allgallery.min.css': [
                        'src/public/scripts/gallery/allgallery.css'
                    ],
                    '.tmp/styles/sendemail.min.css': [
                        'src/public/styles/sendemail.css'
                    ],
                    '.tmp/styles/themeeagleinline.min.css': [
                        'src/public/theme_eagle/styles/bootstrap.min.css',
                        'src/public/theme_eagle/styles/cards.css',
                        'src/public/theme_eagle/styles/style.css',
                        'src/public/theme_eagle/styles/responsive.css'
                        
                    ],
                    '.tmp/styles/themeeaglefile.min.css': [
                        'src/public/theme_eagle/styles/font-awesome.min.css',
                        'src/public/theme_eagle/styles/li-scroller.css',
                        'src/public/theme_eagle/styles/superfish.css',
                        'src/public/theme_eagle/styles/fonts.css',
                        'src/public/theme_eagle/styles/lightslider.css',
                        'src/public/theme_eagle/styles/extra.css'
                    ],
                    '.tmp/styles/themeape.min.css': [
                        'src/public/theme_ape/styles/styles.css',
                        'src/public/theme_ape/styles/lightslider.css',
                        'src/public/theme_ape/styles/font-awesome.css',
                        'src/public/theme_ape/styles/reset.css',
                        'src/public/theme_ape/styles/style.css',
                        'src/public/theme_ape/styles/main.css',
                        'src/public/theme_ape/styles//li-scroller.css',
                        'src/public/theme_ape/styles/media-queries.css',
                        'src/public/theme_ape/styles/extra.css'
                    ],
                    '.tmp/styles/themeduck.min.css': [
                        
                        'src/public/theme_duck/styles/bootstrap.css',
                        'src/public/theme_duck/styles/font-awesome.css',
                        'src/public/theme_duck/styles/superfish.css',
                        'src/public/theme_duck/styles/owl.carousel.css',
                        'src/public/theme_duck/styles/owl.theme.css',
                        'src/public/theme_duck/styles/jquery.navgoco.css',
                        'src/public/theme_duck/styles/flexslider.css',
                        'src/public/theme_duck/styles/style.css',
                        'src/public/theme_duck/styles/responsive.css',
                        'src/public/theme_duck/styles/extra.css'
                    ],
                    '.tmp/styles/thememouse.min.css': [
                        
                        'src/public/theme_mouse/styles/bootstrap.css',
                        'src/public/theme_mouse/styles/lightslider.css',
                        'src/public/theme_mouse/styles/superfish.css',
                        'src/public/theme_mouse/styles/bootstrap-grid.css',
                        'src/public/theme_mouse/styles/bootstrap-reboot.css',
                        'src/public/theme_mouse/styles/materialize.css',
                        'src/public/theme_mouse/styles/style.css',
                        'src/public/theme_mouse/styles/responsive.css',
                    ],
                    '.tmp/styles/themecow.min.css': [
                        
                        'src/public/theme_cow/styles/mega-menu.css',
                        'src/public/theme_cow/styles/superfish.css',
                        'src/public/theme_cow/styles/lightslider.css',
                        'src/public/theme_cow/styles/style.css',
                        'src/public/theme_cow/styles/responsive.css',
                        
                    ],
                    '.tmp/styles/themedolphininline.min.css': [
                        'src/public/theme_dolphin/styles/bootstrap.min.css',
                        'src/public/theme_dolphin/styles/mega-menu.css',
                        'src/public/theme_dolphin/styles/style.css',
                        'src/public/theme_dolphin/styles/responsive.css'
                    ],
                    '.tmp/styles/themedolphinfile.min.css': [
                        'src/public/theme_dolphin/styles/font-awesome.min.css',
                        'src/public/theme_dolphin/styles/color.css',
                        'src/public/theme_dolphin/styles/li-scroller.css',
                        'src/public/theme_dolphin/styles/superfish.css',
                        'src/public/theme_dolphin/styles/fonts.css',
                        'src/public/theme_dolphin/styles/lightslider.css',
                        'src/public/theme_dolphin/styles/extra.css',
                        'src/public/theme_dolphin/styles/more.css'
                    ],
                    '.tmp/styles/themekangarooinline.min.css': [
                        'src/public/theme_kangaroo/styles/bootstrap.css',
                        'src/public/theme_kangaroo/styles/style.css',
                        'src/public/theme_kangaroo/styles/responsive.css'
                    ],
                    '.tmp/styles/themekangaroofile.min.css': [
                        'src/public/theme_kangaroo/styles/font-icons.css',
                        'src/public/theme_kangaroo/styles/animate.css',
                        'src/public/theme_kangaroo/styles/magnific-popup.css',
                        'src/public/theme_kangaroo/styles/dark.css',
                    ],
                    '.tmp/styles/themecobrainline.min.css': [
                        'src/public/theme_cobra/styles/font-awesome.min.css',
                        'src/public/theme_cobra/styles/gumby.css',
                        'src/public/theme_cobra/styles/aqpb.css',
                        'src/public/theme_cobra/styles/superfish.css',
                        'src/public/theme_cobra/styles/style.css',
                        'src/public/theme_cobra/styles/custom_style.css',
                        'src/public/theme_cobra/styles/responsive.css'
                    ],
                    '.tmp/styles/themecobrafile.min.css': [
                        'src/public/theme_cobra/styles/lightslider.css',
                        'src/public/theme_cobra/styles/li-scroller.css',
                        'src/public/theme_cobra/styles/owl.carousel.css',
                        'src/public/theme_cobra/styles/carousel3d.css',
                        'src/public/theme_cobra/styles/owl.theme.css',
                        'src/public/theme_cobra/styles/extra.css'
                    ],
                    '.tmp/styles/themesnakeinline.min.css': [
                        'src/public/theme_snake/styles/reset.css',
                        'src/public/theme_snake/styles/style.css',
                        'src/public/theme_snake/styles/mega-menu.css',
                        'src/public/theme_snake/styles/responsive.css',

                    ],
                    '.tmp/styles/themesnakefile.min.css': [
                        'src/public/theme_snake/styles/superfish.css',
                        'src/public/theme_snake/styles/prettyPhoto.css',
                        'src/public/theme_snake/styles/jquery.qtip.css',
                        'src/public/theme_snake/styles/animations.css',
                        'src/public/theme_snake/styles/odometer-theme-default.css',
                        'src/public/theme_snake/styles/owl.carousel.css',
                        'src/public/theme_snake/styles/owl.theme.css',
                        'src/public/theme_snake/styles/extra.css'

                        
                    ],
                    '.tmp/styles/themefish.min.css': [
                        'src/public/theme_fish/styles/bootstrap.css',
                        'src/public/theme_fish/styles/jasny-bootstrap.min.css',
                        'src/public/theme_fish/styles/material-kit.css',
                        'src/public/theme_fish/styles/font-awesome.min.css',
                        'src/public/theme_fish/fonts/line-icons/line-icons.css',
                        'src/public/theme_fish/styles/main.css',
                        'src/public/theme_fish/styles/animate.css',
                        'src/public/theme_fish/styles/owl.carousel.css',
                        'src/public/theme_fish/styles/owl.theme.css',
                        'src/public/theme_fish/styles/responsive.css',
                        'src/public/theme_fish/styles/slicknav.css',
                        
 
                        'src/public/theme_fish/styles/jquery.auto-complete.css',
                        'src/public/theme_fish/styles/bootstrap-select.min.css',
                        'src/public/theme_fish/styles/chosen.min.css',
                        'src/public/styles/pickaday.css',
                        'src/public/theme_fish/styles/nouislider.min.css',
                        'src/public/styles/highCheckTree.css',
                        'src/public/theme_fish/styles/extra.css'

                    ],
                    '.tmp/styles/themeservice.min.css': [
                        'src/public/theme_service/styles/bootstrap.min.css',
                        'src/public/theme_service/styles/font-awesome.min.css',
                        'src/public/theme_service/styles/animate.min.css',
                        'src/public/theme_service/styles/prettyPhoto.css',
                        'src/public/theme_service/styles/main_parent.css',
                        'src/public/theme_service/styles/responsive.css'

                    ],
                    '.tmp/styles/themeelephantinline.min.css': [
                        'src/public/theme_elephant/styles/superfish.css',
                        'src/public/theme_elephant/styles/bootstrap.css',
                        'src/public/theme_elephant/styles/font-awesome.css',
                        'src/public/theme_elephant/styles/mega-menu.css',
                        'src/public/theme_elephant/styles/style.css',
                        'src/public/theme_elephant/styles/responsive.css'

                    ],
                    '.tmp/styles/themebearinline.min.css': [
                        'src/public/theme_bear/styles/reset.css',
                        'src/public/theme_bear/styles/custom-color.css',
                        'src/public/theme_bear/styles/mega-menu.css',
                        'src/public/theme_bear/styles/style.css',
                        'src/public/theme_bear/styles/responsive.css'

                    ],
                    '.tmp/styles/themebearfile.min.css': [
                        'src/public/theme_bear/styles/animate.css',
                        'src/public/theme_bear/styles/jquery.qtip.css',
                        'src/public/theme_bear/styles/lightbox.css',
                        'src/public/theme_bear/styles/superfish.css',
                        'src/public/theme_bear/styles/lightslider.css'

                    ],
                    '.tmp/styles/themewolfinline.min.css': [
                        'src/public/theme_wolf/styles/reset.css',
                        'src/public/theme_wolf/styles/custom-color.css',
                        'src/public/theme_wolf/styles/mega-menu.css',
                        'src/public/theme_wolf/styles/bootstrap.css',
                        'src/public/theme_wolf/styles/style.css',
                        'src/public/theme_wolf/styles/responsive.css'

                    ],
                    '.tmp/styles/themewolffile.min.css': [
                        'src/public/theme_wolf/styles/animate.css',
                        'src/public/theme_wolf/styles/jquery.qtip.css',
                        'src/public/theme_wolf/styles/lightbox.css',
                        'src/public/theme_wolf/styles/superfish.css',
                        'src/public/theme_wolf/styles/lightslider.css'

                    ],
                    '.tmp/styles/themeelephantfile.min.css': [
                        'src/public/theme_elephant/styles/lightslider.css'
                    ],
                    '.tmp/styles/themepandainline.min.css': [
                        'src/public/theme_panda/styles/mega-menu.css',
                        'src/public/theme_panda/styles/lightslider.css',
                        'src/public/theme_panda/styles/style.css',
                        
                    ],
                    '.tmp/styles/themepandafile.min.css': [
                        'src/public/theme_panda/styles/tabs.css',
                    ],
                    '.tmp/styles/themefishwolfcombinedinline.min.css': [
                        'src/public//theme_fish/styles/font-awesome.min.css',
                        'src/public/theme_fish/styles/main.css',
                        'src/public/theme_fish/styles/responsive.css',
                        'src/public/theme_fish/styles/extra.css',
                        'src/public/theme_wolf/styles/reset.css',
                        'src/public/theme_wolf/styles/custom-color.css',
                        'src/public/theme_wolf/styles/mega-menu.css',
                        'src/public/theme_wolf/styles/bootstrap.css',
                        'src/public/theme_wolf/styles/style.css',
                        'src/public/theme_wolf/styles/responsive.css'

                    ],
                    '.tmp/styles/themefishwolfcombinedfile.min.css': [
                        'src/public/theme_fish/styles/slicknav.css',
                        'src/public/theme_fish/styles/bootstrap-select.min.css',
                        'src/public/theme_fish/styles/jquery.auto-complete.css',
                        'src/public/styles/pickaday.css',
                        'src/public/styles/highCheckTree.css',
                        'src/public/theme_fish/styles/chosen.min.css',
                        'src/public/theme_fish/styles/nouislider.css',


                        'src/public/theme_wolf/styles/animate.css',
                        'src/public/theme_wolf/styles/jquery.qtip.css',
                        'src/public/theme_wolf/styles/lightbox.css',
                        'src/public/theme_wolf/styles/superfish.css',
                        'src/public/theme_wolf/styles/lightslider.css'

                    ],
                    '.tmp/styles/themeturtle.min.css': [
                        'src/public/theme_turtle/styles/animate.css',
                        'src/public/theme_turtle/styles/bootstrap.css',
                        'src/public/theme_turtle/styles/font-awesome.css',
                        'src/public/theme_turtle/styles/style.css',
                        // 'src/public/theme_wolf/styles/lightslider.css'

                    ],
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 2 versions', 'ie 9', '> 1%']
            },
            prefix: {
                expand: true,
                flatten: true,
                src: '.tmp/styles/*.css',
                dest: '.tmp/styles/'
            },
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.src %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            css: {
              files : [{
                expand : true,
                cwd : ".tmp/styles/",
                dest : "<%= yeoman.src %>/styles/",
                src : [
                  '*.css'
                ]
              }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.src %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }]
            }
        },
        concurrent: {
            server: [
                'coffee:dist',
                'compass:server'
            ],
            test: [
                'coffee',
                'compass'
            ],
            dist: [
                'compass:dist',
                'svgmin',
                'htmlmin'
            ]
        },
        bower: {
            options: {
                exclude: ['modernizr']
            },
            all: {
                rjsConfig: '<%= yeoman.src %>/scripts/main.js'
            }
        },
        // express: {
        //     options: {
        //         port: grunt.option('port') || SERVER_PORT,
        //         hostname: 'localhost'
        //     },
        //     livereload: {
        //         options: {
        //             server: path.resolve('./app'),
        //             // keepalive: true,

        //             livereload: true,
        //             serverreload: true,
        //             bases: [path.resolve('./.tmp'), path.resolve(__dirname, yeomanConfig.app)],
        //             open: true
        //         }
        //     },
        //     test: {
        //         options: {
        //             server: path.resolve('./app'),
        //             bases: [path.resolve('./.tmp'), path.resolve(__dirname, 'test')]
        //         }
        //     },
        //     dist: {
        //         options: {
        //             server: path.resolve('./app'),
        //             bases: path.resolve(__dirname, yeomanConfig.dist)
        //         }
        //     }
        // },
        express: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    script: 'bin/www'
                }
            },
            prod: {
                options: {
                    script: '<%= yeoman.dist %>/app.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    port: (grunt.option('port') || SERVER_PORT) + 1,
                    script: 'app.js',
                    args: ['--unittest']
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('generate', function() {
        grunt.task.run([
            'clean:server',
            'compass:server',
        ]);
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'compass:server',
            'cssmin',
            'autoprefixer:prefix',
            'copy:css',
            'express:livereload',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'compass',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        
        'cssmin',
        'copy:css',
        'uglify:dist',
        'filerev',
        'clean:dist_final',
        'replace'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('screenshots', [
        'clean:server',
        'concurrent:server',
        'connect:livereload',
        'autoshot'
    ]);

};
