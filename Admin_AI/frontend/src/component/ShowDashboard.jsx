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
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import 'bootstrap/dist/css/bootstrap.min.css';
import { styled } from '@mui/material/styles';
import Chart from 'react-apexcharts';
// import ApexCharts from 'apexcharts';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './../css/Dashboard.css'



const useStyles = makeStyles((theme) => ({
    pageContent: {
      padding: theme.spacing(3),
      height: '900px',
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
    dropdown: {
      width: '100px'
    }
  }));





export default function Users() {
  const classes = useStyles();
  const [stackedBarStartClass, setStackedBarStartClass] = useState(null);
  const [stackedBarFinishClass, setStackedBarFinishClass] = useState(null);

  // console.log(stackedBarStartClass)


  const [name, setName] = useState([]);
  const [showName, setShowName] = React.useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const fetchData = (csName, semester, academicYear) => {
    axios.get('http://localhost:8081/StartTimeDashboard', {
        params: {
            csName: csName,
            semester: semester, 
            academicYear: academicYear 
        }
    })
    .then(response => setStackedBarStartClass(response.data))
    .catch(error => console.error('Error fetching Start Class data:', error));
    
    axios.get('http://localhost:8081/FinishTimeDashboard', {
        params: {
            csName: csName,
            semester: semester, 
            academicYear: academicYear 
        }
    })
    .then(response => setStackedBarFinishClass(response.data))
    .catch(error => console.error('Error fetching Finish Class data:', error))
};


  const handleChange = (event) => {
    setShowName(event.target.value);
    fetchData(event.target.value, semester, academicYear);
  };

  const handleChangeSemester = (event) => {
    setSemester(event.target.value);  
  };

  const handleChangeYear = (event) => {
    setAcademicYear(event.target.value); 
  };

  useEffect(() => {
    // axios.get('http://localhost:8081/dashboard')
    // .then(response => {
    //     setStackedBarStartClass(response.data);
    //     setStackedBarFinishClass(response.data);
    // })
    // .catch(error => console.error('Error fetching data:', error));

    axios.get('http://localhost:8081/csName')
    .then(response => {
      const csNames = response.data.map(item => item.CSName); 
      setName(csNames); 
    })
    .catch(error => console.log(error));

  }, []);
  
  useEffect(() => {
    if (showName) {
        fetchData(showName, semester, academicYear);
    }
}, [showName, semester, academicYear]);
  console.log(name)
  
  return (
    <>
      <PageHeader
          title="Chart"
          subTitle="Computer Science and Information KMUTNB"
          icon={<StackedBarChartIcon fontSize="large" style={{ transform: 'rotate(90deg)' }}/>}
      />


      <Paper className={classes.pageContent}>
        <div className="FormControl">
          <FormControl sx={{ m: 2, minWidth: 250 }} size="small" >
            <InputLabel id="demo-select-small-label">name</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={showName}
              label="Name"
              onChange={handleChange}
              style={{width: '250px'}}
            >
              {name.map((nameItem) => (
                <MenuItem key={nameItem} value={nameItem}>
                  {nameItem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ m: 2, minWidth: 250 }} size="small" >
            <InputLabel id="demo-select-small-label">semester</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={semester}
              label="Semester"
              onChange={handleChangeSemester}
              style={{width: '120px'}}
            >
              
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </FormControl>


          <FormControl sx={{ m: 2, minWidth: 250 }} size="small" >
            <InputLabel id="demo-select-small-label">Academin Year</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={academicYear}
              label="AcademinYear"
              onChange={handleChangeYear}
              style={{width: '155px'}}
            >
              
              {Array.from({length: 47}, (_, index) => {
                const year = 2024 + index;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </div>
        


        <Toolbar>
          <React.Fragment>
            <div className="container-fluid mb-3 text-center">
                <h2>IN </h2>
                <div className='d-flex align-items-center justify-content-center'>
                    {stackedBarStartClass && (
                        <Chart
                            type="bar"
                            width={600}
                            height={350}
                            series={stackedBarStartClass.series}
                            options={stackedBarStartClass.options}
                        />
                    )}
                </div>
            </div>
          </React.Fragment>
        </Toolbar>

        <Toolbar>
          <React.Fragment>
            <div className="container-fluid  text-center in-bar">
                <h2>OUT </h2>
                <div className='d-flex align-items-center justify-content-center'>
                    {stackedBarFinishClass && (
                        <Chart
                            type="bar"
                            width={600}
                            height={300}
                            series={stackedBarFinishClass.series}
                            options={stackedBarFinishClass.options}
                        />
                    )}
                </div>
            </div>
          </React.Fragment>
        </Toolbar>
          
      
      </Paper>
      
    </>
  );
}
