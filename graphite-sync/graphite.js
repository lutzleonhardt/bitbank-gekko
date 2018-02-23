// Nodejs Graphite Library
//  TODO: Cleanup this header and cleanup comments
//  Thanks to aronatkins (https://github.com/aronatkins) and the statsd project for the pickle code :)
//  Example code found here: https://github.com/aronatkins/statsd/blob/2c6b83b0d9bcb19466b3da419bb6c2cc06f9ccfb/backends/graphite.js
//  statsd License: https://github.com/aronatkins/statsd/blob/2c6b83b0d9bcb19466b3da419bb6c2cc06f9ccfb/LICENSE




var net = require('net');


// Minimally necessary pickle opcodes.
var MARK = '(',
    STOP = '.',
    LONG = 'L',
    STRING = 'S',
    APPEND = 'a',
    LIST = 'l',
    TUPLE = 't';



// toSimple (key, value, ts)
// Returns Graphite String
exports.toSimple = function(key, value, ts) {
    // Lets build a pickle!!!!!!
    return key + " " + value + " " + ts;
};


// pickleArray expects an array of hashes
// example:
// 		[{key:'', value:0, ts: 0}, {key:'', value:0, ts: 0}....]
exports.stringArray = function (array){
    var testVar = "";
    for (var i = 0; i < array.length; i++){
        if (array[i] && array[i].key && array[i].value && array[i].ts)
            testVar += exports.toSimple(array[i].key, array[i].value, array[i].ts) + "\n";
    }
    return testVar;
}


// Returns a Python Pickle of the three values
exports.toPickle = function(key, value, ts) {
    // Lets build a pickle!!!!!!
    return MARK + STRING + '\'' + key + '\'\n' + MARK + LONG + ts + 'L\n' + STRING + '\'' + value + '\'\n' + TUPLE + TUPLE + APPEND;
};


// pickleArray expects an array of hashes
// example:
// 		[{key:'', value:0, ts: 0}, {key:'', value:0, ts: 0}....]
exports.pickleArray = function (array){
    var testVar = "";
    for (var i = 0; i < array.length; i++){
        if (array[i] && array[i].key && array[i].value && array[i].ts)
            testVar += exports.toPickle(array[i].key, array[i].value, array[i].ts);
    }
    return testVar;
}



// connect to graphite server on the given port. Only supports TCP for now. Once the connection
// has been established, the callback is executed with the socket. If there is an error, the connection
// is killed.

exports.connect = function(graphiteServer, graphitePort, callback){
    socket = net.createConnection(graphitePort, graphiteServer);

    console.log("-> [ Graphite Connecting... ]");
    socket.on("connect", function(){
        console.log("-> [ Graphite Connection established ]");
        callback(socket);
    });

    socket.on("error", function(error){
        exports.endSimple(socket);
        console.log("<- [ Graphite Connection error:", error, "]");
    });
}


// SendSimple expects two or three variables:
//   1. socket: this is the net socket used to talk to graphite. Create the socket using
//             mahGraphite.connect(pocklePort, graphiteServer, callback)
//   2. txtString: this is a string in the following format: "$path $metric $timestamp"
//   3. callback: The callback is optional. If we give a callback, we wait for the
//             server to confirm the sent data. This takes a bit more, but is safer as
//             we confirm the send. If we do not give a callback, there is no wait for
// 			   confirmation. So for example if you only open the graphite connection
//             when sending, you might end up killing the socket before all metrics get
//  		   sent

exports.SendSimple = function(socket, txtString, callback){

    if (callback){
        socket.write(txtString + "\n", function() {
            callback();
        });
    } else {
        socket.write(txtString + "\n");
        return;
    }
}


// sendPickles expects two or three variables:
//  1. socket: this is the net socket used to talk to graphite. Create the socket using
//             mahGraphite.connect(pocklePort, graphiteServer, callback)
//  2. pickles: long string of 'pickles' generated using the toPickle function. You
//             can join the returns from toPickle in a long string without any seperator.
//  3. callback: The callback is optional. If we give a callback, we wait for the
//             server to confirm the sent data. This takes a bit more, but is safer as
//             we confirm the send. If we do not give a callback, there is no wait for
// 			   confirmation. So for example if you only open the graphite connection
//             when sending, you might end up killing the socket before all metrics get
//  		   sent.

exports.sendPickles = function(socket, pickles, callback){

    // Prepare Pickles....
    var body = MARK + LIST + pickles + STOP;

    // The first four bytes of the graphite pickle format
    // contain the length of the rest of the payload.
    // We use Buffer because this is binary data.
    var buf = new Buffer(4 + body.length);

    buf.writeUInt32BE(body.length,0);
    buf.write(body,4);


    if (callback){
        socket.write(buf, function() {
            callback();
        });
    } else {
        socket.write(buf);
        return;
    }
}


// Close the Graphite Connection
exports.close = function(socket){
    socket.end();
    console.log("-> [ Graphite Connection Closed ]");
}

