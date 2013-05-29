'use strict';

module.exports = function(compiler, selList) {
	return compiler.visit(selList.children).join(',\n' + compiler.indent());
};