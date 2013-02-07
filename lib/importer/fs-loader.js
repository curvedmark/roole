'use strict'

var fs = require('fs')

var loader = exports

loader.load = function(path, callback) {
	fs.readFile(path, 'utf8', callback)
}