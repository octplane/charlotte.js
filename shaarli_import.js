var 
  btoa = require('btoa'),
  atob = require('atob'), 
  zlib = require("zlib"),
  fs=require('fs');

var Buffer = require('buffer').Buffer;
var zlib = require('zlib');

var fname = process.env.SOURCE_FILE;

var HEADER = /^<\?php \/\* /;
var FOOTER = / \*\/ \?>$/

fs.readFile(fname, function(err, data) {
  if (err) {
    console.log(err);
    return;
  }

  data = new Buffer(atob(data.toString().replace(HEADER, '').replace(FOOTER, '')));
  zlib.gunzipRaw(data.toString(), function(err, buffer) {
    if (!err) {
      console.log(buffer.toString());
    } else {
      console.log(err);
    }
  });

});
