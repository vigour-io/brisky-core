const { render } = require('../')
const test = require('tape')
const p = require('parse-element')
const { create: s } = require('brisky-struct')

test('text', t => {
  const state = s({ text: 'some text' })
  t.equal(
    p(render({ text: 'hello' })),
    '<div>hello</div>',
    'static text'
  )

  const app = render(
    {
      types: {
        thing: {
          tag: 'p',
          state: {
            text: {
              $: 'text',
              $transform: (val) => typeof val === 'object' ? '' : `-${val}-`
            }
          },
          static: {
            text: 'static'
          }
        }
      },
      something: { type: 'thing' }
    },
    state
  )

  t.equal(
    p(app),
    '<div><p><div>-some text-</div><div>static</div></p></div>',
    'state and static text as a component'
  )

  state.text.set('other text')

  t.equal(
    p(app),
    '<div><p><div>-other text-</div><div>static</div></p></div>',
    'updated text'
  )

  state.text.set(null)

  t.equal(
    p(app),
    '<div><p><div></div><div>static</div></p></div>',
    'removed text'
  )

  t.end()
})

test('text - path subscription', t => {
  const state = s({
    first: { second: 'a' }
  })
  // add broken operator case and everything
  const app = render({
    text: { $: 'first.second' }
  }, state)

  t.equal(p(app), '<div>a</div>', 'correct html')
  state.first.set(null)
  t.equal(p(app), '<div></div>', 'removed text')
  t.end()
})

test('text - true subscription', t => {
  const state = s({
    first: { second: 'a' }
  })
  // add broken operator case and everything
  const app = render({
    $: 'first.second',
    text: { $: true }
  }, state)
  t.equal(p(app), '<div>a</div>', 'correct html')

  state.first.second.set(void 0)
  t.equal(p(app), '<div></div>', 'set text to void 0')

  state.first.set(null)
  t.equal(p(app), '<div></div>', 'removed text')
  t.end()
})

test('text - multiple', t => {
  const state = s({ title: 'hello' })
  const app = render([
    { type: 'text', val: '!' },
    { type: 'text', $: 'title' },
    { type: 'text', val: '!' }
  ], state)
  t.equal(p(app), '<div>!hello!</div>', 'reuse text type')
  t.end()
})
