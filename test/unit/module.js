'use strict';

var assert = require('../assert');

suite('@module');

test('default separator', function() {
	assert.compileTo([
		'@module foo {',
		'	.button {',
		'		display: inline-block;',
		'	}',
		'}',
	], [
		'.foo-button {',
		'	display: inline-block;',
		'}',
	]);
});

test('specify separator', function() {
	assert.compileTo([
		'@module foo with "--" {',
		'	.button {',
		'		display: inline-block;',
		'	}',
		'}',
	], [
		'.foo--button {',
		'	display: inline-block;',
		'}',
	]);
});

test('nested selectors', function() {
	assert.compileTo([
		'@module foo {',
		'	.tabs .tab {',
		'		float: left;',
		'	}',
		'}',
	], [
		'.foo-tabs .foo-tab {',
		'	float: left;',
		'}',
	]);
});

test('chained selectors', function() {
	assert.compileTo([
		'@module foo {',
		'	.button.active {',
		'		display: inline-block;',
		'	}',
		'}',
	], [
		'.foo-button.foo-active {',
		'	display: inline-block;',
		'}',
	]);
});

test('nested modules', function() {
	assert.compileTo([
		'@module foo {',
		'	@module bar {',
		'		.button {',
		'			display: inline-block;',
		'		}',
		'	}',
		'}',
	], [
		'.foo-bar-button {',
		'	display: inline-block;',
		'}',
	]);
});

test('not allow invalid module name', function() {
	assert.failAt([
		'$func = @function {};',
		'@module $func {',
		'	.button {',
		'		display: inline-block;',
		'	}',
		'}',
	], {line: 2, column: 9});
});

test('not allow invalid module separator', function() {
	assert.failAt([
		'$func = @function {};',
		'@module foo with $func {',
		'	.button {',
		'		display: inline-block;',
		'	}',
		'}',
	], {line: 2, column: 18});
});