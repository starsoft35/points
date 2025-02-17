import { take, call, put, apply, all, select } from 'redux-saga/effects';
import { JwtResponse, UserDto, ApiError, UserCheckinsDto } from '@points/shared';
import jwt_decode from 'jwt-decode';
import { some, isEmpty } from 'lodash';

import { userService } from '../services';
import { checkinService } from '../../checkin/services';
import { IAuthState, ICurrentUser, IUserRegister } from '../reducers';
import { persistentStorage } from '../../core/async-storage';
import NavigationService from '../../navigation/services/navigation-service';
import { currentUserSelector } from '../../store/selectors/current-user.selector';
import { loadNavigation } from '../../navigation/sagas';

import * as loginActions from '../actions/login';
import * as registerActions from '../actions/register';
import * as userDataActions from '../actions/userData';

export function* registerUser(userRegister: IUserRegister): any {

    // TODO make id nullable in UserDto
    // @ts-ignore
    const response = yield apply(userService, 'create', [userRegister as UserDto]);

    if (response.accessToken && !response.errors) {

        const user = storeUserInfo({
            userName: userRegister.userName,
            firstName: userRegister.firstName,
            isAdmin: false,
            password: '',
            rememberMe: false
        } as ICurrentUser, response);

        yield put({ type: loginActions.UserLoginSuccess, payload: { currentUser: user } });
    }

    if (response.errors) {
        yield put({ type: loginActions.UserLoginFailure });
    }
}

export function* authorize(currentUser: ICurrentUser): any {

    // TODO make id nullable in UserDto
    // @ts-ignore
    const response: JwtResponse & ApiError = yield apply(userService, 'login', [currentUser as UserDto]);

    if (response.accessToken && !response.errors) {
        currentUser = storeUserInfo(currentUser, response);
        yield put({ type: loginActions.UserLoginSuccess, payload: { currentUser } });
    }

    if (response.errors) {
        yield put({ type: loginActions.UserLoginFailure });
    }
}

export function* getUserData() {
    const user: ICurrentUser = yield select((state: any) => currentUserSelector(state.authReducer));

    const userData: UserCheckinsDto & ApiError =
        yield apply(checkinService, 'getForUser', [{ userId: user.userId! }]);

    if (userData && !userData.errors) {
        yield put({ type: userDataActions.UserDataSuccess, payload: { userData } });
        return userData;
    }

    if (userData.errors) {
        yield put({ type: userDataActions.UserDataFailure });
    }

}

function storeUserInfo(currentUser: ICurrentUser, response: JwtResponse): ICurrentUser {
    persistentStorage.set('jwt', response.accessToken);

    if (currentUser.rememberMe) {
        persistentStorage.set('user', JSON.stringify(currentUser));
    } else {
        persistentStorage.delete('user');
    }

    const userInfo = jwt_decode<{ id: string, roles: string[] }>(response.accessToken);
    currentUser.userId = userInfo.id;
    currentUser.isAdmin = userInfo.roles.some(role => role === "admin");

    // TODO should we nuke the password here? or keep for relogging in?
    // TODO keep password but utilize native encrypting methods
    return currentUser;
}

function* getAllUsers(): any {

    const user: ICurrentUser = yield select((state: any) => currentUserSelector(state.authReducer));

    const allUsers: UserDto[] & ApiError = yield apply(userService, 'getAll');

    if(!user.isAdmin){
        return yield [{}];
    }
    
    if (allUsers && !allUsers.errors) {
        yield put({ type: userDataActions.GetAllUsersSuccess, payload: { users: allUsers } });
        return allUsers;
    }

    if (allUsers.errors) {
        yield put({ type: userDataActions.GetAllUsersFailure });
    }
}

export function* login() {

    while (true) {
        // TODO apply this paradigm to all sagas ie. `{ payload: IAuthState }`
        const request: { payload: IAuthState } = yield take(loginActions.UserLoginRequest);

        yield call(authorize, {
            userName: request.payload.currentUser!.userName,
            password: request.payload.currentUser!.password,
            rememberMe: request.payload.currentUser!.rememberMe
        });

    }
}

export function* loginSuccess() {

    while (true) {
        yield take(loginActions.UserLoginSuccess);
        yield put({ type: userDataActions.UserDataRequest });
    }
}

export function* userDataRequest() {

    while (true) {
        yield take(userDataActions.UserDataRequest);

        var userDataCalls = [
            call(getUserData),
            call(loadNavigation),
            call(getAllUsers)
        ];

        const response = yield all(userDataCalls);
        debugger;
        if (!some(response, isEmpty)) {
            NavigationService.navigate('AchievementList');
        }
    }
}

export function* userRegisterRequest() {

    while (true) {
        const request: { payload: IAuthState } = yield take(registerActions.RegisterRequest);
        yield call(registerUser, request.payload.userRegister!);
    }
}
