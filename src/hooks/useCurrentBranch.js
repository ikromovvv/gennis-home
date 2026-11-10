import {useSelector} from "react-redux";

// xojakent.gennis.uz -> "xojakent". Bare gennis.uz, www, localhost, IPs -> null.
export const hostSlug = () => {
    const parts = window.location.hostname.split(".")
    if (parts.length < 3 || /^\d+$/.test(parts[parts.length - 1])) return null
    return parts[0] === "www" ? null : parts[0]
}

// The branch whose subdomain we are being served from (null on the main site).
export const useCurrentBranch = () => {
    const {locations} = useSelector(state => state.website)
    const slug = hostSlug()
    return slug ? locations.find(item => item.subdomain === slug) || null : null
}
