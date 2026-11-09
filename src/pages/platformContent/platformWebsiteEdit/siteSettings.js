import React, {useEffect, useRef, useState} from 'react';

import Modal from "components/platform/platformUI/modal";
import {V2BackUrl, resolveImg} from "constants/global";
import "./siteSettings.sass"

const authHeaders = (json = true) => {
    const headers = {"Authorization": "Bearer " + sessionStorage.getItem("v2_access_token")}
    if (json) headers["Content-Type"] = "application/json"
    return headers
}

const api = (path, method = "GET", body = null, json = true) =>
    fetch(`${V2BackUrl}${path}`, {
        method,
        headers: authHeaders(json),
        body: body ? (json ? JSON.stringify(body) : body) : undefined
    }).then(res => {
        if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
        return res.json()
    })

const Field = ({field, value, onChange}) => {
    const common = {
        value: value ?? "",
        onChange: (e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value),
        required: field.required,
        placeholder: field.placeholder
    }
    return (
        <label className="siteField">
            <span>{field.label}</span>
            {
                field.type === "textarea"
                    ? <textarea rows={field.rows || 6} {...common}/>
                    : <input type={field.type || "text"} {...common}/>
            }
        </label>
    )
}

const ImagePicker = ({current, file, onPick, label = "Rasm tanlang"}) => {
    const ref = useRef()
    const preview = file ? URL.createObjectURL(file) : resolveImg(current)
    return (
        <>
            <input ref={ref} type="file" accept="image/*" style={{display: "none"}}
                   onChange={(e) => e.target.files[0] && onPick(e.target.files[0])}/>
            <div className="siteImage" onClick={() => ref.current.click()}>
                {preview ? <img src={preview} alt=""/> : <span>{label}</span>}
            </div>
        </>
    )
}

