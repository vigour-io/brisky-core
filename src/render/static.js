const isStatic = t => t.isStatic !== void 0
  ? t.isStatic
  : t.inherits && isStatic(t.inherits)

// optmize these things
const staticProps = t => t.staticProps ||
  (t.staticProps = t.filter(t => !t.isElement && isStatic(t)))

const staticElements = t => t.staticElements ||
  (t.staticElements = t.filter(t => t.isElement && isStatic(t)))

const property = (t, div, param) => {
  const props = staticProps(t)
  for (let i = 0, len = props.length; i < len; i++) {
    props[i].render.static(props[i], div, param)
  }
  return props
}

const element = (t, div) => {
  const elements = staticElements(t)
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].render.static(elements[i], div)
  }
  return elements
}

export { isStatic, staticProps, staticElements, property, element }
