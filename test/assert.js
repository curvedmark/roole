'use strict'

var roole = require('../lib/roole')

var assert = exports

assert.compileTo = function(imports, input, css, options) {
	var called = false

	if (typeof imports !== 'object') {
		options = css
		css = input
		input = imports
		imports = {}
	}

	if (!options)
		options = {}

	options.imports = imports
	options.prettyError = true

	roole.compile(input, options, function(error, output) {
		called = true

		if (error)
			throw error

		if (output !== css) {
			error = new Error('')
			error.actual = output
			error.expected = css

			output = output ? '\n"""\n' + output + '\n"""\n' : ' ' + output + '\n'
			css = css ? '\n"""\n' + css + '\n"""' : ' empty string'
			error.message = 'input compiled to' + output + 'instead of' + css

			throw error
		}
	})

	if (!called)
		throw new Error('input is never compiled')
}

assert.failAt = function(imports, input, line, column, filePath) {
	var called = false

	if (typeof imports !== 'object') {
		filePath = column
		column = line
		line = input
		input = imports
		imports = {}
	}

	if (!filePath)
		filePath = ''

	var options = {
		imports: imports,
		prettyError: true
	}

	roole.compile(input, options, function(error, css) {
		if (!error)
			throw new Error('no error is thrown')

		if (!error.line)
			throw error

		called = true

		if (error.line !== line) {
			var message = 'error has line number ' + error.line + ' instead of ' + line
			error.message = message + ':\n\n' + error.message
			throw error
		}

		if (error.column !== column) {
			var message = 'error has column number ' + error.column + ' instead of ' + column
			error.message = message + ':\n\n' + error.message
			throw error
		}

		if (error.filePath !== filePath) {
			var message = 'error has file path ' + error.filePath + ' instead of ' + filePath
			error.message = message + ':\n\n' + error.message
			throw error
		}
	})

	if (!called)
		throw new Error('input is never compiled')
}