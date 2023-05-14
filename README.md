### Hamster walkie talkies

Setup pi zero w:

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

Useful links:

- https://pinout.xyz/pinout/pin36_gpio16
- https://pt.pinout.xyz/pinout/pin38_gpio20
- https://learn.adafruit.com/adding-basic-audio-ouput-to-raspberry-pi-zero/overview
- https://www.tinkernut.com/adding-audio-output-raspberry-pi-zero-tinkernut-workbench/
- https://forums.raspberrypi.com/viewtopic.php?p=1936253#p1936253
- https://www.instructables.com/Talking-Hamster-Hack/
- https://www.oodlestechnologies.com/blogs/recording-audio-in-raspberry-pi-3-using-nodejs/
