"use strict";

let StateMachine = require('javascript-state-machine');
let socket = require('./socket.js')
const milliSecondsAgo = require('./system').milliSecondsAgo
const {
  WEIGHT_OF_EMPTY_BREWER_WITH_POT,
  WEIGHT_OF_POT,
  CUP_WEIGHT,
  MINIMUM_BREW,
  IDLE,
  PREPARED_FOR_BREWING,
  BREWING,
  BREWING_PAUSED,
  FILTER_OR_POT_REMOVED,
  INPUT_TICK_INTERVAL,
  BUFFER_TIME
} = require('./constants')

var Brewer = function() {
  this.cups = 0;
  this.left = 0;
  this.right = 0;
}

StateMachine.create({
  initial: IDLE,
  target: Brewer.prototype,
  error: (eventName, from, to, args, errorCode, errorMessage) => {
    console.error(eventName, from, to, args, errorCode, errorMessage)
  },
  events: [
    { name: 'BrewerWasFilledWithWater', from: [IDLE, FILTER_OR_POT_REMOVED],  to: PREPARED_FOR_BREWING },
    { name: 'BrewingWasHalted',         from: BREWING,                        to: BREWING_PAUSED },
    { name: 'PotWasRemoved',            from: IDLE,                           to: FILTER_OR_POT_REMOVED },
    { name: 'PotWasReplaced',           from: FILTER_OR_POT_REMOVED,          to: IDLE },
    { name: 'BrewingWasInitiated',      from: PREPARED_FOR_BREWING,           to: BREWING },
    { name: 'BrewingWasResumed',        from: BREWING_PAUSED,                 to: BREWING },
    { name: 'BrewingWasCompleted',      from: BREWING,                        to: IDLE },
  ],
  callbacks: {
    onPotWasRemoved: function() {
      this.logTransition('onPotWasRemoved')
      this.sendState('potWasRemoved', false)
    },
    onPotWasReplaced: function() {
      this.logTransition('onPotWasReplaced')
      this.sendState('potWasReplaced', true)
    },
    onBrewingWasInitiated: function() {
      this.logTransition('onBrewingWasInitiated')
      this.sendState('brewingWasInitiated', false)
    },
    onBrewingWasResumed: function() {
      this.logTransition('onBrewingWasResumed')
      this.sendState('brewingWasResumed', false)
    },
    onBrewingWasHalted: function() {
      this.logTransition('brewingWasHalted')
      this.sendState('brewingWasHalted', false)
    },
    onBrewerWasFilledWithWater: function() {
      this.logTransition('brewerWasFilledWithWater')
      this.sendState('brewerWasFilledWithWater', false)
    },
    onBrewingWasCompleted: function() {
      setTimeout(() => {
        this.sendState('brewingWasCompleted', true)
      }, 10000)
      this.logTransition('onBrewingWasCompleted')
      this.sendStatePreview('brewingWasCompleted', true)
    },

  }
});

Brewer.prototype.logTransition = function(transition) {
  console.log('\x1b[32m%s\x1b[0m', transition);
}

Brewer.prototype.sendStatePreview = function(event, sendCups) {
  console.log('Kaffet är klart.')
}

/**
 * On each state transition, send new state and the event that
 * occured through the socket
 */
Brewer.prototype.sendState = function(event, sendCups) {
  const oldAmount = this.cups
  const newAmount = this.calculateCups()
  this.updateCups()

  if (event) {
    return socket.broadcast(JSON.stringify({
      state: this.current,
      cups: (sendCups) ? Math.round(newAmount) : Math.round(oldAmount),
      event: event,
    }))
  }
  /**
   * If no event occured, and the cups value has changed, and the
   * sendCups arg evaluates to true - send the new state through the socket
   */
  if (Math.round(newAmount) !== Math.round(oldAmount) && sendCups) {
    socket.broadcast(JSON.stringify({
      state: this.current,
      cups: Math.round(newAmount),
      event: null,
    }))
  }
}

/**
 * @return void
 */
Brewer.prototype.setWeights = function(left, right) {
  this.left = left
  this.right = right
}

/**
 * @return int
 */
Brewer.prototype.getTotalWeight = function() {
  return this.left + this.right
}

/**
 * @return void
 */
Brewer.prototype.updateCups = function() {
  this.cups = this.calculateCups()
}

/**
 * @return void
 */
