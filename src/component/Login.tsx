import React from 'react';
import {FormComponentProps} from "antd/lib/form/Form";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import {RouteComponentProps, Route, Link, BrowserRouter} from 'react-router-dom';
const FormItem = Form.Item;

interface LoginOwnProps extends FormComponentProps{}

interface LoginOwnState{}

class Login extends React.Component<LoginOwnProps, LoginOwnState>{
    constructor(props: LoginOwnProps){
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleSubmit(){
        console.log("hello")
    }
    render(){
        return(
            <Form style={{margin: "100px auto",width: 300}}>
                <FormItem>
                    <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />
                </FormItem>
                <FormItem>
                    <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />
                </FormItem>
                <FormItem>
                    <a style={{float: "right"}} href="">Forgot password</a>
                    <Button onClick={this.handleSubmit} type="primary" htmlType="submit" style={{width: "100%"}}>
                        <Link to={{pathname: "/home"}}>
                            <span>Login in</span>
                        </Link>
                    </Button>
                    Or <a href="">register now!</a>
                </FormItem>
            </Form>
        );
    }
}
const LoginForm = Form.create()(Login);
export default LoginForm;