# no-kafka-test-case

## Intro

I am running a system that processes about 3M messages per day.  It uses Node 0.10, Kafka 0.9 and high level consumers
using no-kafka 2.5.6.  When fetch sizes get large, the consumers start to rebalance infinitely.  The culprit appears
to be the synchronous call to deserialize a fetch response from 
[within client.js](https://github.com/oleksiyk/kafka/blob/v2.5.6/lib/client.js#L337).  That call is taking 250ms-1.3
secs with the test fetch responses included in this project.  The node event loop shouldn't be blocked for >250ms.

## Running this test
    node index.js
    
Notice that reading a 1MB fetch response buffer takes ~250ms and reading a 6MB fetch response buffer takes ~1.3sec.
I ran with Node versions 0.10, 4.x, 6.x.