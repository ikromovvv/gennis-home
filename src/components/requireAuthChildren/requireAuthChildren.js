import React from 'react';
import {V2_WEBSITE_ADMIN_ROLES} from "constants/global";

// Gates inline "edit on the live page" affordances (pencil icons) shown to
// a logged-in website-content admin. Sourced from the v2 session (not the
// old ROLES/meSlice system, which nothing here logs into anymore) — see
// requireAuth.js for the same v2_user sessionStorage shape.
const RequireAuthChildren = ({children}) => {

    let roles = []
    try {
        const user = JSON.parse(sessionStorage.getItem("v2_user") || "null")
        if (user) roles = [user.role, ...(user.roles || [])]
    } catch (e) {}

    return roles.some(r => V2_WEBSITE_ADMIN_ROLES.includes(r))
        ? children
        : null;

}



export default RequireAuthChildren
