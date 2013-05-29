'use strict';

module.exports = function(compiler, str) {
	return str.quote + str.children[0] + str.quote;
};