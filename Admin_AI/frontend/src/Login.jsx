import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser} from '@fortawesome/free-solid-svg-icons'


function Login() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigateTo = useNavigate()

    function handleSubmit(event){
        event.preventDefault();
        axios.post('http://localhost:8081/Login', {username, password})

       
        .then(res => {
            if(res.data === "Login success"){
                navigateTo('/Dashboard') 
                console.log("Yes")
            }else{
                console.log("NO RECORD")
            }
        })
        .catch(err => console.log(err))
    }
    return (  
        <div className='d-flex vh-100 justify-content-center align-items-center bg-gradient' style={{background: "#470a68"}}>
            {/* <div className='p-5 bg-white w-25'> */}
            <div className='p-5 w-25 bg-white bg-slate-800 border border-slate-400 rounded p-8 shadow-lg backdrop-filter backdrop-blur-sm bg-opacity-30 relative'>
                <form onSubmit={handleSubmit}>
                
                <div className='mb-4 fw-bolder fs-1 text-center'>
                    <FontAwesomeIcon icon={faCircleUser}  style={{color: "#5f4b8b", fontSize: "6rem"}}/>
                    
                    <p>Login</p>
                </div>
                    <div className='mb-3'>
                        <label htmlFor='username'>Username</label>
                        <input type='text' placeholder='Enter Username' className='form-control' onChange={e => setUsername(e.target.value)}/>
                    </div>

                    <div className='mb-3'>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder='Enter Password' className='form-control'onChange={e => setPassword(e.target.value)}/>
                    </div>

                    <button className='btn btn-success'>Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;