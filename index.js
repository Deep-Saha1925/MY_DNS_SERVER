// Creating a UDP service
const dgram = require('dgram');

const server = dgram.createSocket('udp4')

server.on('message', (msg, rinfo) => {
    console.log('Incoming msg', msg.toString());
})

server.bind(53, () => {
    console.log('DNS server running on port 53')
})