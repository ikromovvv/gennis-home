import React from 'react';
import ReactDOM from 'react-dom/client';
import App from "./components/app/App"
import { Provider } from "react-redux"

import "./styles/style.sass"
import { BrowserRouter as Router } from "react-router-dom";
import store from "./store";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Router basename={"/"}>
            <Provider store={store}>
                <App />
            </Provider>
        </Router>
    </React.StrictMode>
);
