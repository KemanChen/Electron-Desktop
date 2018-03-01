import {ADD_COUNT} from "./constants";
import {createAction} from 'redux-actions';

export const addCount = createAction<number>(ADD_COUNT);