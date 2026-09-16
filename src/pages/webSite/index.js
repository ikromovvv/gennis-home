import React, {useEffect, useState} from 'react';


import {AnimatePresence} from "framer-motion";
import WebSiteLoader from "components/loader/webSiteLoader/WebSiteLoader";
import {Route, Routes} from "react-router-dom";
import HomePage from "pages/webSite/home/homePage";
import BooksPage from "pages/webSite/books/booksPage";
import Book from "pages/webSite/books/book/book";
import TeacherInfo from "pages/webSite/teacherInfo";
import {BackUrl, V2BackUrl, headers} from "constants/global";
import {
    fetchedAdvantages,
    fetchedCertificates, fetchedHrefs,
    fetchedImageItems, fetchedLocations,
    fetchedNews, fetchedSubjects, fetchedTeachers,
    fetchedVideoItems
} from "slices/webSiteSlice";
import {useHttp} from "hooks/http.hook";
import {useDispatch, useSelector} from "react-redux";
import {Context} from "context/websiteContext";


const WebSite = () => {


    const {request} = useHttp()
    const dispatch = useDispatch()

    useEffect(() => {
        request(`${BackUrl}home_page/get_home_info`, "GET", null, headers())
            .then(res => {
                if (res?.success) {
                    dispatch(fetchedAdvantages(res?.advantages))
                    dispatch(fetchedImageItems(res?.design))
                    dispatch(fetchedVideoItems(res?.video))
                    dispatch(fetchedNews(res?.news))
                    dispatch(fetchedCertificates(res?.certificates))
                    dispatch(fetchedHrefs(res?.links))
                    dispatch(fetchedSubjects(res?.subjects))
                    dispatch(fetchedTeachers(res?.teachers))
                    dispatch(fetchedLocations(res?.locations))
                } else {
                    dispatch(fetchedAdvantages([]))
                    dispatch(fetchedImageItems({}))
                    dispatch(fetchedVideoItems({}))
                    dispatch(fetchedNews([]))
                    dispatch(fetchedCertificates([]))
                    dispatch(fetchedHrefs([]))
                    dispatch(fetchedSubjects([]))
                    dispatch(fetchedTeachers([]))
                    dispatch(fetchedLocations([]))
                }
            })
            // .catch(err => console.log(err))

        // v2.gennis.uz now owns advantages/news content (admin.gennis.uz is
        // being retired) — fetched separately and overrides whatever the
        // call above set for these two, once it resolves.
        fetch(`${V2BackUrl}gennis/website/home`)
            .then(res => res.ok ? res.json() : null)
            .then(res => {
                if (!res) return
                if (Array.isArray(res.advantages)) {
                    dispatch(fetchedAdvantages(res.advantages.map(item => ({
                        id: item.id,
                        name: item.title,
                        text: "",
                        img: item.image
                    }))))
                }
                if (Array.isArray(res.news)) {
                    dispatch(fetchedNews(res.news.map(item => ({
                        id: item.id,
                        title: item.title,
                        text: item.description,
                        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
                        images: item.image ? [{url: item.image}] : []
                    }))))
                }
            })
            .catch(() => {})
    }, [])


    const {imageLoadingStatus} = useSelector(state => state.website)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(imageLoadingStatus === "loading" || imageLoadingStatus === "idle")
        }, 3000)

        return () => clearTimeout(timer)
    },[imageLoadingStatus])

    const [sectionTop, setSectionTop] = useState({
        home: null,
        about: null,
        advantages: null,
        comments: null,
        events: null,
        gallery: null,
        contact: null
    })




    return (
        <>
            <AnimatePresence >
                {
                    loading ? (
                        <WebSiteLoader/>
                    ) : (
                        <>
                            <Context.Provider value={{sectionTop, setSectionTop}}>
                                <Routes>
                                    <Route index path={"/"} element={<HomePage/>}/>
                                    <Route path={"books"} element={<BooksPage/>}/>
                                    <Route path={"books/:id"} element={<Book/>}/>
                                    <Route path={"teacherInfo/:id"} element={<TeacherInfo/>}/>
                                </Routes>
                            </Context.Provider>
                        </>
                    )


                }
            </AnimatePresence>
        </>
    );
};

export default WebSite;
