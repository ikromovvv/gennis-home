import React from 'react';
import {Link} from "react-router-dom";

import style from "./style.module.sass";

const NotFound = () => {
    return (
        <div className={style.notFound}>
            <h1>404</h1>
            <p>Bunday sahifa topilmadi</p>
            <Link to={"/"} className={style.notFound__link}>Bosh sahifaga qaytish</Link>
        </div>
    );
};

export default NotFound;
