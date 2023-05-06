require("dotenv").config();
const mqtt = require('mqtt')
const fs = require("fs");
const spawn = require("child_process").spawn;
let voiceFile = `${new Date().getTime()}.wav`; // generating the music file name
const MPR121 = require("mpr121");
const mpr121 = new MPR121(0x5a, 1);
const WaveFile = require('wavefile').WaveFile;
const receivedFile = 'receivedFile.wav';
let childRecord;
let childPlay;

console.log("starting...");

const client = mqtt.connect(process.env.MQTT_HOST, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
  clientId: process.env.CLIENT_ID,
  clean: false,
  reconnectPeriod: 1,
});

// MQTT pub/sub
// prints a received message
client.on("message", function (topic, payload) {
  if (topic === "steph-message") {
    console.log("steph-message received");
    createWavFile(payload);
    playFile(receivedFile);
  }
});

// reassurance that the connection worked
client.on("connect", () => {
  console.log("Connected!");
});

// prints an error message
client.on("error", (error) => {
  console.log("Error:", error);
});

// subscribe and publish to the same topic
client.subscribe(process.env.TOPIC);

// listen for pin 5 events
mpr121.on(5, (state) => {
  console.log(`pin 5: ${state}`);
  if (state) {
    startRecording();
  } else {
    if (childRecord) {
      stopRecording();
      sendFile();
    }
  }
});

// arecord -D plughw:0 -c1 -r 48000 -f S32_LE -t wav -V mono -v file.wav
const startRecording = () => {
  childRecord = spawn("arecord", [
    "-D",
    "plughw:0",
    "-c1",
    "-r",
    "48000",
    "-f",
    "S32_LE",
    "-t",
    "wav",
    "-V",
    "mono",
    "-v",
    `${voiceFile}`,
  ]);

  childRecord.on("exit", function (code, sig) {
    if (code !== null && sig === null) {
      console.log("done recording");
    }
  });
  childRecord.stderr.on("data", function (data) {
    console.log("music record stderr :" + data);
  });
  childRecord.stdout.on("data", function (data) {
    console.log(" music record stdout data: " + data);
  });
};

const playFile = (file) => {
  childPlay = spawn('aplay', [`${file}`]);
  childPlay.on("exit", function (code, sig) {
    if (code !== null && sig === null) {
      console.log("done playing");
    }
  });
  childPlay.stderr.on("data", function (data) {
    console.log("music record stderr :" + data);
  });
};

const stopRecording = () => {
  console.log("stopped recording")
  childRecord.kill("SIGTERM");
};

const sendFile = () => {
  const recordedBuffer = new WaveFile(fs.readFileSync(voiceFile)).toBuffer();
  client.publish("steph-message", recordedBuffer);
};

const getAsByteArray = (file) => {
  console.log("creating file")
  const buffer = fs.readFileSync(file);
  return new Uint8Array(buffer);
};


const createWavFile = (bufferMsg) => {
  fs.writeFileSync('receivedFile.wav', bufferMsg);
}

// To delete file:
const deleteFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err; //handle your error the way you want to;
    console.log("path/file.txt was deleted"); //or else the file will be deleted
  });
};
