'use strict'

module.exports = function guessNextState(buffer, current, brewer) {
  const {getPreviousFrame} = require('./system')
  brewer.setWeights(current.left, current.right)
  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []
  console.log(brewer.current);
  console.log(possibleTransitions);
  const previousState = getPreviousFrame(buffer).previousState
  const currentState = brewer.current
  const assertTransition = transition => brewer[`assert${transition}`](buffer, current)
  const validTransition = possibleTransitions.find(assertTransition)

  if (validTransition) {
    brewer[validTransition]() // Call transition on the brewer
    return {
      previousState: currentState,
      state: brewer.current,
      left: current.left,
      right: current.right,
    }
  }
  brewer.sendState(null, true) // Send cups value to client
  return {
    previousState: previousState || null,
    state: currentState,
    left: current.left,
    right: current.right,
  }
}
