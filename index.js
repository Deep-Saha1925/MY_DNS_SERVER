const dgram = require('dgram');
const dnsPacket = require('dns-packet');

const server = dgram.createSocket('udp4');

const db = {
    'test.dev': [
        { type: 'A', data: '1.2.3.4' }
    ],
    'xyz.com': [
        { type: 'CNAME', data: 'hashnode.dev' }
    ]
};

server.on('message', (msg, rinfo) => {
    const incomingReq = dnsPacket.decode(msg);

    const questions = incomingReq.questions || [];
    const answers = [];

    for (let q of questions) {
        const domain = q.name;

        // 🔇 Ignore reverse DNS noise
        if (domain.endsWith('in-addr.arpa')) continue;

        const records = db[domain];

        if (!records) {
            console.log(`Domain not found: ${domain}`);
            continue;
        }

        // Add all records from DB (A, CNAME, etc.)
        for (let record of records) {
            answers.push({
                type: record.type,
                class: 'IN',
                name: domain,
                ttl: 300, // good practice
                data: record.data
            });
        }
    }

    const response = dnsPacket.encode({
        type: 'response',
        id: incomingReq.id,

        // ✅ Proper flags
        flags:
            dnsPacket.AUTHORITATIVE_ANSWER |
            dnsPacket.RECURSION_DESIRED |
            dnsPacket.RECURSION_AVAILABLE,

        questions: questions,
        answers: answers
    });

    server.send(response, rinfo.port, rinfo.address);
});

server.on('listening', () => {
    const addr = server.address();
    console.log(`DNS server running on ${addr.address}:${addr.port}`);
});

server.bind(53);