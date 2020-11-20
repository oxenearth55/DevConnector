import axios from 'axios'; 
import { setAlert } from './alert'; 
import { GET_POSTS, POST_ERROR, UPDATE_LIKES, DELETE_POST, ADD_POST} from './types';

// SECTION Get Posts 

export const getPosts = () => async  dispatch => {
    try{
        const res = await axios.get('/api/posts');

        dispatch({
            type: GET_POSTS,
            payload: res.data
        })

    }catch (err) {
        dispatch({
          type: POST_ERROR,
          payload: { msg: err.response.statusText, status: err.response.status }
        });
    }    
}

// SECTION Add like 
//NOTE id stands for whcih post that we are going to like 
export const addLike = id => async  dispatch => {
    try{
        const res = await axios.put(`/api/posts/like/${id}`);

        dispatch({
            type: UPDATE_LIKES,
            //NOTE Get array that contains user ID from the back-end
            payload: { id, likes: res.data}
        })

    }catch(err){
        dispatch({
            type: POST_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
}

// SECTION Get Posts 
export const removeLike = id => async  dispatch => {
    try{
        const res = await axios.put(`/api/posts/unlike/${id}`);

        dispatch({
            type: UPDATE_LIKES,
            payload: {id, likes: res.data}
        })

    }catch(err){
        dispatch({
            type: POST_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
}


// SECTION Delete Posts 
export const deletePost = id => async  dispatch => {
    try{
        const res = await axios.delete(`/api/posts/${id}`);

        dispatch({
            type: DELETE_POST,
            payload: id
        })

        dispatch(setAlert('Post Removed', 'success'));

    }catch(err){
        dispatch({
            type: POST_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
}

// SECTION Add Posts 
export const addPost = formData => async  dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    try{
        const res = await axios.post('/api/posts', formData, config);

        dispatch({
            type: ADD_POST,
            payload: res.data
        })

        dispatch(setAlert('Post Added', 'success'));

    }catch(err){
        dispatch({
            type: POST_ERROR, 
            payload: {msg: err.response.statusText, status: err.response.status}
        });   
    }
}

