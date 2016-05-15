const {INPUT_TICK_INTERVAL} = require('./constants')
const milliSecondsToTicks = milliSeconds => {
  return Math.round(milliSeconds / INPUT_TICK_INTERVAL)
}

const milliSecondsAgo = (buffer, milliSeconds) => {
  const ticksAgo = (buffer.length) ? 0 : buffer.length - milliSecondsToTicks(milliSeconds)
  console.log(buffer[ticksAgo]);
  return buffer[ticksAgo]
};

const getPreviousFrame = buffer => {
  return buffer[buffer.length -1] || null
}

module.exports = {
  milliSecondsToTicks,
  milliSecondsAgo,
  getPreviousFrame
}
