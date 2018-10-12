/**
 * TCP 代理
 * author: NOBO.ZHOU
 */
'use strict';
var net = require('net');

var cfg = require('./config.json');

var LOCAL_PORT = cfg.LOCAL_PORT;
//代理的TCP远程端口
var REMOTE_PORT = cfg.REMOTE_PORT;
//代理的TCP远程IP
var REMOTE_ADDR = cfg.REMOTE_ADDR;
//IP白名单
var W_IP = cfg.W_IP.split(',');

var UID = 1;
var connCount = 0;

var server = net.createServer(function(socket) {
	var clientIp = socket.remoteAddress.split(':')[3];
	
	if( W_IP.indexOf(clientIp) === -1 ) {
		console.log('deny access with ' + clientIp);
		socket.destroy();
		return;
	}
	
	console.log("客户端IP:" + clientIp);
	
    var serviceSocket = new net.Socket();
    var CID = UID++;
    connCount++;
    console.log(CID + '. 收到请求(连接数' + connCount + ')');
    socket.on('close', () => {
        connCount--;
        console.log(CID + '. 请求关闭(连接数' + connCount + ')');
    });
    socket.on('error', (e) => {
        console.log('socket', e);
    })
    serviceSocket.on('error', (e) => {
        console.log('serviceSocket', e);
    })
    serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_ADDR, function() {
        socket.pipe(serviceSocket);
        serviceSocket.pipe(socket);
    });
});

server.listen(LOCAL_PORT);
console.log("TCP server accepting connection on port: " + LOCAL_PORT);