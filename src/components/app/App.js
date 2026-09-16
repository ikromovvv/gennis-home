import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Website from "pages/webSite";
import Login from "pages/login/Login";
import Sso from "pages/sso";
import RequireAuth from "components/requireAuth/requireAuth";
import Platform from "components/platform/layout/Platform";
import PlatformWebsiteEdit from "pages/platformContent/platformWebsiteEdit/platformWebsiteEdit";
import { V2_WEBSITE_ADMIN_ROLES } from "constants/global";

import "./app.sass"

const App = () => {

    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/sso" element={<Sso/>}/>
            <Route element={<RequireAuth allowedRules={V2_WEBSITE_ADMIN_ROLES}/>}>
                <Route path="/platform" element={<Platform/>}>
                    <Route index element={<Navigate to="Advantages" replace/>}/>
                    <Route path="/platform/*" element={<PlatformWebsiteEdit/>}/>
                </Route>
            </Route>
            <Route path="/*" element={<Website/>} />
        </Routes>
    )
}

export default App
