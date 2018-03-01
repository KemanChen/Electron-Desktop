import 'react-hot-loader/patch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import { createBrowserHistory} from 'history';
import { AppContainer } from 'react-hot-loader';
import Es6Promise from 'es6-promise';
import LoginForm from "./component/Login";
import Home from "./component/Home";
import RootRoute from "./Containers/RootRoute";
import createReducer from "./reducer";

Es6Promise.polyfill();

const history = createBrowserHistory({basename: "/"});

const composeEnhancer: typeof compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    createReducer(undefined),
    composeEnhancer(
        applyMiddleware(
            routerMiddleware(history),
        )
    )
)

ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <RootRoute history={history}/>
        </Provider>
    </AppContainer>,
    document.getElementById("rootElement")
)