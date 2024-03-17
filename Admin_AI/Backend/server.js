const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const multer  = require('multer');
const path = require('path'); 
const { json } = require('body-parser');

const app = express()
app.use(express.json())
app.use(cors())



const storage = multer.memoryStorage(); 

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), function (req, res, next) {
  const file = req.file;

  
  const nextCSIDQuery = 'SELECT CSID + 1 AS NextCSID FROM CSUser ORDER BY CSID DESC LIMIT 1';

  db.query(nextCSIDQuery, (err, results) => {
    if (err) {
      console.error('Error getting the next CSID:', err);
      res.status(500).json({ error: 'Error getting the next CSID from the database' });
    } else {
      
      const nextCSID = results[0] ? results[0].NextCSID : 1;
      console.log('Query results:', results);
    //   const nextCSID = results[0].NextCSID ;
    

      const filename = nextCSID + path.extname(file.originalname);

      // Save 
      const destination = path.join('../frontend/img_test/', filename);
      require('fs').writeFileSync(destination, file.buffer);
    
      console.log(destination)
      console.log('File saved successfully:', filename);
      res.send(destination);

      
    }
  });
})





const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'ai'
})

app.get('/' , (re, res) => {
    return res.json("From Backend Side")
})

app.get('/Search', (req, res) => {
    // const sql = "SELECT * FROM transaction"
    // const sql = "SELECT t.Date_time, t.CSGender, t.CSAge, u.CSName AS UserName, e.EmoName AS EmotionName, t.S_Pic, t.L_Pic FROM Transaction t JOIN `CSUser` u ON t.CSID = u.CSID JOIN Emotion e ON t.EmoID = e.EmoID"
    const sql = `
                SELECT
                t.Date_time,
                t.CSGender,
                t.CSAge,
                CASE WHEN t.CSID = 0 THEN 'Unknown' ELSE u.CSName END AS UserName,
                e.EmoName AS EmotionName,
                t.S_Pic,
                t.L_Pic
            FROM
                Transaction t
            LEFT JOIN
                CSUser u ON t.CSID = u.CSID
            JOIN
                Emotion e ON t.EmoID = e.EmoID
            ORDER BY 
                t.Date_time;
                `;
    
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data)
    })
})


app.post('/Login', (req, res) => {
    const sql = "SELECT * FROM admin WHERE AdUsername = ? AND AdPassword = ? "
    db.query(sql, [req.body.username, req.body.password], (err, data) => {
        if(err) return res.json("err");
        if(data.length > 0){
            return res.json("Login success")
        }else{
            return res.json("No record")
        }
    })
})

app.get('/User', (req, res) => {
    const sql = 'SELECT * FROM `csuser` WHERE 1';
    db.query(sql, (err, data) => {
        if(err) return res.json(err)
        return res.json(data)
    })
})
app.delete('/deleteUser/:userId', (req, res) => {
    const userId = req.params.userId;

    const sql = 'DELETE FROM CSUser WHERE CSID = ?';
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Failed to delete user' });
        } else {
            console.log('User deleted successfully');
            res.status(200).json({ message: 'User deleted successfully' });
        }
    });
});

app.post('/AddUser', (req, res) => {
    const { CSName, role, imgpath } = req.body;
    console.log(req.body)
    const sql = 'INSERT INTO CSUser (CSName, Role, CSImg) VALUES (?, ?, ?)';
  
    db.query(sql, [CSName, role, imgpath], (error, results) => {
      if (error) {
        console.error('Error inserting user:',error);
        res.status(500).json({ message: 'Failed to add user' });
      } else {
        console.log('User added successfully');
        res.status(200).json({ message: 'User added successfully' });
      }
    });
  });
  

