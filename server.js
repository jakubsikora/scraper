'use strict';

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res) {

  //All the web scraping magic will happen here
  var services = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  var output = [];

  services.forEach(function(service) {
    var serviceId = service.ServiceId;
    var url = 'http://buses.co.uk/travel/service.aspx?serviceid=' + serviceId;

    var routeStops = []
      , json = {};

    json = {
      serviceId: serviceId,
      routes: []
    };

    request(url, function(error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);

        var stops
          , route = {};

        $('.serviceStops').each(function() {
          var data = $(this);
          stops = [];

          route = {
            id: data.find('select').attr('data-routeid'),
            name: data.find('.departureBoardRouteName').text()
          };

          data.find('select').children(function() {
            if ($(this).text() !== 'choose a stop') {
              stops.push({
                id: $(this).val(),
                name: $(this).text()
              });
            }
          });

          json.routes.push({
            route: route,
            stops: stops
          });
        });

        output.push(json);
        fs.writeFile('output.json', JSON.stringify(output, null, 4), function(err){});
      }
    });
  });
});

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;