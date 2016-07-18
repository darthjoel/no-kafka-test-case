# no-kafka-test-case

## Intro

I am running a system that processes about 3M messages per day.  It uses Node 0.10, Kafka 0.9 and high level consumers
using no-kafka 2.5.6.  When fetch sizes get large, the consumers start to rebalance infinitely due to event loop lag 
spiking to high levels (over 1 sec).  The culprit appears to be the synchronous call to deserialize a fetch response from 
[within client.js](https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L337) as well as the synchronous call
to [_mapTopics](https://github.com/oleksiyk/kafka/blob/master/lib/client.js#L57).  Combined these 2 calls are taking
2.7-32secs with the test fetch responses included in this project.  The node event loop cannot be blocked for that long
or the consumer heartbeat requests not be sent on time.

## Running this test
    node index.js
    
Notice that reading a 1MB fetch response buffer takes ~250ms and reading a 6MB fetch response buffer takes ~1.3sec.
I ran with Node versions 0.10, 4.x, 6.x.