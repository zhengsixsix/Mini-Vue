import { ShapeFlags } from './vnode'
import { pathProps } from './pathProps'
export function render(vnode, container) { // 由于h函数已经加了shapeFlag的标识 vnode里面就是元素的各个信息 container就是元素
    const prevVnode = container._vnode
    if (!vnode) {
        unmount(prevVnode)
    } else {
        patch(prevVnode, vnode, container)
    }
    container._vnode = vnode
}
function unmount(vnode) {
    const { shapeFlag, el } = vnode
    if (shapeFlag & ShapeFlags.COMPONENT) {
        unmountComponent(vnode)
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        unmountFragment(vnode)
    } else {
        el.parentNode.removeChild(el)
    }
}
function unmountComponent(vnode) { }
function unmountFragment(vnode) {
    const { el: cur, anchor: end } = vnode
    const { parentNode } = cur
    while (cur !== end) {
        let next = cur.nextSibling
        parentNode.removeChild(cur)
        cur = next
    }
}
function patch(n1, n2, container, anchor) {
    if (n1 && isSameVNode(n1, n2)) {
        anchor = (n1.anchor || n1.el).nextSibling
        unmount(n1)
        n1 = null
    }
    const { shapeFlag } = n2
    if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(n1, n2, container, anchor)
    } else if (shapeFlag & ShapeFlags.TEXT) {
        processText(n1, n2, container)
    } else if (shapeFlag & ShapeFlags.FRAGMENT) {
        processFragment(n1, n2, container, anchor)
    } else {
        processElement(n1, n2, container, anchor)
    }
}
function isSameVNode(n1, n2) {
    return n1.type === n2.type
}
function processElement(n1, n2, container, anchor) {
    if (n1) {
        pathElement(n1, n2)
    } else {
        mountElement(n2, container, anchor);
    }
}
function processFragment(n1, n2, container, anchor) {
    const fragmentStartAnchor = n2.el = n1 ? n2.el : document.createTextNode('')
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : document.createTextNode('')
    if (n1) {
        patchChildren(n1, n2, container, fragmentEndAnchor)
    } else {
        // container.appendChild(fragmentStartAnchor)
        container.insertBefore(fragmentStartAnchor, anchor)
        // container.appendChild(fragmentEndAnchor)
        container.insertBefore(fragmentEndAnchor, anchor)
        mountChildren(n2.children, container, fragmentEndAnchor, anchor)
    }
}
function processText(n1, n2, container, anchor) {
    if (n1) {
        n2.el = n1.el
        n1.el.textContent = n2.children
    } else {
        mountTextNode(n2, container, anchor);
    }
}
function processComponent(n1, n2, container, anchor) { }

function mountTextNode(vnode, container, anchor) {
    const textNode = document.createTextNode(vnode.children)
    // container.appendChild(textNode)
    container.insertBefore(textNode, anchor)
    vnode.el = textNode
}

function mountElement(vnode, container, anchor) { // props 就是传过来的第二个参数 
    const { type, props, shapeFlag, children } = vnode
    const el = document.createElement(type)
    pathProps(null, props, el)
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        mountTextNode(vnode, el)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el)
    }
    // container.appendChild(el)
    container.insertBefore(el, anchor)
    vnode.el = el
}
function mountChildren(children, container, anchor) {
    children.forEach(child => {
        patch(null, child, container, anchor)
    });
}
function pathElement(n1, n2) {
    n2.el = n1.el
    pathProps(n1.props, n2.props, n2.el)
    patchChildren(n1, n2, n2.el)
}
function unmountChildren(children) {
    children.forEach(child => unmount(child))
}
function patchChildren(n1, n2, container, anchor) {
    const { shapeFlag: prevShapeFlag, children: c1 } = n1
    const { shapeFlag, children: c2 } = n2
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            unmountChildren(c1)
        }
        if (c1 !== c2) {
            container.textContent = c2.textContent
        }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            container.textContent = ''
            mountChildren(c2, container, anchor)

        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            patchArrayChildren(c1, c2, container, anchor)

        } else {
            mountChildren(c2, container, anchor)
        }
    } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            container.textContent = ''
        } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(c2, container)
        }
    }
}
function patchArrayChildren(c1, c2, container, anchor) {
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    for (let i = 0; i < commonLength; i++) {
        patch(c1[i], c2[i], container, anchor)
    }
    if (oldLength > newLength) {
        unmountChildren(c1.slice(commonLength))
    } else if (oldLength < newLength) {
        mountChildren(c2.slice(commonLength), container, anchor)
    }
}
