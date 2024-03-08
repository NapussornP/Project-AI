import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import Controls from './controls/Controls';
import { useForm, Form } from './UseForm';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import axios from 'axios';



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
];

const initialFValues = {
  fullName: '',
  role: 'student',
};

export default function UseForm(props) {
  const [selectedImage, setSelectedImage] = useState(null);

  const validate = (fieldValues = values) => {
    let temp = { ...errors };
    if ('fullName' in fieldValues) {
    const isValidFullname = /^[a-zA-Z\s]*$/.test(fieldValues.fullName);

    // Check if the field is empty or contains only English letters
    temp.fullName = fieldValues.fullName
      ? isValidFullname
        ? ''
        : 'Please enter only English letters'
      : 'This field is required.';
  }
      
      setErrors({
      ...temp,
    });

    if (fieldValues == values)
      return Object.values(temp).every((x) => x == '');
  };

  const {
    values,
    errors,
    setErrors, // Ensure setErrors is available
    handleInputChange,
    resetForm,
  } = useForm(initialFValues, true, validate);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imagePath = await saveImageToDirectory(selectedImage);
      console.log('PAth 1: ',imagePath)
      await axios.post('http://localhost:8081/AddUser', {
        CSName: values.fullName,
        role: values.role,
        imgpath: imagePath,
      });

      
      window.location.reload();

      resetForm();
      clearFile();
    } catch (error) {
      console.error('Error creating:', error);
    }
  };


  
  const saveImageToDirectory = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:8081/upload', formData);
      console.log('PAth jaaa22: ',response.data)
      return response.data;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];


    if (file) {
      // Update the state to store the image file
      setSelectedImage(file);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Grid container>
        <Grid item xs={6}>
          <Controls.Input
            name="fullName"
            label="Full Name"
            value={values.fullName}
            onChange={handleInputChange}
            error={errors.fullName}
          />
          <Controls.RadioGroup
            name="role"
            label="Role"
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
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 20, right: 15 }}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </Grid>
      </Grid>
    </Form>
  );
}
