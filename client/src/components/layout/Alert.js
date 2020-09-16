import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';


const Alert = ({alerts}) => 
alerts !== null && alerts.length > 0 && alerts.map(alert => (
    <div key = {alert.id} className = {`alert alert-${alert.alertType}`}>
        {alert.msg}
    </div>
));

Alert.propTypes = {
    alerts: PropTypes.array.isRequired
}
//NOTE maping (get) state redux to prop in this component (array of alert from store redux)
const mapStateToProps = state => ({
    alerts: state.alert //NOTE get state from alert (reducer)
});


export default connect(mapStateToProps)(Alert);