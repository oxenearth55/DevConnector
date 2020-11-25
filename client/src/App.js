import React, {Fragment ,useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'; 
import setAuthToken from './utils/setAuthToken';

//NOTE Redux
import {Provider} from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';

//NOTE Component
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Routes from './components/routing/Routes';


import './App.css';


//NOTE check localStorage that there is any token there?
if(localStorage.token){
    setAuthToken(localStorage.token)
}

const App = () =>  {

  useEffect( () => {
    store.dispatch(loadUser());
  },[]);


  return(
  <Provider store = {store}>
    <Router>
    <Fragment>
      <Navbar/>
      <Switch>
        <Route exact path='/' component={Landing}/>
        <Route component={Routes}/>
      </Switch>
      
       
    </Fragment>
  </Router>
   </Provider>
  

)};

export default App;
