import classNames from "classnames";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {useDropzone} from "react-dropzone";
import {useDispatch, useSelector} from "react-redux";
import {motion} from "framer-motion";
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {useHttp} from "hooks/http.hook";
import {BackUrl, BackUrlForDoc, V2BackUrl, ROLES, resolveImg} from "constants/global";
import {
    fetchingNews,
    addNew,
    changeNew
} from "slices/webSiteSlice";
import Modal from "components/platform/platformUI/modal";
import {Context} from "context/websiteContext";

import cls from './style.module.sass'
import InputForm from "components/platform/platformUI/inputForm";
import WebButton from "components/webSite/webSiteUI/webButton/webButton";
import {isMobile, isMobileOnly} from "react-device-detect";
import RequireAuthChildren from "components/requireAuthChildren/requireAuthChildren";

const list = [1, 2, 3, 4]

const News = () => {

    const {newsList, teachersLoadingStatus} = useSelector(state => state?.website)

    const {setSectionTop} = useContext(Context)

    const sectionRef = useRef()

    useEffect(() => {
        if (teachersLoadingStatus === 'success')
            setSectionTop(cur => ({...cur, news: sectionRef?.current?.offsetTop}))
    }, [setSectionTop, teachersLoadingStatus])

    const token = sessionStorage.getItem("token")
    const {request} = useHttp()
    const formData = new FormData()
    const {register, handleSubmit, setValue} = useForm()
    const dispatch = useDispatch()
    const [changeStatus, setChangeStatus] = useState(false)
    const [addStatus, setAddStatus] = useState(false)
    const [imagesList, setImagesList] = useState([])
    const [changeItem, setChangeItem] = useState({})
    const [changedImages, setChangedImages] = useState([])
    // scroll-x
    const [width, setWidth] = useState(0)
    const wrapper = useRef()

    useEffect(() => {
        setWidth(wrapper.current?.scrollWidth - wrapper.current?.offsetWidth)
    }, [newsList.length])

    const v2Token = sessionStorage.getItem("v2_access_token")
    const v2Request = (path, method = "GET", body = null, json = true) =>
        fetch(`${V2BackUrl}${path}`, {
            method,
            headers: json
                ? {"Authorization": "Bearer " + v2Token, "Content-Type": "application/json"}
                : {"Authorization": "Bearer " + v2Token},
            body: body ? (json ? JSON.stringify(body) : body) : undefined
        }).then(res => res.status === 204 ? null : res.json())

    const onSubmitAdd = async (data) => {
        dispatch(fetchingNews())

        let row
        if (addStatus) {
            row = await v2Request("gennis/website/news", "POST", {title: data.title, description: data.text})
        } else if (changeStatus) {
            row = await v2Request(`gennis/website/news/${changeItem.id}`, "PATCH", {title: data.title, description: data.text})
        }

        const firstImage = imagesList[0]
        if (firstImage) {
            const imgData = new FormData()
            imgData.append("file", firstImage.file)
            row = await v2Request(`gennis/website/news/${row.id}/image`, "POST", imgData, false)
        }

        const links = [
            data?.instagram ? {link_type: "instagram", url: data.instagram} : null,
            data?.facebook ? {link_type: "facebook", url: data.facebook} : null,
            data?.telegram ? {link_type: "telegram", url: data.telegram} : null,
        ].filter(Boolean)
        const savedLinks = await v2Request(`gennis/website/news/${row.id}/links`, "PUT", links)

        const mapped = {
            id: row.id,
            title: row.title,
            text: row.description,
            date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
            images: row.image ? [{url: row.image}] : [],
            links: savedLinks
        }

        if (addStatus) {
            dispatch(addNew(mapped))
            setAddStatus(false)
        } else if (changeStatus) {
            dispatch(changeNew(mapped))
            setChangeStatus(false)
        }
    }

    const onImages = (value) => {
        const filtered = imagesList.filter(item => item.type !== value.type)
        setImagesList(arr => [...filtered, value])
    }

    const onChangeModal = (id) => {
        const filtered = newsList.filter(item => item.id === id)
        setChangeItem(...filtered)

        const findLink = (type) => (filtered[0]?.links || []).find(l => (l.link_type || l.type) === type)

        setValue("title", filtered[0]?.title)
        setValue("date", filtered[0]?.date)
        setValue("text", filtered[0]?.text)
        setValue("instagram", findLink("instagram")?.url)
        setValue("telegram", findLink("telegram")?.url)
        setValue("facebook", findLink("facebook")?.url)
        setChangeStatus(true)
    }

    const onAdd = () => {
        setValue("title", null)
        setValue("date", null)
        setValue("text", null)
        setValue("instagram", null)
        setValue("telegram", null)
        setValue("facebook", null)
        setAddStatus(true)
    }

    const animateBox = {
        hidden: {
            opacity: 0,
            y: 150
        },
        show: (num) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                delay: num * 0.2
            }
        }),
        exit: {
            opacity: 1,
            y: 0
        }
    }

    function compareById(a, b) {
        return a.id - b.id;
    }

    return (
        <section
            className={cls.news}
            ref={sectionRef}
        >
            <RequireAuthChildren allowedRules={[ROLES.Smm]}>
                <Modal
                    activeModal={addStatus ? addStatus : changeStatus}
                    setActiveModal={addStatus ? setAddStatus : setChangeStatus}
                >
                    <div className={cls.news__changeAdd}>
                        {
                            addStatus ? <h1>Yangilik kiritish</h1>
                                : <h1>Yangilikni o'zgartirish</h1>
                        }
                        <div className={cls.wrapper}>
                            <div className={cls.news__changeAdd_images}>
                                <div className={cls.items}>
                                    {
                                        list.map((item, i) => {
                                            return (
                                                <ImageDrop
                                                    key={i}
                                                    status={addStatus}
                                                    image={changeItem?.images ? changeItem?.images[i] : []}
                                                    setChangedImages={setChangedImages}
                                                    onImages={onImages}
                                                    index={i}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <form
                                id={"news-form"}
                                className={cls.news__changeAdd_content}
                                onSubmit={handleSubmit(onSubmitAdd)}
                            >
                                <InputForm
                                    register={register}
                                    name={'title'}
                                    placeholder={'Title'}
                                />
                                <InputForm
                                    register={register}
                                    name={'date'}
                                    type={'date'}
                                />
                                <textarea
                                    placeholder="Text"
                                    required
                                    cols="30"
                                    rows="10"
                                    {...register('text')}
                                />
                                <InputForm
                                    required={false}
                                    register={register}
                                    name={'instagram'}
                                    placeholder={'Instagram'}
                                />
                                <InputForm
                                    required={false}
                                    register={register}
                                    name={'telegram'}
                                    placeholder={'Telegram'}
                                />
                                <InputForm
                                    required={false}
                                    register={register}
                                    name={'facebook'}
                                    placeholder={'Facebook'}
                                />
                                {changeStatus ? <WebButton form={"news-form"}>O’zgartirish</WebButton> : <WebButton form={"news-form"}>Qo'shish</WebButton>}
                            </form>

                        </div>
                    </div>
                </Modal>
            </RequireAuthChildren>

            <motion.div
                className={cls.news_block}
                ref={wrapper}
            >
                <motion.div
                    drag={"x"}
                    dragConstraints={{left: -width, right: 0}}
                    className={cls.news_block_inner}
                >
                    {
                        newsList && [...newsList].sort(compareById).map((item, i) => {
                            return (
                                <RenderNews
                                    item={item}
                                    index={i}
                                    animateBox={animateBox}
                                    onChangeModal={onChangeModal}
                                />
                            )
                        })
                    }
                </motion.div>
            </motion.div>
            <RequireAuthChildren allowedRules={[ROLES.Smm]}>
                <i
                    className={classNames("fas fa-plus", cls.plus)}
                    onClick={onAdd}
                />
            </RequireAuthChildren>

        </section>
    )
}

const RenderNews = ({item, index, animateBox, onChangeModal}) => {
    const ref = useRef([])

    function renderText(text) {
        if (window.innerWidth >= 1440 && text.length >= 570)
            return `${text.slice(0, 570)} ...`
        else if (window.innerWidth >= 1024 && text.length >= 540)
            return `${text.slice(0, 540)} ...`
        else if (isMobileOnly && (window.innerWidth >= 375 || window.innerWidth >= 320) && text.length >= 160)
            return `${text.slice(0, 160)} ...`
        else if (isMobileOnly && text.length >= 540)
            return `${text.slice(0, 540)} ...`
        else if (isMobile && text.length >= 260)
            return `${text.slice(0, 260)} ...`
        else
            return text
    }

    return (
        <motion.div
            key={index}
            variants={animateBox}
            initial="hidden"
            whileInView="show"
            onViewportLeave="exit"
            viewport={{amount: .2, once: true}}
            custom={
                index >= 3 ? (index % 3 === 0 ? 1 : index % 2 === 0 ? 2 : 3) : index + 1
            }
            ref={el => ref.current[index] = el}
            className={cls.box}
        >
            <RequireAuthChildren allowedRules={[ROLES.Smm]}>
                <i
                    className={classNames("fas fa-pen", cls.icon)}
                    onClick={() => onChangeModal(item.id)}
                />
            </RequireAuthChildren>

            <Example
                images={item.images}
            />
            <div className={cls.box_info}>
                <div className={cls.date}>{item.date}</div>
                <h3>{item.title}</h3>
                <div className={cls.info}>
                    {renderText(item.text)}
                </div>
            </div>
            <div className={cls.icons}>
                <i className="fab fa-instagram"/>
                <i className="fab fa-telegram"/>
                <i className="fab fa-facebook"/>
            </div>
        </motion.div>
    )
}

const ImageDrop = ({onImages, index, setChangedImages, image, status}) => {
    useEffect(() => {
        if (status) {
            setImg({})
        }
    }, [status])

    const [img, setImg] = useState({})
    const {getInputProps, getRootProps} = useDropzone({
        onDrop: (acceptedFiles) => {
            onImages({
                type: `image_${index + 1}`,
                file: acceptedFiles[0]
            })
            setImg(acceptedFiles[0])
            setChangedImages(arr => [...arr, image?.id])
        }
    })

    const ImageRender = useCallback(({img, image}) => {
        return (
            img?.path ? <img src={URL.createObjectURL(img)} alt=""/>
                : status ? <>
                    <i className="far fa-image"/>
                    <input
                        type="file"
                        {...getInputProps()}
                    />
                </> : image?.url ? <img src={resolveImg(image.url)} alt=""/> : <>
                    <i className="far fa-image"/>
                    <input
                        type="file"
                        {...getInputProps()}
                    />
                </>
        )
    }, [img, image])

    return (
        <div
            className={cls.items__item}
            {...getRootProps()}
        >
            <ImageRender
                img={img}
                image={image}
            />
        </div>
    )
}

const Example = ({images}) => {
    const settings = {
        dots: true,
        fade: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        waitForAnimate: false
    }

    return (
        <div className={cls.box__img}>
            <Slider {...settings}>
                {
                    images.map(item => {
                        return (
                            <div
                                className={cls.img}
                            >
                                <img
                                    src={resolveImg(item?.url)}
                                    alt=""
                                />
                            </div>
                        )
                    })
                }
            </Slider>
        </div>
    )
}

export default News;