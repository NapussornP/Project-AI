import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../test/component/Nav";
import PageHeader from "../test/component/PageHeader";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import {
  Scheduler,
  Appointments,
  WeekView,
} from "@devexpress/dx-react-scheduler-material-ui";
import { ViewState } from "@devexpress/dx-react-scheduler";
import { IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import "./../css/Schedule.css";

function TeacherScedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tName, setTName] = useState([]);
  const [showName, setShowName] = useState("");
  const [academicYear, setAcademinYear] = useState("");
  const [semester, setSemester] = useState("");
  const [TSchedule, setTSchedule] = useState(null);
  const [data, setData] = useState([]);
  const [subjectID, setSubjectID] = useState("");
  const [subject, setSubject] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [day, setDay] = useState("");
  const [tid, setTId] = useState("");
  const currentDate = "2024-03-04";

  const handleEditAppointment = (data) => {
    setIsDialogOpen(true);
    setTId(data.ID);
    setSubjectID(data.CID);
    setSubject(data.title);
    setDay(data.day);
    setStartTime(data.startDate.split("T")[1]);
    setEndTime(data.endDate.split("T")[1]);
  };

  // console.log("st:", startTime);
  // console.log("et:", endTime);

  const handleClosePopup = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/csName")
      .then((response) => {
        setTName(response.data.map((item) => item.CSName));
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (showName && academicYear && semester) {
      fetchData(showName, academicYear, semester);
    }
  }, [showName, academicYear, semester]);

  const fetchData = (showName, academicYear, semester) => {
    axios
      .get("http://localhost:8081/TeachingSchedule", {
        params: {
          semester: semester,
          academicYear: academicYear,
          csName: showName,
        },
      })
      .then((response) => setTSchedule(response.data))
      .catch((error) => console.log("err fetching Tsch:", error));
  };

  const handleFormat = (newFormat) => {
    const formatData = newFormat.map((item) => {
      const dayMapping = {
        mon: "2024-03-04",
        tue: "2024-03-05",
        wed: "2024-03-06",
        thu: "2024-03-07",
        fri: "2024-03-08",
        sat: "2024-03-09",
      };
      const startDate = `${dayMapping[item.Day]}T${item.StartTime}`;
      const endDate = `${dayMapping[item.Day]}T${item.EndTime}`;
      return {
        startDate,
        endDate,
        title: item.CName,
        CID: item.CID,
        ID: item.ID,
        day: item.Day,
      };
    });
    setData(formatData);
  };

  // console.log(data);

  useEffect(() => {
    if (TSchedule) {
      handleFormat(TSchedule);
    }
  }, [TSchedule]);

  // console.log(TSchedule);
  const handleSelectTName = (event) => {
    setShowName(event.target.value);
  };

  const handleChangeYear = (e) => {
    setAcademinYear(e.target.value);
  };

  const handleDelete = async (data) => {
    // console.log(
    //   `DELETING!!!! ${data.ID} ${data.title} start:${
    //     data.startDate.split("T")[1]
    //   } end:${
    //     data.endDate.split("T")[1]
    //   } Tname:${showName} sem:${semester} year:${academicYear}`
    // );

    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });
      if (confirm.isConfirmed) {
        axios
          .delete(`http://localhost:8081/TeachingSchedule/${data.ID}`)
          .then((response) => {
            console.log("Delete Success: ");
            setTSchedule((prevSchedule) =>
              prevSchedule.filter((item) => item.ID !== data.ID)
            );
          });
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  const handleEdit = () => {
    const editData = {
      CID: subjectID,
      CName: subject,
      Day: day,
      StartTime: startTime,
      EndTime: endTime,
    };
    axios
      .put(`http://localhost:8081/TeachingSchedule/${tid}`, editData)
      .then((response) => {
        setIsDialogOpen(false);
        console.log("Edit Success: ", response.data);
        fetchData(showName, academicYear, semester);
      })
      .catch((error) => {
        console.log("error editing: ", error);
      });
  };

  // console.log(subject);
  return (
    <div>
      {isDialogOpen && (
        <div className="popup-user w-[100%] h-[100vh] z-40 absolute">
          <div className="overlay">
            <div className="userform p-[10%] rounded-3xl">
              {/* <h3>input form</h3> */}
              <form className="flex flex-col justify-center">
                <form method="dialog">
                  <div className="w-[100%] flex justify-end mt-[-8%] ml-[8%] ">
                    <button
                      className="btn btn-sm btn-circle btn-ghost absolute"
                      onClick={handleClosePopup}
                    >
                      ✕
                    </button>
                  </div>
                </form>
                <h3 className="font-bold text-xl flex justify-center">
                  Edit Schedule
                </h3>

                <form
                  className="flex flex-col mt-4"
                  // onSubmit={handleTestEdit}
                >
                  <div className="flex ">
                    <label className="text-gray-700 text-sm font-bold mr-3">
                      Subject ID:
                    </label>
                    <input
                      className="input-sm border-black border-[1px] rounded-lg  cursor-pointer w-[18%] mr-3"
                      type="text"
                      pattern="0[0-9]{0,6}"
                      defaultValue={subjectID}
                      onChange={(e) => setSubjectID(e.target.value)}
                    />

                    <label className="text-gray-700 text-sm font-bold mr-3">
                      Subject:
                    </label>
                    <input
                      className="input-sm border-black border-[1px] rounded-lg  cursor-pointer w-[40%]"
                      type="text"
                      defaultValue={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="flex mt-4">
                    <label className="text-gray-700 text-sm font-bold mr-3">
                      Day:
                    </label>
                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-[25%] p-2.5"
                      onChange={(e) => setDay(e.target.value)}
                    >
                      <option selected disabled>
                        Choose Day
                      </option>
                      <option value="mon">mon</option>
                      <option value="tue">tue</option>
                      <option value="wed">wed</option>
                      <option value="thu">thu</option>
                      <option value="fri">fri</option>
                      <option value="sat">sat</option>
                    </select>
                    <label className="text-gray-700 text-sm font-bold mr-3 ml-2">
                      Start:
                    </label>
                    <input
                      className="text-sm"
                      type="time"
                      id="appt"
                      name="appt"
                      defaultValue={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />

                    <label className="text-gray-700 text-sm font-bold mr-3">
                      End:
                    </label>
                    <input
                      type="time"
                      id="appt"
                      name="appt"
                      defaultValue={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <p className="py-4"></p>
                  {/* <div className="flex justify-center w-[100%]">
                    <button type="submit" className="btn btn-success w-[20%]">
                      Submit
                    </button>
                  </div> */}
                </form>
              </form>
              <div className="flex justify-center w-[100%]">
                <button
                  className="btn btn-success w-[20%]"
                  onClick={handleEdit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 bg-[#f4f5fd]">
        <Nav />
        <div className="m-3 w-screen text-xl flex flex-col text-center items-center ">
          <PageHeader
            title="Teaching Schedule"
            icon={
              <PiChalkboardTeacherDuotone className="text-[#3c44b1] !text-[35px] place-self-center" />
            }
          />
          <div className="w-[60%] h-[650px] mt-4 pt-5 px-5 bg-white shadow-md">
            <div className="w-[100%">
              <FormControl sx={{ m: 2, minWidth: 250 }} size="small">
                <InputLabel>Teacher Name</InputLabel>
                <Select
                  value={showName}
                  label="Teacher Name"
                  onChange={handleSelectTName}
                >
                  {tName.map((nameItem) => (
                    <MenuItem key={nameItem} value={nameItem}>
                      {nameItem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 2 }} size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={academicYear}
                  label="Academic Year"
                  onChange={handleChangeYear}
                  style={{ width: "155px" }}
                >
                  {Array.from({ length: 47 }, (_, index) => {
                    const year = 2024 + index;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 2 }} size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={semester}
                  label="Semester"
                  onChange={(e) => setSemester(e.target.value)}
                  style={{ width: "120px" }}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* schedule */}

            <div className="flex justify-center h-[70%] w-[100%] mt-3">
              <div className="h-[100%] w-[85%] border-b-2">
                <Scheduler data={data}>
                  <ViewState currentDate={currentDate} />
                  <WeekView
                    startDayHour={8}
                    endDayHour={22}
                    excludedDays={[0]}
                  />
                  <Appointments
                    appointmentContentComponent={({ data }) => (
                      <div>
                        {data && (
                          <div
                            className="text-white font-semibold pt-10 h-[100%]"
                            // onClick={handleTestEdit}
                          >
                            <div> {data.title}</div>
                            <div>{data.startDate.split("T")[1]}</div>
                            <div className="my-0.025">-</div>
                            <div>{data.endDate.split("T")[1]}</div>
                          </div>
                        )}
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(data)}
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            zIndex: 9999,
                          }}
                        >
                          <Delete />
                        </IconButton>

                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEditAppointment(data)}
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 25,
                            zIndex: 1,
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </div>
                    )}
                  />
                </Scheduler>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherScedule;
