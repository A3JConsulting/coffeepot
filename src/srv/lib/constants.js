'use strict'
module.exports = Object.freeze({
  WEIGHT_OF_EMPTY_BREWER_WITH_POT: 2818, // Vikt inklusive en genomsnittlig sump
  WEIGHT_OF_POT: 335, // så mycket väger kannan
  CUP_WEIGHT: 108, // gram kaffe per kopp
  MINIMUM_BREW: 3, // minst antal koppar när man sätter på en ny kanna

  IDLE: 'IDLE',
  PREPARED_FOR_BREWING: 'PREPARED_FOR_BREWING',
  BREWING: 'BREWING',
  BREWING_PAUSED: 'BREWING_PAUSED',
  FILTER_OR_POT_REMOVED: 'FILTER_OR_POT_REMOVED',

  INPUT_TICK_INTERVAL: 500, // Hur ofta ska det pollas?
  BUFFER_TIME: 10, // Hur mycket ska det buffras, i sekunder?
  INITIAL_STATE: [{ previousState: null, state: this.IDLE, left: 0, right: 0 }],
});
