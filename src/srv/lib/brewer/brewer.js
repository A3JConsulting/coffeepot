'use strict'
var StateMachine = require('../fsm/state-machine.min.js');
const {
  WEIGHT_OF_EMPTY_BREWER_WITH_POT,
  WEIGHT_OF_POT,
  CUP_WEIGHT,
  MINIMUM_BREW
} = require('./constants');

var Brewer = function() {
  this.cups = 0;
  this.left = 0;
  this.right = 0;
}

StateMachine.create({
  initial: 'brewing', // Ska förmodligen vara 'idle' tänker jag
  target: Brewer.prototype,
  events: [
    { name: 'potWasRemoved',       from: ['idle', 'brewing'],     to: 'filter_or_pot_removed' },
    { name: 'potWasReplaced',      from: 'filter_or_pot_removed', to: 'idle' },
    { name: 'brewingWasInitiated', from: 'idle',                  to: 'brewing' },
    { name: 'brewingWasResumed',   from: 'filter_or_pot_removed', to: 'brewing' },
    { name: 'brewingWasCompleted', from: 'brewing',               to: 'idle' },
]});

/**
 * Kolla när antalet färdiga koppar mer än maxantalet
 * (givet vikten, minus en halv kopp)
 */
Brewer.prototype.assertBrewingWasCompleted = function(buffer, left, right) {
  return this.calculateCups() > this.maxCups() - 0.5;
}

Brewer.prototype.assertPotWasRemoved = function(buffer, left, right) {
  return (left + right) < WEIGHT_OF_EMPTY_BREWER_WITH_POT
}

Brewer.prototype.assertBrewingWasResumed = function(buffer, left, right) {
  return false // TODO: implement
}

Brewer.prototype.assertPotWasReplaced = function(buffer, left, right) {
  return false // TODO: implement
}

Brewer.prototype.assertBrewingWasInitiated = function(buffer, left, right) {
  return false // TODO: implement
}

Brewer.prototype.setWeights = function(left, right) {
  this.left = left;
  this.right = right;
}

Brewer.prototype.calculateCups = function() {
  return this.right / CUP_WEIGHT // TODO: implementera på riktigt
}

Brewer.prototype.maxCups = function() {
  return (this.left + this.right - WEIGHT_OF_EMPTY_BREWER_WITH_POT) / CUP_WEIGHT
}


module.exports = new Brewer();
