/**
 * RooleError
 *
 * Thin wrapper around Error to add loc info to the error object.
 */
'use strict';

module.exports = RooleError;

function RooleError(message, node) {
	var error = new Error(message);
	error.loc = node.loc;
	return error;
}