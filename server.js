var express = require('express');
var app = express();
var _ = require('underscore');
var fs = require('fs');
var browserify = require('browserify');
var cardigan = require('./cardigan');
var backend = require('./backend');

var c = cardigan();
c.addElements(require('./elements/base'));
c.addElements(require('./elements/site'));

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/app.js', function(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    var b = browserify('./app');
    b.bundle({debug: true}).pipe(res);
});

app.all('/backend/:method', function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    var method = req.params.method;
    var action = backend[method];

    action(req.body, function(err, result) {
        res.send(result);
    });
});

app.get('/*', function(req, res) {
    //res.setHeader('Content-Type', 'text/html');
    res.send(c(
        ['boilerplate', ['container']]
    ));
});


app.listen(3000);
console.log('Listening on port 3000');