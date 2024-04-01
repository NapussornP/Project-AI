const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
// const { json } = require("body-parser");
// const bodyParser = require("body-parser");
const axios = require("axios");
const { error } = require("console");

const app = express();
app.use(express.json());
app.use(cors());

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), function (req, res, next) {
  const file = req.file;

  const nextCSIDQuery =
    "SELECT CSID + 1 AS NextCSID FROM CSUser ORDER BY CSID DESC LIMIT 1";

  db.query(nextCSIDQuery, (err, results) => {
    if (err) {
      console.error("Error getting the next CSID:", err);
      res
        .status(500)
        .json({ error: "Error getting the next CSID from the database" });
    } else {
      const nextCSID = results[0] ? results[0].NextCSID : 1;
      console.log("Query results:", results);
      //   const nextCSID = results[0].NextCSID ;

      const filename = nextCSID + path.extname(file.originalname);

      // Save
      const destination = path.join("../frontend/img_test/", filename);
      require("fs").writeFileSync(destination, file.buffer);

      console.log(destination);
      console.log("File saved successfully:", filename);
      res.send(destination);
    }
  });
});

var host = "localhost";
if (process.env.NODE_ENV == "production") {
  host = "mysql-server";
}

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ai",
});

app.get("/", (re, res) => {
  return res.json("From Backend Side");
});

app.get("/Search", (req, res) => {
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
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.post("/Login", (req, res) => {
  const sql = "SELECT * FROM admin WHERE AdUsername = ? AND AdPassword = ? ";
  db.query(sql, [req.body.username, req.body.password], (err, data) => {
    if (err) return res.json("err");
    if (data.length > 0) {
      return res.json("Login success");
    } else {
      return res.json("No record");
    }
  });
});

app.get("/User", (req, res) => {
  const sql = "SELECT * FROM `csuser` WHERE 1";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.delete("/deleteUser/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = "DELETE FROM CSUser WHERE CSID = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Failed to delete user" });
    } else {
      console.log("User deleted successfully");
      res.status(200).json({ message: "User deleted successfully" });
    }
  });
});

app.post("/AddUser", (req, res) => {
  const { CSName, role, img_64 } = req.body;
  // console.log(req.body);
  const sql = "INSERT INTO CSUser (CSName, Role, 	img_64) VALUES (?, ?, ?)";

  db.query(sql, [CSName, role, img_64], (error, results) => {
    if (error) {
      console.error("Error inserting user:", error);
      res.status(500).json({ message: "Failed to add user" });
    } else {
      console.log("User added successfully");
      res.status(200).json({ message: "User added successfully" });

      axios
        .get("http://127.0.0.1:5001/savetoDir")
        .then(() => {
          console.log("Python API called successfully");
        })
        .catch((error) => {
          console.error("Error calling Python API:", error);
        });
    }
  });
});

// normal dash

// app.get('/dashboard', (req, res) => {
//     const sql = `
//             SELECT
//             e.EmoName,
//             COALESCE(COUNT(t.EmoID), 0) AS EmoCount,
//             d.DayName AS DayOfWeek
//         FROM
//             emotion e
//         CROSS JOIN
//             (SELECT DISTINCT DAYNAME(Date_time) AS DayName FROM transaction) d
//         LEFT JOIN
//             transaction t ON e.EmoID = t.EmoID AND DAYNAME(t.Date_time) = d.DayName
//         GROUP BY
//             e.EmoName, DayOfWeek
//         ORDER BY
//             FIELD(DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
//             `;

//     db.query(sql, (err, data) => {
//         if (err) return res.json(err);

//         const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ];
//         const seriesColors = ['#FF3EA5', '#008ffb', '#00E396', 'rgb(119, 93, 208)', '#4d1b28', 'rgb(255, 69, 96)', 'rgb(254, 176, 25)'];

//         const series = data.reduce((result, item, index) => {
//             const existingEmotion = result.find(entry => entry.name === item.EmoName);
//             const dayIndex = days.indexOf(item.DayOfWeek);

