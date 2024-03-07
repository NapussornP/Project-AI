import React, { useState, useEffect } from 'react';

function App() {
  const [emotionInfo, setEmotionInfo] = useState({ emotion: "", age: "", gender: "" });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:5000/emotion_info');
      const data = await response.json();
      setEmotionInfo(data);
    };

    const intervalId = setInterval(fetchData, 1000); // Fetch data every second
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  

  return (
    <div>
      <h3>Emotion: {emotionInfo.emotion}</h3>
      <h3>Age: {emotionInfo.age}</h3>
      <h3>Gender: {emotionInfo.gender}</h3>
      <img
        src="http://localhost:5000//video_feed"
        style={{ borderRadius: "10px" }}
        className="img"
        alt="Video Feed"
      />
    </div>
  );
}

export default App;
