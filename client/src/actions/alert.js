import { SET_ALERT, REMOVE_ALERT } from './types';
import { v4 as uuidv4 } from 'uuid';

export const setAlert = (msg, alertType, timeout = 5000 ) => dispatch => {
    const id = uuidv4();; //NOTE used to Random ID as long string 
    dispatch({
        type: SET_ALERT, 
        payload: { msg, alertType, id}
    });   
    //NOTE after 5 sec, it will dispatch this type 
    setTimeout( () => dispatch({ type: REMOVE_ALERT, payload: id}), timeout); //NOTE 5000 = 5 sec
}