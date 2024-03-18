import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [similarImages, setSimilarImages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSimilarImages();
  }, []);

  const fetchSimilarImages = async () => {
    try {
      const response = await axios.get('http://localhost:5001/user/showresult');
      setSimilarImages(response.data);
    } catch (error) {
      console.error('Error fetching similar images:', error);
      setError('An error occurred while fetching similar images.');
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];

      try {
        const apiResponse = await axios.post('http://localhost:5001/api/find_similar_images', { image: base64Image });
        setSimilarImages(apiResponse.data);
        setError(null);
      } catch (error) {
        console.error('Error calling Flask API:', error);
        setError('An error occurred while calling the Flask API.');
      }
    };

    reader.readAsDataURL(image);
  };

  return (
    <div>
      <form onSubmit={handleImageUpload}>
        <label>
          Upload Image:
          <input type="file" accept=".jpg" onChange={(e) => setImage(e.target.files[0])} />
        </label>
        <button type="submit" style={{ border: 'solid black 1px' }}>Find Similar Images</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <h2>Similar Images:</h2>
        <ul>
          {similarImages.map((image, index) => (
            <li key={index}>
              CSID: {image.CSID}, Date_time: {image.Date_time}, CSGender: {image.CSGender}, CSAge: {image.CSAge}, EmoID: {image.EmoID}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
