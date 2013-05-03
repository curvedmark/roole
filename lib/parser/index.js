'use strict';

var generatedParser = require('./generatedParser');

module.exports = Parser;

function Parser(options) {
	this.options = options;
}

Parser.prototype.parse = function (input) {
	try {
		return generatedParser.parse(input, this.options);
	} catch(error) {
		if (error.line) this._normalizeError(error);
		throw error;
	}
};

Parser.prototype._normalizeError = function (error) {
	var found = error.found;
	switch (found) {
	case '\r':
	case '\n':
		found = 'new line';
		break;
	default:
		found = !found ? 'end of file' : "'" + found + "'";
	}
	error.message = 'unexpected ' + found;

	error.loc = this.options.loc || {
		line: error.line,
		column: error.column,
		offset: error.offset,
		filename: this.options.filename,
	};
};