require("dotenv").config();
const setTimeout = require("timers/promises").setTimeout;
const mqtt = require("mqtt");
const fs = require("fs");
const spawn = require("child_process").spawn;
const MPR121 = require("mpr121");
const mpr121 = new MPR121(0x5a, 1);
const WaveFile = require("wavefile").WaveFile;
const ws281x = require('rpi-ws281x-native');
let childRecord;
let childPlay;

const inLocalMode = true;
let isRecording = false;

const brightness = 120;

// colors are GRB!
const options = {
  gpio: 10,
  brightness: brightness,
  stripType: ws281x.stripType.SK6812W,
};

const channel = ws281x(1, options);
const colors = channel.array;

colors[0] = 0x000000;
ws281x.render();

// update color-values
colors[0] = 0x00ffff;
ws281x.render();

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
  if (topic === process.env.TOPIC_SUB) {
    console.log(`${process.env.TOPIC_SUB} received`);
    if (!inLocalMode) playFile(payload);
  }
});

// reassurance that the connection worked
client.on("connect", () => {
  console.log("Connected!");
  colors[0] = 0x000000;
  ws281x.render();
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
  if (state && !isRecording) {
    startRecording();
  } else {
    if (childRecord && isRecording) {
      stopRecording();
    }
  }
});

// arecord -D plughw:0 -c1 -r 48000 -f S32_LE -t wav -V mono -v file.wav
const startRecording = () => {
  colors[0] = 0x0000ff;
  ws281x.render();

  isRecording = true;

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
      isRecording = false;
      inLocalMode ? playFile(voiceFile) : sendFile(voiceFile);
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
  const file = inLocalMode ? payload : await createWavFile(payload);
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

const stopRecording = async () => {
  colors[0] = 0x0088ff;
  ws281x.render();
  await setTimeout(1000)
  colors[0] = 0x000000;
  ws281x.render();

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
  await setTimeout(2000);
  fs.unlink(path, (err) => {
    if (err) throw err; //handle your error the way you want to;
    console.log(`${path} was deleted`); //or else the file will be deleted
  });
};
