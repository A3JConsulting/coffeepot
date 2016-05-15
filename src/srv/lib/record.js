'use strict'
const filter = require('./filter')
const fs = require('fs')
const {INPUT_TICK_INTERVAL} = require('./constants')

let buffer = []
let interval = setInterval(function() {
  // buffer.push(Math.random())
  buffer.push(filter(require('hx711').getValues()))
}, INPUT_TICK_INTERVAL)

process.on('SIGINT', () => {
  fs.writeFile(`${__dirname}/record.json`, JSON.stringify(buffer, null, 2), function(err) {
    if (err) {
      return console.error(err);
    } else {
      console.log('Data saved to record.js', buffer)
    }
  });
});
