import React, {useCallback, useEffect, useRef, useState} from 'react';


import "./platformWebsiteEdit.sass"
import Modal from "components/platform/platformUI/modal";
import img from "assets/user-interface/user_image.png"
import {V2BackUrl} from "constants/global";
import Select from "components/platform/platformUI/select";
import {Routes, Route, Outlet} from "react-router-dom";
import Input from "components/platform/platformUI/input";

const v2Headers = (json = true) => {
    const token = sessionStorage.getItem("v2_access_token")
    const headers = {"Authorization": "Bearer " + token}
    if (json) headers["Content-Type"] = "application/json"
    return headers
}

const v2Request = (path, method = "GET", body = null, json = true) =>
    fetch(`${V2BackUrl}${path}`, {
        method,
        headers: v2Headers(json),
        body: body ? (json ? JSON.stringify(body) : body) : undefined
    }).then(res => {
        if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
        return res.status === 204 ? null : res.json()
    })


const PlatformWebsiteEdit = () => {
    return (
        <div className="websiteEdit">
            <div className="websiteEdit__content">
                <Routes>
                    <Route path="Advantages" element={<Advantages/>}/>
                    <Route path="Comments" element={<Comments/>}/>
                    <Route path="Events" element={<Events/>}/>
                    <Route path="Gallery" element={<Gallery/>}/>
                </Routes>


                <Outlet/>
            </div>

        </div>
    );
};



