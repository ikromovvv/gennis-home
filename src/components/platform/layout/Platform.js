import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import "./platform.sass"
import Logo from "assets/logo/Gennis logo.png"
import PlatformMessage from "components/platform/platformMessage";

const NAV_ITEMS = [
    { to: "Advantages", label: "Afzalliklar", icon: "fa-star" },
    { to: "Events", label: "Yangiliklar", icon: "fa-newspaper" },
    { to: "Gallery", label: "Galereya", icon: "fa-images" },
    { to: "Comments", label: "Sharhlar", icon: "fa-comments" },
]

const Platform = () => {

    const navigate = useNavigate()

    const onLogout = () => {
        sessionStorage.removeItem("v2_access_token")
        sessionStorage.removeItem("v2_refresh_token")
        sessionStorage.removeItem("v2_user")
        navigate("/login")
    }

    return (
        <div className="platformLayout">
            <aside className="platformLayout__sidebar">
                <div className="platformLayout__brand">
                    <img className="platformLayout__logo" src={Logo} alt="Logo" />
                    <span>Boshqaruv paneli</span>
                </div>

                <nav className="platformLayout__nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={`/platform/${item.to}`}
                            className={({ isActive }) => "platformLayout__navItem" + (isActive ? " active" : "")}
                        >
                            <i className={`fas ${item.icon}`} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="platformLayout__bottom">
                    <Link to="/" className="platformLayout__navItem">
                        <i className="fas fa-eye" />
                        <span>Saytni ko'rish</span>
                    </Link>
                    <button className="platformLayout__navItem platformLayout__logout" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt" />
                        <span>Chiqish</span>
                    </button>
                </div>
            </aside>

            <main className="platformLayout__main">
                <Outlet />
            </main>
            <PlatformMessage />
        </div>
    )
}

export default Platform;
