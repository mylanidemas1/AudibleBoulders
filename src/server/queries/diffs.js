/*jshint loopfunc: true */
"use strict";

var pool = require('../db/index.js');

module.exports = {
  // NOTE: by "return", we really mean "pass to callback as results arg"

  deleteAll: function (signatureHash, callback) {
    // delete all records from diffs that have a matching users_dashboards_signature_hash
    // no return value
    pool.getConnection(function (err, connection) {
      if (err) {
        throw new Error(err);
      }
      var deleteStr = "DELETE FROM diffs WHERE users_dashboards_signature_hash='" + signatureHash + "';";
      connection.query(deleteStr, function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, "Diffs deleted");
        }
        connection.release();
      });
    });
  },
  addAll: function (signatureHash, diffsArray, callback) {
    // go through diffsArray and add a new record in diffs table for each, with users_dashboards_signature_hash set to signatureHash
    // no return value
    var counter = {diffsInserted: 0};
    // we use counter to determine when all diffs have been successfully inserted, so that we can invoke the callback at that point
    // counter is an object instead of a number so that it will be mutable
    // i.e. if the counter object changes in one asychronous query, it will also be changed in the other queries
    for (var i = 0; i < diffsArray.length; i++) {
      var diffObject = diffsArray[i];
      var insertStr = "INSERT INTO diffs (file, mod_type, users_dashboards_signature_hash) VALUES ('" + diffObject.file + "', '" + diffObject.mod_type + "', '" + signatureHash + ");";
      pool.query(insertStr, function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          counter.diffsInserted++;
          if (counter.diffsInserted === diffsArray.length) {
            callback(null, "Diffs inserted");
          }
        }
      });
    }
  },
  getAll: function (signatureHash, callback) {
    // return an array of diff objects that have a matching users_dashboards_signature_hash
    pool.getConnection(function (err, connection) {
      if (err) {
        throw new Error(err);
      }
      var selectStr = "SELECT FROM diffs WHERE users_dashboards_signature_hash='" + signatureHash + "';";
      connection.query(selectStr, function (err, results) {
        callback(err, results);
        connection.release();
      });
    });
  }
};
