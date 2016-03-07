'use strict'
module.exports = function guessNextState(buffer, current, brewer) {
  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []

  possibleTransitions.forEach(transition => {
    const assertion = `assert${transition}`
    console.log(assertion,'-', brewer[assertion](buffer, current.left, current.right));
    if (brewer[assertion](buffer, current.left, current.right)) {
      brewer[transition]() // call transition method on the brewer
      return {
        state: brewer.current,
        left: current.left,
        right: current.right,
      }
    }
  })

  brewer.sendState(null, true)
  return {
    state: brewer.current,
    left: current.left,
    right: current.right,
  }
}