//             if (existingEmotion) {
//                 // Set data according to the const days
//                 existingEmotion.data[dayIndex] = item.EmoCount;
//             } else {
//                 const newData = Array(days.length).fill(0);
//                 newData[dayIndex] = item.EmoCount;

//                 result.push({
//                     name: item.EmoName,
//                     data: newData,
//                     // Set color for the series
//                     color: seriesColors[index],
//                 });
//             }

//             return result;
//         }, []);

//         const options = {
//             title: {
//                 text: "cs kmutnb emotion",
//             },
//             chart: {
//                 stacked: true,
//             },
//             plotOptions: {
//                 bar: {
//                     horizontal: true,
//                     columnWidth: '100%',
//                     // colors: ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FFA500', '#800080', '#A52A2A'],
//                 },
//             },
//             stroke: {
//                 width: 1,
//             },
//             xaxis: {
//                 title: {
//                     text: "cs kmutnb emotion in Days",
//                 },
//                 categories: days,
//             },
//             yaxis: {
//                 title: {
//                     text: "Count of Emotions",
//                 },
//             },
//             legend: {
//                 position: 'bottom',
//             },
//             dataLabels: {
//                 enabled: true,
//             },
//             grid: {
//                 show: true,
//                 xaxis: {
//                     lines: {
//                         show: false,
//                     },
//                 },
//                 yaxis: {
//                     lines: {
//                         show: false,
//                     },
//                 },
//             },
//             // colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'],

//         };

//         const stackedBarChartData = { series, options };
//         // console.log('Days length:', days.length);
//         // console.log('Series length:', series.length);

//         return res.json(stackedBarChartData);
//     });
// });

app.get("/dashboard", (req, res) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const seriesColors = [
    "#FF3EA5",
    "#008ffb",
    "#00E396",
    "rgb(119, 93, 208)",
    "#4d1b28",
    "rgb(255, 69, 96)",
    "rgb(254, 176, 25)",
  ];

  const series = [];
  for (let i = 0; i < 7; i++) {
    const newData = Array(days.length).fill(0);

    series.push({
      name: "",
      data: newData,
      // color: seriesColors[i % seriesColors.length],
    });
  }

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
        columnWidth: "100%",
      },
    },
    stroke: {
      width: 1,
    },
    xaxis: {
      title: {
        text: "Number of Emotions",
      },
      categories: days,
    },
    yaxis: {
      title: {
        text: "7 Days",
      },
    },
    legend: {
      position: "bottom",
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
  };

  const stackedBarChartData = { series, options };

  res.json(stackedBarChartData);
});

