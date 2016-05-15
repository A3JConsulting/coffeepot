'use strict'
const filter = require('./filter')
const {Observable} = require('rx')
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

const testStream = (function() {
  return JSON.parse(require('fs').readFileSync(`${__dirname}/data.json`).toString())
})()

let i = 0
const getTick = () => {
  const tick = testStream[i]
  i++
  return tick
}
const weight = debug => debug ? getTick() : filter(require('hx711').getValues())
const initialState = [{ previousState: null, state: IDLE, left: 0, right: 0 }]

module.exports = function poll(debug = false) {
  Observable
    .interval(INPUT_TICK_INTERVAL)
    .map(tick => weight(debug))
    .filter(x => x)
    .scan((buffer, current) => {
      brewer.setWeights(current.left, current.right)
      const nextState = guessNextState(buffer, current, brewer)
      return appendToBuffer(buffer, nextState)
    }, initialState)
    .subscribe(
      buffer => {
        console.log()
        logCurrentState(brewer)
        logLastFrame(buffer)
        console.log('Cups:', Math.round(brewer.calculateCups()))
      },
      err => console.error(err),
      () => console.log('Done.')
    )
}
