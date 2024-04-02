import React, { useState, useRef, useEffect } from "react";
import { Grid } from "@material-ui/core";
import Controls from "./controls/Controls";
import { useForm, Form } from "./UseForm";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import { canvasPreview } from "./controls/canvasPreview";
import "react-image-crop/dist/ReactCrop.css";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const roleItem = [
  { id: "student", title: "Student" },
  { id: "teacher", title: "Teacher" },
];

const initialFValues = {
  fullName: "",
  role: "student",
};

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function UseForm(props) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState("");

  // about crop
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aspect, setAspect] = useState(10 / 10);

  const validate = (fieldValues = values) => {
    let temp = { ...errors };
    if ("fullName" in fieldValues) {
      const isValidFullname = /^[A-Z][a-z]{0,19}\s[A-Z][a-z]{0,30}$/.test(
        fieldValues.fullName
      );

      // Check if the field is empty or contains only English letters
      temp.fullName = fieldValues.fullName
        ? isValidFullname
          ? ""
          : 'Please enter only English letters ex. "Ami Kim"'
        : "This field is required.";
    }

    setErrors({
      ...temp,
    });

    if (fieldValues == values) return Object.values(temp).every((x) => x == "");
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
      // const imagePath = await saveImageToDirectory(selectedImage);
      // console.log("PAth 1: ", imagePath);
      const image = imgRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!image || !previewCanvas || !completedCrop) {
        throw new Error("Crop canvas does not exist");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const canvas = document.createElement("canvas");
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("No 2d context");
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      const imageBase64 = canvas.toDataURL("image/jpeg");

      await axios.post("http://localhost:8081/AddUser", {
        CSName: values.fullName,
        role: values.role,
        img_64: imageBase64,
      });

      window.location.reload();

      resetForm();
      clearFile();
    } catch (error) {
      console.error("Error creating:", error);
    }
  };

  // const saveImageToDirectory = async (file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("image", file);

  //     const response = await axios.post(
  //       "http://localhost:8081/upload",
  //       formData
  //     );
  //     console.log("PAth jaaa22: ", response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     throw error;
  //   }
  // };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function () {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 200;

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            file.type,
            1
          );
        };

        img.onerror = function (error) {
          reject(error);
        };
      };

      reader.onerror = function (error) {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const resizedImage = await resizeImage(file);

    const reader = new FileReader(); // ประกาศตัวแปร reader เพียงครั้งเดียว

    reader.onloadend = () => {
      const base64String = reader.result;
      setImageBase64(base64String);
    };

    if (resizedImage) {
      setSelectedImage(file);
      reader.readAsDataURL(resizedImage);
    }

    // อ่านไฟล์รูปภาพอีกครั้งและกำหนดค่าให้กับ imgSrc
    reader.addEventListener("load", () =>
      setImgSrc(reader.result ? reader.result.toString() : "")
    );
    reader.readAsDataURL(file);
  };

  console.log("Base64 image:", imageBase64);

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result ? reader.result.toString() : "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop);
    }
  }, [completedCrop]);

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
        <div className="">
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ height: "200px" }}
              />
            </ReactCrop>
          )}

          {/* {selectedImage && (
            <div>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </div>
          )} */}

          {!!completedCrop && (
            <>
              <div>
                <p>Cropped Preview</p>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: "100px",
                    height: "100px",
                  }}
                />
              </div>
            </>
          )}

          <div style={{ position: "absolute", bottom: 20, right: 15 }}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </div>
        </div>
      </Grid>
    </Form>
  );
}
