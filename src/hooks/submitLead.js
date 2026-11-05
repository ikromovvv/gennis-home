import {V2BackUrl} from "constants/global";

// Public registration forms all post here (v2 owns leads now). The forms'
// "location_id" select actually carries the website branch id.
export const submitLead = (data, courseId = null) =>
    fetch(`${V2BackUrl}gennis/website/lead`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            branch_id: data.location_id ? Number(data.location_id) : null,
            course_id: courseId
        })
    }).then(async res => {
        if (res.ok) return {success: true, msg: "Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz!"}
        const err = await res.json().catch(() => null)
        const detail = typeof err?.detail === "string" ? err.detail : "Xatolik yuz berdi. Qayta urinib ko'ring"
        return {success: false, msg: detail}
    }).catch(() => ({success: false, msg: "Server bilan aloqa yo'q. Keyinroq urinib ko'ring"}))
