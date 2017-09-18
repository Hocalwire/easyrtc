var page = require('webpage').create();
page.viewportSize = { width: 640, height: 480 };

page.open('google.com', function () {
  setInterval(function() {
    page.render('xx.png', { format: "png" });
  }, 25);
});
