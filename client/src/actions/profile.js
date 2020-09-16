import axios from 'axios'; 
import { setAlert } from './alert';
import {
    GET_PROFILE, 
    PROFILE_ERROR
} from './types';

//NOTE get current user profile 

export const getCurrentProfile = () => async dispatch => {

    try {
        const res = await axios.get('/api/profile/me'); 

        dispatch({
            type: GET_PROFILE, 
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
};

//ANCHOR Create or update profile 
//NOTE history object which has a method called push that will redirect to client side route
//NOTE edit stand for checking that the user want to create or update the profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        //NOTE send data as an object to the backend to crate user profile 
        const res = await axios.post('/api/profile', formData, config);
        //NOTE keep data that was returned from the backend in redux (global storage)
        dispatch({
            type: GET_PROFILE, 
            payload: res.data
        });

        dispatch(setAlert(edit ? 'Profile updated' : 'Profile Created', 'success'));

        //NOTE if create profile then redirect the user to dashboard page 
        if(!edit) {
            history.push('/dashboard'); //NOTE use history.push instead of redirect because this is not react
        }
        
    } catch (err) {

        const errors =err.response.data.errors;
        if(errors){
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger'))); //NOTE errors are array from validator at the backend
        }

        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });          
    }
}