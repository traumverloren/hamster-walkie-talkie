const spawn = require('child_process').spawn
const musicFileName = new Date().getTime() // generating the music file name
const MPR121 = require('mpr121'),
      mpr121  = new MPR121(0x5A, 1);

// listen for touch events
mpr121.on('touch', (pin) => console.log(`pin ${pin} touched`));

// listen for release events
mpr121.on('release', (pin) => console.log(`pin ${pin} released`));

// arecord -D plughw:0 -c1 -r 48000 -f S32_LE -t wav -V mono -v file.wav

const process = spawn('arecord', ['-D', 'plughw:0', '-c1', '-r', '48000', '-d', '5', '-f', 'S32_LE', '-t', 'wav', '-V', 'mono', '-v', `${musicFileName}.wav`])
process.on('exit', function(code, sig) { // if arecord process success
                    if (code !== null && sig === null) {

                    }
                });
process.stderr.on('data', function(data) {
                    console.log("music record stderr :" + data);
                });
                process.stdout.on('data', function(data) {
                   console.log(' music record stdout data: ' + data);
                });
                setTimeout(function() {
                    process.kill('SIGTERM');
                }, 30000);
