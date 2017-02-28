'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const restService = express();

restService.use(bodyParser.json());

var retornaCodigo = function(entrada){
    entrada = entrada.toUpperCase();
    console.log('Entrada->' + entrada);
    switch(entrada) {
        case "SEDE III":
            return '1';
        case "SEDE IV":
            return '2';            
        case "SEDE VI":
            return '3';
        case "SEDE VII":
            return '4';
        case "SEDE VIII":
            return '5';
        case "SIA SHOPPING":
            return '6';
        case "CAPITAL DIGITAL":
            return '7';  
        case "EDIFÍCIO BB":
            return '8';                          
        default:
            return '';
    }
};

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    console.log('requestBody.result.action->' + requestBody.result.action);
                    if(requestBody.result.action == "horario.van")
                    {
                        console.log('retornaCodigo'+ retornaCodigo("Sede VII"));
                        var ori = retornaCodigo(requestBody.result.parameters.origem);
                        var dest = retornaCodigo(requestBody.result.parameters.destino);
                        
                        if(!(!ori || 0 === ori.length) && !(!dest || 0 === dest.length) ){
                            
                            // Set the headers
                            var headers = {
                                'User-Agent':       'Super Agent/0.0.1',
                                'Content-Type':     'application/x-www-form-urlencoded'
                            };

                            // Configure the request
                            var options = {
                                uri: 'https://vans.labbs.com.br/horario',
                                //path: '/horario',
                                method: 'GET',
                                headers: headers,                                
                                qs: {'idOrigem': ori, 'idDestino': dest}
                            };

                            // Start the request
                            request(options, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    // Print out the response body
                                    var info = JSON.parse(body);
                                    //speech += 
                                    console.log('REQUEST->'+body);
                                }else{
                                    console.log('ERROR->'+error);
                                    console.log('status->'+response.statusCode);
                                }
                            });
                            
                            speech += 'teste1: ' + ori  +' teste2: ' + dest;
                        } else {
                            speech += 'Precisa de dois parametros';
                        }
                    }                    
                    //speech += 'action: ' + requestBody.result.action;
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            source: 'bot-van-bb'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
