import classNames from "classnames";
import {useEffect, useState, useContext, useRef, useCallback} from "react";
import {useForm} from "react-hook-form";
import {useDispatch, useSelector} from "react-redux";
import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import {isMobile} from "react-device-detect";

import {useHttp} from "hooks/http.hook";
import {BackUrl, BackUrlForDoc} from "constants/global";
import Header from "components/webSite/header/Header";
import {Context} from "context/websiteContext";

import cls from './style.module.sass'
import WebButton from "components/webSite/webSiteUI/webButton/webButton";
import {setMessage} from "slices/messageSlice";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";
import {createPortal} from "react-dom";
// import {animateBox, animateText} from "frame-motion";

const Home = () => {
    const {setSectionTop} = useContext(Context)

    const sectionRef = useRef()

    useEffect(() => {
        setSectionTop(cur => ({...cur, home: sectionRef?.current?.offsetTop}))
    }, [setSectionTop])

    const {register, handleSubmit} = useForm()
    const {request} = useHttp()
    const dispatch = useDispatch()

    const [mobileMenuStatus, setMobileMenuStatus] = useState(false)
    const {image,locations} = useSelector(state => state?.website)
    const [loading, setLoading] = useState(false)

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

    return (
        <section
            className={cls.home}
            ref={sectionRef}
            style={{backgroundImage: `url(${BackUrlForDoc + image?.img})`}}
        >
            {
                loading ? createPortal(
                    <div className={cls.overlay}>
                        <DefaultLoader/>
                    </div>,
                    document.body
                ) : null
            }
            {
                isMobile ?
                    <div className={cls.home__hamburger}>
                        <i
                            className={classNames((mobileMenuStatus ? "fas fa-times" : "fas fa-bars"), cls.home__hamburger_inner)}
                            onClick={() => setMobileMenuStatus(!mobileMenuStatus)}
                        />
                    </div>
                    : null
            }
            <div className={cls.home__back}></div>
            <Header
                status={mobileMenuStatus}
                setStatus={setMobileMenuStatus}
            />
            <motion.div className={cls.home_information}>

                <motion.div className={cls.information_about}>
                    <span className="badge">GENNIS Ta'lim Markazi</span>
                    <motion.h1
                        // variants={animateText}
                        initial="hidden"
                        whileInView="show"
                        onViewportLeave="exit"
                        viewport={{amount: .2, once: true}}
                        custom={1}
                    >
                        {image?.name}
                    </motion.h1>
                    <motion.div
                        // variants={animateText}
                        initial="hidden"
                        whileInView="show"
                        onViewportLeave="exit"
                        viewport={{amount: .2, once: true}}
                        custom={2}
                        style={{
                            hyphens: "auto",
                            width: "100%",
                            overflowWrap: "anywhere"
                        }}
                    >
                        {image?.text}
                    </motion.div>
                    {
                        isMobile ?
                            <Link
                                to={'login'}
                                style={{textDecoration: "none", width: "150px", height: "35px"}}
                            >
                                <WebButton style={"blackWhite"}>Login</WebButton>
                            </Link> : null
                    }
                </motion.div>


                <motion.div
                    className={cls.register}
                    // variants={animateBox}
                    initial="hidden"
                    whileInView="show"
                    onViewportLeave="exit"
                    viewport={{amount: .2, once: true}}
                    custom={3}
                >

                    <motion.form
                        onSubmit={handleSubmit(onSubmitReg)}
                    >
                        <h1>Ro’yxatdan o’tish</h1>
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
                            placeholder="+998 (__) ___ __ __"
                            {...register("phone")}
                        />
                        <select required  {...register("location_id")} >
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
                        <WebButton>Registratsiya</WebButton>
                    </motion.form>
                </motion.div>
            </motion.div>

        </section>
    )
}

export default Home