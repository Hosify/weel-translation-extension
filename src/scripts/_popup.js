import UI from './libs/UI.js'
import * as doms from './libs/doms-popup.js'
import * as fn from './libs/functions.js'
import { speech } from './libs/synth.js'
import {
  TRANSLATE_QUERY_DONE,
} from './libs/actions.js'

const port = chrome.runtime.connect({ name: 'Connecting From Popup Panel' })

UI.q('.wave.-js').register('wave')('click')
UI.q('.drawer-menu.-js').register('drawer')('click', ev => {
  doms.container.setAttribute('data-unique-ui', 'drawer')
  doms.mask.classList.add('_on')
})
UI.q('.mask.-js').register('mask')('click', ev => {
  doms.container.setAttribute('data-unique-ui', '')
  doms.mask.classList.remove('_on')
})
UI.q('.mark.-js').register('mark')('click', ev => ev.currentTarget.classList.toggle('_on'))
UI.q('.select.-js').register('select')('click')
UI.q('.language .-swap.-js').register('lang_swap')('click')
UI.q('.input-stream .textarea.-js').register('textarea')('keyup')

const translate = doms.container.querySelector('.translate.-js')
translate.addEventListener('click', do_translate, false)

const voice = doms.ostream.querySelector('.-phonetic button.voice.-js')
voice.addEventListener('click', ev => {
  const text = doms.istream.querySelector('.textarea.-js').innerText
  console.log(text)
  speech(text)
}, false)

function do_translate(ev) {
  const stream = doms.istream

  port.postMessage({
    type: 'TRANSLATE',
    meta: {
      from: 'popup',
    },
    payload: {
      q: stream.querySelector('.textarea.-js').innerText || 'translate',
      source: stream.querySelector('.language .-origin').getAttribute('data-value'),
      target: stream.querySelector('.language .-destination').getAttribute('data-value'),
    },
  })
}

port.onMessage.addListener(data => {
  const { type, payload = {} } = data
  console.log(payload)
  switch (type) {
  case TRANSLATE_QUERY_DONE:
    const { explains, phonetic, translation } = payload

    doms.ostream.querySelectorAll('._on')
      .forEach(elem => elem.classList.remove('_on'))

    const $result = doms.ostream.querySelector('.result')
    const [$phonetic, $explains] = [
      $result.querySelector('.-word .-phonetic'),
      $result.querySelector('.-word .-explain'),
    ]

    if (phonetic[0]) {
      $phonetic.querySelector('.-plain').innerText = phonetic[0]
      $phonetic.classList.add('_on')
    }

    $explains.querySelector('.-plain').innerText = translation.join(', ')

    if (explains) {
      $explains.querySelector('.-detail').innerHTML = explains.join('<br>')
      $explains.classList.add('_on')
    }

    $result.classList.add('_on')

    break
  default:

  }
})

UI.q('.drawer .link-list > a.item').register('page_link')('click', ev => {
  ev.preventDefault()
  ev.stopPropagation()

  const target = ev.currentTarget
  const link = target.href

  doms.container.setAttribute('data-unique-ui', '')
  UI.q('.mask.-js').off()

  return router(link)
})

function router(link) {
  const match = /.+\/(([\w\d\-\_]+)\.html)$/.exec(link)
  const page = match[1]
  const page_name = match[2]

  const page_showed = doms.content.querySelector('.page._on')
  const page_ready = doms.content.querySelector(`.page.-${page_name}`)

  if (page_ready) {
    page_ready.classList.add('_on')
  } else {
    const new_page = page(link)
    new_page.classList.add('_on')
  }

  if (page_showed !== page_ready) page_showed.classList.remove('_on')
}

function page(link, sync = false) {}

document.body.addEventListener('click', ev => {
  UI.q('.select.-js').off()

  // browser.storage.sync.get(null)
  // .then(res => console.log(res))
  // browser.runtime.sendMessage({
  //   greeting: "Greeting from the content script",
  // })
}, false)
