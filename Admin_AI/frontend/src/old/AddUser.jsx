import React, { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';
import Nav from '../Nav';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Swal from 'sweetalert2';
import './../css/AddUser.css'


export default function DataGridDemo() {
    const [user, setUser] = useState([]);
    // const AdForm = () => {
    //     const [adData, setAdData] = useState({
    //         CSName: '',
    //         Role: '',
    //         CSpath: '',
    //     });

    // const handleOnSubmit  = async (e) => {
    //     e.preventDefault();
    //     try {
    //         await axios.post('http://localhost:8081/AddUser', addUser);
    //         console.log('Ad created successfully');
    //         
    //     } catch (error) {
    //         console.error('Error creating ad:', error);
    //     }
    //     };

    useEffect(() => {
        fetch('http://localhost:8081/User')
            .then((response) => response.json())
            .then((data) => {
                
                const usersWithIds = data.map((user, index) => ({ ...user, id: index + 1 }));
                setUser(usersWithIds);
            })
            .catch((error) => console.log('Error: ', error));
    }, []);

    const handleDelete = async (userId) => {
        try {
            const confirm = await Swal.fire({
                title: 'Are you sure?',
                text: 'You won\'t be able to revert this!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });
    
            if (confirm.isConfirmed) {
                await axios.delete(`http://localhost:8081/deleteUser/${userId}`);
                const response = await fetch('http://localhost:8081/User');
                const newData = await response.json();
                
                const usersWithIds = newData.map((user, index) => ({ ...user, id: index + 1 }));
                setUser(usersWithIds);
    
                Swal.fire(
                    'Deleted!',
                    'Your file has been deleted.',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            });
        }
    };

    const columns = [
        { name: 'id', label: 'ID' },
        { name: 'CSName', label: 'Name' },
        { name: 'Role', label: 'Role' },
        { name: 'IMAGE', label: 'IMAGE' },
        {
            name: 'Delete',
            options: {
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            color="error"
                            onClick={() => handleDelete(tableMeta.rowData[0])}
                        >
                            Delete
                        </Button>
                    );
                }
            }
        },
    ];

    const options = {
        selectableRows: 'none',
        // responsive: "scroll",
        elevation: 0,
        rowsPerPage: 4,
        rowsPerPageOptions: [2, 4, 5],
        print: false,
        viewColumns: false,
        download: false,
        filter: false,
      };

    
    

    return (
        <section className="flex gap-6">
            <Nav />
            
            <div className="Add m-4 text-xl text-gray-900 font-semibold">
                <div className='center'>
                    <Button variant="contained" color="success" >
                        ADD USER
                    </Button>
                    <div className="muidtb-container">
                        <MUIDataTable
                            title={"User List"}
                            data={user}
                            columns={columns}
                            options={options}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

