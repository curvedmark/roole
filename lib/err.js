/**
 * Err
 *
 * Thin wrapper around Error to add meta info to the error instance.
 */
'use strict'

var Err = module.exports = function(message, node, filePath) {
	var error = new Error(message)

	try {
		error.line = node.loc.line
		error.column = node.loc.column
		error.offset = node.loc.offset
		error.filePath = filePath
	} catch (error) {
		console.error(node)
	}

	return error
}