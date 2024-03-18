from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import mysql.connector
from PIL import Image
from io import BytesIO
from deepface import DeepFace


app = Flask(__name__)
CORS(app)

# เชื่อมต่อฐานข้อมูล MySQL
def connect_to_mysql():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="ai"
        )
        return connection
    except mysql.connector.Error as err:
        print('MySQL Connection Error:', err)
        return None
    
def query_mysql(query):
    connection = connect_to_mysql()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(query)
            return cursor.fetchall()
        except mysql.connector.Error as err:
            print('MySQL Query Error:', err)
        finally:
            connection.close()
    return None

# อ่านรูปภาพจากฐานข้อมูลและแปลงให้อยู่ในรูปแบบที่ OpenCV สามารถใช้งานได้
def read_images_from_db():
    query = "SELECT L_Pic FROM `transaction`;"
    images = query_mysql(query)
    image_list = []
    for image_data in images:
        # แปลงข้อมูลรูปภาพ base64 เป็น binary
        img_data = base64.b64decode(image_data[0])
        # อ่านรูปภาพจาก binary
        nparr = np.frombuffer(img_data, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        image_list.append(img_np)
    return image_list


# เปรียบเทียบรูปภาพ
def compare_images(input_image, images_from_db):
    similarity_results = []

    for db_image in images_from_db:
        try:
            # Convert DB image from numpy array to PIL Image
            db_image_pil = Image.fromarray(db_image)
            # Convert to RGB (if not already in RGB mode)
            if db_image_pil.mode != 'RGB':
                db_image_pil = db_image_pil.convert('RGB')

            # Verification using DeepFace
            verification_result = DeepFace.verify(input_image, db_image_pil, model_name='Facenet', enforce_detection=False)

            # Append similarity score
            similarity_results.append(verification_result["distance"])
        except Exception as e:
            print(f"Error comparing images: {e}")

    return similarity_results


# ฟังก์ชันคำนวณความคล้ายคลึงระหว่างรูปภาพ
def compute_similarity(image1, image2):
    # ในที่นี้คุณสามารถใช้เทคนิคการคำนวณความคล้ายคลึงระหว่างรูปภาพตามความต้องการของคุณ เช่น Histogram of Oriented Gradients (HOG) หรือ Feature Matching

    # ในตัวอย่างนี้จะใช้ฟังก์ชัน compareHist ของ OpenCV เพื่อคำนวณค่าความคล้ายคลึงของภาพ (ใช้ Histograms)
    hist1 = cv2.calcHist([image1], [0], None, [256], [0, 256])
    hist2 = cv2.calcHist([image2], [0], None, [256], [0, 256])

    # คำนวณความคล้ายคลึงระหว่างภาพด้วย histogram
    similarity = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

    return similarity

@app.route('/api/find_similar_images', methods=['POST'])
def find_similar_images():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400

        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        input_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Load images from database
        images_from_db = read_images_from_db()

        # Compare images
        similarity_results = compare_images(input_image, images_from_db)

        return jsonify(similarity_results)
    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred while processing the request'}), 500
    

@app.route('/user/showresult')
def get_records_from_transaction():
    query = """
    SELECT 
        `SID`, 
        `Date_time`, 
        `CSGender`, 
        `CSAge`, 
        `CSID`, 
        `EmoID`, 
        `S_Pic`, 
        `L_Pic` 
    FROM 
        `transaction` 
    WHERE 
        DATE(`Date_time`) = CURDATE()
    ORDER BY `SID` DESC;
    """

    try:
        records = query_mysql(query)

        if not records:
            return jsonify({"message": "No records found for today."}), 404

        formatted_records = [{"SID": record[0], "Date_time": str(record[1]), "CSGender": record[2], "CSAge": record[3], "CSID": record[4], "EmoID": record[5], "S_Pic": record[6], "L_Pic": record[7]} for record in records]

        return jsonify(formatted_records)
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
