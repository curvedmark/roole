/**
 * Err
 *
 * Thin wrapper around Error to add meta info to the error instance.
 */
'use strict';
/* exported Err */

var Err = module.exports = function(message, node) {
	var error = new Error(message);
	error.loc = node.loc;
	return error;
};