const milliSecondsToTicks = milliSeconds => {
  return Math.round(milliseconds / INPUT_TICK_INTERVAL)
}

const milliSecondsAgo = (buffer, milliSeconds) => {
  return buffer[buffer.length - milliSecondsToTicks(milliSeconds)]
};

const getPreviousFrame = buffer => {
  return buffer[buffer.length -1] || null
}

module.exports = {
  milliSecondsToTicks,
  milliSecondsAgo,
  getPreviousFrame
}
