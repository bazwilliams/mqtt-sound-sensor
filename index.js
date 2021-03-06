#!/usr/bin/env node
"use strict";

const SoundDetection = require('sound-detection');
const program = require('commander');
const mqtt = require('mqtt');

program
    .version('0.0.1')
    .option('-u --url <url>', 'Set the URL to the IP Camera')
    .option('-h --host <host>', 'MQTT broker host [localhost]')
    .option('-t --topic <topic>', 'MQTT topic to publish onto')
    .option('-b --bit-depth <n>', 'Bit depth of audio stream [16]', parseInt)
    .option('-c --channels <n>', 'Number of Channels [1]', parseInt)
    .parse(process.argv);

let options = {
    url: program.url || process.env.AUDIO_URL,
    format: {
        bitDepth: program.bitDepth || process.env.BITDEPTH || 16,
        numberOfChannels: program.channels || process.env.CHANNELS || 1,
        signed: true
    }
}

let mqttTopic = program.topic || process.env.MQTTTOPIC;

if (!(options.url && mqttTopic)) {
    program.outputHelp();
    process.exit(1);
}

let client = mqtt.connect(program.host || process.env.MQTTHOST || "mqtt://localhost");
console.log(`Connecting: ${client.options.href}`);

let lastPublishedValue = -80;

let detector = new SoundDetection(options, (dB) => {
    if (Math.abs(lastPublishedValue - dB) > 2) {
        client.publish(mqttTopic, `${dB.toFixed(1)}`);
        lastPublishedValue = dB;
    }
});

client.on('connect', (connack) => {
    console.log('Connected');
    if (!connack.sessionPresent) {
        detector.start();
    }
});

client.on('error', (err) => {
    console.error(`MQTT Client Error: ${err}`);
});
