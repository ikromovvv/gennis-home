import React, { useState } from 'react';

import "./login.sass"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";

import Logo from "assets/logo/Gennis logo.png"

import Message from "components/platform/platformMessage";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";
import { V2BackUrl } from "constants/global";
import { setMessage } from "slices/messageSlice";
import Input from "components/platform/platformUI/input";


const Login = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState('')

    const [activeError, setActiveError] = useState(false)
    const [postDataStatus, setPostDataStatus] = useState("")

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const onSubmit = (e) => {
        e.preventDefault()

        setPostDataStatus("loading")
        fetch(`${V2BackUrl}auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
            .then(async res => {
                const data = await res.json().catch(() => null)
                if (!res.ok || !data?.access_token) {
                    throw new Error("invalid_credentials")
                }
                return data
            })
            .then(data => {
                sessionStorage.setItem("v2_access_token", data.access_token)
                sessionStorage.setItem("v2_refresh_token", data.refresh_token)
                sessionStorage.setItem("v2_user", JSON.stringify(data.user))
                setPostDataStatus("")
                navigate("/platform")
            })
            .catch(() => {
                setPostDataStatus("")
                setActiveError(true)
                dispatch(setMessage({
                    msg: "Parol yoki Username hato berilgan",
                    type: "error",
                    active: true
                }))
            })
    }

    const renderForm = () => {
        if (postDataStatus === "loading") {
            return (
                <DefaultLoader />
            )
        } else {
            return (
                <>
                    <h1 className="title">Login Admin</h1>
                    <Input
                        name={"username"}
                        title={"Username"}
                        type={"text"}
                        required
                        clazz={activeError ? "input-fields-error" : null}
                        onChange={(e) => {
                            setUsername(e)
                            setActiveError(false)
                        }}
                    />
                    <Input
                        name={"password"}
                        title={"Password"}
                        type={"password"}
                        required
                        clazz={activeError ? "input-fields-error" : null}
                        onChange={(e) => {
                            setPassword(e)
                            setActiveError(false)
                        }}
                    />
                    <input type="submit" className="input-submit" value="Submit" />

                    <div className="link__register">
                        Agar accountingiz mavjud bolmasa:
                        <span>
                            <Link to="/register">
                                Register
                            </Link>
                        </span>
                    </div>
                </>
            )
        }
    }

    return (
        <div className="login">

            <Link to="/">
                <img className="login__logo" src={Logo} alt="Logo" />
            </Link>

            <form action="" onSubmit={onSubmit}>
                {renderForm()}
            </form>
            <Message />
        </div>
    );
};

export default Login;
