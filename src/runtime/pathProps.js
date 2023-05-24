import { isBoolean } from '../utils'
const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/
export function pathProps(oldProps, newProps, el) {
    if (oldProps === newProps) return
    oldProps = oldProps || {};
    newProps = newProps || {};
    for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        pathDomProps(prev, next, key, el)
    }
    for (const key in oldProps) {
        if (newProps[key] == null) {
            pathDomProps(oldProps[key], null, key, el)
        }
    }
}
function pathDomProps(prev, next, key, el) {
    switch (key) {
        case 'class':
            el.className = next || ''
            break;
        case 'style':
            for (const styleName in next) {
                el.style[styleName] = next[styleName]
            }
            if (prev) {
                for (const styleName in prev) {
                    if (next[styleName] == null) {
                        el.style[styleName] = ''
                    }
                }
            }
            break;

        default:
            if (/^on[^a-z]/.test(key)) {
                const eventName = key.slice(2).toLowerCase()
                if (prev) {
                    el.removeEventListener(eventName, prev)
                }
                if (next) {
                    el.addEventListener(eventName, next)
                }

            } else if (domPropsRE.test(key)) {
                if (next === '' && isBoolean(el[key])) {
                    next = true
                }
                el[key] = next
            } else {
                if (next == null || next === false) {
                    el.removeAttribute(key)
                } else {
                    el.setAttribute(key, next)
                }

            }
            break;
    }
}