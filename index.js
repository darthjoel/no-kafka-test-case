var fs = require('fs');
var Protocol = require('no-kafka/lib/protocol');
var _ = require('lodash');

//
// This is test measures the time it takes to read a
// FetchResponse of size 1MB and 6MB
// It is testing the synchronous functions (e.g. slow part) in the
// Client.fetchRequest function: https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L313
//

var myProtocol = new Protocol({
  bufferSize: 256 * 1024
});

fs.readFile('fetch_response_1mb', function (err, data) {
  if (err) throw err;
  var label = "1MB";
  var topics = readTopicsFromBuffer(data, label);
  _mapTopics(topics, label);
  fs.readFile('fetch_response_6mb', function (err, data) {
    if (err) throw err;
    var label = "6MB";
    var topics = readTopicsFromBuffer(data, label);
    _mapTopics(topics, label);
  });
});

function readTopicsFromBuffer(data, label) {
  var start = new Date().getTime();
  // line copied directly from client.js
  // https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L337
  var topics = myProtocol.read(data).FetchResponse().result.topics;
  console.log('reading ' + label + ' buffer took ' + (new Date().getTime() - start) + 'ms');
  return topics;
}

// function copied directly from client.js, just added label and timing
// https://github.com/oleksiyk/kafka/blob/master/lib/client.js#L57
function _mapTopics(topics, label) {
  var start = new Date().getTime();
  var result = _(topics).flatten().transform(function (a, tv) {
    if (tv === null) { return; } // requiredAcks=0
    _.each(tv.partitions, function (p) {
      a.push(_.merge({
            topic: tv.topicName,
            partition: p.partition
          },
          _.omit(p, 'partition')
          /*function (_a, b) {if (b instanceof Buffer) {return b;}}*/) // fix for lodash _merge in Node v4: https://github.com/lodash/lodash/issues/1453
      );
    });
    return;
  }, []).value();
  console.log('_mapTopics ' + label + ' took ' + (new Date().getTime() - start) + 'ms');
  return result;
}