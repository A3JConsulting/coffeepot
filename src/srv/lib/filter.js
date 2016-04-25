const LEFT_ZERO = 300000
const RIGHT_ZERO = -200000
const DIVIDER = 100

const parseLeftRight = val => {
  const values = val.split(', ')
  return {
    left: parseInt(values[0]),
    right: parseInt(values[1])
  }
}

const setZero = (val) => {
  return {
    left: val.left + LEFT_ZERO,
    right: val.right + RIGHT_ZERO
  }
}

const transform = (val) => {
  return {
    left: val.left / DIVIDER
    right: val.right / DIVIDER
  }
}

const apply = val => {
  return transform(setZero(parseLeftRight(val)))
}

module.exports = apply
