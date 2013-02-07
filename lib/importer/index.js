'use strict'

var Importer = require('./importer')

var importer = exports

importer.import = function(ast, options, callback) {
	new Importer().import(ast, options, callback)
}