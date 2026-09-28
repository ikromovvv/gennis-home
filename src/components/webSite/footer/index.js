import classNames from "classnames";
import React, {useContext, useEffect, useRef, useState} from "react";

import cls from "./style.module.sass";
import logo from "assets/website/logo.png"
import {useForm} from "react-hook-form";
import {useHttp} from "hooks/http.hook";
import {BackUrl} from "constants/global";
import {Context} from "context/websiteContext";
import {useSelector, useDispatch} from "react-redux";
import {isMobileOnly} from "react-device-detect";
import {motion} from "framer-motion";
import WebButton from "components/webSite/webSiteUI/webButton/webButton";
import {setMessage} from "slices/messageSlice";
import {createPortal} from "react-dom";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";

const list = [
    {
        label: "Youtube",
        icon: `fab fa-youtube ${cls.icons}`,
        src: "https:/genniscampus/"
    }, {
        label: "Telegram",
        icon: `fab fa-telegram ${cls.icons}`,
        src: "https:/genniscampus/"
    }, {
        label: "Instagram",
        icon: `fab fa-instagram ${cls.icons}`,
        src: "https:/genniscampus/"
    }, {
        label: "Facebook",
        icon: `fab fa-facebook ${cls.icons}`,
        src: "https:/genniscampus/"
    }
]

const Footer = () => {

    const {
        hrefs,
        locations,
        teachersLoadingStatus
    } = useSelector(state => state?.website)

    const {setSectionTop} = useContext(Context)

    const sectionRef = useRef()

    useEffect(() => {
        if (teachersLoadingStatus === 'success')
            setSectionTop(cur => ({...cur, contact: sectionRef?.current?.offsetTop}))
    }, [setSectionTop, teachersLoadingStatus])

    const {register, handleSubmit} = useForm()
    const dispatch = useDispatch()
    const {request} = useHttp()
    const [activeLoc, setActiveLoc] = useState(0)
    const [selectedItem, setSelectedItem] = useState(locations[0])
    const [loading, setLoading] = useState(false)

    const animateChildren = {
        hidden: {
            opacity: 0,
            y: 100
        },
        show: (num) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: .7,
                delay: num * .1
            }
        }),
        exit: {
            opacity: 1,
            y: 0,
        }
    }

    const onSubmitReg = (data) => {
        setLoading(true)
        request(`${BackUrl}lead/register_lead`, 'POST', JSON.stringify(data))
            .then(res => {
                setLoading(false)
                if (res.success) {
                    dispatch(setMessage({
                        msg: res.msg,
                        type: "success",
                        active: true
                    }))
                } else {
                    dispatch(setMessage({
                        msg: res.msg,
                        type: "error",
                        active: true
                    }))
                }
            })
            .catch(err => {
                setLoading(false)
            })
    }

    const selectItem = (id) => {
        locations.filter(item => {
            if (item.id === id) {
                setSelectedItem((item))
            }
            return null
        })
    }

    function compareById(a, b) {
        return a.id - b.id;
    }

    return (
        <footer
            className={cls.footer}
            ref={sectionRef}
        >
            {
                loading ? createPortal(
                    <div className={cls.overlay}>
                        <DefaultLoader/>
                    </div>,
                    document.body
                ) : null
            }
            <div className={cls.footer__wrapper}>
                <div className={cls.footer_branches}>
                    <div className={cls.location}>
                        <i className="fab fa-location-dot"/>
                        <h2>Filiallar</h2>
                    </div>
                    <div className={cls.branch}>
                        {
                            locations && [...locations].sort(compareById).map((item, i) => {
                                return (
                                    <div
                                        className={classNames(cls.branch_inner, {
                                            [cls.active]: i === activeLoc
                                        })}
                                        onClick={() => {
                                            setActiveLoc(i)
                                            selectItem(item.id)
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className={cls.footer_main}>
                    <div className={classNames(cls.connect, cls.connect_none)}>
                        <h1>Biz bilan bog’laning!</h1>
                        <div className={cls.connects}>
                            {
                                hrefs.map((item, i) => {
                                    return (
                                        <div key={i} className={cls.links}>
                                            <i className={classNames(list[i]?.icon, cls.bigIcon, {
                                                [cls.red]: i === 0
                                            })}/>
                                            <h2>{item.name}</h2>
                                            <a href={item?.link}>{list[i]?.src}</a>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className={cls.box}>
                        <div className={cls.number}>
                            <h2>{locations[activeLoc]?.name}</h2>
                            <div className={cls.phone}>
                                <i className="fas fa-phone-alt"/>{selectedItem?.number}
                            </div>
                        </div>
                        <div className={cls.number}>
                            <h2>Manzil</h2>
                            <div>{selectedItem?.location}</div>
                        </div>
                    </div>
                    <iframe
                        src={selectedItem?.link}
                        style={{width: "600", height: "450", border: 0}} allowFullScreen="" loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"/>
                </div>
            </div>
            {
                isMobileOnly ? <div className={classNames(cls.connect)}>
                    <h1>Biz bilan bog’laning!</h1>
                    <div className={cls.connects}>
                        {
                            hrefs.map((item, i) => {
                                return (
                                    <motion.div
                                        key={i}
                                        variants={animateChildren}
                                        initial="hidden"
                                        whileInView="show"
                                        onViewportLeave="exit"
                                        viewport={{amount: .2, once: true}}
                                        custom={i + 1}
                                        className={cls.links}
                                    >
                                        <i className={list[i]?.icon}/>
                                        <h2>{item.name}</h2>
                                        <a href={item?.link}>{list[i]?.src}</a>
                                    </motion.div>
                                )
                            })
                        }
                    </div>
                </div> : null
            }
            <div className={classNames(cls.footer_register, cls.none_footer)}>
                <div className={cls.logo}><img src={logo} alt=""/></div>
                <form
                    onSubmit={handleSubmit(onSubmitReg)}
                >
                    <input
                        required
                        type="text"
                        placeholder="Ismingiz"
                        {...register("name")}
                    />
                    <input
                        required
                        type="tel"
                        inputMode="numeric"
                        placeholder="Telefon raqamingiz"
                        {...register("phone")}
                    />
                    <select required {...register("location_id")}>
                        <option value="">Filialni tanlang</option>
                        {
                            locations.map(item => {
                                return (
                                    <option value={item.id}>{item.name}</option>
                                )
                            })
                        }
                    </select>
                    <label className={cls.consent}>
                        <input required type="checkbox" {...register("consent")} />
                        Shaxsiy ma'lumotlarimni qayta ishlashga roziman
                    </label>
                    <WebButton>Yuborish</WebButton>
                </form>
            </div>
        </footer>
    )
}

export default Footer