import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import Nav from "../Nav";
import './../css/Search.css'


function Search() {
    const [Date_time, setDate_time] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8081/transaction')
            .then((response) => response.json())
            .then((data) => {
                setDate_time(data);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []); // Empty dependency array to ensure the effect runs only once

    const columns = [
        {
            name: 'Date_time',
            label: 'Date',
            options: {
                customBodyRender: (value) => {
                    const formattedDate = new Date(value).toLocaleDateString("en-GB");
                    return formattedDate;
                },
                sort: true, // Enable sorting for Date column
            },
        },
        {
            name: 'Date_time',
            label: 'Time',
            options: {
                customBodyRender: (value) => {
                    const formattedTime = new Date(value).toLocaleTimeString("en-GB");
                    return formattedTime;
                },
                sort: true, // Enable sorting for Time column
            },
        },
        {
            name: 'UserName',
            label: 'Name',
        },
        {
            name: 'CSGender',
            label: 'Gender',
        },
        {
            name: 'EmotionName',
            label: 'Emotion',
        },
        {
            name: 'S_Pic',
            label: 'Image1',
            options: {
              customBodyRender: (value) => (
                <img
                  src={`${value}`}
                  alt="Image1"
                  style={{ width: '150px', height: 'auto' }} // ปรับขนาดตามความต้องการ
                />
              ),
            },
          },
        {
            name: 'L_Pic',
            label: 'image',
            options: {
                customBodyRender: (value) => (
                  <img
                    src={`${value}`}
                    alt="Image2"
                    style={{ width: '150px', height: 'auto' }} 
                  />
                ),
              },
        }
        
    ];

    const options = {
        selectableRows: 'none',
        responsive: "scroll",
        elevation: 0,
        rowsPerPage: 4,
        rowsPerPageOptions: [2, 4, 5],
        print: false,
        viewColumns: false,
        download: false,
        filter: false,
      };
    
    return (
        <section className="flex gap-6">
            <Nav/>
            <div className="searchCon m-4 text-xl text-gray-900 font-semibold w-100">
                {/* <p>saa</p> */}
                <div className='center'>
                    <MUIDataTable className="muiSearch" title={'Transaction'} 
                    data={Date_time} 
                    columns={columns} 
                    options={options} />
                </div>
                
                
                    
            </div>
        </section>
    );
  }
  export default Search;

