import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { LoginState } from '../reducers';
import Login from '../components';

import * as userActions from '../actions'
import { store } from '../../store';


export interface LoginProps {
    login?: (loginState: LoginState) => void
}

export function mapStateToProps(loginState: LoginState) {
    return loginState
}

export function mapDispatchToProps(dispatch: Dispatch<userActions.UserAction>) {
    return {
        login: (loginState: LoginState) => {
            
            dispatch({ type: userActions.UserLoginRequest, payload: loginState })
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Login);