const Advantages = () => {

    const [advantages, setAdvantages] = useState([])
    const [active, setActive] = useState(false)
    const [advantage, setAdvantage] = useState({
        title: "",
        img: null,
        file: null
    })
    const inputRef = useRef()
    const [changing, setChanging] = useState(null)


    const reload = () => v2Request("gennis/website/advantages").then(setAdvantages)

    useEffect(() => {
        reload()
    }, [])


    const delAdvantages = (id) => {
        setAdvantages(items => items.filter(item => item.id !== id))
        v2Request(`gennis/website/advantages/${id}`, "DELETE")
    }

    const changeAdvantages = (id) => {
        const found = advantages.find(item => item.id === id)
        setAdvantage({
            title: found.title,
            img: found.image,
            file: null
        })
        setActive(true)
        setChanging(id)
    }


    const getImg = (e) => {
        const file = e.target.files[0]
        setAdvantage(item => ({...item, img: URL.createObjectURL(file), file}))
    }

    const Open = () => {
        inputRef.current.click()
    }


    const onSubmit = async (e) => {
        e.preventDefault()
        setActive(false)

        let row
        if (changing) {
            row = await v2Request(`gennis/website/advantages/${changing}`, "PATCH", {title: advantage.title})
        } else {
            row = await v2Request("gennis/website/advantages", "POST", {title: advantage.title})
        }

        if (advantage.file) {
            const formData = new FormData()
            formData.append("file", advantage.file)
            await v2Request(`gennis/website/advantages/${row.id}/image`, "POST", formData, false)
        }

        setChanging(null)
        setAdvantage({title: "", img: null, file: null})
        reload()
    }

    const renderAdvantages = (advantages) => {
        return advantages.map(item => {
            return (
                <div className="advantagesEdit__wrapper-item" key={item.id}>
                    <div className="advantagesEdit__wrapper-item-header">
                        <i className="fas fa-edit" onClick={() => changeAdvantages(item.id)}/>
                        <i className="fas fa-times" onClick={() => delAdvantages(item.id)}/>
                    </div>
                    <div className="advantagesEdit__wrapper-item-content">
                        <img src={item.image} alt="Img"/>
                        <div className="desc">{item.title}</div>
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="advantagesEdit">
            <div className="statCards">
                <StatCard icon="fa-star" value={advantages.length} label="Jami afzalliklar" />
            </div>

            <div className="advantagesEdit__header">
                <div className="advantagesEdit__header-item">
                    <h1>Afzalliklar</h1>
                </div>
                <button className="addBtn" onClick={() => setActive(true)}>
                    <i className="fas fa-plus" /> Yangi qo'shish
                </button>
            </div>

            <div className="advantagesEdit__wrapper">
                {renderAdvantages(advantages)}
            </div>



            <Modal setActiveModal={setActive} activeModal={active}>
                <div className="edit">
                    <form className="edit__wrapper" onSubmit={onSubmit}>
                        <input
                            ref={inputRef}
                            onChange={(e) => getImg(e)}
                            className="img-input"
                            type="file"
                        />
                        <div onClick={Open}  className="addImg">
                            {
                                advantage.img ?
                                    <img
                                        src={advantage.img}
                                        alt=""
                                    />
                                    :
                                    <h1>
                                        Rasm tanlang
                                    </h1>
                            }
                        </div>
                        <textarea
                            value={advantage.title}
                            onChange={(e) => setAdvantage(item => ({...item, title: e.target.value}))}
                        />
                        <input type="submit" className="input-submit" value="Submit"/>
                    </form>
                </div>
            </Modal>
        </div>
    )
}


const Comments = () => {
    // No v2 equivalent yet — admin.gennis.uz's user-comments/reviews
    // feature (home_page/home_comments) hasn't been ported. Left pointing
    // at the old backend; will stop working once it's fully retired.
    const [comments, setComments] = useState([])

    useEffect(() => {
        fetch("https://admin.gennis.uz/api/home_page/home_comments", {
            headers: {"Authorization": "Bearer " + sessionStorage.getItem("token")}
        })
            .then(res => res.json())
            .then(res => setComments(res.comments || []))
            .catch(() => {})
    }, [])

    const delComment = (id) => {
        setComments(prev => prev.filter(item => item.id !== id))
        fetch(`https://admin.gennis.uz/api/home_page/delete_comment/${id}`, {
            headers: {"Authorization": "Bearer " + sessionStorage.getItem("token")}
        })
    }



    const renderComments = (comments) => {
        return comments.map(item => {
            const userImg = item.img ? `https://admin.gennis.uz/${item?.img}` : img

            return (
                <div className="commentsEdit__item" key={item.id}>
                    <div className="commentsEdit__item-header" >
                        <div className="info">
                            <img src={userImg} alt="UserImg"/>
                            <div>
                                <span>{item.name}</span>
                                <span>{item.surname}</span>
                            </div>
                        </div>
                        <div className="links">
                            <i onClick={() => delComment(item.id)} className="fas fa-times" />
                        </div>
                    </div>

                    <p>
                        {item.comment}
                    </p>
                </div>
            )
        })
    }


    return (
        <div className="commentsEdit">
            {renderComments(comments)}
        </div>
    )
}


const Events = () => {

    const [events, setEvents] = useState([])
    const [active, setActive] = useState(false)
    const [event, setEvent] = useState({
        title: "",
        desc: "",
        img: null,
        file: null
    })
    const [linksInput, setLinksInput] = useState([])
    const inputRef = useRef()
    const [changing, setChanging] = useState(null)


    const reload = () => v2Request("gennis/website/news").then(setEvents)

    useEffect(() => {
        reload()
    }, [])


    const delAdvantages = (id) => {
        setEvents(items => items.filter(item => item.id !== id))
        v2Request(`gennis/website/news/${id}`, "DELETE")
    }



    const changeAdvantages = (id) => {
        const found = events.find(item => item.id === id)
        setEvent({
            title: found.title,
            desc: found.description,
            img: found.image,
            file: null
        })

        setLinksInput(found.links.map(l => ({link_id: l.id, type: l.link_type, link: l.url})))
        setActive(true)
        setChanging(id)
    }


    const getImg = (e) => {
        const file = e.target.files[0]
        setEvent(item => ({...item, img: URL.createObjectURL(file), file}))
    }

    const Open = () => {
        inputRef.current.click()
    }



    const onSubmit = async (e) => {
        e.preventDefault()

        let row
        if (changing) {
            row = await v2Request(`gennis/website/news/${changing}`, "PATCH", {title: event.title, description: event.desc})
        } else {
            row = await v2Request("gennis/website/news", "POST", {title: event.title, description: event.desc})
        }

        if (event.file) {
            const formData = new FormData()
            formData.append("file", event.file)
            await v2Request(`gennis/website/news/${row.id}/image`, "POST", formData, false)
        }

        if (linksInput.length) {
            await v2Request(`gennis/website/news/${row.id}/links`, "PUT",
                linksInput.map(l => ({link_type: l.type, url: l.link})))
        }

        setActive(false)
        setChanging(null)
        setEvent({title: "", desc: "", img: null, file: null})
        setLinksInput([])
        reload()
    }

    const renderAdvantages = (events) => {
        return events.map(item => {
            return (
                <div className="eventsEdit__wrapper-item" key={item.id}>
                    <div className="eventsEdit__wrapper-item-header">
                        <i className="fas fa-edit" onClick={() => changeAdvantages(item.id)}/>
                        <i className="fas fa-times" onClick={() => delAdvantages(item.id)}/>
                    </div>
                    <div className="eventsEdit__wrapper-item-content">
                        <img src={item.image} alt="Img"/>
                        <h1 className="title">{item.title}</h1>
                        <p className="desc">{item.description}</p>

                        <div className="links">
                            {
                               item.links.map(link => {
                                   return (
                                       <a href={link.url} key={link.id}>
                                           <i className={`fab fa-${link.link_type}`} />
                                       </a>
                                   )
                               })
                            }
                        </div>
                    </div>
                </div>
            )
        })
    }


    const options = [
        {
            name: "telegram"
        },
        {
            name: "instagram"
        },
    ]


    const renderLinksInput = useCallback(() => {
        return linksInput.map((eventItem, i) => {
            return (
                <div className="links__item" key={eventItem.link_id || i}>
                    <Select
                        onChangeOption={(e) => setLinksInput(items => items.map((item, j) =>
                            j === i ? {...item, type: e} : item
                        ))}
                        defaultValue={eventItem.type}
                        name="type"
                        title="Turi"
                        options={options}
                    />
                    <Input
                        onChange={(e) => setLinksInput(items => items.map((item, j) =>
                            j === i ? {...item, link: e} : item
                        ))}
                        defaultValue={eventItem.link}
                        title={"link"}
                    />
                </div>
            )
        })
    }, [linksInput])


    const onAddLinksInput = () => {
        setLinksInput([...linksInput, {type: "", link: ""}])
    }


    const rendered = renderLinksInput()

    return (
        <div className="eventsEdit">
            <div className="statCards">
                <StatCard icon="fa-newspaper" value={events.length} label="Jami yangiliklar" />
            </div>

            <div className="eventsEdit__header">
                <div className="eventsEdit__header-item">
                    <h1>Yangiliklar</h1>
                </div>
                <button className="addBtn" onClick={() => setActive(true)}>
                    <i className="fas fa-plus" /> Yangi qo'shish
                </button>
            </div>
            <div className="eventsEdit__wrapper">
                {renderAdvantages(events)}
            </div>
            <Modal setActiveModal={setActive} activeModal={active}>
                <div className="edit">
                    <form className="edit__wrapper" onSubmit={onSubmit}>
                        <input
                            ref={inputRef}
                            onChange={(e) => getImg(e)}
                            className="img-input"
                            type="file"
                        />
                        <div onClick={Open}  className="addImg">
                            {
                                event.img ?
                                    <img
                                        src={event.img}
                                        alt="Img"
                                    />
                                    :
                                    <h1>
                                        Rasm tanlang
                                    </h1>
                            }
                        </div>
                        <Input
                            title={"Title"}
                            defaultValue={event.title}
                            onChange={(e) => setEvent(item => ({...item, title: e}))}
                        />
                        <label className={"input-label"} htmlFor="comment">
                            <span className="name-field">Desc</span>
                            <textarea
                                value={event.desc}
                                onChange={(e) => setEvent(item => ({...item, desc: e.target.value}))}
                            />
                        </label>
                        {
                            linksInput.length < 2 ?
                                <div className="button">
                                    <i onClick={onAddLinksInput} className="fas fa-plus" />
                                </div> : null
                        }

                        <div className="links">
                            {rendered}
                        </div>

                        <input type="submit" className="input-submit" value="Submit"/>
                    </form>
                </div>
            </Modal>
        </div>
    )
}


const Gallery = () => {

    const [images, setImages] = useState([])



    const [activeModal, setActiveModal] = useState(false)
    const [layoutId, setLayoutId] = useState(null)

    const poper = (id) => {
        setLayoutId(id)
        setActiveModal(true)

    }
    const deleteImage = (e, id) => {
        e.stopPropagation()
        setImages(items => items.filter(item => item.id !== id))
        v2Request(`gennis/website/gallery/${id}`, "DELETE")
    }

    const renderItems = (images) => {
        return images.map(({id, image}) => {
            return (
                <div
                    className={"galleryEdit__item" + (image ? " filled" : "")}
                    key={id}
                    onClick={() => poper(id)}
                >
                    {
                        image ?
                            <>
                                <img
                                    src={image}
                                    alt="Img"
                                />
                                <i className="fas fa-times galleryEdit__delete" onClick={(e) => deleteImage(e, id)}/>
                            </>
                            : <i className="fas fa-image"/>
                    }
                </div>

            )
        })
    }

    const reload = () => v2Request("gennis/website/gallery").then(setImages)

    useEffect(() => {
        reload()
    }, [])

    return (
        <div className="galleryEdit">
            <div className="statCards">
                <StatCard icon="fa-images" value={images.length} label="Jami rasmlar" />
            </div>
            <div className="galleryEdit__wrapper">
                {renderItems(images)}
                <div className="galleryEdit__item addSlot" onClick={async () => {
                    const row = await v2Request("gennis/website/gallery", "POST", null, false)
                    setImages(items => [...items, row])
                }}>
                    <i className="fas fa-plus"/>
                </div>
            </div>
            <Modal activeModal={activeModal} setActiveModal={setActiveModal}>
                <PopupImg
                    setActiveModal={setActiveModal}
                    setImages={setImages}
                    images={images}
                    loyautId={layoutId}
                    reload={reload}
                />
            </Modal>
        </div>
    )
}


const PopupImg = ({loyautId, images, setImages, setActiveModal, reload}) => {
    const selected = images.filter(item => item.id === loyautId);

    const inputRef = useRef()
    const [localImg, setLocalImg] = useState(null)
    const [file, setFile] = useState(null)

    const getImg = (e) => {
        const f = e.target.files[0]
        setLocalImg(URL.createObjectURL(f))
        setFile(f)
    }

    const Open = () => {
        inputRef.current.click()
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)
        await v2Request(`gennis/website/gallery/${selected[0].id}/image`, "POST", formData, false)
        setActiveModal(false)
        setLocalImg(null)
        setFile(null)
        reload()
    }

    return (
        <div  className="imgEdit">
            <form className="imgEdit-wrapper" onSubmit={onSubmit}>
                <div onClick={Open}  className="addImg">
                    <input
                        ref={inputRef}
                        onChange={(e) => getImg(e)}
                        className="img-input"
                        type="file"
                    />
                    {
                        localImg ?
                            <img
                                src={localImg}
                                alt="Img"
                            />
                            :
                            <h1>
                                Rasm tanlang
                            </h1>
                    }
                </div>

                <input type="submit" className="input-submit" />
            </form>
        </div>
    )
}


const StatCard = ({icon, value, label}) => (
    <div className="statCard">
        <div className="statCard__icon"><i className={`fas ${icon}`}/></div>
        <div className="statCard__body">
            <div className="statCard__value">{value}</div>
            <div className="statCard__label">{label}</div>
        </div>
    </div>
)


export default PlatformWebsiteEdit;
