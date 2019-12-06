'use strict';

const
    express = require('express'),
    bodyParser = require('body-parser'),
    log = require('npmlog'),  
    http = require('./node_modules/xmlhttprequest/lib/XMLHttpRequest'),
    fileStream = require('fs');

var app = express();
var host = 'localhost:';
var port = 10000;

initiate().then(function(response){
    var accountInfo = JSON.parse(response)[0];
        if (accountInfo !== null){
            log.info('initiating lisk forger');

            app.use(bodyParser.json());
            app.post('/api/forging/', function(req, res){
                res.setHeader('Access-Control-Allow-Origin', '*');
                log.info('API', '/api/forging');

                res.status(200).json({ result: setForging(req.body, accountInfo) });
            });

            app.listen(port, function(){
                log.info("forging api service running");
            });
        }
});

async function initiate(){
    var response = fileStream.readFileSync('./account.json');
    log.info('delegate account information loaded');
    fileStream.closeSync(0);
    
    return response;
}

function setForging(server, accountInfo){

    var invalidDelegate = { "result": "invalid delegate info" };
    if (accountInfo.publicKey !== server.publicKey){
        log.info("Different account");

        return JSON.parse(invalidDelegate);
    }

    var forgingData = 
    {
        "publicKey": server.publicKey,
        "password": accountInfo.password,
        "forging": server.forging
    }

    var forgingRequest = new http.XMLHttpRequest();
    var url = "http://".concat(host).concat(server.port).concat("/api/node/status/forging");

    forgingRequest.onload = function(){
        console.log("forgingRequest.status: ".concat(forgingRequest.status));
        if (forgingRequest.status === 200){
            console.log("Forging changed");
            console.log(JSON.parse(forgingRequest.responseText).data);
        }
    }

    forgingRequest.open("PUT", url, false);
    forgingRequest.setRequestHeader("Cache-Control", "no-cache");
    forgingRequest.setRequestHeader("Content-Type", "application/json");
    forgingRequest.send(JSON.stringify(forgingData));

    return JSON.parse(forgingRequest.responseText).data;
}
