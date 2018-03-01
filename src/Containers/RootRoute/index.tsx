// {/*<ConnectedRouter history={this.props.history}>*/}
// {/*<Switch>*/}
// {/*<Route path="/" component={LoginForm} exact={true}/>*/}
// {/*<Route path="/home" component={Home} />*/}
// {/*</Switch>*/}
// {/*</ConnectedRouter>*/}
import React from 'react';
import { createBrowserHistory} from 'history';
import {Switch} from 'react-router';
import {Button} from "antd";
import {RouteComponentProps, Route, Link} from 'react-router-dom';
import {ConnectedRouter} from 'react-router-redux';
import createRootRoutes from "../../routes";
import LoginForm from "../../component/Login";
import Home from "../../component/Home";

interface RootRouteOwnProps {
    history?: any
}

interface RootRouteOwnState {

}

export default class RootRoute extends React.Component<RootRouteOwnProps, RootRouteOwnState>{
    rootRoutes: Array<any>;
    constructor(props: RootRouteOwnProps){
        super(props);
        this.rootRoutes = createRootRoutes();
        this.state = {
            myHistory: createBrowserHistory({ basename: '/'})
        };
    }
    generateRoutes() {
        return this.rootRoutes.map((route, index) => {
            if (route.component != undefined) {
                if (route.exact) {
                    return <Route key={'rRoute_' + index} exact path={route.path} component={route.component}/>;
                } else {
                    return <Route key={'rRoute_' + index} path={route.path} component={route.component}/>;
                }
            } else if (route.render != undefined) {
                if (route.exact) {
                    return <Route key={'rRoute_' + index} exact path={route.path} render={route.render}/>;
                } else {
                    return <Route key={'rRoute_' + index} path={route.path} render={route.render}/>;
                }
            }
        });
    }
    render() {
        const routes = this.generateRoutes();
        let routeComponent = React.createElement(Switch, null, ...routes);
        return (
            <ConnectedRouter history={this.props.history}>
                <Home/>
            </ConnectedRouter>
        )
    }
}