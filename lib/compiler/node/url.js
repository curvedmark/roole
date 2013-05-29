'use strict';

module.exports = function(compiler, url) {
	url = compiler.visit(url.children[0]);
	return 'url(' + url + ')';
};