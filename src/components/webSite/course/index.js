import {motion} from "framer-motion";
import {isMobile} from "react-device-detect";

import cls from './style.module.sass';
import {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Context} from "context/websiteContext";
import {useCurrentBranch} from "hooks/useCurrentBranch";
import {useDispatch, useSelector} from "react-redux";
import Modal from "components/platform/platformUI/modal";
import InputForm from "components/platform/platformUI/inputForm";
import {useForm} from "react-hook-form";
import classNames from "classnames";
import WebButton from "components/webSite/webSiteUI/webButton/webButton";
import {resolveImg} from "constants/global";
import {setMessage} from "slices/messageSlice";
import {submitLead} from "hooks/submitLead";
import {createPortal} from "react-dom";
import DefaultLoader from "components/loader/defaultLoader/DefaultLoader";

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


const Course = () => {

    const {
        subjects,
        subjectsLoadingStatus,
        locations
    } = useSelector(state => state?.website)
    const {setSectionTop} = useContext(Context)

    const sectionRef = useRef()

    useLayoutEffect(() => {
        if (subjectsLoadingStatus === "success") {
            setSectionTop(cur => ({...cur, course: sectionRef?.current?.offsetTop}))
        }
    }, [setSectionTop, subjectsLoadingStatus])

    const currentBranch = useCurrentBranch()
    const {register, handleSubmit} = useForm()
    const [modalStatus, setModalStatus] = useState(false)
    const [clickedSubject, setClickedSubject] = useState()
    const [width, setWidth] = useState(0)
    const ref = useRef([])
    const wrapper = useRef()
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        setWidth(wrapper.current?.scrollWidth - wrapper.current?.offsetWidth)
    }, [subjects.length])

    const renderCourses = (arr, setStatus) => {
        if (arr.length === 0) {
            return <h2>Kurslar hozircha qo'shilmagan</h2>
        }
        return arr.map((item, i) => {
            // if (isMobile && i >= 1) return null
            return (
                <motion.div
                    variants={animateChildren}
                    initial="hidden"
                    whileInView="show"
                    onViewportLeave="exit"
                    viewport={{amount: .2, once: true}}
                    custom={isMobile ? 1 :i}
                    ref={el => ref.current[i] = el}
                    className={cls.box}
                >
                    {
                        item.img ? <div className={cls.box_icon}>
                            <img src={resolveImg(item.img)} alt=""/>
                        </div> : null
                    }
                    <div>
                        <strong>{item.desc}</strong>
                        {item.text ? <p>{item.text}</p> : null}
                    </div>
                    {/*<button*/}
                    {/*    className={cls.reg_item}*/}
                    {/*    onClick={() => setStatus(true)}*/}
                    {/*>*/}
                    {/*    Ro'yxatdan o'tish*/}
                    {/*</button>*/}
                    <WebButton
                        onClick={() => {
                            setClickedSubject(item.id)
                            setModalStatus(true)
                        }}
                    >
                        Ro'yxatdan o'tish
                    </WebButton>
                </motion.div>
            )
        })
    }


    const dispatch = useDispatch()

    const onSubmitReg = (data) => {
        setModalStatus(false)
        setLoading(true)
        submitLead(data, clickedSubject)
            .then(res => {
                setLoading(false)
                dispatch(setMessage({
                    msg: res.msg,
                    type: res.success ? "success" : "error",
                    active: true
                }))
            })
            .catch(() => setLoading(false))
    }

    return (
        <section
            className={cls.course}
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
            <Modal
                activeModal={modalStatus}
                setActiveModal={setModalStatus}
            >
                <div className={cls.course__modal}>
                    <div className={cls.wrapper}>
                        <h1>Darslikka ro'yhatdan o'tish</h1>
                        <form onSubmit={handleSubmit(onSubmitReg)} className={cls.wrapper__container }>
                            <InputForm
                                required
                                register={register}
                                name={"name"}
                                placeholder={"Ismingiz"}
                            />
                            <InputForm
                                required
                                register={register}
                                name={"phone"}
                                type={"tel"}
                                inputMode={"numeric"}
                                placeholder={"+998 (__) ___ __ __"}
                            />
                            <select required key={currentBranch?.id ?? "all"} defaultValue={currentBranch ? String(currentBranch.id) : ""} {...register("location_id")} >
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
                            {/*<button>*/}
                            {/*    Registratsiya*/}
                            {/*</button>*/}
                            <WebButton>Registratsiya</WebButton>
                        </form>
                    </div>
                </div>
            </Modal>
            <motion.div
                className={classNames(cls.course_block, {
                    [cls.wrap]: !(isMobile || window.innerWidth <= 768)
                })}
                ref={wrapper}
            >
                {
                    isMobile || window.innerWidth <= 768 ? <motion.div
                        className={classNames(cls.course_block_inner, {
                            // [cls.wrap]: !isMobile && 768 <= window.innerWidth
                        })}
                        drag={"x"}
                        dragConstraints={{left: -width, right: 0}}
                    >
                        {renderCourses(subjects)}
                    </motion.div> : renderCourses(subjects)
                }

            </motion.div>
        </section>
    )
}

export default Course