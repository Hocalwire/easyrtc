/**
 * execute with `phantomjs scraper.js [url]`
 * http://mindthecode.com/recording-a-website-with-phantomjs-and-ffmpeg/
 */
var system = require('system');
var args = system.args;
var url,stdout;
var fps,viewWidth,viewHeight; // must be the same as in index.js
console.log(" live page scrapper is called************");
console.log(args);
if (args[1]) {
  url = args[1];
  stdout = args[2];
  fps=args[3];
  viewWidth=args[4];
  viewHeight=args[5]
} else {
  throw new Error('scraper: url is missing! usage: phantomjs scraper.js [url]');
  phantom.exit();
}

var page = require('webpage').create();
page.viewportSize = { width: viewWidth, height: viewHeight };

page.open(url, function () {
  setInterval(function () {
    page.render('/dev/'+stdout, { format: 'png' });
  }, 1000 / fps);
});
