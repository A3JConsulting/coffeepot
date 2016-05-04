'use strict'
module.exports = function guessNextState(buffer, current, brewer) {
  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []
  const previousState = brewer.current

  possibleTransitions.forEach(transition => {
    const assertion = `assert${transition}`
    console.log(assertion,'-', brewer[assertion](buffer, current));
    if (brewer[assertion](buffer, current)) {
      brewer[transition]() // call transition method on the brewer
      return {
        previousState: previousState,
        state: brewer.current,
        left: current.left,
        right: current.right,
      }
    }
  })
  // Send cups value to client
  brewer.sendState(null, true)
  return {
    previousState: current.previousState || null,
    state: brewer.current,
    left: current.left,
    right: current.right,
  }
}
