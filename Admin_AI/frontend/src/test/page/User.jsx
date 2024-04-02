import React, { useEffect, useState } from "react";
import Nav from "../component/Nav";
import PageHeader from "../component/PageHeader";
import { AiOutlineUser } from "react-icons/ai";
import axios from "axios";
import "./css/popup.css";

function User() {
  const [dataUser, setDataUser] = useState([]);
  const [popup, setPopup] = useState(false);
  const [role, setRole] = useState("");
  const [imgfile, setImgFile] = useState(null);
  const [searchuser, setSearchUser] = useState("");
  // const [formvalue, setFormvalue] = useState({
  //   CSName: "",
  //   role: "",
  //   imgpath: "",
  // });
  const [CSName, setCSName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios
      .get("http://localhost:8081/User")
      .then((response) => {
        setDataUser(response.data);
      })
      .catch((error) => console.log(error));
  }, []);
  // console.log(dataUser);

  const handlePopup = () => {
    console.log("Add User");
    setPopup(!popup);
  };

  const handleDelete = async (CSID) => {
    try {
      const response = await axios.delete(
        `http://localhost:8081/deleteUser/${CSID}`
      );
      console.log(response);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const saveImgToDir = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(
        "http://localhost:8081/upload",
        formData
      );

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const imgPath = await saveImgToDir(imgfile);
      const response = await axios.post("http://localhost:8081/AddUser", {
        CSName: CSName,
        role: role,
        imgpath: imgPath,
      });

      console.log(response);

      window.location.reload();

      resetForm();
      clearFile();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value;
    setSearchUser(searchTerm);
  };

  const filterData = () => {
    const startPage = (currentPage - 1) * 5;
    const endPage = startPage + 5;
    if (searchuser.length > 0) {
      return dataUser
        .filter((item) => {
          return item.CSName.toLowerCase().includes(searchuser.toLowerCase());
        })
        .slice(startPage, endPage);
    } else {
      return dataUser.slice(startPage, endPage);
    }
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  // const handleAddUser = () => {};

  const handleChangeRole = (event) => {
    setRole(event.target.value);
  };

  const saveImage = async (file) => {
    try {
      const fileData = new File();
      fileData.append("image", file);
      const response = await axios.post(
        "http://localhost:8080/upload",
        fileData
      );
    } catch (error) {
      console.log("err save img: ", error);
      throw error;
    }
  };
  const handleImageFile = (event) => {
    const file = event.target.files;

    console.log(file);

    if (file && file.length > 0) {
      console.log("1");
      const fileImg = file[0];
      setImgFile(fileImg);
    }
  };

  if (popup) {
    document.body.classList.add("active-popup");
  } else {
    document.body.classList.remove("active-popup");
  }

  return (
    <div>
      {popup && (
        <div className="popup-user w-[100%] h-[100vh] z-40 absolute">
          <div className="overlay">
            <div className="userform">
              {/* <h3>input form</h3> */}
              <form onSubmit={handleSubmit}>
                <div className="user-input p-10 flex flex-col">
                  <label>FullName</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={CSName}
                    className="input input-sm input-secondary"
                    onChange={(event) => setCSName(event.target.value)}
                  />
                  <div className="user-role mt-4">
                    <h6>Role</h6>
                    <br />

                    <input
                      type="radio"
                      name="role"
                      value="student"
                      className="radio radio-xs mr-3"
                      onChange={handleChangeRole}
                    />
                    <label>student</label>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      className="radio radio-xs ml-5 mr-3"
                      onChange={handleChangeRole}
                    />
                    <label>teacher</label>
                  </div>
                  <div className="user-file mt-4">
                    <h6>Image</h6>
                    <input
                      type="file"
                      accept=".jpg"
                      onChange={handleImageFile}
                    />
                    {imgfile && (
                      <img src={URL.createObjectURL(imgfile)} width={50} />
                    )}
                  </div>
                </div>
                <div className="button flex justify-center">
                  <button
                    type="submit"
                    className="btn btn-square btn-success mr-2"
                  >
                    Add
                  </button>
                  <button
                    className="btn btn-square btn-error"
                    onClick={handlePopup}
                  >
                    close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* popup */}

      {/*  */}
      <div className="flex gap-6 bg-[#f4f5fd]">
        <Nav />

        <div className="m-3 w-screen text-xl flex flex-col text-center items-center ">
          <PageHeader
            title="Schedule"
            icon={
              <AiOutlineUser className="text-[#3c44b1] !text-[35px] place-self-center" />
            }
          />

          <div className="w-[60%] h-[650px] mt-4 pt-5 px-5 bg-white shadow-md ">
            <div className="w-[100%] flex mb-4">
              <input
                type="text"
                placeholder="search here"
                className="input input-bordered input-info w-[50%] "
                onChange={handleSearch}
              />
              <button
                className="btn btn-square w-[14%] btn-info !ml-8"
                onClick={handlePopup}
              >
                Add User
              </button>
            </div>
            <div>
              <table style={{ fontSize: "0.88rem" }} className="w-full">
                <thead>
                  <tr className=" bg-purple-200">
                    <th className="font-semibold text-left pl-20 py-3 w-[50%]">
                      Name
                    </th>
                    <th className="font-semibold py-3">Role</th>
                    <th className="font-semibold py-3">Image</th>
                    <th className="font-semibold py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filterData().map((item, index) => (
                    <tr
                      key={item.CSID}
                      className="border-y-[1px] border-y-gray-300 text-gray-600"
                    >
                      {/* <td className="py-6 hidden">{item.CSID}</td> */}
                      <td className="text-left pl-20 py-6">{item.CSName}</td>
                      <td>{item.Role}</td>
                      <td className="flex  h-[5rem] justify-center items-center mx-auto">
                        <img
                          src={`./../../../img_test/${item.CSID}.jpg`}
                          alt="userimg"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-error"
                          onClick={() => handleDelete(item.CSID)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end ">
              <button
                className="btn py-0.5 "
                style={{ fontSize: "0.75rem" }}
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm flex items-center mx-1">
                Page {currentPage}
              </span>
              <button
                className="btn py-0.5 "
                style={{ fontSize: "0.75rem" }}
                onClick={nextPage}
                disabled={dataUser.length <= currentPage * 5}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="m">gg</div> */}
    </div>
  );
}

export default User;
