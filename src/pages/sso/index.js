import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from "react-router-dom";
import {V2BackUrl} from "constants/global";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";

// Redeems a short-lived token minted by management-v2's /auth/gennis-sso
// (office.gennis.uz's "Gennis web site change" link) — the token is
// already a valid gennis-v2 access token on arrival (shared SECRET_KEY),
// so this just needs to store it the same way a normal /login does and
// confirm it works before handing off to /platform.
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

        fetch(`${V2BackUrl}auth/me`, {
            headers: {"Authorization": "Bearer " + token}
        })
            .then(async res => {
                if (!res.ok) throw new Error("invalid_token")
                const user = await res.json()
                sessionStorage.setItem("v2_access_token", token)
                sessionStorage.setItem("v2_user", JSON.stringify(user))
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
