import React, { useState, useEffect } from "react";
import Controls from "./controls/Controls";
import { Search } from "@material-ui/icons";
import useTable from "./UseTable";
import Popup from "./Popup";
import axios from "axios";
import {
  Paper,
  makeStyles,
  TableBody,
  TableRow,
  TableCell,
  Toolbar,
  InputAdornment,
} from "@material-ui/core";
import PageHeader from "./UserPageHeader";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import AddIcon from "@material-ui/icons/Add";
import UserForm from "./UserForm";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";

const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(3),
    height: "650px",
  },
  searchInput: {
    width: "75%",
    marginTop: "2px",
  },
  newButton: {
    position: "absolute",
    right: "10px",
  },
}));

const headCells = [
  { id: "CSID", label: " " },
  { id: "CSName", label: "Name" },
  { id: "Role", label: "Role" },
  { id: "Image", label: "Image" },
  { id: "", label: "Action" },
];

export default function Users() {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    useTable(records, headCells, filterFn);
  const [user, setUser] = useState([]);
  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API + "/User")
      .then((response) => {
        setRecords(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleSearch = (e) => {
    let target = e.target.value.toLowerCase();
    setFilterFn({
      fn: (items) => {
        if (target === "") return items;
        else
          return items.filter((x) => x.CSName.toLowerCase().includes(target));
      },
    });
  };

  const handleDelete = async (userId) => {
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
        await axios.delete(import.meta.env.VITE_API + `/deleteUser/${userId}`);
        const response = await fetch(import.meta.env.VITE_API + "/User");
        const newData = await response.json();

        const usersWithIds = newData.map((user, index) => ({
          ...user,
          id: index + 1,
        }));
        setUser(usersWithIds);

        Swal.fire("Deleted!", "Your file has been deleted.", "success");

        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
    }
  };

  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  return (
    <>
      <PageHeader
        title="CS USER"
        subTitle="Computer Science and Information KMUTNB"
        icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
      />
      <Paper className={classes.pageContent}>
        <Toolbar>
          <Controls.Input
            label="Search Users"
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={handleSearch}
          />
          <Controls.Button
            text="Add New"
            variant="outlined"
            startIcon={<AddIcon />}
            className={classes.newButton}
            onClick={() => {
              setOpenPopup(true);
              setRecordForEdit(null);
            }}
          />
        </Toolbar>
        <TblContainer>
          <TblHead />
          <TableBody>
            {recordsAfterPagingAndSorting().map((item) => (
              // console.log('Item:', item),
              // console.log('../../../../img_test/',item.CSID),
              <TableRow key={item.CSID}>
                <TableCell> </TableCell>
                <TableCell>{item.CSName}</TableCell>
                <TableCell>{item.Role}</TableCell>
                <TableCell>
                  {/* <img
                    src={`${item.CSImg}`}
                    alt="User Image"
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  /> */}

                  <img
                    // src={`./../../../img_test/${item.CSID}.jpg`
                    src={`${item.img_64}`}
                    alt="User Image"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    color="error"
                    style={{ color: "red", borderColor: "red" }}
                    onClick={() => handleDelete(item.CSID)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TblContainer>
        <TblPagination />
      </Paper>
      <Popup
        title="Add New User"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <UserForm recordForEdit={recordForEdit} />
      </Popup>
    </>
  );
}
