import React, { useState, useEffect } from 'react'
import { Grid, } from '@material-ui/core';
import Controls from "./controls/Controls"
import { useForm, Form } from './UseForm';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import axios from 'axios';
import Swal from 'sweetalert2';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
    
  });



const roleItem = [
    { id: 'student', title: 'Student' },
    { id: 'teacher', title: 'Teacher' },
   
]

const initialFValues = {
    fullname: '',
    role: 'student',
}

export default function UseForm(props) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [data, setData] = useState([]);
    const [courseDetails, setCourseDetails] = useState({});
    
    const validate = (fieldValues = values) => {
        let temp = { ...errors }
        if ('fullName' in fieldValues)
            temp.fullName = fieldValues.fullName ? "" : "This field is required."
        setErrors({
            ...temp
        })

        if (fieldValues == values)
            return Object.values(temp).every(x => x == "")
    }

    const {
        values,
        setValues,
        errors,
        setErrors,
        handleInputChange,
        resetForm
    } = useForm(initialFValues, true, validate);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await axios.post('http://localhost:8081/AddUser', {
            CSName: values.CSName, // Use the correct property name
            role: values.role,
            imgbase64: base64URL, // Access the base64URL from state
          });

        window.alert('Add new user successfully');
        window.location.reload();
        
          console.log('created successfully');
          resetForm();
          clearFile();
        } catch (error) {
          console.error('Error creating:', error);
          
        }
      };
      const clearFile = () => {
        setSelectedImage(null);
        setBase64URL('');
    };
    


    const getBase64 = (file) => {
        return new Promise((resolve) => {
          let baseURL = "";
          let reader = new FileReader();
      
          reader.readAsDataURL(file);
      
          reader.onload = () => {
            let img = new Image();
            img.src = reader.result;
      
            img.onload = () => {
              // ปรับขนาดของรูปภาพก่อนแปลงเป็น Base64
              const MAX_WIDTH = 800; // กำหนดความกว้างสูงสุด
              const MAX_HEIGHT = 600; // กำหนดความสูงสูงสุด
      
              let canvas = document.createElement("canvas");
              let ctx = canvas.getContext("2d");
      
              let width = img.width;
              let height = img.height;
      
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
      
              canvas.width = width;
              canvas.height = height;
      
              ctx.drawImage(img, 0, 0, width, height);
      
              // แปลงรูปภาพที่ถูกปรับขนาดเป็น Base64
              baseURL = canvas.toDataURL("image/jpeg");
      
              resolve(baseURL);
            };
          };
        });
      };
      
      
    const handleImageChange = (event) => {
        const file_2 = event.target.files[0];
        setSelectedImage(URL.createObjectURL(file_2));

        console.log(event.target.files[0]);
        let file = event.target.files[0];

        console.log("File Size is: ", Math.round(file.size / 1024) + ' KB'); // เพิ่มบรรทัดนี้เพื่อดูขนาดไฟล์


        getBase64(file)
            .then((result) => {
            file['base64'] = result;
            console.log('File Is', file);
            setBase64URL(result); // Set the base64URL in state
            })
            .catch((err) => {
            console.log(err);
            });
    };
    
    const [base64URL, setBase64URL] = useState('');
    console.log('base64',base64URL);

    return (
        <Form onSubmit={handleSubmit}>
            <Grid container>
                <Grid item xs={6}>
                    <Controls.Input
                        name="CSName"
                        label="Full Name"
                        value={values.CSName}
                        onChange={handleInputChange}
                        // error={errors.fullName}
                    />
                    <Controls.RadioGroup
                        name="role"
                        label="role"
                        value={values.role}
                        onChange={handleInputChange}
                        items={roleItem}
                    />
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<AddPhotoAlternateIcon />}
                        
                        >
                        Upload image
                        <VisuallyHiddenInput
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            />
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    {selectedImage && (
                        <div>
                            <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </div>
                    )}

                        <div style={{ position: 'absolute', bottom: 20, right: 15 }}>
                            <Controls.Button type="submit" text="Submit" />
                        </div>
                </Grid>

            </Grid>
        </Form>
    )
}
