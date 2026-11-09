import {useEffect, useContext, useRef} from "react";
import {useSelector} from "react-redux";
import {motion} from "framer-motion";

import {Context} from "context/websiteContext";

import cls from './style.module.sass'
import ReactPlayer from "react-player";

const About = () => {

    const {setSectionTop} = useContext(Context)

    const sectionRef = useRef()

    useEffect(() => {
        setSectionTop(cur => ({...cur, about: sectionRef?.current?.offsetTop}))
    }, [setSectionTop])

    const {
        video,
    } = useSelector(state => state.website)

    const animateText = {
        hidden: {
            opacity: 0,
            x: -150
        },
        show: (num) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.7,
                delay: num * 0.2
            }
        }),
        exit: {
            opacity: 1,
            x: 0
        }
    }

    const animateBox = {
        hidden: {
            opacity: 0,
            x: 150
        },
        show: (num) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.7,
                delay: num * 0.2
            }
        }),
        exit: {
            opacity: 1,
            x: 0
        }
    }

    return (
        <section
            className={cls.about}
            ref={sectionRef}
        >
            <motion.div
                className={cls.about_info}
                variants={animateText}
                initial="hidden"
                whileInView="show"
                onViewportLeave="exit"
                viewport={{amount: .2, once: true}}
                custom={1}
            >
                <h1>
                    {video?.name}
                </h1>
                <p>
                    {video?.text}
                </p>
            </motion.div>
            <motion.div
                className={cls.about_img}
                variants={animateBox}
                initial="hidden"
                whileInView="show"
                onViewportLeave="exit"
                viewport={{amount: .2, once: true}}
                custom={2}
            >
                <div className={cls.square}>
                    <ReactPlayer
                        width="100%"
                        height="100%"
                        url={video?.url}
                    />
                </div>
            </motion.div>
        </section>
    )
}

export default About