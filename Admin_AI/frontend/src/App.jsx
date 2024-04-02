import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Search from "./pages/Search";
// import AddUser from "./pages/AddUser"
import User from "./pages/User";
import ImgCrop from "./imgCrop/CropApp";
import TestUser from "./test/page/User";
import TeacherScedule from "./pages/TeacherScedule";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/User" element={<User />} />
        {/* <Route path="/User" element={<TestUser />} /> */}
        <Route path="/TeacherSchedule" element={<TeacherScedule />} />
        <Route path="/Schedule" element={<Schedule />} />
        <Route path="/Search" element={<Search />} />
      </Routes>
    </div>
  );
};

export default App;
