var fs = require('fs');
var Protocol = require('no-kafka/lib/protocol');

//
// This is test measures the time it takes to read a
// FetchResponse of size 1MB and 6MB
// It is copied from: https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L337
//

var myProtocol = new Protocol({
  bufferSize: 256 * 1024
});

fs.readFile('fetch_response_1mb', function (err, data) {
  if (err) throw err;
  var start = new Date().getTime();
  console.log(myProtocol.read(data).FetchResponse().result.topics);
  console.log('reading 1mb buffer took ' + (new Date().getTime() - start) + 'ms');

  fs.readFile('fetch_response_6mb', function (err, data) {
    if (err) throw err;
    var start = new Date().getTime();
    console.log(myProtocol.read(data).FetchResponse().result.topics);
    console.log('reading 6mb buffer took ' + (new Date().getTime() - start) + 'ms');
  });

});