from gpiozero import LED, Button
from signal import pause
from time import sleep
import threading
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# A=18, B=9, C=10, D=11, E=12, F=13, G=17
sega = LED(18)
segb = LED(9)
segc = LED(10)
segd = LED(11)
sege = LED(12)
segf = LED(13)
segg = LED(17)

# LED rouge pour alarme
red_led = LED(16)

# btn_activate et btn_reset
btn = Button(27, pull_up=True)
reset_btn = Button(20, pull_up=True)

# Alarm zones
zone1 = Button(22, pull_up=True)
zone2 = Button(5, pull_up=True)
zone3 = Button(6, pull_up=True)
zone4 = Button(19, pull_up=True)

# False= unarmed, True= armed
systemStatus = 0

stop_blinking_flag = threading.Event()

def show0():
    sega.off()
    segb.off()
    segc.off()
    segd.off()
    sege.off()
    segf.off()
    segg.on()

def show1():
    sega.off()
    segb.on()
    segc.off()
    segd.on()
    sege.on()
    segf.on()
    segg.on()

def show2():
    sega.off()
    segb.off()
    segc.on()
    segd.off()
    sege.on()
    segf.on()
    segg.off()

def show3():
    sega.off()
    segb.off()
    segc.off()
    segd.off()
    sege.on()
    segf.on()
    segg.off()

def show4():
    sega.off()
    segb.on()
    segc.off()
    segd.on()
    sege.on()
    segf.off()
    segg.off()

def show5():
    sega.on()
    segb.off()
    segc.off()
    segd.off()
    sege.off()
    segf.off()
    segg.off()

def show6():
    sega.on()
    segb.off()
    segc.off()
    segd.off()
    sege.off()
    segf.off()
    segg.off()

def show7():
    sega.off()
    segb.off()
    segc.off()
    segd.on()
    sege.on()
    segf.on()
    segg.on()

def show8():
    sega.off()
    segb.off()
    segc.off()
    segd.off()
    sege.off()
    segf.off()
    segg.off()

def show9():
    sega.off()
    segb.off()
    segc.off()
    segd.off()
    sege.on()
    segf.off()
    segg.off()

def showA():
    sega.off()
    segb.off()
    segc.off()
    segd.on()
    sege.off()
    segf.off()
    segg.off()

def cout_up():
    show0()
    sleep(1)
    show1()
    sleep(1)
    show2()
    sleep(1)
    show3()
    sleep(1)
    show4()
    sleep(1)
    show5()
    sleep(1)
    show6()
    sleep(1)
    show7()
    sleep(1)
    show8()
    sleep(1)
    show9()
    sleep(1)

def cout_down():
    show9()
    sleep(1)
    show8()
    sleep(1)
    show7()
    sleep(1)
    show6()
    sleep(1)
    show5()
    sleep(1)
    show4()
    sleep(1)
    show3()
    sleep(1)
    show2()
    sleep(1)
    show1()
    sleep(1)
    show0()
    sleep(1)

def activate_system():
    global systemStatus
    if systemStatus == 0:
        cout_up()
        showA()
        red_led.on()
        systemStatus = 1
    elif systemStatus == 1:
        cout_down()
        show0()
        red_led.off()
        systemStatus = 0

def handle_zone_alarm():
    if systemStatus == 1:
        if zone1.is_pressed:
            show1()
        elif zone2.is_pressed:
            show2()
        elif zone3.is_pressed:
            show3()
        elif zone4.is_pressed:
            show4()
        start_blinking()

def blink_red_led():
    while not stop_blinking_flag.is_set():
        red_led.on()
        sleep(0.5)
        red_led.off()
        sleep(0.5)

def start_blinking():
    stop_blinking_flag.clear()
    threading.Thread(target=blink_red_led).start()

def stop_blinking():
    stop_blinking_flag.set()
    red_led.off()

btn.when_pressed = activate_system
zone1.when_pressed = handle_zone_alarm
zone2.when_pressed = handle_zone_alarm
zone3.when_pressed = handle_zone_alarm
zone4.when_pressed = handle_zone_alarm
reset_btn.when_pressed = stop_blinking

show0()

# Routes Flask pour interagir avec le système via le web
@app.route('/arm', methods=['POST'])
def arm():
    activate_system()
    return jsonify({"status": "armed" if systemStatus else "disarmed"})

@app.route('/disarm', methods=['POST'])
def disarm():
    activate_system()
    return jsonify({"status": "disarmed"})

@app.route('/alarm', methods=['POST'])
def alarm():
    zone = request.json.get('zone')
    if zone in [1, 2, 3, 4]:
        if zone == 1:
            show1()
        elif zone == 2:
            show2()
        elif zone == 3:
            show3()
        elif zone == 4:
            show4()
        start_blinking()
        return jsonify({"status": f"alarm handled for zone {zone}"})
    else:
        return jsonify({"error": "Invalid zone"}), 400

@app.route('/reset', methods=['POST'])
def reset():
    stop_blinking()
    return jsonify({"status": "reset"})

if __name__ == '__main__':
    threading.Thread(target=lambda: app.run(host='0.0.0.0', port=5000)).start()

pause()
