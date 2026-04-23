// Creating a UDP service
const dgram = require('dgram');
const dnsPacket = require('dns-packet');

const server = dgram.createSocket('udp4');

const db = {
    'test.dev': '1.2.3.4',
    'xyz.com': '4.5.6.7'
}

server.on('message', (msg, rinfo) => {
    //console.log('Incoming msg', msg.toString());
    const incomingReq = dnsPacket.decode(msg);
    const ipFromDB = db[incomingReq.questions[0].name]

    const ans = dnsPacket.encode({
        type: 'response',
        id: incomingReq.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingReq.questions,
        answers: [{
            type: 'A',
            class: 'IN',
            name: incomingReq.questions[0].name,
            data: ipFromDB
        }]
    })
    server.send(ans, rinfo.port, rinfo.address)
})

server.bind(53, () => {
    console.log('DNS server running on port 53')
})