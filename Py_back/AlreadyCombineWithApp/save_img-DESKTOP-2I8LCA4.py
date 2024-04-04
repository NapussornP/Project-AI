
from flask import Flask, jsonify
import os
import requests
from flask_cors import CORS
import base64
import glob
from pathlib import Path

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
  
    return "Image Delete successfully"



if __name__ == "__main__":
    app.run(debug=True, port=5000)
    # create_image_folders_and_save_images()
