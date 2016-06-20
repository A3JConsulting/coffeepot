'use strict'
const filter = require('./filter')
const {Observable} = require('rx')
const guessNextState = require('./guess')
const {appendToBuffer, logCurrentState, logLastFrame, handleState} = require('./system')
const {INPUT_TICK_INTERVAL, INITIAL_STATE} = require('./constants')
Number.prototype.between = function(min, max) {
  return this > min && this < max
}

const testStream = (function() {
  return require('./data.json')
})()

let i = 0
const getTick = () => {
  const tick = testStream[i]
  i++
  return tick
}

const weight = debug => debug ? getTick() : filter(require('hx711').getValues())
let brewer = new (require('./brewer'))

const calcAvg = buffer => {
  return {
    left: buffer.reduce((a, b) => a + b.left, 0) / buffer.length,
    right: buffer.reduce((a, b) => a + b.right, 0) / buffer.length
  }
}

module.exports = function main(debug = false) {
  Observable
    .interval(INPUT_TICK_INTERVAL)
    .map(tick => {
      return weight(debug)
    })
    .bufferWithCount(3, 1)
    .map(calcAvg)
    .scan((buffer, current) => {
      return handleState(buffer, current, brewer)
    }, INITIAL_STATE)
    .subscribe(
      buffer => {
        logCurrentState(brewer)
        logLastFrame(buffer)
        console.log('Cups:', Math.round(brewer.calculateCups()))
      },
      err => console.error(err),
      () => console.log('Done.')
    )
}
