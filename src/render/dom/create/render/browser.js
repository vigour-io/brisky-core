// TESTBROWSER!!!!???
import { get } from 'brisky-struct'
import fragment from './fragment'
import { property, element, isStatic, staticProps } from '../../../static'
import { cache, tag } from '../../../../get'

const injectable = {}

export default injectable

const hasStateProperties = t => {
  const keys = t.keys()
  if (keys) {
    let i = keys.length
    while (i--) {
      let check = get(t, keys[i])
      if (!check.isElement && !isStatic(check)) {
        return true
      }
    }
  }
}

injectable.static = t => {
  const cached = cache(t)
  var node
  if (cached && isStatic(t)) {
    node = cached.cloneNode(true)
    if (cached._index) {
      node._index = cached._index
    }
    if (cached._last) {
      node._last = cached._last
    }
  } else {
    if (cached) {
      node = cached.cloneNode(false)
      // need to get
      if (cached._propsStaticParsed) {
        node._propsStaticParsed = true
      }
    } else {
      const nodeType = tag(t)
      if (nodeType === 'fragment') {
        console.error('not handeling static fragments yet')
      } else {
        node = document.createElement(nodeType)
        property(t, node)
        t._cachedNode = node
      }
    }
    element(t, node)
  }
  return node
}

injectable.state = (t, type, subs, tree, id, pnode) => {
  const cached = cache(t)
  var node
  // @todo: this copies unwanted styles / props -- need to add an extra clonenode for this
  if (cached) {
    node = cached.cloneNode(false)
    tree._[id] = node
    if (cached._last) {
      node._last = cached._last
    }
    if (cached._index) {
      node._index = cached._index
    }
  } else {
    const nodeType = tag(t)
    if (nodeType === 'fragment') {
      return fragment(t, pnode, id, tree)
    } else {
      node = document.createElement(nodeType)
      const hasStaticProps = staticProps(t).length
      if (hasStaticProps) {
        t._cachedNode = node
        property(t, node)
        if (hasStateProperties(t)) {
          node = t._cachedNode.cloneNode(false)
        }
      }
    }
    tree._[id] = node
  }
  element(t, node)

  return node
}