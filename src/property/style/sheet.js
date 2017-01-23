import { getClass } from '../../get'

var inProgress

const globalSheet = {
  map: {},
  count: 0
}

class StyleSheet {
  constructor (t) {
    this.sheet = ''
    this.map = {}
    this.mediaMap = { count: 0 }
    this.parsed = false
    t.stylesheet = this
  }
  parse () {
    var str = this.sheet
    const mediaMap = this.mediaMap
    var media = ''
    for (let key in mediaMap) {
      if (key !== 'count') {
        media += ` ${key} {`
        for (let style in mediaMap[key]) {
          if (style !== 'count' && style !== 'id') {
            media += ` .${mediaMap[key][style]} {${style};}`
          }
        }
        media += ' }'
      }
    }
    // replace media
    if (media) str += ' ' + media
    return str + ' '
  }
  init (node) {
    const style = document.createElement('style')
    style.innerHTML = this.parse()
    node.appendChild(style)
    this.parsed = style
  }
  update () {
    this.parsed.innerHTML = this.parse()
  }
}

const isNotEmpty = store => {
  for (let i in store) { return true }
}

const toDash = key => key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const uid = num => {
  const div = num / 26 | 0
  var str = String.fromCharCode(97 + num % 26)
  if (div) {
    if (div / 26 | 0) {
      str = str + uid(div)
    } else {
      str = str + String.fromCharCode(97 + div % 26)
    }
  }
  return str
}

const setStyle = (t, store, elem) => {
  var className = ''
  const style = elem.stylesheet || new StyleSheet(elem)
  const map = style.map
  const mediaMap = style.mediaMap
  for (let key in store) {
    if (key.indexOf('@media') === 0) {
      if (!mediaMap[key]) mediaMap[key] = { id: ++mediaMap.count, count: 0 }
      const mmap = mediaMap[key]
      const parsed = t.get(key).serialize()
      for (let style in parsed) {
        let s = toDash(style) + ':' + parsed[style]
        if (!mmap[s]) mmap[s] = uid(mmap.count++) + mmap.id
        className += ` ${mmap[s]}`
      }
    } else {
      // prefix (and multiply for server)
      let s = toDash(key) + ':' + store[key]
      if (!map[s]) {
        if (!globalSheet.map[s]) globalSheet.map[s] = uid(globalSheet.count++)
        const rule = globalSheet.map[s]
        map[s] = rule
        style.sheet += ` .${rule} {${s};}`
      }
      className += ' ' + map[s]
    }
  }
  if (style.parsed) {
    style.update()
  } else if (!inProgress) {
    style.init(elem.node)
  }
  return className
}

const setClass = (node, newStyle, style) => {
  if (style) {
    if (newStyle !== style) {
      node.className = node.className.replace(style, newStyle)
    }
  } else {
    node.className = (node.className || '') + newStyle
  }
  node.setAttribute('data-styletron', newStyle)
}

const sheet = {
  type: 'group',
  render: {
    state: () => {
      // need to add style later
      // console.error('???')
    },
    static (t, node, store) {
      const elem = inProgress || t.root()
      if (!getClass(t._p._p)) {
        if (isNotEmpty(store)) {
          node.className = setStyle(t, store, elem)
        }
      } else {
        const style = node.getAttribute('data-styletron')
        if (isNotEmpty(store)) {
          const newStyle = t._cachedNode = setStyle(t, store, elem)
          if (newStyle) {
            setClass(node, newStyle, style)
            return
          }
        }
        if (style) node.removeAttribute('data-styletron')
      }
    }
  }
}

const clear = () => {
  globalSheet.count = 0
  globalSheet.map = {}
}

const done = (elem, node) => {
  if (elem.stylesheet) elem.stylesheet.init(node)
  inProgress = void 0
}

const render = t => { inProgress = t }

export { sheet, clear, render, done }