'use strict'

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = function guessNextState(buffer, current, brewer) {

  const possibleTransitions = (brewer.transitions()) ? brewer.transitions() : []

  possibleTransitions.forEach(transition => {
    const assertion = `assert${capitalize(transition)}`
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

  return {
    state: brewer.current,
    left: current.left,
    right: current.right,
  }
}
