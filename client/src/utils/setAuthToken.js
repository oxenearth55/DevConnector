import axios from 'axios';

const setAuthToken = token => {
    if( token ) {
        //NOTE set global header 
        //NOTE when we have a token and we want to to send it with every request 
        // instead of picking and choosing which request to send it
        axios.defaults.headers.common['x-auth-token'] = token;
    }else{
        delete  axios.defaults.headers.common['x-auth-token'];
    }
}
export default setAuthToken;