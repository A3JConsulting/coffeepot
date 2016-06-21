'use strict'
const filter = require('./filter')
const {Observable} = require('rx')
const {logCurrentState, logLastFrame, handleState} = require('./system')
const {INPUT_TICK_INTERVAL, INITIAL_STATE} = require('./constants')

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

const avgFilter = buffer => {
  const avg = (x, d) => x.reduce((a, b) => a + b[d], 0) / x.length
  return {
    left: avg(buffer, 'left'),
    right: avg(buffer, 'right'),
  }
}

module.exports = function main(debug = false) {
  Observable
    .interval(INPUT_TICK_INTERVAL)
    .map(tick => weight(debug))
    .bufferWithCount(4, 1)
    .map(avgFilter)
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
