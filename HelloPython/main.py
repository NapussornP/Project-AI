from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import threading
import mysql.connector
import base64

app = Flask(__name__)
CORS(app)


db_connection = mysql.connector.connect(
    host="localhost",
    user='root',
    password='',
    database='ai'
)
cursor = db_connection.cursor()


video = cv2.VideoCapture(0)

if not video.isOpened():
    print("Error open the camera.")
    exit()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

emotion_info = {"emotion": "", "age": "", "gender": ""}

def detect_emotion(face_roi, x, y, w, h, img_flipped):
    try:
        # analysis = DeepFace.analyze(face_roi, actions=['emotion', 'age', 'gender'], enforce_detection=False)
        # emotion = analysis[0]['dominant_emotion']
        # age = analysis[0]['age']
        # gender = analysis[0]['dominant_gender']


        img_test_path = '../frontend/img_test' 
        result = DeepFace.find(face_roi, db_path=img_test_path, enforce_detection=False)

        if result:
            analysis = DeepFace.analyze(face_roi, actions=['emotion', 'age', 'gender'], enforce_detection=False)
            emotion = analysis[0]['dominant_emotion']
            age = analysis[0]['age']
            gender = analysis[0]['dominant_gender']
            print("Face found in img_test folder!")
        else:
            print('Face not match')

        emotion_info["emotion"] = emotion
        emotion_info["age"] = age
        emotion_info["gender"] = gender
        
        # Print or handle the predicted results as needed
        print("Emotion:", emotion)
        print("Age:", age)
        print("Gender:", gender)

        # You can perform further actions with the predictions as needed
    except Exception as e:
        print("Error in processing:", e)


def gen_frames(video):
    while True:
        success, frame = video.read()
        if not success:
            break

        img_resized = cv2.resize(frame, (640, 480))
        img_flipped = cv2.flip(img_resized, 1)

        gray_scale = cv2.cvtColor(img_flipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        for (x, y, w, h) in faces:
            cv2.rectangle(img_flipped, (x, y), (x + w, y + h), (255, 0, 0), 2)

            face_roi = img_flipped[y:y + h, x:x + w]

            # Use threading to run detect_emotion asynchronously
            threading.Thread(target=detect_emotion, args=(face_roi, x, y, w, h, img_flipped)).start()

        ret, buffer = cv2.imencode('.jpg', img_flipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(video),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/emotion_info')
def get_emotion_info():
    # Return emotion, age, and gender as JSON
    return jsonify(emotion_info)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
