import {parseMIResponse, parseResponse} from './parseResponse'
const responseMI = require('./responseMI')
const response = require('./response')

// console.log(responseMI)
console.log(parseResponse(response))
console.log(parseMIResponse(responseMI))

