import axios from 'axios'; 
import { setAlert } from './alert';
import {
    GET_PROFILE,
    GET_PROFILES, 
    PROFILE_ERROR,
    UPDATE_PROFILE,
    ACCOUNT_DELETE,
    CLEAR_PROFILE,
    GET_REPOS
} from './types';

//ANCHOR get current user profile 

export const getCurrentProfile = () => async dispatch => {

    try {
        const res = await axios.get('/api/profile/me'); 

        dispatch({
            type: GET_PROFILE, 
            payload: res.data
        });
    } catch (err) {
        dispatch({ type: CLEAR_PROFILE });
        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
};

//ANCHOR get current user profile 

export const getProfiles = () => async dispatch => {
    dispatch({ type: CLEAR_PROFILE});

    try {
        const res = await axios.get('/api/profile'); 

        dispatch({
            type: GET_PROFILES, 
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
};

//ANCHOR Get Profile by ID 
export const getProfileById = userId => async dispatch => {

    try {
        const res = await axios.get(`/api/profile/user/${userId}`); 

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

//ANCHOR Get Github repos
export const getGithubRepos = username => async dispatch => {

    try {
        const res = await axios.get(`/api/profile/github/${username}`); 

        dispatch({
            type: GET_REPOS, 
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

//NOTE Add Experience 
export const addExperience = (formData, history) => async dispatch => {

    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        //NOTE send data as an object to the backend to crate user profile 
        const res = await axios.put('/api/profile/experience', formData, config);
        //NOTE keep data that was returned from the backend in redux (global storage)
        dispatch({
            type: UPDATE_PROFILE, 
            payload: res.data
        });

        dispatch(setAlert('Experience Added', 'success'));    
        history.push('/dashboard'); //NOTE use history.push instead of redirect because this is not react
        
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

//NOTE Add Education 
export const addEducation = (formData, history) => async dispatch => {

    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        //NOTE send data as an object to the backend to crate user profile 
        const res = await axios.put('/api/profile/education', formData, config);
        //NOTE keep data that was returned from the backend in redux (global storage)
        dispatch({
            type: UPDATE_PROFILE, 
            payload: res.data
        });

        dispatch(setAlert('Education Added', 'success'));
        history.push('/dashboard'); //NOTE use history.push instead of redirect because this is not react
        
        
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

//ANCHOR Delete Experience 

export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });

        dispatch(setAlert('Experience Removed', 'success'));

    } catch (err) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });          
    }
}


//ANCHOR Delete Education 

export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });

        dispatch(setAlert('Education Removed', 'success'));

    } catch (err) {
        dispatch({
            type: PROFILE_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });          
    }
}

//NOTE Delete account & profile 

export const deleteAccount = () => async dispatch => {
    if(window.confirm('Are you sure? This can NOT be undone?')){

        try {
            await axios.delete(`/api/profile`);
    
            dispatch({ type: CLEAR_PROFILE });
            dispatch({ type: ACCOUNT_DELETE})
    
            dispatch(setAlert('Your account has been perminantly deleted'));
    
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR, 
                payload: {msg: err.response.statusText, status: err.response.status}
            });          
        }


    }

    
}
