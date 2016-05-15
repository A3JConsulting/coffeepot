'use strict'
const hx711 = require('hx711')
const filter = require('./filter')
const Observable = require('rx').Observable
const guessNextState = require('./guess')
const { INPUT_TICK_INTERVAL, BUFFER_TIME, IDLE } = require('./constants')
const STREAM_BUFFER_LENGTH = (BUFFER_TIME * 1000) / INPUT_TICK_INTERVAL // ticks
let brewer = new (require('./brewer'));

function appendToBuffer(buffer, newState) {
  if (buffer.length < STREAM_BUFFER_LENGTH) {
    return [...buffer, newState]
  } else {
    const lastItems = buffer.slice(Math.max(buffer.length - STREAM_BUFFER_LENGTH -1, 1))
    return [...lastItems, newState]
  }
}

function logCurrentState(brewer) {
  console.log('\x1b[33m%s\x1b[0m', brewer.current);
}

function logLastFrame(buffer, prop) {
  if (buffer.length === 0) return
  const last = buffer[buffer.length -1]
  if (prop) return console.log(last[prop])
  console.log(last)
}

const initialState = { previousState: null, state: IDLE, left: 0, right: 0 }

module.exports = function poll() {
  Observable
    .interval(INPUT_TICK_INTERVAL)
    .map(t => filter(hx711.getValues()))
    .filter(x => x)
    .scan((buffer, current) => {
      brewer.setWeights(current.left, current.right)
      const nextState = guessNextState(buffer, current, brewer)
      return appendToBuffer(buffer, nextState)
    }, [initialState])
    .subscribe(
      buffer => {
        logCurrentState(brewer)
        logLastFrame(buffer)
      },
      err => console.error(err),
      () => console.log('Done.')
    )
}
