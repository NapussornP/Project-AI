from flask import Flask, Response,jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import threading
from pathlib import Path
import os
import requests
# import tensorflow as tf
from datetime import datetime
import base64
import pyttsx3
import random
import concurrent.futures
from flask import jsonify
import requests
import glob
import time

app = Flask(__name__)
CORS(app)

# Initialize camera
video = cv2.VideoCapture(0)


if not video.isOpened():
    print("Error: Could not open video.")
    exit()

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# current_directory = Path(__file__).parent
# db_path = current_directory.parent.parent / 'AI' / 'Admin_AI' / 'frontend' / 'img_test'
# db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "a")
# print('Check Path:', db_path)
current_directory = Path(__file__).parent
db_path = current_directory / 'UserImage'
# print("Is db_path exists:", os.path.exists(db_path))


TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"
def speak_message(message):
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1)
    engine.setProperty('voice', TH_voice_id)
    engine.say(message)
    engine.runAndWait()

def get_message_based_on_emotion(emotion_text):
    emotion = select_emoId(emotion_text)
    # print('Emo jaa :' ,emotion)
    try:
        response = requests.get("http://localhost:8081/texttospeech", params={"emotion": emotion})
        # print(response)
        if response.status_code == 200:
            result = response.json()
            # print('result: ',result)
            messages = []  
            for item in result:
                messages.append(item["Message"]) 
            random_message = random.choice(messages)
            print('random: ', random_message)
            # print('random: ', messages)
                
            return random_message
        else:
            print("Failed to send data:", response.json())
        
    except Exception as e:
        print("Error:", e)
    


def select_emoId(emoName):
    try:
        response = requests.get("http://localhost:8081/selectEmoID", json={"emoName": emoName})
        
        if response.status_code == 200:
            result = response.json()
            
            emo_id = result[0]['EmoID']  
            return emo_id
        else:
            print("Failed to select emotion id:", response.json())
    except Exception as e:
        print("Error:", e)
    return None

MAX_WIDTH = 200
def resize_image(image):
    height, width = image.shape[:2]
    if width > MAX_WIDTH:
        height = int(height * (MAX_WIDTH / width))
        width = MAX_WIDTH
    resized_image = cv2.resize(image, (width, height))
    return resized_image

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    base64_image = base64.b64encode(buffer).decode('utf-8')
    return base64_image

def insert_db(datetime, gender, age, cs_id, emotion, s_pic, l_pic):
    print(emotion)
    emo_id = select_emoId(emotion)
    print('emoID: ', emo_id)

    # Resize images
    s_pic_resized = resize_image(s_pic)
    l_pic_resized = resize_image(l_pic)

    # Convert resized images to base64
    small_img_base64 = image_to_base64(s_pic_resized)
    large_img_base64 = image_to_base64(l_pic_resized)

    datetime_str = datetime.strftime("%Y-%m-%d %H:%M:%S")

    data = {
        "Date_time": datetime_str,
        "CSGender": gender,
        "CSAge": age,
        "CSID": cs_id,
        "EmoID": emo_id,
        "S_Pic": small_img_base64,
        "L_Pic": large_img_base64
    }

    try:
        response = requests.post("http://localhost:8081/insertPy", json=data)
        if response.status_code == 200:
            print("Data sent successfully")
        else:
            print("Failed to send data:", response.json())
    except Exception as e:
        print("Error insert:", e)




