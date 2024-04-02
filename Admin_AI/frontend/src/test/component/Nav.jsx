import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { AiOutlineSchedule } from "react-icons/ai";
import { GoSearch } from "react-icons/go";
import { IoLogOutOutline } from "react-icons/io5";
import { PiChalkboardTeacher } from "react-icons/pi";

function Nav() {
  const menu = [
    {
      name: "Dashboard",
      link: "/Dashboard",
      icon: <MdOutlineDashboard size={18} />,
    },
    {
      name: "User",
      link: "/User",
      icon: <AiOutlineUser size={18} />,
    },
    {
      name: "Schedule",
      link: "/Schedule",
      icon: <AiOutlineSchedule size={18} />,
    },
    {
      name: "T. Schedule",
      link: "/TeacherSchedule",
      icon: <PiChalkboardTeacher size={18} />,
    },
    { name: "Search", link: "/Search", icon: <GoSearch size={18} /> },
    {
      name: "Logout",
      link: "/",
      icon: <IoLogOutOutline size={18} />,
    },
  ];

  const [open, setOpen] = useState(true);
  return (
    <div className="flex gap-6 bg-purple-100">
      <div
        className={`bg-black min-h-screen  ${
          open ? "w-72" : "w-16"
        }  duration-500 text-white px-4`}
      >
        <div className="py-3 flex justify-end ">
          <HiMenuAlt3
            size={26}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 relative">
          {menu.map((item, index) => (
            <Link
              key={item.name}
              to={item.link}
              className={`group flex items-center text-base  gap-3.5 font-medium p-2 hover:bg-gray-900 rounded-md  ${
                index === 1 ? "mb-8" : ""
              } ${
                open && item.name === "Logout"
                  ? "group fixed bottom-2 w-64"
                  : item.name === "Logout" && "group fixed bottom-2 w-8"
              }`}
            >
              <div className="iconMenu">{item.icon}</div>

              <h2
                style={{ transitionDelay: `${index + 3}00ms` }}
                className={`whitespace-pre duration-500 ${
                  !open && "opacity-0 translate-x-4 overflow-hidden"
                }`}
              >
                {item.name}
              </h2>
              <h2
                className={`${
                  open && "hidden"
                } absolute bg-white text-black font-semibold whitespace-pre rounded-lg drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:bg-opacity-50 group-hover:w-fit group-hover:px-1 group-hover:py-1 group-hover: left-14 group-hover: duration-300`}
              >
                {item.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Nav;
