'use strict';

var assert = require('../assert');

suite('mixin');

test('mixin rules', function() {
	assert.compileTo([
		'$property = @function {',
		'	width: auto;',
		'};',
		'',
		'body {',
		'	@mixin $property();',
		'}',
	], [
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('ignore @return', function() {
	assert.compileTo([
		'$rules = @function {',
		'	width: auto;',
		'	@return 960px;',
		'	height: auto;',
		'};',
		'',
		'body {',
		'	@mixin $rules();',
		'}',
	], [
		'body {',
		'	width: auto;',
		'	height: auto;',
		'}',
	]);
});