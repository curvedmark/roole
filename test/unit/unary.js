'use strict';

var assert = require('../assert');

suite('unary');

test('+number', function() {
	assert.compileTo([
		'body {',
		'	-foo: +1;',
		'}',
	], [
		'body {',
		'	-foo: 1;',
		'}',
	]);
});

test('+percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: +1%;',
		'}',
	], [
		'body {',
		'	-foo: 1%;',
		'}',
	]);
});

test('+dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: +1px;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('+string, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: +"a";',
		'}',
	], {line: 2, column: 8});
});

test('-number', function() {
	assert.compileTo([
		'body {',
		'	-foo: -1;',
		'}',
	], [
		'body {',
		'	-foo: -1;',
		'}',
	]);
});

test('-percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: -1%;',
		'}',
	], [
		'body {',
		'	-foo: -1%;',
		'}',
	]);
});

test('-dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: -1px;',
		'}',
	], [
		'body {',
		'	-foo: -1px;',
		'}',
	]);
});

test('-variable, value is number', function() {
	assert.compileTo([
		'$foo = 1px;',
		'body {',
		'	-foo: -$foo;',
		'}',
	], [
		'body {',
		'	-foo: -1px;',
		'}',
	]);
});

test('-variable, value is identifier', function() {
	assert.compileTo([
		'$foo = foo;',
		'body {',
		'	-foo: -$foo;',
		'}',
	], [
		'body {',
		'	-foo: -foo;',
		'}',
	]);
});