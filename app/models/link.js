var config = require ("../../config/config");
var path = require("path");

exports.thumbPath = function(identifier) {
  return path.join(config.db_path, "thumb" , identifier + ".jpg");
}

exports.icoPath = function(identifier) {
  return path.join(config.db_path, "favicon" , identifier);
}