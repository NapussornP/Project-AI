import React from "react";
import Nav from "../component/Nav";
import PageHeader from "../component/PageHeader";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Paper from "@mui/material/Paper";

function Schedule() {
  return (
    <section className="flex gap-6 bg-[#f4f5fd]">
      <Nav />
      <div className="m-3 w-screen text-xl text-purple-800 flex flex-col text-center items-center ">
        {/* Schedule Page */}
        <PageHeader
          title="Schedule"
          icon={
            <EventNoteIcon className="text-[#3c44b1] !text-[35px] place-self-center" />
          }
        />

        <Paper elevation={1} className="w-[60%] h-[650px] mt-4 pt-5">
          {/* qqq */}
          <input
            class="block w-[30rem] mx-10 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            accept=".csv"
          />
        </Paper>
      </div>
    </section>
  );
}

export default Schedule;
