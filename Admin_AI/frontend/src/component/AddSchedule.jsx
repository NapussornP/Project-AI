import React, { useState, useEffect } from "react";
import useTable from "./UseTable";
import axios from 'axios';
import {
  Paper,
  makeStyles,
  Toolbar,
  InputAdornment,
} from "@material-ui/core";
import PageHeader from './UserPageHeader'
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import EventNoteIcon from '@mui/icons-material/EventNote';

import {
  Scheduler,
  Appointments,
  WeekView,
} from "@devexpress/dx-react-scheduler-material-ui";
import Papa from 'papaparse';
import 'bootstrap/dist/css/bootstrap.min.css';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './../css/Schedule.css'



const useStyles = makeStyles((theme) => ({
    pageContent: {
      padding: theme.spacing(3),
      height: '650px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    searchInput: {
      width: "75%",
      marginTop: '2px'
    },
    newButton: {
      position: "absolute",
      right: "10px",
    },
    uploadButton: {
      textAlign: 'center',
      marginBottom: theme.spacing(2),
    },
  }));


export default function Users() {
  const classes = useStyles();

    const [data, setData] = useState([]);
    const [courseDetails, setCourseDetails] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const loadedData = [];
                let details = {};
                results.data.slice(0, -1).forEach((row) => {
                    const dateMap = {
                        mon: "2024-03-04",
                        tue: "2024-03-05",
                        wed: "2024-03-06",
                        thu: "2024-03-07",
                        fri: "2024-03-08",
                        sat: "2024-03-09",
                    };
                    
                    const dayDate = dateMap[row.Day?.toLowerCase()];
                    if(dayDate) {
                        const startDateTime = dayDate + 'T' + row.StartTime;
                        const endDateTime = dayDate + 'T' + row.EndTime;
  
                        loadedData.push({
                            title: row.CName + ' ' + row.CID,
                            startDate: startDateTime,
                            endDate: endDateTime,
                        });
  
                        
                        details = {
                            semester: row.semester,
                            academicYear: row.academicYear,
                            Tname: row.Tname,
                        };
                    }
                    console.log(row.Tname)
                });
                
                setData(loadedData);
                setCourseDetails(details);
                setSelectedFile(file); 
  
                
            },
        });
    };
  
    const clearFile = () => {
      setData([]);
      setCourseDetails({});
      setSelectedFile(null);
    };
  
    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8081/insertSchedule', { data, courseDetails });
      Swal.fire({
        icon: 'success',
        title: 'Schedule submitted successfully',
      });
      console.log('created successfully');
      clearFile();
      
    } catch (error) {
      console.error('Error creating:', error);
    }
  };
  
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

  return (
    <>
      <PageHeader
        title="Schedule"
        subTitle="Computer Science and Information KMUTNB"
        icon={<EventNoteIcon fontSize="large" />}
      />
      <Paper className={classes.pageContent}>
        <Toolbar>
          
          <div className={classes.uploadButton}>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                >
                Upload file
                <VisuallyHiddenInput type="file" accept=".csv" onChange={handleFileUpload}/>
            </Button>
          </div>
          
        </Toolbar>
        {courseDetails.Tname ? (
            <div className="detailSc">
                <div>
                    <p>Teacher: <span className="s">{courseDetails.Tname}</span>
                    <span/>Semester: <span className="s">{courseDetails.semester}</span><span/>
                    Academic Year: <span className="s">{courseDetails.academicYear}</span></p>
                </div>
            </div>
        ) : null}

        <div className="centerContainer">
            <Paper className="paperStyle">
                <Scheduler data={data}>
                    <WeekView startDayHour={8} endDayHour={22} excludedDays={[0]} />
                    <Appointments />
                </Scheduler>
            </Paper>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2%' }}>
            <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit
            </Button>
        </div>
       
      </Paper>
      
    </>
  );
}