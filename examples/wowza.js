// Yellowstone Example.
// Connect to the RTSP server
// Once connected, open a file, write the SPS and PPS and then start streaming

const { RtspClient, H264Transport } = require('../lib');
const fs = require('fs');

const url = 'rtsp://admin:12345@192.168.1.78:554/Streaming/Channels/101?transportmode=unicast&profile=Profile_101';
const filename = 'video.264';


const client = new RtspClient();

// details is a plain Object that includes...
//   format - string
//   mediaSource - media portion of the SDP
//   transport RTP and RTCP channels

client.connect(url, { keepAlive: true }).then((details) => {
  console.log('Connected. Video format is', details.format);

  // Open the output file
  if (details.isH264) {
    //const h264 = new H264Transport(client, fs.createWriteStream("bigbuckbunny.264"), details);
  }

  client.play();
}).catch(err=>{
    console.log(err);
});

// data == packet.payload, just a small convenient thing
// data is for RTP packets
client.on('data', function(channel, data, packet, rtspMessage, rtspPacket) {
  console.log('RTP Packet', 'ID=' + packet.id, 'TS=' + packet.timestamp, 'M=' + packet.marker, data.slice(0, 20));

  const buf = Buffer.concat([Buffer.from(rtspMessage), rtspPacket])
  console.log('RTSP data raw packet: ', data.length, data.slice(0, 20), '\n');
});

// control data is for RTCP packets
client.on('controlData', function(channel, rtcpPacket, rtspMessage, rtspPacket) {
    console.log('RTCP Control Packet', 'TS=' + rtcpPacket.timestamp, 'PT=' + rtcpPacket.packetType);
    //console.log('RTSP packet: ', rtspPacket.slice(0, 20));
});

// allows you to optionally allow for RTSP logging
// also allows for you to hook this into your own logging system easily
client.on('log', function(data, prefix) {
  //console.log(prefix + ': ' + data);
});

client.on('message', function(requestName, id, req, resp) {
    //console.log('[Method] ', requestName);
    //console.log('[CSeq] ', id);
    //console.log('[Request]');
    console.log(req);
    //console.log('[Response]');
    console.log(resp);
});

client.once('data', ()=>{
    setTimeout(()=>{
        client.close(false);
    }, 3000);
})
