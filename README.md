# no-kafka-test-case

## Intro

I am running a system that processes about 3M messages per day.  It uses Node 0.10, Kafka 0.9 and high level consumers
using no-kafka 2.5.6.  When fetch sizes get large, the consumers start to rebalance infinitely due to event loop lag 
spiking to high levels (over 1 sec).  The culprit appears to be the synchronous call to deserialize a fetch response from 
[within client.js](https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L337) as well as the synchronous call
to [_mapTopics](https://github.com/oleksiyk/kafka/blob/master/lib/client.js#L57).  Combined these 2 calls are taking
2.7-32secs with the test fetch responses included in this project.  The node event loop cannot be blocked for that long
or the consumer heartbeat requests not be sent on time.

## Update 8/1/2016

This issue has been resolved by:

1. Moving to Node 4.x because lodash's merge() function, which is used by the no-kafka
 library during decoding, is very slow under Node 0.10 but gets much faster under Node 4.x
1. Reducing fetch size from 13MB to 4MB.  Decoding time is obviously proportional to fetch response size.

I noticed during testing that message size also effects decoding time.  A 1MB fetch response with 16b messages is
decoded significantly slower than a 1MB fetch response with 1K message size.  The bottom line is that you need to
monitor event loop lag when using a high level consumer (really any Node process that has any real time requirements)
because if something like decoding blocks the event loop for too long then the consumers will infinitely rebalance.

Note a worthwhile future enhancement to the no-kafka library is to make all decoding async which would avoid this
types of issues.  However if you use the default fetch size 1MB, you shouldn't run into any issues.

## Running this test
    node index.js
    
Notice that reading a 1MB fetch response buffer takes ~250ms and reading a 6MB fetch response buffer takes ~1.3sec.
I ran with Node versions 0.10, 4.x, 6.x.