app.get('/dashboard', (req, res) => {
    const sql = `
            SELECT 
            e.EmoName,
            COALESCE(COUNT(t.EmoID), 0) AS EmoCount,
            d.DayName AS DayOfWeek
        FROM 
            emotion e
        CROSS JOIN
            (SELECT DISTINCT DAYNAME(Date_time) AS DayName FROM transaction) d
        LEFT JOIN 
            transaction t ON e.EmoID = t.EmoID AND DAYNAME(t.Date_time) = d.DayName
        GROUP BY 
            e.EmoName, DayOfWeek
        ORDER BY
            FIELD(DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
            `;

    db.query(sql, (err, data) => {
        if (err) return res.json(err);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
        const seriesColors = ['#FF3EA5', '#008ffb', '#00E396', 'rgb(119, 93, 208)', '#4d1b28', 'rgb(255, 69, 96)', 'rgb(254, 176, 25)'];

        const series = data.reduce((result, item, index) => {
            const existingEmotion = result.find(entry => entry.name === item.EmoName);
            const dayIndex = days.indexOf(item.DayOfWeek);

            if (existingEmotion) {
                // Set data according to the const days
                existingEmotion.data[dayIndex] = item.EmoCount;
            } else {
                const newData = Array(days.length).fill(0);
                newData[dayIndex] = item.EmoCount;

                result.push({
                    name: item.EmoName,
                    data: newData,
                    // Set color for the series
                    color: seriesColors[index],
                });
            }

            return result;
        }, []);

        const options = {
            title: {
                text: "cs kmutnb emotion",
            },
            chart: {
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: '100%',
                    // colors: ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FFA500', '#800080', '#A52A2A'],
                },
            },
            stroke: {
                width: 1,
            },
            xaxis: {
                title: {
                    text: "cs kmutnb emotion in Days",
                },
                categories: days,
            },
            yaxis: {
                title: {
                    text: "Count of Emotions",
                },
            },
            legend: {
                position: 'bottom',
            },
            dataLabels: {
                enabled: true,
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            // colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'],
            
            
        };

        

        const stackedBarChartData = { series, options };
        // console.log('Days length:', days.length);
        // console.log('Series length:', series.length);


        return res.json(stackedBarChartData);
    });
});






// app.post('/createAd', (req, res) => {
//     const { AdName, AdUsername, AdPassword } = req.body;
  
//     const sql = 'INSERT INTO admin (AdName, AdUsername, AdPassword) VALUES (?, ?, ?)';
//     db.query(sql, [AdName, AdUsername, AdPassword], (err, result) => {
//         if (err) {
//             res.status(500).json({ error: err.message });
//         } else {
//             const newAdId = result.insertId;
//             console.log('New Ad ID:', newAdId);
//             const responseData = {
//                 id: newAdId,
//                 AdName: AdName,
//                 AdUsername: AdUsername,
//                 message: 'Ad created successfully'
//             };
//             res.status(200).json(responseData);
//         }
//     });
//   });


// normal
// app.post('/insertSchedule', async (req, res) => {
//     const { data, courseDetails } = req.body;

//     try {
//         for (const schedule of data) {
//         const {
//             title,
//             startDate,
//             endDate
//         } = schedule;

//         const [CName, CID] = title.split(' ');

//         const query = `
//             INSERT INTO schedule (CID, CName, Day, StartTime, EndTime, semester, academicYear, CSID)
//             SELECT 
//                 ?, -- CID
//                 ?, -- CName
//                 DAYOFWEEK(?)-1, -- Day (assuming DAYOFWEEK returns 1 for Sunday)
//                 TIME(?), -- StartTime
//                 TIME(?), -- EndTime
//                 ?, -- semester
//                 ?, -- academicYear
//                 csuser.CSID -- CSID
//             FROM 
//                 csuser 
//             WHERE 
//                 csuser.CSName = ?;
//         `;

//         const values = [CID, CName, startDate, startDate, endDate, courseDetails.semester, courseDetails.academicYear, courseDetails.Tname];

//         await db.query(query, values);
//     }

//         console.log('Schedules inserted successfully');
//         res.status(200).json({ message: 'Schedules inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting schedules:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.post('/insertSchedule', async (req, res) => {
//     const { data, courseDetails } = req.body;

