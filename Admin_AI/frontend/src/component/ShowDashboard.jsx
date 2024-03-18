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


  const handleChange = (event) => {
    setShowName(event.target.value); 
    axios.get('http://localhost:8081/StartTimeDashboard', {
        params: {
            csName: event.target.value
        }
    })
    .then(response => setStackedBarStartClass(response.data))
    .catch(error => console.error('Error fetching Start Class data:', error));
    
    axios.get('http://localhost:8081/FinishTimeDashboard', {
      params: {
        csName: event.target.value
      }
    })
    .then(response => setStackedBarFinishClass(response.data))
    .catch(error => console.error('Error fetching Finish Class data:', error))
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

  console.log(name)
  
  return (
    <>
      <PageHeader
          title="Chart"
          subTitle="Computer Science and Information KMUTNB"
          icon={<StackedBarChartIcon fontSize="large" style={{ transform: 'rotate(90deg)' }}/>}
      />


      <Paper className={classes.pageContent}>
        <FormControl sx={{ m: 2, minWidth: 250 }} size="small" className="FormControl">
          <InputLabel id="demo-select-small-label">name</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={showName}
            label="Name"
            onChange={handleChange}
            className="selectName"
          >
            
            {name.map((nameItem) => (
              <MenuItem key={nameItem} value={nameItem}>
                {nameItem}
              </MenuItem>
            ))}
          </Select>

          <InputLabel id="demo-select-small-label">name</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={showName}
            label="Semester"
            onChange={handleChange}
          >
            
            {/* {name.map((nameItem) => (
              <MenuItem key={nameItem} value={nameItem}>
                {nameItem}
              </MenuItem>
            ))} */}
          </Select>
        </FormControl>


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
