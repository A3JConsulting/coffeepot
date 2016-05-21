const {INPUT_TICK_INTERVAL, BUFFER_TIME} = require('./constants')
const guessNextState = require('./guess')
const STREAM_BUFFER_LENGTH = (BUFFER_TIME * 1000) / INPUT_TICK_INTERVAL // ticks

const milliSecondsToTicks = milliSeconds => {
  return Math.round(milliSeconds / INPUT_TICK_INTERVAL)
}

const milliSecondsAgo = (buffer, milliSeconds) => {
  const ticksAgo = (buffer.length) ? 0 : buffer.length - milliSecondsToTicks(milliSeconds)
  return buffer[ticksAgo]
};

const getPreviousFrame = buffer => {
  return buffer[buffer.length -1] || null
}

const appendToBuffer = (buffer, nextFrame) => {
  if (buffer.length < STREAM_BUFFER_LENGTH) {
    return [...buffer, nextFrame]
  } else {
    const lastFrames = buffer.slice(Math.max(buffer.length - STREAM_BUFFER_LENGTH -1, 1))
    return [...lastFrames, nextFrame]
  }
}

const handleState = (buffer, current, brewer) => {
  const nextFrame = guessNextState(buffer, current, brewer)
  return appendToBuffer(buffer, nextFrame)
}

const logCurrentState = brewer => {
  console.log('\x1b[33m%s\x1b[0m', brewer.current);
}

const logLastFrame = (buffer, prop) => {
  if (buffer.length === 0) return
  const last = buffer[buffer.length -1]
  if (prop) return console.log(last[prop])
  console.log(last)
}

module.exports = {
  milliSecondsToTicks,
  milliSecondsAgo,
  getPreviousFrame,
  handleState,
  appendToBuffer,
  logCurrentState,
  logLastFrame,
}