def face_detection(img_face, x, y, w, h, img_full_flip, saved_faces, db_path):
    try:
        datetime_detect = datetime.now()
        print(f"Date taken for detection: {datetime_detect} ")

        # Define functions to analyze emotion, age, and gender
        def analyze_emotion():
            return DeepFace.analyze(img_face, actions='emotion', enforce_detection=False)

        def analyze_age():
            return DeepFace.analyze(img_face, actions='age', enforce_detection=False)

        def analyze_gender():
            return DeepFace.analyze(img_face, actions='gender', enforce_detection=False)


        def face_verify(img_face_resized, image_path):
            # return DeepFace.verify(img_face, img2_path=image_path, enforce_detection=False)
            # img_face_1 = cv2.imread(img_face)
            img_face_resized = resize_image(img_face)
            return DeepFace.verify(img_face_resized, img2_path=image_path, enforce_detection=False)

        # Analyze emotion, age, and gender concurrently
        start_time = time.time()  # เวลาเริ่มต้นที่เริ่มนับ

        with concurrent.futures.ThreadPoolExecutor() as executor:
            emo_start_time = time.time()  # เวลาที่เริ่มต้นการส่งภารกิจ analyze_emotion
            emo_future = executor.submit(analyze_emotion)
            emo_end_time = time.time()  # เวลาที่ภารกิจ analyze_emotion เสร็จสิ้น

            age_start_time = time.time()  # เวลาที่เริ่มต้นการส่งภารกิจ analyze_age
            age_future = executor.submit(analyze_age)
            age_end_time = time.time()  # เวลาที่ภารกิจ analyze_age เสร็จสิ้น

            gender_start_time = time.time()  # เวลาที่เริ่มต้นการส่งภารกิจ analyze_gender
            gender_future = executor.submit(analyze_gender)
            gender_end_time = time.time()  # เวลาที่ภารกิจ analyze_gender เสร็จสิ้น

            # รอภารกิจเสร็จสิ้นและดึงผลลัพธ์
            detec_emo = emo_future.result()
            detec_age = age_future.result()
            detec_gender = gender_future.result()

        # คำนวณเวลาทั้งหมดที่ใช้ในการส่งภารกิจและรอผลลัพธ์
        total_time = time.time() - start_time

        print("Emotion task started at:", emo_start_time)
        print("Emotion task finished at:", emo_end_time)
        print("Age task started at:", age_start_time)
        print("Age task finished at:", age_end_time)
        print("Gender task started at:", gender_start_time)
        print("Gender task finished at:", gender_end_time)
        print("Total time:", total_time)

        # Extract emotion, age, and gender from the analysis
        emotion = detec_emo[0]['dominant_emotion']
        age = detec_age[0]['age']
        gender = detec_gender[0]['dominant_gender']

        # Get message based on emotion
        message = get_message_based_on_emotion(emotion)
        # print(message)
        if message:
            threading.Thread(target=speak_message, args=(message,)).start()

        img_face_resized = resize_image(img_face)
        image_paths = glob.glob(str(db_path / '**/*.jpg'), recursive=True)
        for image_path in image_paths:
            # print('path img find: ', image_path)
            result = face_verify(img_face_resized, image_path)
            if result['verified'] == True:
                print('Match User')
                break
            else:
                print('not match any')
                cs_id = 0
            
           
        # insert_db(datetime_detect, gender, age, cs_id, emotion, img_face, img_full_flip)

        face_id = f"{x}-{y}-{w}-{h}"
        print('faceid:', face_id)
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


# @app.route('/savetoDir')
def create_image_folders_and_save_images():
    api_endpoint = 'http://localhost:8081/uploadtofolder'

    response = requests.get(api_endpoint)
    image_data = response.json()

    for entry in image_data:
        print(entry['CSName'])

    folder_root = "UserImage"

    if not os.path.exists(folder_root):
        os.makedirs(folder_root)
        print("folder '{}' has been created".format(folder_root))
    else:
        print("folder '{}' already exist".format(folder_root))
    
    return "folder is creating"

# Route to serve video feed
@app.route('/video_feed')
def video_feed():
    return Response(get_frames(video, set(), db_path),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/HelloHowAreYou')
# def get_info():
#     try:
#         # สร้าง SQL query
#         sql = f'''SELECT
#                     DATE(t.Date_time) AS TransactionDate,
#                     TIME(t.Date_time) AS TransactionTime,
#                     t.CSGender,
#                     t.CSAge,
#                     CASE WHEN t.CSID = 0 THEN 'Unknown' ELSE u.CSName END AS UserName,
#                     e.EmoName AS EmotionName,
#                     t.S_Pic
#                 FROM
#                     Transaction t
#                 LEFT JOIN
#                     CSUser u ON t.CSID = u.CSID
#                 JOIN
#                     Emotion e ON t.EmoID = e.EmoID
#                 ORDER BY t.SID DESC LIMIT 3;'''

#         db.execute(sql)
#         result = db.fetchall()

#         if not result:
#             return jsonify({"message": "No records found"}), 404
        
#         records = [
#             {
#                 "TransactionDate": str(record[0]),
#                 "TransactionTime": str(record[1]),
#                 "CSGender": record[2],
#                 "CSAge": record[3],
#                 "UserName": "Unknown" if record[4] == 0 else record[4],
#                 "EmotionName": record[5],
#                 "S_Pic": record[6]
#             }
#             for index, record in enumerate(result)
#         ]


#         return jsonify(records)

#     except Exception as e:
#         # จัดการกับ error ที่เกิดขึ้น
#         error_message = f"An error occurred: {str(e)}"
#         print(error_message)
#         return jsonify({"error": error_message})


if __name__ == '__main__':
    # create_image_folders_and_save_images()
    app.run(host='0.0.0.0', debug=True)