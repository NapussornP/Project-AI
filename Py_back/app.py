import cv2
from flask import Flask, render_template, Response, jsonify
from flask_socketio import SocketIO
from datetime import datetime
import base64
from deepface import DeepFace
import threading
import os
import pyttsx3
import random
import requests
import concurrent.futures
from scipy.linalg import norm
import numpy as np
from pathlib import Path
import glob

app = Flask(__name__)
socketio = SocketIO(app)

cap = cv2.VideoCapture(0)
scaling_factor = 1

# ตรวจจับใบหน้า face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# สร้างโฟลเดอร์ 'Userimage' หากยังไม่มี
os.makedirs('Userimage', exist_ok=True)

# รับข้อมูล CSID จาก URL
url = 'http://localhost:8081/User'
response = requests.get(url)
csids = response.json()

# สร้าง Stream video ที่แสดงบนตู้
def gen_frames():
    while True:
        ret, frame = cap.read()
        frame = cv2.resize(frame, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)
        frame = cv2.flip(frame, 1)

        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d   %H:%M:%S")
        cv2.putText(frame, f'Time: {timestamp}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, flags=cv2.CASCADE_SCALE_IMAGE)

        for (x, y, w, h) in faces:
            frame[y:y+h, x:x+w]
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 255), 1)
        _  , encoded_frame = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + encoded_frame.tobytes() + b'\r\n\r\n')
        
# ตีกรอบให้ใบหน้า เพื่อเอารูปไปทำนาย
tracked_faces = []
current_time = 0
def camera_stream():
    while True:
        ret, frame = cap.read()
        frame = cv2.resize(frame, None, fx=scaling_factor, fy=scaling_factor, interpolation=cv2.INTER_AREA)
        frame = cv2.flip(frame, 1)
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d   %H:%M:%S")
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
                # solve to payload too large
                # frame_resize = cv2.resize(frame, (int(width * scale_factor), int(height * scale_factor))) 
            else:
                face_resized = face

            # Encode face_resized image to base64
            face_encoded = base64.b64encode(cv2.imencode('.jpg', face_resized)[1]).decode('utf-8')
            face_encoded = f"data:image/jpeg;base64,{face_encoded}"

            # Encode frame image to base64
            frame_encoded = base64.b64encode(cv2.imencode('.jpg', frame)[1]).decode('utf-8')
            frame_encoded = f"data:image/jpeg;base64,{frame_encoded}"

            # ใช้ DeepFace เพื่อสร้าง embedding จากใบหน้าที่ถูก resize แล้ว
            embedding_objs = DeepFace.represent(face_resized, model_name="Facenet", enforce_detection=False)
            embedding = embedding_objs[0]["embedding"]

            # เปรียบเทียบกับ embedding ที่มีอยู่ใน tracker
            is_existing_face = False
            for track in tracked_faces:
                cosine = np.dot(embedding, track['embedding']) / (norm(embedding) * norm(track['embedding']))
                if cosine > 0.6:
                    # ใบหน้าที่มีความคล้ายสูงสุด
                    track['time'] = current_time
                    is_existing_face = True
                    break
                elif track['time'] != current_time:
                    # ใบหน้าที่มีความคล้ายน้อย
                    tracked_faces.append({'embedding': embedding, 'time': current_time})
                    break

            if not is_existing_face:
                # ใบหน้าที่ไม่เคยเห็น
                cv2.imwrite('face.jpg', face)
                cv2.imwrite('frame.jpg', frame)
                tracked_faces.append({'embedding': embedding, 'time': current_time})
                
                # ค้นหาใบหน้าที่คล้ายคลึงในระบบ
                current_directory = Path(__file__).parent
                db_path = current_directory / 'UserImage'
                results = DeepFace.find(img_path='face.jpg', db_path=db_path, model_name='VGG-Face', enforce_detection=False)

                most_similar_id = 0
                if results and not results[0].empty:
                    first_result_df = results[0]
                    most_similar_path = first_result_df.iloc[0]['identity']
                    most_similar_id = os.path.splitext(os.path.basename(most_similar_path))[0]
                
                most_similar_name = "Unknown"
                response = requests.get('http://localhost:8081/User')
                if response:
                    users = response.json()
                    for user in users:
                        if user["CSID"] == int(most_similar_id):
                            most_similar_name = user["CSName"]
                            break

                emotions, age, gender = analyze_face(face)
                print(emotions)
                message = get_message_based_on_emotion(emotions)
                print(message)
                if message:
                    speak_message(message)

                # Emit data ด้วย socket
                socketio.emit('data', {'name': most_similar_name, 'emotion': emotions, 'age_range': age, 'gender': gender, 'faceimg': face_encoded})

                # ส่งข้อมูลไปบันทึกด้วย api
                store_data_to_mysql(most_similar_id, emotions, age, gender, face_encoded, frame_encoded, timestamp)

            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 255, 255), 1)

