### Hamster walkie talkies

Setup pi zero w:

- format sd card - pi formatter
- install git
- install nvm
- install node arm (https://gist.github.com/traumverloren/7b1140e6c438988df755d047e1e98a7b)
- enable i2c (sudo rasps-config)
- install i2c mems mic (https://learn.adafruit.com/adafruit-i2s-mems-microphone-breakout/raspberry-pi-wiring-test)
- check working: `arecord -l`
- sudo apt-get install i2c-tools
- check i2c working: `i2cdetect -y 1`
- setup i2s audio output over pwm pins:
  - `sudo nano /boot/config.txt`
  - add: `dtoverlay=audremap, pins_12_13`
  - `sudo reboot`
  - check working: `aplay -l`
- git clone this repo
- add .env w/ secrets
- npm i

Useful links:

- https://pinout.xyz/pinout/pin36_gpio16
- https://pt.pinout.xyz/pinout/pin38_gpio20
- https://learn.adafruit.com/adding-basic-audio-ouput-to-raspberry-pi-zero/overview
- https://www.tinkernut.com/adding-audio-output-raspberry-pi-zero-tinkernut-workbench/
- https://forums.raspberrypi.com/viewtopic.php?p=1936253#p1936253
- https://www.instructables.com/Talking-Hamster-Hack/
- https://www.oodlestechnologies.com/blogs/recording-audio-in-raspberry-pi-3-using-nodejs/
