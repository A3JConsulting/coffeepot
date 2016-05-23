'use strict'
const filter = require('./filter')
const {Observable} = require('rx')
const guessNextState = require('./guess')
const {appendToBuffer, logCurrentState, logLastFrame, handleState} = require('./system')
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

module.exports = function main(debug = false) {
  Observable
    .interval(INPUT_TICK_INTERVAL)
    .map(tick => weight(debug))
    .filter(x => x)
    .scan((buffer, current) => {
      return handleState(buffer, current, brewer)
    }, INITIAL_STATE)
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
