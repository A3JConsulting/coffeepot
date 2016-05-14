'use strict'
const {getPreviousFrame} = require('./system')

module.exports = function guessNextState(buffer, current, brewer) {
  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []
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
    previousState: previousState || brewer.current,
    state: currentState,
    left: current.left,
    right: current.right,
  }
}
