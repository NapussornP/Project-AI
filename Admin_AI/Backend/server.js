const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const multer  = require('multer');
const path = require('path'); 

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
            u.CSName AS UserName,
            e.EmoName AS EmotionName,
            t.S_Pic,
            t.L_Pic
        FROM
            Transaction t
        JOIN
            CSUser u ON t.CSID = u.CSID
        JOIN
            Emotion e ON t.EmoID = e.EmoID
        ORDER BY 
            t.Date_time
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
            e.EmoName AS emotion,
            COUNT(*) AS count
        FROM
            Transaction t
        JOIN Emotion e ON t.EmoID = e.EmoID
        GROUP BY
            t.EmoID, e.EmoName
    `;
    
    db.query(sql, (err, data) => {
        if (err) return res.json(err);

        const categories = ['g'];

        const series = data.map(item => ({
            name: item.emotion,
            // data: data.map(item => item.count), // Initialize with zeros for both categories
            // Add color property if needed
            data: [item.count]
        }));

       

        const options = {
            title: {
                text: "cs kmutnb emotion"
            },
            chart: {
                stacked: true,
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    columnWidth: '100%'
                }
            },
            stroke: {
                width: 1,
            },
            xaxis: {
                title: {
                    text: "cs kmutnb emotion in Year's"
                },
                categories: categories
            },
            yaxis: {
                title: {
                    text: "Data in (K)"
                },
            },
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: true,
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }

            }
        };

        const stackedBarChartData = { series, options };

        return res.json(stackedBarChartData);
    });
});


// app.post('/createAd', (req, res) => {
//     const { AdName, AdUsername, AdPassword } = req.body;
  
//     const sql = 'INSERT INTO admin (AdName, AdUsername, AdPassword) VALUES (?, ?, ?)';
//     db.query(sql, [AdName, AdUsername, AdPassword], (err, result) => {
//       if (err) throw err;
//       console.log('Ad created:', result);
//       res.send('Ad created successfully');
//     });
//   });

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

        const query = `
            INSERT INTO schedule (CID, CName, Day, StartTime, EndTime, semester, academicYear, CSID)
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

        const values = [CID, CName, startDate, startDate, endDate, courseDetails.semester, courseDetails.academicYear, courseDetails.Tname];

        await db.query(query, values);
    }

        console.log('Schedules inserted successfully');
        res.status(200).json({ message: 'Schedules inserted successfully' });
    } catch (error) {
        console.error('Error inserting schedules:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

app.listen(8081, () => {
    console.log("listening");
})