import React, { useState } from 'react';
import Cropper from 'react-easy-crop'

const ImagCrop = ({ image, onCropDone, onCropCancle }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
  
    const [croppedArea, setCroppedArea] = useState(null);
    const [aspectRatio, setAspectRatio] = useState(4 / 3);
  
    const onCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
      setCroppedArea(croppedAreaPixels);
    };
  
    const onAaspectRatioChange = (event) => {
      setAspectRatio(event.target.value);
    };
  
    return (
      <div>
        <div>
          <Cropper
            image={image}
            aspect={aspectRatio}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                width: '100%',
                height: '80%',
                backgroundColor: '#fff',
              },
            }}
          />
        </div>
        <div className='action-btns'>
        <div className="aspect-ratio" onChange={onAaspectRatioChange}>
          <input type="ratio" value={1 / 1} name="ratio" />1:1
          <input type="ratio" defaultValue={5 / 4} name="ratio" />5:4
          <input type="ratio" defaultValue={4 / 3} name="ratio" />4:3
          <input type="ratio" defaultValue={3 / 2} name="ratio" />3:2
          <input type="ratio" defaultValue={16 / 9} name="ratio" />16:9
          <input type="ratio" defaultValue={3 / 1} name="ratio" />3:1
        </div>
        <div className="btn-container">
          <button className="btn btn-outline" onClick={onCropCancle}>
            cancel
          </button>
          <button
            className="btn"
            onClick={() => {
              onCropDone(croppedArea);
            }}
          >
            crop
          </button>
        </div>
      </div>
        </div>
    );
  };
  
  export default ImagCrop;