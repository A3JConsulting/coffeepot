'use strict'
const hx711 = require('hx711')
const filter = require('./filter')

const EventEmitter = require('events').EventEmitter
const Rx = require('rx')
const guessNextState = require('./guess')
const weightsEmitter = new EventEmitter()

const INPUT_TICK_INTERVAL = 500 // milliseconds
const BUFFER_TIME = 10 // seconds
const STREAM_BUFFER_LENGTH = (BUFFER_TIME * 1000) / INPUT_TICK_INTERVAL // ticks

let brewer = new (require('./machine/brewer'));

const initialState = {
  state: 'idle',
  left: 0,
  right: 0,
}

let weightStream$ = Rx.Observable
  .fromEvent(weightsEmitter, 'weights', (left, right) => {
    return {left: left, right: right}
  })
  .filter(x => x) // TODO: bort med signalbrus
  .reduce((buffer, current) => {
    logCurrentState(brewer)
    logLastFrame(buffer)
    brewer.setWeights(current.left, current.right)
    const nextState = guessNextState(buffer, current, brewer)
    return appendToBuffer(buffer, nextState)
  }, [initialState])
  .subscribe(x => console.log('Done.'));

function appendToBuffer(buffer, newState) {
  if (buffer.length < STREAM_BUFFER_LENGTH) {
    return [...buffer, newState]
  } else {
    const lastItems = buffer.slice(Math.max(buffer.length - STREAM_BUFFER_LENGTH -1, 1))
    return [...lastItems, newState]
  }
}

function getPreviousFrame(buffer) {
  return buffer[buffer.length -1] || null
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

module.exports = function poll() {
  setInterval(function() {
    const values = filter(hx711.getValues())
    weightsEmitter.emit('weights', values.left, values.right)

  }, INPUT_TICK_INTERVAL)

}
