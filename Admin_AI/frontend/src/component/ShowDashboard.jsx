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
import ApexCharts from 'apexcharts';


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

    const [stackedBarChartData, setStackedBarChartData] = useState(null);
    console.log(stackedBarChartData)

    useEffect(() => {
        fetch('http://localhost:8081/dashboard')
            .then(response => response.json())
            .then(data => setStackedBarChartData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);
    return (
        <>
        <PageHeader
            title="Chart"
            subTitle="Computer Science and Information KMUTNB"
            icon={<StackedBarChartIcon fontSize="large" style={{ transform: 'rotate(90deg)' }}/>}
        />
        <Paper className={classes.pageContent}>
            <Toolbar>
            
            <React.Fragment>
            <div className="container-fluid mb-3 text-center">
                <h2>Stacked bar chart in react using apexcharts</h2>
                <div className='d-flex align-items-center justify-content-center'>
                    {stackedBarChartData && (
                        <Chart
                            type="bar"
                            width={500}
                            height={250}
                            series={stackedBarChartData.series}
                            options={stackedBarChartData.options}
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
