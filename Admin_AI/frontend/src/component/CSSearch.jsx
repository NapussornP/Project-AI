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
import AddIcon from "@material-ui/icons/Add";
import UserForm from "./UserForm";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import "./../css/Search.css";

const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(3),
    width: "90%",
    height: "auto",
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
  // { id : 'SID', label: 'Id'},
  { id: "Date_time", label: "Date" },
  { id: "Time", label: "Time" },
  { id: "UserName", label: "Name" },
  { id: "CSGender", label: "Gender" },
  { id: "CSAge", label: "Age" },
  { id: "EmotionName", label: "Emotion" },
  { id: "S_Pic", label: "Image" },
  { id: "L_Pic", label: "Image" },
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
      .get("http://localhost:8081/Search")
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
          return items.filter((x) => x.UserName.toLowerCase().includes(target));
      },
    });
  };

  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  return (
    <>
      <PageHeader
        title="Search History"
        subTitle="Computer Science and Information KMUTNB"
        icon={<PersonSearchIcon fontSize="large" />}
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
          {/* <Controls.Button
            text="!!search img!!"
            variant="outlined"
            // startIcon={<AddIcon />}
            className={classes.newButton}
            // onClick={() => {
            //   setOpenPopup(true);
            //   setRecordForEdit(null);
            // }}
          /> */}
        </Toolbar>
        <TblContainer style={{ maxHeight: "600px" }}>
          <TblHead />

          <TableBody
            className="a"
            style={{
              width: "200px",
              maxWidth: `${!open ? "300px" : "none"}`, // ปรับตามที่คุณต้องการ
              // overflowY: `${!open ? 'auto' : 'visible'}` // ปรับตามที่คุณต้องการ
            }}
          >
            {recordsAfterPagingAndSorting().map(
              (item) => (
                console.log("Item:", item),
                (
                  <TableRow key={item.SID}>
                    <TableCell>
                      {new Date(item.Date_time).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell>
                      {new Date(item.Date_time).toLocaleTimeString("en-GB")}
                    </TableCell>
                    <TableCell>{item.UserName}</TableCell>
                    <TableCell>{item.CSGender}</TableCell>
                    <TableCell>{item.CSAge}</TableCell>
                    <TableCell>{item.EmotionName}</TableCell>
                    <TableCell>
                      <img
                        src={`${item.S_Pic}`}
                        alt="User Image"
                        style={{
                          width: "100px",
                          height: "auto",
                          borderRadius: "10px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={`${item.L_Pic}`}
                        alt="User Image"
                        style={{
                          width: "130px",
                          height: "auto",
                          borderRadius: "10px",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )
              )
            )}
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
