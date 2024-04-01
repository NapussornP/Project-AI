# import os
# import requests

# @app.route('/savetoDir')
# def create_image_folders_and_save_images():
#     api_endpoint = 'http://localhost:8081/uploadtofolder'

#     response = requests.get(api_endpoint)
#     image_data = response.json()

#     for entry in image_data:
#         print(entry['CSName'])

#     folder_root = "UserImage"

#     if not os.path.exists(folder_root):
#         os.makedirs(folder_root)
#         print("folder '{}' has been created".format(folder_root))
#     else:
#         print("folder '{}' already exist".format(folder_root))

#     # for image_entry in image_data:
#     #     # หาชื่อโฟลเดอร์ CSName
#     #     cs_name = image_entry['CSName']

#     #     # สร้างโฟลเดอร์ CSName หากยังไม่มี
#     #     cs_folder = os.path.join(main_folder, cs_name)
#     #     if not os.path.exists(cs_folder):
#     #         os.makedirs(cs_folder)

#     #     # หาจำนวนไฟล์รูปภาพที่มีอยู่ในโฟลเดอร์ CSName เพื่อกำหนดชื่อไฟล์รูปถัดไป
#     #     existing_files = os.listdir(cs_folder)
#     #     next_filename = str(len(existing_files) + 1) + '.jpg'

#     #     # เซฟไฟล์รูปภาพลงในโฟลเดอร์ CSName
#     #     image_path = os.path.join(cs_folder, next_filename)
#     #     with open(image_path, 'wb') as f:
#     #         f.write(base64.b64decode(image_entry['ImageData']))

#     # print("Images saved successfully.")

# if __name__ == "__main__":
#     create_image_folders_and_save_images()

from flask import Flask, jsonify
import os
import requests
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

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






if __name__ == "__main__":
    app.run(debug=True, port=8081)
    # create_image_folders_and_save_images()
