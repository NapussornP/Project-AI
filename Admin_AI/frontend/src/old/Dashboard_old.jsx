import React from "react";
import Nav from "../Nav";
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { useState, useEffect } from 'react';

function Dashboard()
{
    const [stackedBarChartData, setStackedBarChartData] = useState(null);

    useEffect(() => {
        // เรียก API จาก Backend
        fetch('http://localhost:8081/dashboard')
            .then(response => response.json())
            .then(data => setStackedBarChartData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);
    return(
      <section className="flex gap-6">
        <Nav/>
        <div className="m-3 text-xl text-gray-900 font-semibold">
          {/* REACT TAILWIND */}
          <React.Fragment>
            <div className="container-fluid mb-3 text-center">
                <h2>Stacked bar chart in react using apexcharts</h2>
                <div className='d-flex align-items-center justify-content-center'>
                    {stackedBarChartData && (
                        <Chart
                            type="bar"
                            width={1349}
                            height={300}
                            series={stackedBarChartData.series}
                            options={stackedBarChartData.options}
                        />
                    )}
                </div>
            </div>
        </React.Fragment>
        </div>
      </section>
    );
}
export default Dashboard;

