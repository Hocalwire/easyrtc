var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ 'timestamp': true}),
        new (winston.transports.File)({ filename: 'hocalwire-website.log', 'timestamp': true,'maxsize':10000000})
    ]
});


module.exports = logger;
