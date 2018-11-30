var png = require('png-js')
console.log('eiei')
png.decode('./images/smalltest.png', pixels => {
  console.log([...pixels])
})
