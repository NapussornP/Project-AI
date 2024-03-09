import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/AppComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFaceSadCry,
  faFaceLaughBeam,
  faFaceTired,
  faFaceGrimace,
  faFaceMeh,
  faFaceSurprise,
  faFaceAngry,
} from '@fortawesome/free-regular-svg-icons';



function App() {
  const [result, setResult] = useState([]);
  const [gridContainerStyle, setGridContainerStyle] = useState({});


  useEffect(() => {
    const fetchData = () => {
      axios.get('http://localhost:5000//HelloHowAreYou')
        .then((response) => {
          const data = response.data;
          console.log('Data Ja: ',data)
          setResult(data);
          
          console.log('limitttt:',result)

          const updatedStyle = {
          //   // รับ style จากข้อมูลหรือทำการปรับแต่งตามต้องการ
          //   backgroundColor: '#2f3e46',
          //   padding: '10px',
          //   borderRadius: '10px',
          //   // ... เพิ่ม style ต่อไปตามต้องการ
          // };
  
          // setGridContainerStyle(updatedStyle);
        })
        .catch((error) => {
          console.log('Error fetching data: ', error)
        });
    };

    fetchData();

    const interval = setInterval(fetchData, 10000);
    return() => clearInterval(interval)
  }, []);
  
  
  const customStyle = {
    fontSize: '4rem',
     color: 'white'
  }

  return (
    <>
     <img
        src="http://localhost:5000//video_feed"
        style={{ borderRadius: "80px" }}
        className="img"
        alt="Streaming Video"
      />

    <div>
      {result.map((item, index) => (
        <div className='grid-container' key={index}>
          <div className="img" style={{ columnSpan: '2' }}>
            <img src={`data:image/jpeg;base64,${item.S_Pic}`} alt="Emotion Pic" style={{ borderRadius: '5px' }} />
          </div>

          <div><span style={{ fontWeight: '700' }}>Name:</span> {item.UserName}</div>

          <div className='emo'>
            <div className="emoji">
              {/* <FontAwesomeIcon icon={faFaceLaughBeam} size='xl' style={{ fontSize: '4rem', color: 'white' }} /> */}
              {item.EmotionName === 'happy' && (
                <FontAwesomeIcon icon={faFaceLaughBeam} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'sad' && (
                <FontAwesomeIcon icon={faFaceSadCry} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'surprise' && (
                <FontAwesomeIcon icon={faFaceSurprise} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'neutral' && (
                <FontAwesomeIcon icon={faFaceMeh} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'angry' && (
                <FontAwesomeIcon icon={faFaceAngry} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'fear' && (
                <FontAwesomeIcon icon={faFaceGrimace} size='xl' style={customStyle}/>
              )}
              {item.EmotionName === 'disgust' && (
                <FontAwesomeIcon icon={faFaceTired} size='xl' style={customStyle}/>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontWeight: '700' }}>Gender: </span> {item.CSGender}
            <span style={{ fontWeight: '700', marginLeft: '20px' }}>Age: </span> {item.CSAge}
          </div>
        </div>
      ))}
    </div>


      {/* <div>
        {result.map((item, index) => (
          <div key={index}>
            <p>Date: {item.TransactionDate}</p>
            <p>Time: {item.TransactionTime}</p>
            <p>Gender: {item.CSGender}</p>
            <p>Age: {item.CSAge}</p>
            <p>User Name: {item.UserName}</p>
            <p>Emotion: {item.EmotionName}</p>
            <p>Pic: <img src={`data:image/jpeg;base64,${item.S_Pic}`} alt="Emotion Pic" /></p>
            ------------------------

          </div>
        ))}
      </div> */}
    

      {/* <div className='grid-container'>
        <div class="img" style={{columnSpan:'2'}}>
          <img src='src/OIP.jpg' alt='img' style={{borderRadius: '5px'}}/>
        </div>

        <div><span style={{fontWeight: '700'}}>Name:</span> Napussorn Peawpunchoo </div>

        <div className='emo'>
          <div className="emoji">
            <FontAwesomeIcon icon={faFaceSadCry} size='xl' style={{fontSize:'4rem',color:'white'}}/><br/>
          </div>
        </div>

        <div><span style={{fontWeight: '700'}}>Gender: </span> Woman 
          <span style={{fontWeight: '700', marginLeft:'20px'}}>Age: </span> 21
        </div>
        
      </div> */}

    
    </>
  );
}

export default App;
