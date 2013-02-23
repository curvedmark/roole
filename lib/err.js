/**
 * Err
 *
 * Thin wrapper around Error to add meta info to the error instance.
 */
'use strict'

var Err = module.exports = function(message, node, filePath) {
	var error = new Error(message)

	error.line = node.loc.line
	error.column = node.loc.column
	error.offset = node.loc.offset
	error.filePath = filePath

	return error
}