//     try {
//         for (const schedule of data) {
//             const {
//                 title,
//                 startDate,
//                 endDate
//             } = schedule;

//             const [CName, CID] = title.split(' ');

//             // Check if the schedule already exists for the given CID, Day, and CSID
//             const checkQuery = `
//                 SELECT 1
//                 FROM schedule
//                 WHERE CID = ? AND Day = DAYOFWEEK(?) - 1 AND CSID = ?
//                 LIMIT 1;
//             `;
//             const checkValues = [CID, startDate, courseDetails.Tname];
//             const checkResult = await db.query(checkQuery, checkValues);

//             // If the schedule does not exist, insert it
//             if (checkResult.length === 0) {
//                 const query = `
//                     INSERT INTO schedule (CID, CName, Day, StartTime, EndTime, semester, academicYear, CSID)
//                     SELECT 
//                         ?, -- CID
//                         ?, -- CName
//                         DAYOFWEEK(?)-1, -- Day (assuming DAYOFWEEK returns 1 for Sunday)
//                         TIME(?), -- StartTime
//                         TIME(?), -- EndTime
//                         ?, -- semester
//                         ?, -- academicYear
//                         csuser.CSID -- CSID
//                     FROM 
//                         csuser 
//                     WHERE 
//                         csuser.CSName = ?;
//                 `;

//                 const values = [CID, CName, startDate, startDate, endDate, courseDetails.semester, courseDetails.academicYear, courseDetails.Tname];

//                 await db.query(query, values);
//             }
//         }

//         console.log('Schedules inserted successfully');
//         res.status(200).json({ message: 'Schedules inserted successfully' });
//     } catch (error) {
//         console.error('Error inserting schedules:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// not update exists schedule
app.post('/insertSchedule', async (req, res) => {
    const { data, courseDetails } = req.body;

    try {
        for (const schedule of data) {
            const {
                title,
                startDate,
                endDate
            } = schedule;

            const [CName, CID] = title.split(' ');

            // Check if the schedule already exists
            const existingScheduleQuery = `
                SELECT COUNT(*) AS COUNT
                FROM schedule
                WHERE CID = ? AND Day = LOWER(DATE_FORMAT(?, '%a')) AND CSID = (SELECT CSID FROM csuser WHERE CSName= ? )
                LIMIT 1;
            `;

            const existingScheduleValues = [CID, startDate, courseDetails.Tname];

            db.query(existingScheduleQuery, existingScheduleValues, function(err, existingScheduleResult) {
                if (err) {
                    console.error('Error fetching existing schedule:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                console.log('existingScheduleResult: ', existingScheduleResult[0].COUNT);

                // If schedule does not exist, insert it
                if (existingScheduleResult[0].COUNT === 0) {
                    // Insert the schedule if it doesn't already exist
                    const insertQuery = `
                        INSERT IGNORE INTO schedule (CID, CName, Day, StartTime, EndTime, semester, academicYear, CSID)
                        SELECT 
                            ?, -- CID
                            ?, -- CName
                            DAYOFWEEK(?)-1, -- Day (assuming DAYOFWEEK returns 1 for Sunday)
                            TIME(?), -- StartTime
                            TIME(?), -- EndTime
                            ?, -- semester
                            ?, -- academicYear
                            csuser.CSID -- CSID
                        FROM 
                            csuser 
                        WHERE 
                            csuser.CSName = ?;
                    `;

                    const insertValues = [CID, CName, startDate, startDate, endDate, courseDetails.semester, courseDetails.academicYear, courseDetails.Tname];

                    db.query(insertQuery, insertValues, function(err, insertResult) {
                        if (err) {
                            console.error('Error inserting schedule:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }
                        
                        console.log('Schedule inserted successfully');
                    });
                } else {
                    console.log('Schedule already exists');
                }
            });
        }

        console.log('All schedules processed successfully');
        res.status(200).json({ message: 'All schedules processed successfully' });
    } catch (error) {
        console.error('Error inserting schedules:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});









  





app.listen(8081, () => {
    console.log("listening");
})