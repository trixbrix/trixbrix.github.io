## Features
The TrixBrix Bluetooth Switch is an enclosed servo motor capable of actuating genuine LEGO train switch tracks. It integrates seamlessly into the Powered Up system.

### Connection Types
- Standalone, to a [LEGO remote](https://www.lego.com/en-us/product/remote-control-88010). The switch can be directly controlled by a dedicated remote.
- In a network of multiple devices. E.g. If you have two trains connected to a single remote, you can add a switch (or few) and still control it by just one remote.
- To the PoweredUP application.

### Pairing process
All devices working within the Powered Up system have to be paired before use. The TrixBrix switch pairs just as any other LEGO Powered UP device. To connect it to a remote for the first time, turn both devices on by pressing the button and then, press and hold both buttons to start the pairing process. A connection will be established when the LEDs stop blinking. You may then release the buttons.

### Networks and automatic reconnection
Each device connecting to a central gets assigned the same network id. So the next time when any combination of those devices gets powered up, in any order, they will connect automatically and work together without the need to go through the pairing process again.

The network id can be reset to form a separate network. To do so, on a powered-off switch or hub, press and hold the button until the LED starts flashing purple. After releasing the button, the device will power on normally and once paired to a remote, it will form a new network.

### Rechargeable battery
The battery is rechargeable via the micro-USB port. When acting as a central device, it lasts for about 3 hours of playtime. When connected to an app, or a different central, it should power the switch for roughly 4 hours. Once the battery gets low, the LED will start blinking yellow.

### Servo
Out of the box, the servo is controlled by port A of the remote. The red 'stop' button toggles the current position. To switch a device to port B, hold the button for at least a second and then, after releasing, push it quickly 3 times.

> The full original manual lives in the firmware source repo (`MANUAL.md`). This page will be re-synced from there each time `publish-device.sh` is run.
