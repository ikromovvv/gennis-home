import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { V2BackUrl } from "constants/global";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";

const RequireAuth = ({ allowedRules }) => {

    const location = useLocation()
    const [status, setStatus] = useState("loading")

    useEffect(() => {
        const token = sessionStorage.getItem("v2_access_token")
        if (!token) {
            setStatus("error")
            return
        }
        fetch(`${V2BackUrl}auth/me`, {
            headers: { "Authorization": "Bearer " + token }
        })
            .then(async res => {
                if (!res.ok) throw new Error("unauthorized")
                const user = await res.json()
                sessionStorage.setItem("v2_user", JSON.stringify(user))
                const userRoles = [user.role, ...(user.roles || [])]
                if (userRoles.some(r => allowedRules.includes(r))) {
                    setStatus("success")
                } else {
                    setStatus("error")
                }
            })
            .catch(() => {
                sessionStorage.removeItem("v2_access_token")
                sessionStorage.removeItem("v2_refresh_token")
                sessionStorage.removeItem("v2_user")
                setStatus("error")
            })
    }, [])

    const style = {
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }

    if (status === "loading") {
        return (
            <div style={style}>
                <DefaultLoader />
            </div>
        )
    } else if (status === "success") {
        return <Outlet />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
}



export default RequireAuth
