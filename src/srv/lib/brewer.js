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
  BREWING,
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
    { name: 'PotWasRemoved',       from: [IDLE, BREWING],                 to: FILTER_OR_POT_REMOVED },
    { name: 'PotWasReplaced',      from: FILTER_OR_POT_REMOVED,           to: IDLE },
    { name: 'BrewingWasInitiated', from: IDLE,                            to: BREWING },
    { name: 'BrewingWasResumed',   from: FILTER_OR_POT_REMOVED,           to: BREWING },
    { name: 'BrewingWasCompleted', from: BREWING,                         to: IDLE },
  ],
  callbacks: {
    onPotWasRemoved: function() {
      // this.logTransition('onPotWasRemoved')
      this.sendState('onPotWasRemoved', false)
    },
    onPotWasReplaced: function() {
      // this.logTransition('onPotWasReplaced')
      this.sendState('onPotWasReplaced', true)
    },
    onBrewingWasInitiated: function() {
      // this.logTransition('onBrewingWasInitiated')
      this.sendState('onBrewingWasInitiated', true)
    },
    onBrewingWasResumed: function() {
      // this.logTransition('onBrewingWasResumed')
      this.sendState('onBrewingWasResumed', true)
    },
    onBrewingWasCompleted: function() {
      setTimeout(() => {
        this.sendState('onBrewingWasCompleted', true)
      }, 2000)
      // this.logTransition('onBrewingWasCompleted')
      this.sendStatePreview('onBrewingWasCompleted', true)
    },

  }
});

Brewer.prototype.logTransition = function(transition) {
  console.log('\x1b[32m%s\x1b[0m', transition);
}

Brewer.prototype.sendStatePreview = function(event, sendCups) {
  console.log('[HUPP!] Förvarning om nybryggt kaffe! Bra eller dåligt? (Man behöver sannolikt servera kaffe till andra...)')
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
  // TODO: gör en funktion som fungerar oavsett om state är IDLE/BREWING
  // Egentligen är det kanske inte nödvändigt att kunna räkna ut antal koppar
  // när state är BREWING, eftersom frontend ändå inte visar ut antal koppar
  // under bryggning...?
  //
  return ((this.left + this.right) - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}

Brewer.prototype.maxCups = function() {
  return (this.left + this.right - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}

/**
 * Kolla när antalet färdiga koppar mer än maxantalet
 * (givet vikten, minus en kvarts kopp)
 * @return boolean
 */
Brewer.prototype.assertBrewingWasCompleted = function(buffer, currentFrame) {
  // return false
  // TODO: alternativt så kollar man om vikten har stabiliserat sig över tid
  // vilket borde indikera att det bryggt klart
  const ERROR_MARGIN = 0.25
  console.log('FOOBAR',this.calculateCups());
  return this.calculateCups() > (this.maxCups() - ERROR_MARGIN)
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
  if (this.current === BREWING) {
    // Om bryggning pågår, och vikten minskar "mycket"...
    const earlierFrame = milliSecondsAgo(buffer, 1500)
    return (earlierFrame.left + earlierFrame.right) > (left + right + WEIGHT_OF_POT + 50)
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
  return this.weightIsMoreThanEmptyBrewer(left, right)
    // && currentFrame.previousState === IDLE
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
  const ERROR_MARGIN = 50 // grams
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

  return analysedBuffer.leftToRightFlows > 5
}

module.exports = Brewer
