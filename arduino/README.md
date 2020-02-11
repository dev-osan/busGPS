# Instructions for getting the Arduino up and running

### Connecting to a network the first time
After getting the hardware configured and plugging in the arduino with the SIM card installed and activated, you need to perform the following steps. This is accurate for running in South Korea, where it was developed.

1. Download and install the library for testing the hat. https://github.com/botletics/SIM7000-LTE-Shield/wiki/Arduino-IDE-Setup#installing-libraries

2. Run the example program titled SIM7XXX_LTE_DEMO

3. Test the commands that show up in the serial monitor and see if you can get a GPS fix, turn on GPRS, and send an example 'dweet'. You don't need to code anything here. Likely, you won't be able to get GPRS turned on, which is for your data connection.

4. Type in `S` in the serial monitor to enter the serial tube mode. Follow the guide here: https://github.com/botletics/SIM7000-LTE-Shield/wiki/Testing-AT-Commands

5. This next step is following one of the troubleshooting steps on this page: https://github.com/botletics/SIM7000-LTE-Shield/wiki/Connecting-to-Network - Check which networks your module sees by running AT+COPS=? (Note that it might take several seconds). You might get a response like "+COPS: (2,"AT&T","AT&T","310410",7),(1,"310 260","310 260","310260",0),(1,"311 480","311 480","311480",7),(1,"313 100","313 100","313100",7),,(0,1,2,3,4),(0,1,2)"
Once you get a list of networks you can try to manually connect to one of them using a command like AT+COPS=1,2,"310410",7 (Change the six-digit network code with the one you see above). You could also just do AT+COPS=1,2,"310410" without the last number.

6. Make sure you have the customized version of this library installed, compile, and run on the arduino. You should see it boot up, pull down route information, and start getting GPS reads. If it doesn't, try going outside. If it still gives you problems, it may be that the battery is dead. Leave it plugged in for about 10 minutes to recharge and try again.

### SIM Card
This project was built around using the Hologram SIM card, if you want to use something else, you'll have to make a few adjustments to the code. Read the documentation for the hat in order to understand how to do that. https://github.com/botletics/SIM7000-LTE-Shield/wiki