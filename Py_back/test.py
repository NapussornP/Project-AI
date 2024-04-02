from pathlib import Path
import glob
from deepface import DeepFace
import cv2


current_directory = Path(__file__).parent  

db_path = current_directory / 'UserImage'

image_files = glob.glob(str(db_path / '**/*.jpg'), recursive=True)

# for image_file in image_files:
#     print(image_file)
#     img_path = r"C:\Users\User\OneDrive - kmutnb.ac.th\Desktop\AI\Py_back\UserImage\Taksaporn Yarnsangworn\11.jpg"
#     db_path_full = r"C:\Users\User\OneDrive - kmutnb.ac.th\Desktop\AI\Py_back\UserImage\Ami Kim\14.jpg"
#     result = DeepFace.find(img_path=img_path, db_path=image_files, enforce_detection=False)
#     print(result)

# img_path = r"C:\Users\User\OneDrive - kmutnb.ac.th\Desktop\AI\Py_back\UserImage\Taksaporn Yarnsangworn\11.jpg"
# db_path_full = r"C:\Users\User\OneDrive - kmutnb.ac.th\Desktop\AI\Py_back\UserImage\Ami Kim\14.jpg"
# result = DeepFace.find(img_path=img_path, db_path=image_files, enforce_detection=False)
# print(result)


for image_file in image_files:
    print(image_file)
    img = cv2.imread(image_file)
    
    # ตรวจสอบว่าภาพถูกโหลดเข้ามาได้หรือไม่
    if img is None:
        print(f"Unable to load image from file: {image_file}")
    else:
        # ดึงขนาดของภาพ
        height, width, channels = img.shape
        print(f"Image file: {image_file}, Size: {width}x{height}")
    # img_path = r"C:\Users\User\OneDrive - kmutnb.ac.th\Desktop\AI\Py_back\UserImage\Napussorn Peawpunchoo\1.jpg"
    # result = DeepFace.verify(img1_path=img_path, img2_path=image_file, enforce_detection=False)
    # print(result['verified'])
    # if result['verified'] == True:
    #     break

# img = cv2.imread(db_path_full)
# cv2.imshow('Image', img)
# cv2.waitKey(0)
# cv2.destroyAllWindows()