app.get("/StartTimeDashboard", (req, res) => {
  const csName = req.query.csName;
  const semester = req.query.semester;
  const academicYear = req.query.academicYear;
  // const sql = `
  //     SELECT
  //         e.EmoName,
  //         COALESCE(COUNT(t.EmoID), 0) AS EmoCount,
  //         d.DayName AS DayOfWeek
  //     FROM
  //         emotion e
  //     CROSS JOIN
  //         (SELECT DISTINCT DAYNAME(Date_time) AS DayName FROM transaction) d
  //     LEFT JOIN
  //         transaction t ON e.EmoID = t.EmoID AND DAYNAME(t.Date_time) = d.DayName
  //     WHERE
  //         t.CSID = (SELECT CSID FROM csuser WHERE CSName = ?)
  //     GROUP BY
  //         e.EmoName, DayOfWeek
  //     ORDER BY
  //         FIELD(DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  // `;

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
        INNER JOIN
            schedule s ON t.CSID = s.CSID AND
        CASE 
            WHEN DAYNAME(t.Date_time) = 'Monday' THEN 'mon'
            WHEN DAYNAME(t.Date_time) = 'Tuesday' THEN 'tue'
            WHEN DAYNAME(t.Date_time) = 'Wednesday' THEN 'wed'
            WHEN DAYNAME(t.Date_time) = 'Thursday' THEN 'thu'
            WHEN DAYNAME(t.Date_time) = 'Friday' THEN 'fri'
            WHEN DAYNAME(t.Date_time) = 'Saturday' THEN 'sat'
            WHEN DAYNAME(t.Date_time) = 'Sunday' THEN 'sun'
        END = s.Day
        WHERE 
            t.CSID = (SELECT CSID FROM csuser WHERE CSName = ?)
            AND s.semester = ? AND s.academicyear = ?
            AND  TIME(t.Date_time) >= ADDTIME(s.StartTime, '-00:30:00')
            AND TIME(t.Date_time) <= ADDTIME(s.StartTime, '00:30:00')
                    
            
        GROUP BY 
            e.EmoName, DayOfWeek
        
        ORDER BY
                FIELD(DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    `;

  db.query(sql, [csName, semester, academicYear], (err, data) => {
    if (err) return res.json(err);

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const seriesColors = [
      "#FF3EA5",
      "#008ffb",
      "#00E396",
      "rgb(119, 93, 208)",
      "#4d1b28",
      "rgb(255, 69, 96)",
      "rgb(254, 176, 25)",
    ];

    const series = data.reduce((result, item, index) => {
      const existingEmotion = result.find(
        (entry) => entry.name === item.EmoName
      );
      const dayIndex = days.indexOf(item.DayOfWeek);

      if (existingEmotion) {
        // Set data according to the const days
        existingEmotion.data[dayIndex] = item.EmoCount;
      } else {
        const newData = Array(days.length).fill(0);
        newData[dayIndex] = item.EmoCount;

        let color;
        if (item.EmoName === "fear") {
          color = seriesColors[3];
        } else if (item.EmoName === "surprise") {
          color = seriesColors[6];
        } else if (item.EmoName === "neutral") {
          color = seriesColors[2];
        } else if (item.EmoName === "angry") {
          color = seriesColors[5];
        } else if (item.EmoName === "happy") {
          color = seriesColors[0];
        } else if (item.EmoName === "sad") {
          color = seriesColors[1];
        } else if (item.EmoName === "disgust") {
          color = seriesColors[4];
        }

        result.push({
          name: item.EmoName,
          data: newData,
          color: color,
        });
      }

      return result;
    }, []);

    const options = {
      title: {
        text: "Start Class",
      },
      chart: {
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "100%",
        },
      },
      stroke: {
        width: 1,
      },
      xaxis: {
        title: {
          text: "Number of Emotions",
        },
        categories: days,
      },
      yaxis: {
        title: {
          text: "7 Days",
        },
      },
      legend: {
        position: "bottom",
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
    };

    const stackedBarChartData = { series, options };

    res.json(stackedBarChartData);
  });
});

app.get("/FinishTimeDashboard", (req, res) => {
  const csName = req.query.csName;
  const semester = req.query.semester;
  const academicYear = req.query.academicYear;
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
        INNER JOIN
            schedule s ON t.CSID = s.CSID AND
        CASE 
            WHEN DAYNAME(t.Date_time) = 'Monday' THEN 'mon'
            WHEN DAYNAME(t.Date_time) = 'Tuesday' THEN 'tue'
            WHEN DAYNAME(t.Date_time) = 'Wednesday' THEN 'wed'
            WHEN DAYNAME(t.Date_time) = 'Thursday' THEN 'thu'
            WHEN DAYNAME(t.Date_time) = 'Friday' THEN 'fri'
            WHEN DAYNAME(t.Date_time) = 'Saturday' THEN 'sat'
            WHEN DAYNAME(t.Date_time) = 'Sunday' THEN 'sun'
        END = s.Day
        WHERE 
            t.CSID = (SELECT CSID FROM csuser WHERE CSName = ?)
            AND s.semester = ? AND s.academicyear = ?
            AND TIME(t.Date_time) >= ADDTIME(s.EndTime, '-01:30:00')
            AND TIME(t.Date_time) <= ADDTIME(s.EndTime, '00:30:00')
                    
            
        GROUP BY 
            e.EmoName, DayOfWeek
        
        ORDER BY
                FIELD(DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    `;

  db.query(sql, [csName, semester, academicYear], (err, data) => {
    if (err) return res.json(err);

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const seriesColors = [
      "#FF3EA5",
      "#008ffb",
      "#00E396",
      "rgb(119, 93, 208)",
      "#4d1b28",
      "rgb(255, 69, 96)",
      "rgb(254, 176, 25)",
    ];

    const series = data.reduce((result, item, index) => {
      const existingEmotion = result.find(
        (entry) => entry.name === item.EmoName
      );
      const dayIndex = days.indexOf(item.DayOfWeek);

      if (existingEmotion) {
        // Set data according to the const days
        existingEmotion.data[dayIndex] = item.EmoCount;
      } else {
        const newData = Array(days.length).fill(0);
        newData[dayIndex] = item.EmoCount;

        let color;
        if (item.EmoName === "fear") {
          color = seriesColors[3];
        } else if (item.EmoName === "surprise") {
          color = seriesColors[6];
        } else if (item.EmoName === "neutral") {
          color = seriesColors[2];
        } else if (item.EmoName === "angry") {
          color = seriesColors[5];
        } else if (item.EmoName === "happy") {
          color = seriesColors[0];
        } else if (item.EmoName === "sad") {
          color = seriesColors[1];
        } else if (item.EmoName === "disgust") {
          color = seriesColors[4];
        }

        result.push({
          name: item.EmoName,
          data: newData,
          color: color,
        });
      }

      return result;
    }, []);

    const options = {
      title: {
        text: "Finish Class",
      },
      chart: {
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "100%",
        },
      },
      stroke: {
        width: 1,
      },
      xaxis: {
        title: {
          text: "Number of Emotions",
        },
        categories: days,
      },
      yaxis: {
        title: {
          text: "7 Days",
        },
      },
      legend: {
        position: "bottom",
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
    };

    const stackedBarChartData = { series, options };

    res.json(stackedBarChartData);
  });
});

app.get("/csName", (req, res) => {
  const sql = ` SELECT CSName FROM csuser WHERE Role = 'teacher' `;
  // const sql = ` SELECT CSName FROM csuser  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching cs names: ", err);
      res.result(500).send("Internal Server Error");
    } else {
      res.json(result);
    }
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

// not update exists schedule
app.post("/insertSchedule", async (req, res) => {
  const { data, courseDetails } = req.body;

  try {
    for (const schedule of data) {
      const { title, startDate, endDate } = schedule;

      const [CName, CID] = title.split(" ");

      // Check if the schedule already exists
      const existingScheduleQuery = `
                SELECT COUNT(*) AS COUNT
                FROM schedule
                WHERE CID = ? AND Day = LOWER(DATE_FORMAT(?, '%a')) AND CSID = (SELECT CSID FROM csuser WHERE CSName= ? )
                AND semester = ? 
                AND academicYear = ?
                AND schedule.StartTime = TIME(?)
                LIMIT 1;
            `;

      const existingScheduleValues = [
        CID,
        startDate,
        courseDetails.Tname,
        courseDetails.semester,
        courseDetails.academicYear,
        startDate,
      ];

      db.query(
        existingScheduleQuery,
        existingScheduleValues,
        function (err, existingScheduleResult) {
          if (err) {
            console.error("Error fetching existing schedule:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // console.log('existingScheduleResult: ', existingScheduleResult[0].COUNT);

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

            const insertValues = [
              CID,
              CName,
              startDate,
              startDate,
              endDate,
              courseDetails.semester,
              courseDetails.academicYear,
              courseDetails.Tname,
            ];

            db.query(insertQuery, insertValues, function (err, insertResult) {
              if (err) {
                console.error("Error inserting schedule:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              console.log("Schedule inserted successfully");
            });
          } else {
            console.log("Schedule already exists");
          }
        }
      );
    }

    console.log("All schedules processed successfully");
    res.status(200).json({ message: "All schedules processed successfully" });
  } catch (error) {
    console.error("Error inserting schedules:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/TeachingSchedule/:id", (req, res) => {
  const id = req.params.id;

  const sql = ` DELETE FROM schedule WHERE id = ?`;
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.log("Error deleting Schedule: ", err);
      re.status(500).json({ error: "error deleting schedule" });
    } else {
      res.json(data);
    }
  });
});

app.get("/TeachingSchedule", (req, res) => {
  const semester = req.query.semester;
  const academicYear = req.query.academicYear;
  const csName = req.query.csName;

  console.log("1");
  console.log(semester + " " + academicYear + " " + csName);

  const sql = `SELECT ID, CID, CName, Day, StartTime, EndTime FROM schedule s
              JOIN csuser c on c.CSID = s.CSID
              WHERE s.semester = ?
              AND s.academicYear= ?
              AND c.CSName= ?;`;

  // try {
  //   const result = await db.query(sql, [semester, academicYear, csName]);
  //   res.json(result);
  // } catch (err) {
  //   console.log("Error fetching Schedule: ", err);
  //   res.status(500).json({ error: "Error fetching Schedule" });
  // }

  db.query(sql, [semester, academicYear, csName], (err, data) => {
    if (err) {
      console.log("Error fetching Schedule: ", err);
      res.status(500).json({ error: "Error fetching Schedule" });
    } else {
      res.json(data);
    }
  });
});

// -------------kiosk-----------------------
app.get("/uploadtofolder", (req, res) => {
  // const sql =
  //   "SELECT CSID, CSName, Role, CSImg, img_64 FROM csuser";

  const sql = `SELECT CSID, CSName, Role, CSImg, img_64 FROM csuser ORDER BY csuser.CSID DESC LIMIT 1;`;
  db.query(sql, (err, data) => {
    if (err) {
      return res.json(err);
    } else {
      return res.json(data);
    }
  });
});

app.post("/insertPy", (req, res) => {
  const { Date_time, CSGender, CSAge, CSID, EmoID, S_Pic, L_Pic } = req.body;
  // console.log(req.body);
  const sql = `INSERT INTO transaction (Date_time, CSGender, CSAge, CSID, EmoID, S_Pic, L_Pic)
  VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [Date_time, CSGender, CSAge, CSID, EmoID, S_Pic, L_Pic],
    (error, result) => {
      if (error) {
        console.error("Error inserting from kiosk:", error);
        res.status(500).json({ message: "Failed to inserting from kiosk" });
      } else {
        console.log("Kiosk insert successfully");
        res.status(200).json({ message: "Kiosk insert successfully" });
      }
    }
  );
});

app.get("/selectEmoID", (req, res) => {
  const emoName = req.body.emoName;
  console.log(emoName);
  const sql = `SELECT EmoID FROM emotion WHERE EmoName = ?`;
  db.query(sql, [emoName], (error, result) => {
    if (error) {
      console.log("Error selecting Emotion ID: ", error);
      return res.status(500).json({ message: "Failed to select emotion id" });
    } else {
      console.log("select emotion id successfully");
      return res.json(result);
    }
  });
});

app.get("/texttospeech", (req, res) => {
  // console.log("1");
  const emo_id = req.query.emotion;
  // console.log("msg emoid: ", emo_id);
  const sql = `SELECT Message FROM text WHERE EmoID = ?`;

  db.query(sql, [emo_id], (error, result) => {
    if (error) {
      console.log("Error query message: ", error);
      return res.status(500).json({ message: "Failed to select message" });
    } else {
      console.log("select emotion id successfully");
      return res.json(result);
    }
  });
});
app.listen(8081, () => {
  console.log("listening");
});
