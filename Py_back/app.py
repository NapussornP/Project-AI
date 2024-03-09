from flask import Flask, Response,jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import threading
from pathlib import Path
import os
# import tensorflow as tf
from datetime import datetime
import base64
import mysql.connector
# import warnings
# warnings.filterwarnings("ignore", category=DeprecationWarning, module="tensorflow")


app = Flask(__name__)
CORS(app)

# Initialize camera
video = cv2.VideoCapture(0)

connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="",
  database="ai"
)

db = connection.cursor()

if not video.isOpened():
    print("Error: Could not open video.")
    exit()

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Set up paths
current_directory = Path(__file__).parent
db_path = current_directory.parent.parent / 'AI' / 'Admin_AI' / 'frontend' / 'img_test'
# db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "a")
print('Check Path:', db_path)

def select_emoId(emoName):
    emo_id_querry = f"SELECT EmoID FROM emotion WHERE EmoName = '{emoName}' "
    try:
        db.execute(emo_id_querry)
        result = db.fetchone()
        if result:
            emo_id = result[0]
            return emo_id
    except mysql.connector.Error as err:
        print('Error db: ', err)
    return None

def insert_db(datetime, gender, age, cs_id, emotion, s_pic, l_pic ):
    
    emo_id = select_emoId(emotion)

    small_img = base64.b64encode(cv2.imencode('.jpg', s_pic)[1]).decode()
    large_img = base64.b64encode(cv2.imencode('.jpg', l_pic)[1]).decode()
    
    sql = '''INSERT INTO transaction (Date_time, CSGender, CSAge, CSID, EmoID, S_Pic, L_Pic)
        VALUES (%s, %s, %s, %s, %s, %s, %s)'''
    
    value = (datetime, gender, age, cs_id,emo_id,small_img,large_img)
    print('Querry:  ',datetime, gender, age, cs_id,emo_id)

    try:
        db.execute(sql,value)
        connection.commit()
    except db.connector.Error as err:
        print('Error db: ',err)



def face_detection(img_face, x, y, w, h, img_full_flip, saved_faces, db_path):
    try:

        datetime_detect = datetime.now()
        print(f"Date taken for detection: {datetime_detect} ")


        detec_emo = DeepFace.analyze(img_face, actions=['emotion', 'age', 'gender'], enforce_detection=False)
        emotion = detec_emo[0]['dominant_emotion']
        age = detec_emo[0]['age']
        gender = detec_emo[0]['dominant_gender']
        print(f"Emotion: {emotion}, Age: {age}, Gender: {gender}")

        face_recognition = DeepFace.find(img_face, db_path=db_path, enforce_detection=False)

        if face_recognition and not face_recognition[0].empty:

            print('Match')

            first_result = face_recognition[0]
            similar_face_path = first_result.iloc[0]['identity']
            similar_face_path = os.path.normpath(similar_face_path)
            print('Path facee: ',similar_face_path)
            cs_id,_ = os.path.splitext(os.path.basename(similar_face_path))

            print('name is: ', cs_id)

        else:
            print('Not match any')
            cs_id = 0

        insert_db(datetime_detect, gender, age, cs_id, emotion,img_face, img_full_flip) #insert into db

        face_id = f"{x}-{y}-{w}-{h}"
        print('faceid:' ,face_id)
        saved_faces.add(face_id)

    except Exception as e:
        print("Error is :", e)

# Function to generate video frames
def get_frames(video, saved_faces, db_path):
    trackers = []
    saved_faces = set() 
    while True:
        success, img = video.read()
        if not success:
            break

        img_resized = cv2.resize(img, (650, 450))
        img_full_flip = cv2.flip(img_resized, 1)

        updated_trackers = []
        for tracker in trackers:
            success, _ = tracker.update(img_full_flip)
            if success:
                updated_trackers.append(tracker)
        trackers = updated_trackers

        gray_scale = cv2.cvtColor(img_full_flip, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        for (x, y, w, h) in faces:
            cv2.rectangle(img_full_flip, (x, y), (x+w, y+h), (0, 255, 0), 2)

            if not trackers:
                img_face = img_full_flip[y:y+h, x:x+w]
                threading.Thread(target=face_detection, args=(img_face, x, y, w, h, img_full_flip, saved_faces, db_path)).start()
                tracker = cv2.TrackerKCF_create()
                tracker.init(img_full_flip, (x, y, w, h))
                trackers.append(tracker)

        ret, buffer = cv2.imencode('.jpg', img_full_flip)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route to serve video feed
@app.route('/video_feed')
def video_feed():
    return Response(get_frames(video, set(), db_path),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


from flask import jsonify

@app.route('/HelloHowAreYou')
def get_info():
    try:
        # สร้าง SQL query
        sql = f'''SELECT
                    DATE(t.Date_time) AS TransactionDate,
                    TIME(t.Date_time) AS TransactionTime,
                    t.CSGender,
                    t.CSAge,
                    CASE WHEN t.CSID = 0 THEN 'Unknown' ELSE u.CSName END AS UserName,
                    e.EmoName AS EmotionName,
                    t.S_Pic
                FROM
                    Transaction t
                LEFT JOIN
                    CSUser u ON t.CSID = u.CSID
                JOIN
                    Emotion e ON t.EmoID = e.EmoID
                ORDER BY t.SID DESC LIMIT 3;'''

        db.execute(sql)
        result = db.fetchall()

        if not result:
            return jsonify({"message": "No records found"}), 404
        
        records = [
            {
                "TransactionDate": str(record[0]),
                "TransactionTime": str(record[1]),
                "CSGender": record[2],
                "CSAge": record[3],
                "UserName": "Unknown" if record[4] == 0 else record[4],
                "EmotionName": record[5],
                "S_Pic": record[6]
            }
            for index, record in enumerate(result)
        ]


        return jsonify(records)

    except Exception as e:
        # จัดการกับ error ที่เกิดขึ้น
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
