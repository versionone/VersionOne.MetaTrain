var bodyParser = require('body-parser');
var request = require('request');
var express = require('express');
var app = express();
var cors = require('cors');

app.use(bodyParser.text({ type : 'application/json' }));
app.use(bodyParser.text({ type : 'application/xml' }));
app.use(cors());

app.use(express.static(__dirname + '/public'));

function getUrl(req) {
    var url = decodeURIComponent(req.originalUrl.substr(8, req.originalUrl.length - 8));
    return url;
}

function getHeaders(headers) {
    var result = {};
    for (h in headers) {
        if (h == 'host' || h == 'origin' || h == 'referer' || h == 'accept-encoding')
            continue;
        result[h] = headers[h];
    }
    return result;
}

function addHeaders(response, headers) {
    for (h in headers) {
        response.setHeader(h, headers[h]);
    }
}

function responseError(response, msg) {
    response.type('application/json; charset=utf-8');
    var error = { error: msg };
    response.end(JSON.stringify(error));
}

app.get('/pt', function (req, res, next) {
    try {
        var url = getUrl(req);
        var options = {
            url: url,
            method: 'GET',
            headers: getHeaders(req.headers)
        };
        
        request(options, function (error, response, body) {
            if (error) throw error.message;
            addHeaders(res, getHeaders(response.headers));
            res.end(body);
        });
    } catch (exception) {
        responseError(res, exception);
    }
});

app.post('/pt', function (req, res, next) {
    try {
        var options = {
            url: getUrl(req),
            method: 'POST',
            body: req.body,
            headers: getHeaders(req.headers)
        };
        
        request(options, function (error, response, body) {
            if (error) throw error.message;
            addHeaders(res, getHeaders(response.headers));
            res.status(200).send(body);
        });
    } catch (exception) {
        responseError(res, exception);
    }
    
});

var port = parseInt(process.env.PORT) || 5000;

app.listen(port, function () {
    console.log('VersionOne.MetaTrain with CORS Proxy listening on port ' + port);
});