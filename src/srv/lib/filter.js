const LEFT_ZERO = 309153
const RIGHT_ZERO = -286284
const DIVIDER = 335

const parseLeftRight = val => {
  const values = val.split(', ')
  return {
    left: parseInt(values[0]),
    right: parseInt(values[1])
  }
}

const setZero = val => {
  return {
    left: val.left + LEFT_ZERO,
    right: val.right + RIGHT_ZERO
  }
}

const transform = val => {
  return {
    left: Math.abs(Math.round(val.left / DIVIDER)),
    right: Math.abs(Math.round(val.right / DIVIDER))
  }
}

const filter = val => {
  return transform(setZero(parseLeftRight(val)))
}

module.exports = filter
