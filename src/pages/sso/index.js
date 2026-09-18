import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import {V2BackUrl} from "constants/global";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";

// Redeems a short-lived bridge token minted by management-v2's
// /auth/gennis-sso (office.gennis.uz's "Gennis web site change" link),
// signed with a dedicated SSO_SHARED_SECRET rather than either system's
// real session-signing key. It's not a valid gennis-v2 access token by
// itself, so it's exchanged here for a real one via gennis-v2's
// /auth/sso-exchange, then stored exactly like a normal /login response.
const Sso = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [error, setError] = useState(false)

    useEffect(() => {
        const token = searchParams.get("token")
        if (!token) {
            setError(true)
            return
        }

        fetch(`${V2BackUrl}auth/sso-exchange`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({token})
        })
            .then(async res => {
                const data = await res.json().catch(() => null)
                if (!res.ok || !data?.access_token) throw new Error("invalid_token")
                sessionStorage.setItem("v2_access_token", data.access_token)
                sessionStorage.setItem("v2_refresh_token", data.refresh_token)
                sessionStorage.setItem("v2_user", JSON.stringify(data.user))
                navigate("/platform", {replace: true})
            })
            .catch(() => setError(true))
    }, [])

    const style = {
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        justifyContent: "center",
        alignItems: "center"
    }

    if (error) {
        return (
            <div style={style}>
                <p style={{fontSize: "1.8rem"}}>Kirish havolasi yaroqsiz yoki muddati o'tgan.</p>
                <a href="/login" style={{fontSize: "1.6rem", color: "#0098DA"}}>Login sahifasiga o'tish</a>
            </div>
        )
    }

    return (
        <div style={style}>
            <DefaultLoader/>
        </div>
    )
}

export default Sso
