const { render } = require('../')
const test = require('tape')
const p = require('parse-element')
const { create: s } = require('brisky-struct')
const bs = require('stamp')

test('parent', t => {
  const state = s({ first: true })
  const app = render({
    first: {
      tag: 'h1',
      $: 'first'
    }
  }, state)
  t.equal(p(app), '<div><h1></h1></div>', 'correct initial html')
  state.first.set(null)
  t.equal(p(app), '<div></div>', 'removed node')
  t.end()
})

test('parent - error', t => {
  var tree
  const state = s({})
  render({
    first: {
      tag: 'h1',
      text: { $: 'first' }
    }
  }, state, (s, t) => {
    tree = t
  })
  for (let key in tree._) {
    delete tree._[key]
  }
  try {
    state.set({ first: 'hello' })
  } catch (e) {
    bs.inProgress = false // clear this in bs
    t.ok(true, 'throws error when no parent')
    t.end()
  }
})
