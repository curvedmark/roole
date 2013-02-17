/**
 * Formmatter
 *
 * Make error message contain input context
 */
'use strict'

var formatter = exports

formatter.format = function(error, input) {
	var message = error.message
	if (input === undefined)
		return message

	var lineNumber = error.line - 1
	var columnNumber = error.column - 1
	var filePath = error.filePath
	var lines = input.split(/\r\n|[\r\n]/)
	var siblingLineSize = 4
	var startLineNumber = Math.max(lineNumber - siblingLineSize, 0)
	var endLineNumber = Math.min(lineNumber + siblingLineSize, lines.length - 1)
	var maxLineNumberDigitCount = endLineNumber.toString().length

	var context = lines.slice(startLineNumber, endLineNumber + 1).reduce(function(context, line, i) {
		var tabCount = 0
		line = line.replace(/^\t+/, function(tabs) {
			tabCount = tabs.length
			return Array(tabCount + 1).join('  ')
		})

		var currentLineNumber = i + startLineNumber
		var currentLineNumberDigitCount = currentLineNumber.toString().length

		context += '  '
		         + Array(maxLineNumberDigitCount - currentLineNumberDigitCount + 1).join(' ')
		         + (currentLineNumber + 1)
		         + '| '
		         + line
		         + '\n'

		if (i === lineNumber)
			context += '  '
			         + Array(maxLineNumberDigitCount + 1).join('-')
			         + '--'
			         + Array(columnNumber + tabCount + 1).join('-')
			         + '^\n'

		return context
	}, '')

	return message
	     + '\n\n  ' + '(' + (filePath ? filePath + ' ' : '') + error.line + ':' + error.column + ')'
	     + '\n' + context
}
