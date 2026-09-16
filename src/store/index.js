import { configureStore } from "@reduxjs/toolkit";

import me from "slices/meSlice";
import message from "slices/messageSlice";
import website from "slices/webSiteSlice";
import books from "slices/booksSlice";
import teacherInfo from "slices/teacherInfoSlice";

const stringMiddlewere = () => (next) => (action) => {
    if (typeof action === 'string') {
        return next({
            type: action
        })
    }
    return next(action)
}

const store = configureStore({
    reducer: {
        me,
        message,
        website,
        books,
        teacherInfo,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(
            stringMiddlewere
        ),
    devTools: process.env.NODE_ENV !== "production",
})

export default store
