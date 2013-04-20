'use strict';

var generatedParser = require('./generatedParser');
var parser = exports;

parser.parse = function(input, options) {
	try {
		return generatedParser.parse(input, options);
	} catch(error) {
		if (error.line) {
			var found = error.found;
			switch (found) {
			case '\r':
			case '\n':
				found = 'new line';
				break;
			default:
				if (!found) {
					found = 'end of file';
				} else {
					found = "'" + found + "'";
				}
			}
			error.message = "unexpected " + found;

			if (options.loc) {
				error.loc = options.loc;
			} else {
				error.loc = {
					line: error.line,
					column: error.column,
					offset: error.offset,
					filename: options.filename
				};
			}
		}

		throw error;
	}
};