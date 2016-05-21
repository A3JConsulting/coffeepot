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
  return getFixture(fixture)
    .scan((buffer, current) => {
      return handleState(buffer, current, new Brewer())
    }, INITIAL_STATE)
}

test('it detects when pot is removed', t => {
    assertFinalState(createStreamFrom('foo.json'), FILTER_OR_POT_REMOVED, t)
});

test('it detects when pot replaced', t => {
  t.fail()
})

test('it detects when brewing is paused', t => {
  t.fail()
})

test('it detects when brewing starts', t => {
  t.fail()
})

test('it detects when brewing is paused', t => {
  t.fail()
})

test('it detects when brewing is resumed', t => {
  t.fail()
})

test('it detects when brewing is completed', t => {
  t.fail()
})
