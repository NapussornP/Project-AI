from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import mysql.connector
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# กำหนดข้อมูลการเชื่อมต่อฐานข้อมูล MySQL
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="ai"
)
cursor = connection.cursor()

# ฟังก์ชันเชื่อมต่อกับ MySQL และดึงรูปภาพ
def get_images_from_db():
    try:
        cursor.execute("SELECT L_Pic FROM `transaction`;")
        images = cursor.fetchall()
        return images
    except mysql.connector.Error as err:
        print('Query Text Error:', err)
        return []

# ฟังก์ชันปรับขนาดรูปภาพและแปลงเป็น numpy array
def preprocess_image(base64_str, size=(224, 224)):
    img_data = base64.b64decode(base64_str)
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    img_resized = img.resize(size, Image.ANTIALIAS)
    img_array = np.array(img_resized)
    return img_array.flatten()

# ฟังก์ชันคำนวณ cosine similarity
def calculate_cosine_similarity(img1_base64, img2_base64):
    try:
        img1_vector = preprocess_image(img1_base64)
        img2_vector = preprocess_image(img2_base64)
        img1_vector = img1_vector.reshape(1, -1)
        img2_vector = img2_vector.reshape(1, -1)
        similarity = cosine_similarity(img1_vector, img2_vector)[0][0]
        return similarity
    except Exception as e:
        print(f"Error processing images for similarity: {e}")
        return -1

# API endpoint สำหรับ React
@app.route('/api/find_similar_images', methods=['POST'])
def find_similar_images():
    try:
        request_data = request.get_json()
        input_image_base64 = request_data.get('image_data')

        # ดึงรูปภาพทั้งหมดจาก MySQL
        db_images = get_images_from_db()

        # คำนวณ cosine similarity และค้นหารูปที่มีความเหมือน
        similarities = []
        for db_image in db_images:
            db_image_data = db_image[0]  # ดึงข้อมูลรูปภาพจาก Tuple
            similarity = calculate_cosine_similarity(input_image_base64, db_image_data)
            if similarity >= 0:  # ตรวจสอบว่าไม่มีข้อผิดพลาดในการคำนวณ
                similarities.append({"CSID": None, "similarity": similarity})

        # เรียงลำดับตามความเหมือน
        similarities.sort(key=lambda x: x["similarity"], reverse=True)

        return jsonify(similarities[:5])  # ส่งรูปที่มีความเหมือนสูงสุด 5 รูป

    except Exception as e:
        print('Internal Server Error:', str(e))
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
