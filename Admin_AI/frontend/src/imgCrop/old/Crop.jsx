// Crop.jsx
import React, { useState } from 'react';
import Nav from '../../Nav'
import FileInput from '../FileInput';
import ImagCrop from '../Imgcrop'; // Import ImagCrop
function Crop() {
    const [image, setImage] = useState('')
    const [currentPage, setCurrentPage] = useState('choose-img') // แก้ชื่อตัวแปร
    const onImageSelected =  (selectedImg) => { // แก้ชื่อฟังก์ชัน
        setImage(selectedImg);
        setCurrentPage('crop-img') // แก้ชื่อตัวแปร
    }

    const onCropDone = (ImagCroppedArea) => {}
    const onCropCancel = () => {}
    return (  
        // <section className="flex gap-6">
            // {/* <Nav /> */}

            <div className="Add m-4 text-xl text-gray-900 font-semibold">
                <div className='container'>
                    {currentPage === 'choose-img' ? (
                        <FileInput onImageSelected={onImageSelected} />
                    ) : currentPage === 'crop-img' ? (
                        <ImagCrop image={image} onCropDone={onCropDone} onCropCancel={onCropCancel} />
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        // </section>
    );
}

export default Crop;
