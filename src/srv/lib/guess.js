'use strict'
const {getPreviousFrame} = require('./syste')

module.exports = function guessNextState(buffer, current, brewer) {
  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []
  const previousFrame = getPreviousFrame(buffer)
  const previousState = previousFrame.previousState
  const currentState = brewer.current

  possibleTransitions.forEach(transition => {
    const assertion = `assert${transition}`
    console.log(assertion,'-', brewer[assertion](buffer, current));
    if (brewer[assertion](buffer, current)) {
      brewer[transition]() // call transition method on the brewer
      return {
        previousState: currentState,
        state: brewer.current,
        left: current.left,
        right: current.right,
      }
    }
  })
  // Send cups value to client
  brewer.sendState(null, true)
  return {
    previousState: previousState || brewer.current,
    state: currentState,
    left: current.left,
    right: current.right,
  }
}
