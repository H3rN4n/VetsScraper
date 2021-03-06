//http://blog.miguelgrinberg.com/post/easy-web-scraping-with-nodejs
var vet = require('../models/vet.server.model').vet;
var request = require('request');
var cheerio = require('cheerio');

var urlHost = 'http://www.paginasamarillas.com.ar/b/veterinarias/';

exports.start = function(req, res) {
  request({uri: urlHost, headers: {'User-Agent': 'request'}},
    function(err, response, body){
    if (err && resp.statusCode === 200) {
      console.log(err); //throw err;
    }
    $ = cheerio.load(body);
    var results = parseInt($('.m-header--count').text()) + 1 ;
    var pages = parseInt(results / 25) + 1;

    scraper(pages);
  });
};

function scraper(pages) {
  for (var i = 1; i < pages + 1; i++) {
    var url = urlHost + 'p-' + i;
    request({uri: url, headers: {'User-Agent': 'request'}},
      function (err, resp, body) {
        if (err && resp && resp.statusCode === 200) {
          console.log(err); //throw err;
        }
        $ = cheerio.load(body);
        var name=         $('.m-results-business--name').text();
        var url=          $('.m-results-business--online');
        var address=      $('.m-results-business--address');
        var details=      $('.l-plain.m-results-business--services');
        var detailsFull=  $('.m-results-business-expanded-section');
        var site=         $('.m-results-business--online');
        var location=     $('.m-results-business-map');
        /*var location = $('.aviso-resumen-datos tr td').last().text().trim(); // $('#.aviso-resumen-datos tr').last().find( "a" ).text();
         var detail = $("#contenido_aviso p:nth-child(2)").text();//$("#contenido_aviso p").first().text();
         var title = $(".box h2").first().text().trim();
         var date = $(".aviso-resumen-datos tbody tr td").first().text().trim();*/
        console.log("Saving..." + url);
        grabarAviso(name, url, address, details, detailsFull, site, location);
      }
    );
  }
}

function grabarAviso(name, url, address, details, detailsFull, site, location) {
  vet.findOne({url: {$regex: new RegExp(url, "i")}}, function (err, doc) {  // Using RegEx - search is case insensitive
    if (!err && !doc) {
      var newVet = new vet();
      newVet.name = name;
      newVet.url = url;
      newVet.address = address;
      newVet.details = details;
      newVet.detailsFull = detailsFull;
      newVet.site = site;
      newVet.location = location;
      newVet.save(function (err) {
        if (!err) {
          console.log("Saved " + url);
          //res.json(201, {message: "Aviso created with name: " + newAviso.name });    
        } else {
          console.log("Error... " + err);
          //res.json(500, {message: "Could not create User. Error: " + err});
        }
      });
    } else if (!err) {
      //res.json(403, { message: "Aviso with that name already exists, please update instead of create or create a new User with a different name."}); 
    } else {
      //res.json(500, { message: err});
    }
  });
}


exports.jobs = function(req, res) {
  var searchterm = req.body.searchterm;
  if (searchterm == null) {
    aviso.find({}, function (err, docs) {
      if (!err) {
        res.json(200, {jobs: docs});
      } else {
        res.json(500, {message: err});
      }
    });
  } else {
    aviso.findONe({name: {$regex: new RegExp(searchterm, "i")}}, function (err, docs) {  // Using RegEx - search is case insensitive
      if (!err && !docs) {
        if (!err) {
          res.json(200, {jobs: docs});
        } else {
          res.json(500, {message: err});
        }
      }
    });
  }
};
