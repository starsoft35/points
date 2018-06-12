import * as userActions from '../actions';
import { AsyncStorage } from 'react-native';
import { BaseState } from '../../store/index.reducer';

export interface LoginState {
  userName: string;
  password: string;
}

export const initialState: BaseState<LoginState> = {
  condition: {
    userName: '',
    password: ''
  },
  processing: false
}

export const reducer = (state = initialState, action: userActions.UserAction): BaseState<LoginState> => {
  
  switch (action.type) {

    case userActions.UserLoginRequest:
      
      return {
        ...state,
        processing: true,
        message: 'Logging in ' + action.payload!.userName
      }

    case userActions.UserLoginSuccess:
      
      return {
        ...state,
        processing: false,
        error: null,
        message: 'Logged in ' + action.payload!.userName
      }

    case userActions.UserLoginFailure:
      debugger;
      return {
        ...state,
        processing: false,
        error: state.error,
        message: 'Error logging in ' + action.payload!.userName
      }

    default:
      return state
  }
}

export default reducer;

export const isProcessing = (state: BaseState<LoginState>) => state.processing;