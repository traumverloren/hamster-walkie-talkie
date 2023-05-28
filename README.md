# Hamster walkie talkies

Make a pair (or army) of ridiculous toy hamsters that can send/receive voice messages from anywhere in the world using MQTT. Be prepared to debug hamsters!

![hamster-diagram](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/cb510b99-b6fe-473c-b431-5e8818b493fc)

![](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/27419332-ba33-4313-934f-5c0328e1228f)


## Materials:
- Raspberry Pi Zero W
- Talking hamster ([amazon](https://amzn.eu/d/eBBaJ0Z)) - note this specific hamster has the hackable board w/o integrated piezo mic!
- Adafruit I2S MEMS microphone
- Adafruit MPR121 Capacitive touch breakout
- Adafruit NeoPixel
- 270Ω Resistor
- 150Ω Resistor
- 2.2kΩ Resistor
- 100Ω Resistor
- 2 x 10µF electrolytic capacitor
- 33nF ceramic capacitor
- Proto board
- Shrink tubing
- Heat glue gun
- Soldering iron
- Heat gun (optional)
- wiring
- stemma QT to male connector
- male jumper cables (to connec to headers on pi)

## Setup hamster:
- Assemble circuitry as shown above.
- Remove hamster skin by cutting ziptie at bottom.
- Insert circuit into hamster and file plastic case

![IMG_4852 Medium](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/1ceb649a-0f48-425f-839c-f4df827385a3)

![EC1CAC29-6966-414C-A06B-5220EEAE1530 Medium](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/0669f682-d379-4b13-b47c-bf56706bc798)

![IMG_4842 Medium](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/6dd87338-6936-43e8-a13d-650c75d46ebb)

![0A381C62-839B-45C0-91DE-566B17489EF3 2 Medium](https://github.com/traumverloren/hamster-walkie-talkie/assets/9959680/d5fe9743-1867-4313-a5ff-eec1bea3343e)


## Setup pi zero w:

- format sd card - pi formatter
- install git
- install nvm
- install node arm (https://gist.github.com/traumverloren/7b1140e6c438988df755d047e1e98a7b)
- enable i2s & spi in `sudo raspi-config` (Interface options menu)
- install i2s mems mic (https://learn.adafruit.com/adafruit-i2s-mems-microphone-breakout/raspberry-pi-wiring-test)
- check working: `arecord -l`
- enable autoloading of i2c: https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c#installing-kernel-support-with-raspi-config-5-4
- `sudo apt-get install i2c-tools`
- check i2c working: `i2cdetect -y 1`
- setup i2s audio output over pwm pins:
  - `sudo nano /boot/config.txt`
  - add: `dtoverlay=audremap, pins_12_13`
  - then `sudo reboot now`
  - check working: `aplay -l`
  - if necessary, update to use audio over headphones in `sudo raspi-config`
- git clone this repo
- add .env w/ secrets
- npm i
- add the following to`/boot/config.txt` for neopixels to work properly:

  ```shell
  # Fix for running neopixels on SPI (GPIO 10)
  core_freq=250
  ```

- update so can run node/npm with sudo (needed for neopixels):

  ```shell
  sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
  sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
  ```

- run `npm start`
- setup pm2:
  ```shell
  npm i -g pm2
  pm2 startup # setup pm2 to run at boot
  sudo env PATH=$PATH:/home/pi/.nvm/versions/node/v18.16.0/bin /home/pi/.nvm/versions/node/v18.16.0/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi # run command returned from above
  pm2 start npm --name "YOURNAMEHERE" -- start
  pm2 save
  pm2 logs
  ```

Useful links:

- https://pinout.xyz/pinout/pin36_gpio16
- https://pt.pinout.xyz/pinout/pin38_gpio20
- https://learn.adafruit.com/adding-basic-audio-ouput-to-raspberry-pi-zero/overview
- https://www.tinkernut.com/adding-audio-output-raspberry-pi-zero-tinkernut-workbench/
- https://forums.raspberrypi.com/viewtopic.php?p=1936253#p1936253
- https://www.instructables.com/Talking-Hamster-Hack/
- https://www.oodlestechnologies.com/blogs/recording-audio-in-raspberry-pi-3-using-nodejs/
