/**
 * Formmatter
 *
 * Make error message contain input context.
 */
'use strict'

var formatter = exports

formatter.format = function(error, input) {
	var message = error.message
	if (input === undefined)
		return message

	var lineNumber = error.line
	var columnNumber = error.column
	var filePath = error.filePath
	var lines = input.split(/\r\n|[\r\n]/)
	var siblingLineSize = 4
	var startLineNumber = Math.max(lineNumber - siblingLineSize, 1)
	var endLineNumber = Math.min(lineNumber + siblingLineSize, lines.length)
	var maxLineNumberDigitCount = endLineNumber.toString().length

	var context = lines.slice(startLineNumber - 1, endLineNumber).reduce(function(context, line, i) {
		var tabCount = 0
		line = line.replace(/^\t+/, function(tabs) {
			tabCount = tabs.length
			return Array(tabCount + 1).join('  ')
		})

		var currentLineNumber = i + startLineNumber
		var currentLineNumberDigitCount = currentLineNumber.toString().length

		context += '  '
		         + Array(maxLineNumberDigitCount - currentLineNumberDigitCount + 1).join(' ')
		         + currentLineNumber
		         + '| '
		         + line
		         + '\n'

		if (i + startLineNumber === lineNumber)
			context += '  '
			         + Array(maxLineNumberDigitCount + 1).join('-')
			         + '--'
			         + Array(columnNumber + tabCount).join('-')
			         + '^\n'

		return context
	}, '')

	return message
	     + '\n\n  ' + '(' + (filePath ? filePath + ' ' : '') + error.line + ':' + error.column + ')'
	     + '\n' + context
}
