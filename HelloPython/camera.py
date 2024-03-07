from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import threading
import mysql.connector
import base64
import numpy as np

app = Flask(__name__)
CORS(app)

# Set up database connection
db_connection = mysql.connector.connect(
    host="localhost",
    user='root',
    password='',
    database='ai'
)
cursor = db_connection.cursor()

video = cv2.VideoCapture(0)

if not video.isOpened():
    print("Error opening the camera.")
    exit()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

emotion_info = {"emotion": "", "age": "", "gender": ""}

def get_images_and_names_from_database():
    query = "SELECT CSImg, CSName FROM csuser"
    cursor.execute(query)
    return cursor.fetchall()

def detect_emotion(face_roi, x, y, w, h, img_flipped):
    try:
        # Get base64 images and names from the database
        database_images_and_names = get_images_and_names_from_database()
        found_face = False

        for cs_img, cs_name in database_images_and_names:
            print("now precess: ", cs_name)

            # Convert base64 image to numpy array
            db_image_np = np.frombuffer(base64.b64decode(cs_img), dtype=np.uint8)
            db_image = cv2.imdecode(db_image_np, cv2.IMREAD_COLOR)

            # Convert the current face_roi to base64 for comparison
            current_image_base64 = base64.b64encode(cv2.imencode('.jpg', face_roi)[1].tobytes()).decode('utf-8')
            print("db_path:", cs_img)
            print("img_path:", current_image_base64)

            result = DeepFace.find(img_path=current_image_base64, db_path=cs_img)

            if result.shape[0] > 0:
                print('1')
                name = cs_name
                found_face = True
                print("Face matched! Emotion analysis for", name)
                analysis = DeepFace.analyze(face_roi, actions=['emotion', 'age', 'gender'], enforce_detection=False)
                emotion_info["name"] = name

                # Draw rectangle and display name
                cv2.rectangle(img_flipped, (x, y), (x + w, y + h), (255, 0, 0), 2)
                cv2.putText(img_flipped, name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                # Rest of your code...
                break

        if not found_face:
            print('2')
            emotion_info["name"] = "unknown"
            # Draw rectangle and display "unknown"
            cv2.rectangle(img_flipped, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(img_flipped, "unknown", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

    except Exception as e:
        # Move the error print outside the loop to correctly set cs_name
        print("Error in processing image:", e)
        # Add cs_name for the error print to work correctly
        print("Processing image for", cs_name)


def gen_frames(video):
    while True:
        success, img = video.read()
        if not success:
            break

        img_resized = cv2.resize(img, (640, 480))
        img_flipped = cv2.flip(img_resized, 1)

        gray_scale = cv2.cvtColor(img_flipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        for (x, y, w, h) in faces:
            face_roi = img_flipped[y:y + h, x:x + w]

            # Use threading to run detect_emotion asynchronously
            threading.Thread(target=detect_emotion, args=(face_roi, x, y, w, h, img_flipped)).start()

        ret, buffer = cv2.imencode('.jpg', img_flipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(video), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/emotion_info')
def get_emotion_info():
    # Return emotion, age, and gender as JSON
    return jsonify(emotion_info)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
