## Projekt `CoffeePot`

### Contributors
- Linus Berggren
- Olle Karlsson
- Joakim Lilja
- David Wickström

### Phase 2
- #### Day 1
Solder together components to the scale appliance.
Merge hardware `hx711` module into GitHub repository.
Aquire last components (cables, adapters, shrink-hoses). Update `hx711` module to support two circuit-boards. Test `hx711` module with appliance.

- #### Day 2
Implement the ability to push coffee-status from Raspberry Pi to the client. On unknown state replace Tray-Icon with a spinner. Tune the values for coffee-cups.

- #### Day 3
Cleanup and package for delivery, final documentation of the solution.

- #### Day 4
Live demonstration of the appliance.

### Installation instructions for application:
  * `npm install` @ root
  * `npm start` @ root

### Installation instructions for server:
  * `npm install` @ src/srv
  * `npm start` @ src/srv


##### JSHint
  Installation instructions for [Atom](www.atom.io).
  * `apm install linter`
  * `apm install linter-jshint`
