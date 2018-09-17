let border = require('./border.json')
var fs = require('fs')
var filename = 'd:\\0.json'
let area = []
border.forEach(item => {
  area.push([item[1], item[0]])
})
fs.writeFileSync(filename, JSON.stringify(area))
