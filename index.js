// Creating a UDP service
const dgram = require('dgram');
const dnsPacket = require('dns-packet');

const server = dgram.createSocket('udp4');

const db = {
    'test.dev': {
        type: 'A',
        data: '1.2.3.4'
    },
    'xyz.com': {
        type: 'CNAME',
        data: 'hashnode.dev'
    }
}

server.on('message', (msg, rinfo) => {
    const incomingReq = dnsPacket.decode(msg);
    const domain = incomingReq.questions[0].name;

    const ipFromDB = db[domain];

    if (!ipFromDB) {
        console.log(`Domain not found: ${domain}`);

        // Send empty response (no answers)
        const response = dnsPacket.encode({
            type: 'response',
            id: incomingReq.id,
            flags: dnsPacket.RECURSION_DESIRED,
            questions: incomingReq.questions,
            answers: []
        });

        return server.send(response, rinfo.port, rinfo.address);
    }

    const ans = dnsPacket.encode({
        type: 'response',
        id: incomingReq.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingReq.questions,
        answers: [{
            type: ipFromDB.type,
            class: 'IN',
            name: domain,
            data: ipFromDB.data
        }]
    });

    server.send(ans, rinfo.port, rinfo.address);
});

server.bind(53, () => {
    console.log('DNS server running on port 53')
})