Brewer.prototype.calculateCups = function() {
  // total_cups
  // TODO: bryggningen kommer att detekteras som klar om den här funktionen inte
  // kan reda ut hur många koppar som är klara, den får inte vara samma som this.maxCups!!!
  // ELLER så kan man detektera att bryggning är klar på annat sätt, t ex om vikten stabiliserat sig
  // över tid
  return ((this.left + this.right) - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}

Brewer.prototype.maxCups = function() {
  return (this.left + this.right - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}

Brewer.prototype.assertBrewingWasHalted = function(buffer, currentFrame) {
  return false
  const { left, right } = currentFrame
  const earlierFrame = milliSecondsAgo(buffer, 1500)
  return (earlierFrame.left + earlierFrame.right) > (left + right + WEIGHT_OF_POT + 50)
}

/**
 * @return boolean
 */
Brewer.prototype.assertBrewingWasCompleted = function(buffer, currentFrame) {
  const weightFlowsToTheRight = (prev, curr, acc) => {
    return (prev.right < curr.right && prev.left > curr.left) ? acc + 1 : acc
  }

  const analysedBuffer = buffer.reduce(function(acc, currentFrame) {
    const previousFrame = acc.buffer[acc.buffer.length - 1]
    acc.leftToRightFlows = weightFlowsToTheRight(previousFrame, currentFrame, acc.leftToRightFlows)
    acc.buffer = [...acc.buffer, currentFrame]
    return acc
  }, { buffer: [buffer[0]], leftToRightFlows: 0 })

  return analysedBuffer.leftToRightFlows < 5
}

/**
 * If state is IDLE
 * AND
 * the weight is below the weight of the empty brewer and the pot
 *
 * OR
 *
 * If state is BREWING
 * AND
 * the weight, compared to X milliseconds ago, is "a lot" less
 * @return boolean
 */
Brewer.prototype.assertPotWasRemoved = function(buffer, currentFrame) {
  const { left, right } = currentFrame
  if (this.current === IDLE) {
    // Vikten är mindre än tom bryggare minus kannans vikt och lite marginal...
    return (left + right) < (WEIGHT_OF_EMPTY_BREWER_WITH_POT - 200)
  }
  return false // Avoid initial undefined answer
}

/**
 * Weight is more than empty brewer with pot removed
 * AND
 * the previous state was "IDLE"
 * @return boolean
 */
Brewer.prototype.assertPotWasReplaced = function(buffer, currentFrame) {
  const { left, right } = currentFrame
  return (left - right) < 600
    // this.weightIsMoreThanEmptyBrewer(left, right)
    //
    // Vänster minus höger är mindre än 620
    //

}

Brewer.prototype.assertBrewerWasFilledWithWater = function(buffer, currentFrame) {
  // Vänster minus höger är mer än X
  // i minst 3 frames i rad
  const WAIT_FOR_FRAMES = 5
  return buffer.reduce(function(acc, current) {
    const { left, right } = current
    const differenceIsMoreThan = n => (left-right) > n
    if (differenceIsMoreThan(1000)) return acc + 1
    return acc
  }, 0) > WAIT_FOR_FRAMES
}

/**
 * Previous state was "BREWING",
 * AND
 * current state is "FILTER_OR_POT_REMOVED"
 * AND
 * weight increased by more than the weigh of the pot, since X milliseconds ago
 * @return boolean
 */
Brewer.prototype.assertBrewingWasResumed = function(buffer, currentFrame) {
  const ERROR_MARGIN = 50
  return currentFrame.previousState === BREWING
    && currentFrame.state === FILTER_OR_POT_REMOVED
    && currentFrame.right > milliSecondsAgo(buffer, 2500).right + ERROR_MARGIN
}

/**
 * Total weight is more than the weight of an empty brewer including the pot
 * @return boolean
 */
Brewer.prototype.weightIsMoreThanEmptyBrewer = function(left, right)  {
  const ERROR_MARGIN = 10 // grams
  return (left + right) > (WEIGHT_OF_EMPTY_BREWER_WITH_POT - ERROR_MARGIN)
}

/**
 * Loop over the entire buffer:
 * If the weight has decreased on the left side
 * in at least X frames
 * AND
 * If the weight has increased on the right side
 * in at least X frames
 * AND
 * TODO: Not the inverse in any of the investigated frames
 * @return boolean
 */
Brewer.prototype.assertBrewingWasInitiated = function(buffer, currentFrame) {

  const weightFlowsToTheRight = (prev, curr, acc) => {
    return (prev.right < curr.right && prev.left > curr.left) ? acc + 1 : acc
  }

  const analysedBuffer = buffer.reduce(function(acc, currentFrame) {
    const previousFrame = acc.buffer[acc.buffer.length - 1]
    acc.leftToRightFlows = weightFlowsToTheRight(previousFrame, currentFrame, acc.leftToRightFlows)
    acc.buffer = [...acc.buffer, currentFrame]
    return acc
  }, { buffer: [buffer[0]], leftToRightFlows: 0 })

  return analysedBuffer.leftToRightFlows > 6
}

module.exports = Brewer
