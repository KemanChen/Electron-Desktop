import React from "react";
import {Redirect} from 'react-router-dom';
import LoginForm from "./component/Login";

export default function createRootRoutes() {
    return[
        {
            key: "root",
            path: "/",
            render: ()=>{
                <Redirect to="/login" />
            },
            exact: true
        },
        {
            key: "login",
            path: "/login",
            component: LoginForm
        },
        {
            key: "nav",
            path: "/home",
            component: LoginForm
        }
    ]
}