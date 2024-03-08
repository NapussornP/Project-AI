from flask import Flask, Response
import cv2

app = Flask(__name__)

# OpenCV VideoCapture with camera index 0
camera = cv2.VideoCapture(0)

# Set the camera resolution for portrait mode
camera.set(cv2.CAP_PROP_FRAME_WIDTH, 800)  # Width becomes the height
camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 800)  # Height becomes the width


def gen_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
