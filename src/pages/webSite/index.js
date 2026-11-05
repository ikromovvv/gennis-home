import React, {useEffect, useState} from 'react';


import {AnimatePresence} from "framer-motion";
import WebSiteLoader from "components/loader/webSiteLoader/WebSiteLoader";
import {Route, Routes} from "react-router-dom";
import HomePage from "pages/webSite/home/homePage";
import BooksPage from "pages/webSite/books/booksPage";
import Book from "pages/webSite/books/book/book";
import TeacherInfo from "pages/webSite/teacherInfo";
import NotFound from "pages/webSite/notFound";
import {V2BackUrl} from "constants/global";
import {
    fetchedAdvantages,
    fetchedCertificates, fetchedHrefs,
    fetchedImageItems, fetchedLocations,
    fetchedNews, fetchedSubjects, fetchedTeachers,
    fetchedVideoItems
} from "slices/webSiteSlice";
import {useDispatch, useSelector} from "react-redux";
import {Context} from "context/websiteContext";


const WebSite = () => {


    const dispatch = useDispatch()

    useEffect(() => {
        // v2.gennis.uz owns all website content now (the legacy admin.gennis.uz
        // backend is retired); map its payload onto the shapes the sections use.
        fetch(`${V2BackUrl}gennis/website/home`)
            .then(res => res.ok ? res.json() : Promise.reject(new Error("home " + res.status)))
            .then(res => {
                dispatch(fetchedAdvantages((res.advantages || []).map(item => ({
                    id: item.id,
                    name: item.title,
                    text: "",
                    img: item.image
                }))))
                dispatch(fetchedNews((res.news || []).map(item => ({
                    id: item.id,
                    title: item.title,
                    text: item.description,
                    date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
                    images: item.image ? [{url: item.image}] : []
                }))))
                dispatch(fetchedImageItems({
                    name: res.hero?.title || "",
                    text: res.hero?.text || "",
                    img: res.hero?.image || ""
                }))
                dispatch(fetchedVideoItems({}))
                dispatch(fetchedHrefs((res.links || []).map(item => ({
                    id: item.id,
                    platform: item.platform,
                    name: item.platform ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1) : "",
                    link: item.url
                }))))
                dispatch(fetchedSubjects((res.courses || []).map(item => ({
                    id: item.id,
                    desc: item.title,
                    text: item.description,
                    img: item.image
                }))))
                dispatch(fetchedTeachers((res.teachers || []).map(item => ({
                    id: item.id,
                    full_name: item.name,
                    teacher_img: item.photo,
                    subjects: [item.subject_display],
                    text: item.bio || ""
                }))))
                dispatch(fetchedLocations((res.branches || []).map(item => ({
                    id: item.id,
                    display_order: item.display_order,
                    name: item.name,
                    number: item.phone,
                    location: item.address,
                    link: item.map_url
                }))))
                dispatch(fetchedCertificates((res.results || []).map(item => ({
                    id: item.id,
                    certificate: item.result_image,
                    teacher: item.teacher_name,
                    student: item.student_name,
                    text: item.comment || ""
                }))))
            })
            .catch(() => {
                // v2 unreachable: render an empty page instead of spinning forever
                dispatch(fetchedAdvantages([]))
                dispatch(fetchedNews([]))
                dispatch(fetchedImageItems({}))
                dispatch(fetchedVideoItems({}))
                dispatch(fetchedCertificates([]))
                dispatch(fetchedHrefs([]))
                dispatch(fetchedSubjects([]))
                dispatch(fetchedTeachers([]))
                dispatch(fetchedLocations([]))
            })
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
                                    <Route path={"*"} element={<NotFound/>}/>
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
