import cv2
from flask import Flask, render_template, Response
from flask_socketio import SocketIO
from datetime import datetime
import base64
from deepface import DeepFace
import threading
import mysql.connector
import os
import time
import pyttsx3
import random
from pathlib import Path
import requests


app = Flask(__name__)
socketio = SocketIO(app)

cap = cv2.VideoCapture(0)
scaling_factor = 1

# Load Haarcascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# MySQL database configuration
db_config = {
   'host': 'localhost',
   'user': 'root',
   'password': '',
   'database': 'ai'
}


last_recorded_name = None
last_recorded_timestamp = None
namein1hour = set()

def store_data_to_mysql(most_similar_id, emotions, age, gender, face_encoded, frame_encoded):
    global last_recorded_name, last_recorded_timestamp, namein1hour
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        current_time = time.time()
        if most_similar_id in namein1hour and current_time - last_recorded_timestamp.get(most_similar_id, 0) < 3600:
            print("Skipping duplicate entry for", most_similar_id)
            return

        last_recorded_timestamp = {} if last_recorded_timestamp is None else last_recorded_timestamp
        last_recorded_timestamp[most_similar_id] = current_time


        cursor.execute("SELECT EmoID FROM emotion WHERE EmoName = %s", (emotions,))
        emoid = cursor.fetchone()[0]

        query = "INSERT INTO transaction (Date_time, CSGender, CSAge, CSID, EmoID, S_Pic, L_Pic) VALUES (NOW(), %s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (gender, age, most_similar_id, emoid, face_encoded, frame_encoded))
        connection.commit()

        print("Data stored successfully")

        # Update the last recorded timestamp
        last_recorded_timestamp[most_similar_id] = current_time
        namein1hour.add(most_similar_id)

    except mysql.connector.Error as error:
        print("Failed to insert data into MySQL table:", error)

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")


TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"
def speak_message(message):
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1)
    engine.setProperty('voice', TH_voice_id)
    engine.say(message)
    engine.runAndWait()

def get_message_based_on_emotion(emotion_text):
    emoid = requests.get('http://localhost:8081/emotionid', params={'emotion': emotion_text}).json()[0]['EmoID']

    messages = requests.get('http://localhost:8081/textid', params={'EmoID': emoid}).json()

    # If there are messages for the predicted emotion, return a random message
    if messages:
        return random.choice(messages)['Message']
    else:
        return None
    
def analyze_face(face):
    # Analyze emotions, age, and gender
    emotions = DeepFace.analyze(face, actions=['emotion', 'age', 'gender'], enforce_detection=False)
    emotion_text = emotions[0]['dominant_emotion']
    age_text = emotions[0]['age']
    # age_range = f"{age_text - 5} - {age_text + 5}"
    gender_text = emotions[0]['dominant_gender']
    message = get_message_based_on_emotion(emotion_text)
    if message:
        speak_message(message)

    return emotion_text, age_text, gender_text

# Capture face and result
def camera_stream():
    while True:
        ret, frame = cap.read()
        frame = cv2.resize(frame, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)
        # frame = cv2.flip(frame, 1)
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d   %H:%M:%S")
        cv2.putText(frame, f'Time: {timestamp}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, flags=cv2.CASCADE_SCALE_IMAGE)

        for (x, y, w, h) in faces:
            face = frame[y:y+h, x:x+w]
            max_size = 100
            height, width = face.shape[:2]
            if height > max_size or width > max_size:
                if height > width:
                    scale_factor = max_size / height
                else:
                    scale_factor = max_size / width
                face_resized = cv2.resize(face, (int(width * scale_factor), int(height * scale_factor)))
            else:
                face_resized = face

            # Encode face_resized image to base64 with data:image/jpeg;base64,
            face_encoded = base64.b64encode(cv2.imencode('.jpg', face_resized)[1]).decode('utf-8')
            face_encoded = f"data:image/jpeg;base64,{face_encoded}"

            # Encode frame image to base64 with data:image/jpeg;base64,
            frame_encoded = base64.b64encode(cv2.imencode('.jpg', frame)[1]).decode('utf-8')
            frame_encoded = f"data:image/jpeg;base64,{frame_encoded}"

            cv2.imwrite('face.jpg', face)
            cv2.imwrite('frame.jpg', frame)

            # dbpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp")
            current_directory = Path(__file__).parent
            dbpath = current_directory.parent.parent / 'AI DEV' / 'Admin' / 'frontend' / 'img_test'
            dbpath_str = str(dbpath)
            results = DeepFace.find(img_path='face.jpg', db_path=dbpath_str, model_name='VGG-Face', enforce_detection=False)

            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            if results and not results[0].empty:
                first_result_df = results[0]
                most_similar_path = first_result_df.iloc[0]['identity']
                most_similar_id = os.path.splitext(os.path.basename(most_similar_path))[0]
            else:
                most_similar_id = 0

            cursor.execute("SELECT CSName FROM csuser WHERE CSID = %s", (most_similar_id,))
            result = cursor.fetchone()
            if result:
                most_similar_name = result[0]
            else:
                most_similar_name = "Stranger"  # Handle case where CSName is not found in the database

            emotions, age, gender = analyze_face(face)  # Analyze face using DeepFace

            # Emit data over socket
            socketio.emit('data', {'name': most_similar_name, 'emotion': emotions, 'age_range': age, 'gender': gender, 'faceimg': face_encoded})

            # Store data to MySQL
            store_data_to_mysql(most_similar_id, emotions, age, gender, face_encoded, frame_encoded)


            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 255), 1)
            
  
# Only Stream video
def gen_frames():
    while True:
        ret, frame = cap.read()
        frame = cv2.resize(frame, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, flags=cv2.CASCADE_SCALE_IMAGE)

        for (x, y, w, h) in faces:
            frame[y:y+h, x:x+w]
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 255), 1)

        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d   %H:%M:%S")
        cv2.putText(frame, f'Time: {timestamp}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        _, encoded_frame = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + encoded_frame.tobytes() + b'\r\n\r\n')



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    thread = threading.Thread(target=camera_stream)
    thread.daemon = True
    thread.start()
    socketio.run(app)
