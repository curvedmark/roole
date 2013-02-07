'use strict'

var generatedParser = require('./generatedParser')

var parser = exports

parser.parse = function(input, options) {
	var filePath = options.filePath || ''

	try {
		var ast = generatedParser.parse(input, {
			startRule: options._startRule,
			loc: options._loc
		})
		if (ast.type === 'root')
			ast.filePath = filePath
		return ast
	} catch(error) {
		if (error.line) {
			var found = error.found
			switch (found) {
			case '\r':
			case '\n':
				found = 'new line'
				break
			default:
				if (!found)
					found = 'end of file'
				else
					found = "'" + found + "'"
			}
			error.message = "Unexpected " + found
			error.filePath = filePath

			if (options._loc) {
				error.line = options._loc.line
				error.column = options._loc.column
				error.offset = options._loc.offset
			}
		}

		throw error
	}
}