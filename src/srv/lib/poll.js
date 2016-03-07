'use strict'

//REFACTOR ALL MOVES TO GLOBAL BIG NONO.

const EventEmitter = require('events').EventEmitter
const Rx = require('rx')
const guessNextState = require('./guess')
const weightsEmitter = new EventEmitter()

const INPUT_TICK_INTERVAL = 500 // milliseconds
const BUFFER_TIME = 10 // seconds
const STREAM_BUFFER_LENGTH = (BUFFER_TIME * 1000) / INPUT_TICK_INTERVAL // ticks

let brewer = new (require('./machine/brewer'))

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
  .subscribe(x => console.log('Done.'))

var stream = [
  { left: 2200, right: 600 }, // Bryggning pågår
  { left: 2100, right: 700 },
  { left: 2000, right: 800 },
  { left: 1900, right: 900 },
  { left: 1800, right: 1000 },
  { left: 1800, right: 1100 },
  { left: 1600, right: 1200 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 }, // Bryggning klar
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 1300 },
  { left: 1500, right: 99 }, // Någon tar bort kannan och häller upp en kopp
  { left: 1500, right: 99 },
  { left: 1500, right: 99 },
  { left: 1500, right: 99 },
  { left: 1500, right: 99 },
  { left: 1500, right: 99 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
  { left: 1500, right: 1100 },
]

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
  var tick = 0
  setInterval(function() {
    if(!stream[tick]){
      tick = 0;
    };
    weightsEmitter.emit('weights', stream[tick].left, stream[tick].right)
    tick++
  }, INPUT_TICK_INTERVAL)

}