export const Hero = () => {
    const [form, setForm] = useState({title: "", text: ""})
    const [image, setImage] = useState(null)
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState("")

    const load = () => api("gennis/website/hero").then(res => {
        setForm({title: res.title || "", text: res.text || ""})
        setImage(res.image)
    }).catch(() => setStatus("Yuklab bo'lmadi"))

    useEffect(() => {
        load()
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault()
        setStatus("Saqlanmoqda...")
        try {
            await api("gennis/website/hero", "PUT", form)
            if (file) {
                const fd = new FormData()
                fd.append("file", file)
                await api("gennis/website/hero/image", "POST", fd, false)
                setFile(null)
            }
            await load()
            setStatus("Saqlandi")
        } catch (err) {
            setStatus("Xatolik: saqlab bo'lmadi")
        }
    }

    return (
        <div className="siteSection">
            <div className="siteSection__header"><h1>Bosh sahifa (hero)</h1></div>
            <form className="siteForm" onSubmit={onSubmit}>
                <ImagePicker current={image} file={file} onPick={setFile} label="Fon rasmini tanlang"/>
                <Field field={{label: "Sarlavha"}} value={form.title} onChange={v => setForm(f => ({...f, title: v}))}/>
                <Field field={{label: "Matn", type: "textarea", rows: 8}} value={form.text}
                       onChange={v => setForm(f => ({...f, text: v}))}/>
                <div className="siteForm__actions">
                    <button className="addBtn" type="submit">Saqlash</button>
                    <span className="siteForm__status">{status}</span>
                </div>
            </form>
        </div>
    )
}

export const VideoBlock = () => {
    const [form, setForm] = useState({title: "", text: "", url: ""})
    const [status, setStatus] = useState("")

    useEffect(() => {
        api("gennis/website/video")
            .then(res => setForm({title: res.title || "", text: res.text || "", url: res.url || ""}))
            .catch(() => setStatus("Yuklab bo'lmadi"))
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault()
        setStatus("Saqlanmoqda...")
        try {
            await api("gennis/website/video", "PUT", form)
            setStatus("Saqlandi")
        } catch (err) {
            setStatus("Xatolik: saqlab bo'lmadi")
        }
    }

    return (
        <div className="siteSection">
            <div className="siteSection__header"><h1>Video bo'limi</h1></div>
            <form className="siteForm" onSubmit={onSubmit}>
                <Field field={{label: "Sarlavha"}} value={form.title} onChange={v => setForm(f => ({...f, title: v}))}/>
                <Field field={{label: "YouTube havolasi"}} value={form.url} onChange={v => setForm(f => ({...f, url: v}))}/>
                <Field field={{label: "Matn", type: "textarea", rows: 8}} value={form.text}
                       onChange={v => setForm(f => ({...f, text: v}))}/>
                <div className="siteForm__actions">
                    <button className="addBtn" type="submit">Saqlash</button>
                    <span className="siteForm__status">{status}</span>
                </div>
            </form>
        </div>
    )
}

export const CrudSection = ({title, path, fields, imageSuffix, listFn, summary, canAdd = true}) => {
    const [items, setItems] = useState([])
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({})
    const [file, setFile] = useState(null)
    const [error, setError] = useState("")

    const load = () => (listFn ? listFn() : api(path)).then(setItems).catch(() => setError("Yuklab bo'lmadi"))

    useEffect(() => {
        load()
    }, [path])

    const open = (item) => {
        setError("")
        setFile(null)
        setForm(item ? {...item} : {})
        setEditing(item || {})
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const body = {}
        fields.forEach(f => {
            const v = form[f.name]
            body[f.name] = v === "" ? null : v
        })
        try {
            const row = editing.id
                ? await api(`${path}/${editing.id}`, "PATCH", body)
                : await api(path, "POST", body)
            if (file && imageSuffix) {
                const fd = new FormData()
                fd.append("file", file)
                await api(`${path}/${row.id}/${imageSuffix}`, "POST", fd, false)
            }
            setEditing(null)
            load()
        } catch (err) {
            setError("Saqlab bo'lmadi. Maydonlarni tekshiring")
        }
    }

    const remove = async (item) => {
        if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return
        await api(`${path}/${item.id}`, "DELETE").catch(() => {})
        load()
    }

    return (
        <div className="siteSection">
            <div className="siteSection__header">
                <h1>{title}</h1>
                {canAdd && <button className="addBtn" onClick={() => open(null)}>
                    <i className="fas fa-plus"/> Yangi qo'shish
                </button>}
            </div>
            {error && !editing ? <div className="siteForm__status">{error}</div> : null}
            <div className="siteList">
                {items.map(item => (
                    <div className="siteList__item" key={item.id}>
                        {imageSuffix && (item.image || item.photo) ?
                            <img src={resolveImg(item.image || item.photo)} alt=""/> : null}
                        <div className="siteList__info">{summary(item)}</div>
                        <div className="siteList__actions">
                            <i className="fas fa-edit" onClick={() => open(item)}/>
                            <i className="fas fa-times" onClick={() => remove(item)}/>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <div className="siteList__empty">Hozircha hech narsa yo'q</div>}
            </div>
            <Modal activeModal={!!editing} setActiveModal={(v) => !v && setEditing(null)}>
                <div className="edit">
                    <form className="siteForm siteForm--modal" onSubmit={onSubmit}>
                        {imageSuffix && <ImagePicker current={form.image || form.photo} file={file} onPick={setFile}/>}
                        {fields.map(f => (
                            <Field key={f.name} field={f} value={form[f.name]}
                                   onChange={v => setForm(cur => ({...cur, [f.name]: v}))}/>
                        ))}
                        {error && <div className="siteForm__status">{error}</div>}
                        <button className="addBtn" type="submit">Saqlash</button>
                    </form>
                </div>
            </Modal>
        </div>
    )
}

export const Branches = () => (
    <CrudSection
        title="Filiallar"
        path="gennis/website/branches"
        fields={[
            {name: "name", label: "Filial nomi", required: true},
            {name: "phone", label: "Telefon", placeholder: "+998 90 123 45 67"},
            {name: "address", label: "To'liq manzil (ko'cha, uy)"},
            {name: "map_url", label: "Xarita havolasi (Google Maps 'Embed a map' src)"},
            {name: "display_order", label: "Tartib raqami", type: "number"}
        ]}
        summary={item => <><b>{item.name}</b><span>{item.phone || "telefon yo'q"}</span><span>{item.address || "manzil yo'q"}</span></>}
    />
)

export const SocialLinks = () => (
    <CrudSection
        title="Ijtimoiy tarmoqlar"
        path="gennis/website/social-links"
        fields={[
            {name: "platform", label: "Tarmoq (telegram, instagram, youtube, facebook)", required: true},
            {name: "url", label: "Havola (https://...)", required: true},
            {name: "display_order", label: "Tartib raqami", type: "number"}
        ]}
        summary={item => <><b>{item.platform}</b><span>{item.url}</span></>}
    />
)

export const Courses = () => (
    <CrudSection
        title="Kurslar"
        path="gennis/website/courses"
        imageSuffix="image"
        fields={[
            {name: "title", label: "Kurs nomi", required: true},
            {name: "description", label: "Tavsif", type: "textarea"},
            {name: "display_order", label: "Tartib raqami", type: "number"}
        ]}
        summary={item => <><b>{item.title}</b><span>{item.description}</span></>}
    />
)

export const Teachers = () => (
    <CrudSection
        title="O'qituvchilar"
        path="gennis/website/teachers"
        imageSuffix="photo"
        listFn={() => fetch(`${V2BackUrl}gennis/website/home`).then(r => r.json()).then(r => r.teachers)}
        fields={[
            {name: "name", label: "Ism familiya", required: true},
            {name: "subject_display", label: "Fan"},
            {name: "bio", label: "Tarjimai hol / tajriba", type: "textarea", rows: 8},
            {name: "telegram", label: "Telegram havolasi"},
            {name: "instagram", label: "Instagram havolasi"},
            {name: "facebook", label: "Facebook havolasi"},
            {name: "display_order", label: "Tartib raqami", type: "number"}
        ]}
        summary={item => <><b>{item.name}</b><span>{item.subject_display}</span></>}
    />
)
