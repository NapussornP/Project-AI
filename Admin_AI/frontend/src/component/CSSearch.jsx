import React, { useState, useEffect } from "react";
import Controls from "./controls/Controls";
import { Search } from "@material-ui/icons";
import useTable from "./UseTable";
import Popup from "./Popup";
import axios from 'axios';
import {
  Paper,
  makeStyles,
  TableBody,
  TableRow,
  TableCell,
  Toolbar,
  InputAdornment,
} from "@material-ui/core";
import PageHeader from './UserPageHeader'
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from "@material-ui/icons/Add";
import UserForm from './UserForm'
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

const useStyles = makeStyles((theme) => ({
  pageContent: {
    padding: theme.spacing(3),
    height: 'auto'
  },
  searchInput: {
    width: "75%",
    marginTop: '2px'
  },
  newButton: {
    position: "absolute",
    right: "10px",
  },
}));

const headCells = [
    { id : 'Date_time', label: 'Date'},
    { id : 'Time', label: 'Time'},
    { id: 'UserName', label: 'Name' },
    { id: 'CSGender', label: 'Gender' },
    { id: 'EmotionName', label: 'Emotion' },
    { id: 'S_Pic', label: 'Image' },
    { id: 'L_Pic', label: 'Image'}
];

export default function Users() {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } = useTable(records, headCells, filterFn);
  const [user, setUser] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8081/Search').then(response => {
      setRecords(response.data);
    }).catch(error => console.log(error));
  }, []);

  const handleSearch = (e) => {
    let target = e.target.value.toLowerCase();
    setFilterFn({
      fn: (items) => {
        if (target === "") return items;
        else return items.filter(x => x.UserName.toLowerCase().includes(target));
      }
    });
  };

  

  const [openPopup, setOpenPopup] = useState(false);
  const [recordForEdit, setRecordForEdit] = useState(null);

  return (
    <>
      <PageHeader
        title="Search History"
        subTitle="Computer Science and Information KMUTNB"
        icon={<SearchIcon fontSize="large" />}
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
        <TblContainer style={{ maxHeight: '600px' }}>
            
          <TblHead />
          
          <TableBody>
            {recordsAfterPagingAndSorting().map((item) => (
                console.log('Item:', item),
              <TableRow key={item.Date_time}>
                <TableCell>{new Date(item.Date_time).toLocaleDateString("en-GB")}</TableCell>
                <TableCell>{ new Date(item.Date_time).toLocaleTimeString("en-GB")}</TableCell>
                <TableCell>{item.UserName}</TableCell>
                <TableCell>{item.CSGender}</TableCell>
                <TableCell>{item.EmotionName}</TableCell>
                <TableCell>
                <img
                    src={`${item.S_Pic}`}
                    alt="User Image"
                    style={{ width: '100px', height: 'auto'}}
                  />
                </TableCell>
                <TableCell>
                <img
                    src={`${item.L_Pic}`}
                    alt="User Image"
                    style={{ width: '100px', height: 'auto'}}
                  />
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
            <UserForm recordForEdit={recordForEdit}  />
      </Popup>
    </>
  );
}
