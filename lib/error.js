/**
 * RooleError
 *
 * Thin wrapper around Error to add loc info to the error object.
 */
'use strict';

module.exports = RooleError;

function RooleError(msg, node) {
	this.message = msg;
	this.loc = node.loc;
}

RooleError.prototype = Object.create(Error.prototype);
RooleError.prototype.constructor = RooleError;
RooleError.prototype.name = 'RooleError';