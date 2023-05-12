require("dotenv").config();
const mqtt = require("mqtt");
const fs = require("fs");
const spawn = require("child_process").spawn;
const MPR121 = require("mpr121");
const mpr121 = new MPR121(0x5a, 1);
const WaveFile = require("wavefile").WaveFile;
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
  console.log(`${topic} received`);
  if (topic === process.env.TOPIC_SUB) {
    console.log(`${process.env.TOPIC_SUB} received`);
    playFile(payload);
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
client.subscribe(process.env.TOPIC_SUB);

// listen for pin 5 events
mpr121.on(5, (state) => {
  console.log(`pin 5: ${state}`);
  if (state) {
    startRecording();
  } else {
    if (childRecord) {
      stopRecording();
    }
  }
});

// arecord -D plughw:0 -c1 -r 48000 -f S32_LE -t wav -V mono -v file.wav
const startRecording = () => {
  const voiceFile = `${new Date().getTime()}.wav`; // generating the music file name
  childRecord = spawn("arecord", [
    "-D",
    "plughw:1",
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
      sendFile(voiceFile);
    }
  });
  childRecord.stderr.on("data", function (data) {
    console.log("music record stderr :" + data);
  });
  childRecord.stdout.on("data", function (data) {
    console.log("music record stdout data: " + data);
  });
};

const playFile = async (payload) => {
  const file = await createWavFile(payload);
  childPlay = spawn("aplay", [`${file}`]);
  childPlay.on("exit", function (code, sig) {
    if (code !== null && sig === null) {
      console.log("done playing");
      deleteFile(file);
    }
  });
  childPlay.stderr.on("data", function (data) {
    console.log("music record stderr :" + data);
  });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const stopRecording = async () => {
  await sleep(1000);
  console.log("stopped recording");
  childRecord.kill("SIGTERM");
};

const sendFile = (voiceFile) => {
  const recordedBuffer = new WaveFile(fs.readFileSync(voiceFile)).toBuffer();
  client.publish(process.env.TOPIC, recordedBuffer);
};

const createWavFile = async (bufferMsg) => {
  let receivedFile = `receivedFile-${new Date().getTime()}.wav`; // generating the music file name
  await fs.promises.writeFile(receivedFile, bufferMsg);
  return receivedFile;
};

// To delete file:
const deleteFile = async (path) => {
  await sleep(2000);
  fs.unlink(path, (err) => {
    if (err) throw err; //handle your error the way you want to;
    console.log(`${path} was deleted`); //or else the file will be deleted
  });
};
