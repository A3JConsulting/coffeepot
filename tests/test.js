Number.prototype.between = function(min, max) {
  return this > min && this < max
}

const {appendToBuffer, handleState} = require('../src/srv/lib/system')
const {Observable} = require('rx')
const {test} = require('ava')
const {
  INITIAL_STATE,
  IDLE,
  FILTER_OR_POT_REMOVED,
  BREWING
} = require('../src/srv/lib/constants')

const getFixture = file => {
  const data = JSON.parse(
    require('fs')
      .readFileSync(`${__dirname}/fixtures/${file}`)
      .toString()
  )
  return Observable.from(data).take(data.length)
}

const assertFinalState = (observable, expected, test) => {
  let lastState = null
  return observable.subscribe(x => {
    lastState = x[x.length -1].state
  }, err => {
    console.error(err);
  }, () => {
    test.deepEqual(lastState, expected);
  })
}

let Brewer = require('../src/srv/lib/brewer')

const createStreamFrom = fixture => {
  let brewer = new Brewer()
  return getFixture(fixture)
    .bufferWithCount(2)
    .filter(x => {
      const min = x[0].right - 50
      const max = x[0].right + 50
      return x[0].right.between(min, max)
    })
    .map(x => x[1])
    .scan((buffer, current) => {
      console.log(current);
      return handleState(buffer, current, brewer)
    }, INITIAL_STATE)
}

test('it detects when pot #1 (empty) is removed', t => {
    assertFinalState(createStreamFrom('remove-pot01.json'), FILTER_OR_POT_REMOVED, t)
});

test('it detects when pot #2 is removed', t => {
    assertFinalState(createStreamFrom('remove-pot02.json'), FILTER_OR_POT_REMOVED, t)
});

test('it detects when pot #3 is removed', t => {
    assertFinalState(createStreamFrom('remove-pot03.json'), FILTER_OR_POT_REMOVED, t)
});

test('it detects when pot #1 (empty) replaced', t => {
  assertFinalState(createStreamFrom('replace-pot01.json'), IDLE, t)
})

test('it detects when pot #2 replaced', t => {
  assertFinalState(createStreamFrom('replace-pot02.json'), IDLE, t)
})

test('it detects when pot #3 replaced', t => {
  assertFinalState(createStreamFrom('replace-pot03.json'), IDLE, t)
})

test('it detects when brewing has started', t => {
  assertFinalState(createStreamFrom('brewing-initiated.json'), BREWING, t)
})

test('it detects when brewing is completed', t => {
  assertFinalState(createStreamFrom('brewing-completed.json'), IDLE, t)
})
//
// test('it detects when brewing is paused', t => {
//   t.fail()
// })
//
// test('it detects when brewing is resumed', t => {
//   t.fail()
// })