# ทำนาย อารมณ์ อายุ เพศ
def analyze_emotion(face):
    result = DeepFace.analyze(face, actions=['emotion'], enforce_detection=False)[0]['dominant_emotion']
    return result

def analyze_age(face):
    result = DeepFace.analyze(face, actions=['age'], enforce_detection=False)[0]['age']
    return result

def analyze_gender(face):
    result = DeepFace.analyze(face, actions=['gender'], enforce_detection=False)[0]['dominant_gender']
    return result

def analyze_face(face):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        emotion_future = executor.submit(analyze_emotion, face)
        age_future = executor.submit(analyze_age, face)
        gender_future = executor.submit(analyze_gender, face)
  
        concurrent.futures.wait([emotion_future, age_future, gender_future])

        emotion_result = emotion_future.result()
        age_result = age_future.result()
        gender_result = gender_future.result()

        return emotion_result, age_result, gender_result

# สุ่มข้อความสำหรับพูดส่งเสียง
TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"
def speak_message(message):
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1)
    engine.setProperty('voice', TH_voice_id)
    engine.say(message)
    engine.runAndWait()

def get_message_based_on_emotion(emotions):
    emoid = None
    response = requests.get('http://localhost:8081/emotionid').json()
    for item in response:
        if item['EmoName'] == emotions:
            emoid = item['EmoID']
            print(emoid)
            break
    
    if emoid:
        messages_response = requests.get('http://localhost:8081/textid', params={'EmoID': emoid}).json()
        if messages_response:
            filtered_messages = [msg for msg in messages_response if msg['EmoID'] == emoid]
            if filtered_messages:
                return random.choice(filtered_messages)['Message']
            else:
                print("No messages found for EmoID:", emoid)
                return None
        else:
            print("No messages found for EmoID:", emoid)
            return None
    else:
        print("No EmoID found for emotion:", emotions)
        return None
    
# บันทึกข้อมูล transaction ลงฐานข้อมูล
def store_data_to_mysql(most_similar_id, emotions, age, gender, face_encoded, frame_encoded, timestamp):
    url = 'http://localhost:8081/saveKiosk'

    emoid = None
    response = requests.get('http://localhost:8081/emotionid').json()
    for item in response:
        if item['EmoName'] == emotions:
            emoid = item['EmoID']
            break

    payload = {
        'CSGender': gender,
        'CSAge': age,
        'CSID': most_similar_id,
        'EmoID': emoid,
        'S_Pic': face_encoded,
        'L_Pic': frame_encoded,
        'Date_time' : timestamp
    }

    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print("Data stored successfully")
    else:
        print("Failed to store data to API")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/savetoDir', methods=['GET'])
def create_image_folders_and_save_images():
    api_endpoint = 'http://localhost:8081/uploadtofolder'
    response = requests.get(api_endpoint)
    image_data = response.json()

    folder_root = "UserImage"
    if not os.path.exists(folder_root):
        os.makedirs(folder_root)
        print("Folder '{}' has been created".format(folder_root))
    else:
        print("Folder '{}' already exists".format(folder_root))

    #  ตรวจสอบข้อมูลรูปภาพและเซฟลงในโฟลเดอร์
    for entry in image_data:
        cs_name = entry.get('CSName')
        # print(cs_name)
        img_base64 = entry.get('img_64')
        img_id = entry.get('CSID')
        save_image_to_folder(cs_name, img_base64, img_id)

    return "Images saved successfully."

def save_image_to_folder(cs_name, img_base64, img_id):
    cs_folder = os.path.join("UserImage", cs_name)
    if not os.path.exists(cs_folder):
        os.makedirs(cs_folder)

    base64_data = img_base64.split(",")[1]
    binary_data = base64.b64decode(base64_data)

    image_path = os.path.join(cs_folder, f"{img_id}.jpg")
    with open(image_path, 'wb') as f:
        f.write(binary_data)


@app.route('/deletefromDir/<user_id>', methods=['DELETE'])
def delete_image(user_id):
    current_directory = Path(__file__).parent
    db_path = current_directory / 'UserImage' 
    image_paths = glob.glob(str(db_path / '**/*.jpg'), recursive=True)

    deleted = False
    for image_path in image_paths:
        filename = os.path.basename(image_path)
        if filename.startswith(user_id):
            os.remove(image_path)
            print(f"Deleted image: {image_path}")
            new_file_path = image_path.replace(filename, "")
            print( new_file_path)
            deleted = True

    if deleted:
        if(len(os.listdir(new_file_path))) == 0:
            os.rmdir(new_file_path)
            return jsonify({"message": f"Folder '{db_path}' deleted successfully as it's empty"})
        else:
            return jsonify({"message": f"Images for user {user_id} deleted successfully"})
    else:
        return jsonify({"message": f"No images found for user {user_id}"}), 404

if __name__ == '__main__':
    thread = threading.Thread(target=camera_stream)
    thread.daemon = True
    thread.start()
    socketio.run(app)