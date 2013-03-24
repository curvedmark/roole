'use strict';

var assert = require('../assert');

suite('url()');

test('url contains protocol', function() {
	assert.compileTo([
		'a {',
		'	content: url(http://example.com/icon.png?size=small+big);',
		'}',
	], [
		'a {',
		'	content: url(http://example.com/icon.png?size=small+big);',
		'}',
	]);
});

test('url is string', function() {
	assert.compileTo([
		'a {',
		'	content: url("icon.png");',
		'}',
	], [
		'a {',
		'	content: url("icon.png");',
		'}',
	]);
});