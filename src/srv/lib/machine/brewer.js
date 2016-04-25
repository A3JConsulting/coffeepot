"use strict";

let StateMachine = require('javascript-state-machine');
let socket = require('../socket.js')

const {
  WEIGHT_OF_EMPTY_BREWER_WITH_POT,
  WEIGHT_OF_POT,
  CUP_WEIGHT,
  MINIMUM_BREW
} = require('./constants')

var Brewer = function() {
  this.cups = 0;
  this.left = 0;
  this.right = 0;
}

StateMachine.create({
  initial: 'brewing', // Ska förmodligen vara 'idle' tänker jag
  target: Brewer.prototype,
  error: (eventName, from, to, args, errorCode, errorMessage) => {
    console.log(eventName, from, to, args, errorCode, errorMessage)
  },
  events: [
    { name: 'PotWasRemoved',       from: ['idle', 'brewing'],               to: 'filter_or_pot_removed' },
    { name: 'PotWasReplaced',      from: ['filter_or_pot_removed', 'idle'], to: 'idle' },
    { name: 'BrewingWasInitiated', from: 'idle',                            to: 'brewing' },
    { name: 'BrewingWasResumed',   from: 'filter_or_pot_removed',           to: 'brewing' },
    { name: 'BrewingWasCompleted', from: 'brewing',                         to: 'idle' },
  ],
  callbacks: {
    onPotWasRemoved: function() {
      this.sendState('onPotWasRemoved', false)
    },
    onPotWasReplaced: function() {
      this.sendState('onPotWasReplaced', true)
    },
    onBrewingWasInitiated: function() {
      this.sendState('onBrewingWasInitiated', true)
    },
    onBrewingWasResumed: function() {
      this.sendState('onBrewingWasResumed', true)
    },
    onBrewingWasCompleted: function() {
      this.sendState('onBrewingWasCompleted', true)
    },

  }
});

/**
 * On each state transition, send new state and the event that
 * accured through the socket
 */
Brewer.prototype.sendState = function(event, sendCups) {
  const oldAmount = this.cups
  const newAmount = this.calculateCups()
  this.updateCups()

  if (event) {
    return socket.broadcast(JSON.stringify({
      state: this.current,
      cups: (sendCups) ? Math.floor(newAmount) : Math.floor(oldAmount),
      event: event,
    }))
  }
  /**
   * If no event occured, and the cups value has changed, and the
   * sendCups arg evaluates to true - send the new state through the socket
   */
  if (Math.floor(newAmount) !== Math.floor(oldAmount) && sendCups) {
    socket.broadcast(JSON.stringify({
      state: this.current,
      cups: Math.floor(newAmount),
      event: null,
    }))
  }
}

/**
 * Kolla när antalet färdiga koppar mer än maxantalet
 * (givet vikten, minus en halv kopp)
 */
Brewer.prototype.assertBrewingWasCompleted = function(buffer, left, right) {
  return this.calculateCups() > this.maxCups() - 0.5
}

Brewer.prototype.assertPotWasRemoved = function(buffer, left, right) {
  return (left + right) < WEIGHT_OF_EMPTY_BREWER_WITH_POT
}

Brewer.prototype.assertBrewingWasResumed = function(buffer, left, right) {
  return false // TODO: implement
}

Brewer.prototype.assertPotWasReplaced = function(buffer, left, right) {
  if (left + right > (WEIGHT_OF_EMPTY_BREWER_WITH_POT - 20)
    && left + right < WEIGHT_OF_EMPTY_BREWER_WITH_POT + 20) {
    return true
  }
  return false
}

Brewer.prototype.assertBrewingWasInitiated = function(buffer, left, right) {
  return false // TODO: implement
}

Brewer.prototype.setWeights = function(left, right) {
  this.left = left
  this.right = right
}

Brewer.prototype.updateCups = function() {
  this.cups = this.calculateCups()
}

Brewer.prototype.calculateCups = function() {
  return this.right / CUP_WEIGHT // TODO: implementera på riktigt
}

Brewer.prototype.maxCups = function() {
  return (this.left + this.right - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}


module.exports = Brewer
