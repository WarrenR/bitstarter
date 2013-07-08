#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

(function () {
  'use strict';

  var fs = require('fs'),
  program = require('commander'),
  cheerio = require('cheerio'),
  rest = require('restler'),
  HTMLFILE_DEFAULT = 'index.html',
  CHECKSFILE_DEFAULT = 'checks.json',
  assertFileExists,
  cheerioHtml,
  cheerioHtmlFile,
  exitWithError,
  loadChecks,
  checkHtmlFile,
  cheerioUrl,
  checkUrl,
  clone;

  exitWithError = function (context, fn) {
    Function.prototype.call(context, fn);
    process.exit(1);
  };

  assertFileExists = function (infile) {
    var data = infile.toString();

    if (!fs.existsSync(data)) {
      exitWithError(this, function () {
        console.log("%s does not exist. Exiting.", data);
      });
    } else {
      return data;
    }
  };

  cheerioHtmlFile = function (htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
  };

  cheerioHtml = function (html, fn) {
    var ch = cheerio.load(html);
    fn(ch);
  };

  loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
  };

  checkHtmlFile = function (htmlfile, checksfile, fn) {
    var checks, out, chf, present;
    chf = cheerioHtmlFile(htmlfile);
    checks = loadChecks(checksfile).sort();
    out = {};

    for (var ii in checks) {
      present = chf(checks[ii]).length > 0;
      out[checks[ii]] = present;
    }

    fn(out);
  };

  checkUrl = function (url, checksfile, fn) {
    rest.get(url)
    .on('success', function (data, response) {
      var checks, out, present, ch;
      ch = cheerio.load(data);
      checks = loadChecks(checksfile).sort();
      out = {};


      for (var ii in checks) {
        present = ch(checks[ii]).length > 0;
        out[checks[ii]] = present;
      }

      fn(out);
    });
  };

  clone = function (fn) {
    return fn.bind({});
  };

  var printJson = function (json) {
    var outJson;
    outJson = JSON.stringify(json, null, 4);
    console.log(outJson);
  };

  if (require.main === module) {

    program
    .option('-c, --checks <check_file>', 'Specify checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Specify index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'Specify url to check')
    .parse(process.argv);

    if (program.url) {
      checkUrl(program.url, program.checks, function (data) {
        printJson(data);
      });
    } else {
      checkHtmlFile(program.file, program.checks, function (data) {
        printJson(data);
      });
    }

  } else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUrl;
  }

}());
