import {combineReducers} from "redux";
import {routerReducer} from 'react-router-redux';
import counterReducer from './Containers/RootContainer/reducer';

export default function createReducer(asyncReducers: any) {
    return combineReducers({
        counterReducer: counterReducer
    });
}