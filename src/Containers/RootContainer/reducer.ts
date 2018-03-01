import {createAction, handleActions, Action} from 'redux-actions';
import {ADD_COUNT} from "./constants";

const counterReducer = handleActions({
    [ADD_COUNT]: (state, action: Action<any>) => {
        return Object.assign({},state,{
            count: state.count++
        })
    }
},{
    count: 0
});

export default counterReducer