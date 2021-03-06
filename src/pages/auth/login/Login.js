import React, { Component } from 'react';
import Input from '../../../components/formInput/FormInput';
import Button from '../../../components/button/Button';
import './Login.css';
import { validator} from '../../../utilities/validators';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import ErrorHandler from '../../../components/errorHandler/ErrorHandler';

import {timeStampGenerator } from '../../../utilities/timeStampGenerator';
import openSocket from 'socket.io-client';
import { withRouter } from 'react-router-dom'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'


const messages = defineMessages({
    password: {
        id: "password",
        defaultMessage: "password"
    }
})

 class Login extends Component {

    state= {
        loginForm: {
            email: {
                value: ''
            },

            password:{
                value: ''
            }
        },

        error: null,
    }

    inputChangeHandler = (input, value) => {
        this.setState( prevState => {
            const updatedForm = {
                ...prevState.loginForm,
                [input]: {
                    ...prevState.loginForm[input],
                    value: value
                }
            }
            return {
                loginForm: updatedForm
            }
        })
    }

    loginHandler = (e, loginFormData) => {
        e.preventDefault();
        this.props.setLoadingToTrue();
        if(loginFormData){
            const errors = validator(
                loginFormData.email,
                loginFormData.password
            )
            if(errors.length > 0){
                this.setState({ error: errors})
                this.props.setLoadingToFalse()
                this.props.setErrors()

                return 
            }
        }
        let timeStamp = timeStampGenerator();
        fetch('https://africauto.herokuapp.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginFormData.email.value,
                password: loginFormData.password.value,
                timeStamp: timeStamp
            })
        })
        .then( res => {
            if(res.status === 422){
                throw new Error('validation failed')
            }
            
            if(res.status === 401){
                throw new Error('Wrong email or password')
            }

            if(res.status !== 200 && res.status !== 201){
                throw new Error('Could not authenticate you')
            }
            return res.json()
        })
        .then( resData => {
            let socket = openSocket('https://africauto.herokuapp.com', {query: `data=${resData.userId} ${resData.connectionId}`});
            socket.connect()
                this.props.loginSucceeded(resData);
                localStorage.setItem('woto-token', resData.token);
                localStorage.setItem('woto-userId', resData.userId);
                localStorage.setItem('woto-userName', resData.userName);
                const remainingMilliSeconds = 24 * 60 * 60 * 1000 //24hours
                const expiryDate = new Date( new Date().getTime() + remainingMilliSeconds )

                localStorage.setItem('woto-expiryDate', expiryDate.toISOString());

                this.props.setLoadingToFalse()
                this.props.history.push('/my-account/messages')

        })
        .catch( err => {
            let error = []
            error.push(err.message)
            this.setState({ error: error})
            this.props.loginFailed()
            this.props.setLoadingToFalse()
            this.props.setErrors()
        })


    }

    closeErrorHandler = () => {
        this.setState({ error: null});
        this.props.resetErrors()
    }

    


    render() {
        const {formatMessage } = this.props.intl

        let form;

        if(this.state.error) {
            form = <ErrorHandler error = {this.state.error}
                    onCloseError={this.closeErrorHandler}/>
        }
         else {
             form = (
                <form className= 'auth__form auth__form--login' 
                       onSubmit={e => this.loginHandler(e, this.state.loginForm)}
                       noValidate
                       autoComplete="off">
                    <ul className="auth__input__list">

                                <Input  type='email'
                                    control='input'
                                    label='email'
                                    id='email'
                                    value={this.state.loginForm['email'].value}
                                    onChange={this.inputChangeHandler}
                                    placeholder='email'
                                    border
                                    required={true}
                                    autoComplete = 'new-password'/>

                            <Input  type='password'
                                    control='input'
                                    label='mot de passe'
                                    id='password'
                                    value={this.state.loginForm['password'].value}
                                    onChange={this.inputChangeHandler}
                                    placeholder={formatMessage(messages.password)}
                                    border
                                    required={true}
                                    autoComplete = 'new-password'/>
                    </ul>

                    <div className='login__options'>
                        <div className="login__options--1" >
                            <FormattedMessage id="forgotPassword" defaultMessage="Forgot your password"/>
                        </div>
                        <div className="login__options--1">
                            <FormattedMessage id="notAMemberYet" defaultMessage="Not a member yet"/> ?
                        </div>
                    </div>

                    <div className="auth__button">
                        <Button color='primary' type='submit'>
                            <FormattedMessage id="login" defaultMessage="login"/>
                        </Button>
                    </div>
                
            </form>
             )
         }
        return form
    }
}


const mapDispatchToProps = dispatch => {
    return {
        loginSucceeded: (data) => dispatch(actions.loginSucceeded(data)),
        loginFailed: () => dispatch(actions.loginFailed())
    }
}

export default connect(null, mapDispatchToProps)(withRouter(injectIntl(Login)));
