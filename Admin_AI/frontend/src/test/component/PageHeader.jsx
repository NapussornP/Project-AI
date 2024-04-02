import React from "react";

function PageHeader(props) {
  const { title, icon } = props;
  return (
    <div className="p-2 w-[60%] h-[9%] flex gap-4 mt-3 bg-white ">
      <div className="flex justify-center w-[7%] shadow-md">{icon}</div>

      <div className="text-left">
        <h6 className="!font-semibold">{title}</h6>
        <h6 className="!font-semibold text-gray-400 !text-[0.9rem]">
          Computer Science and Information KMUTNB
        </h6>
      </div>
    </div>
  );
}

export default PageHeader;
