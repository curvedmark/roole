'use strict';

var assert = require('../assert');

suite('function');

test('no params', function() {
	assert.compileTo([
		'$width = @function {',
		'	@return 960px;',
		'};',
		'',
		'body {',
		'	width: $width();',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('not allow undefined function', function() {
	assert.failAt([
		'body {',
		'	width: $width();',
		'}',
	], {line: 2, column: 9});
});

test('not allow non-function to be called', function() {
	assert.failAt([
		'$width = 960px;',
		'',
		'body {',
		'	width: $width();',
		'}',
	], {line: 4, column: 9});
});

test('not allow using @return outside @function', function() {
	assert.failAt([
		'body {',
		'	@return 1;',
		'}',
	], {line: 2, column: 2});
});

test('call function multiple times', function() {
	assert.compileTo([
		'$get-value = @function {',
		'	@return $value;',
		'};',
		'',
		'body {',
		'	$value = 960px;',
		'	width: $get-value();',
		'',
		'	$value = 400px;',
		'	height: $get-value();',
		'}',
		'',
	], [
		'body {',
		'	width: 960px;',
		'	height: 400px;',
		'}',
	]);
});

test('specify parameter', function() {
	assert.compileTo([
		'$width = @function $width {',
		'	@return $width;',
		'};',
		'',
		'body {',
		'	width: $width(960px);',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('specify default parameter', function() {
	assert.compileTo([
		'$width = @function $width = 960px {',
		'	@return $width;',
		'};',
		'',
		'body {',
		'	width: $width();',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('specify default parameter, overriden', function() {
	assert.compileTo([
		'$width = @function $width = 960px {',
		'	@return $width;',
		'};',
		'',
		'body {',
		'	width: $width(400px);',
		'}',
	], [
		'body {',
		'	width: 400px;',
		'}',
	]);
});

test('under-specify arguments', function() {
	assert.compileTo([
		'$margin = @function $h, $v {',
		'	@return $h $v;',
		'};',
		'',
		'body {',
		'	margin: $margin(20px);',
		'}',
	], [
		'body {',
		'	margin: 20px null;',
		'}',
	]);
});

test('rest argument', function() {
	assert.compileTo([
		'$add = @function ...$numbers {',
		'	$sum = 0;',
		'	@for $number in $numbers {',
		'		$sum = $sum + $number;',
		'	}',
		'	@return $sum;',
		'};',
		'',
		'body {',
		'	width: $add(1, 2, 3, 4);',
		'}',
	], [
		'body {',
		'	width: 10;',
		'}',
	]);
});

test('ignore rules under @return', function() {
	assert.compileTo([
		'$width = @function {',
		'	$width = 960px;',
		'	@return $width;',
		'',
		'	$width = 400px;',
		'	@return $width;',
		'};',
		'',
		'body {',
		'	width: $width();',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('ignore block rules', function() {
	assert.compileTo([
		'$width = @function {',
		'	div {',
		'		margin: 0;',
		'	}',
		'',
		'	$width = 960px;',
		'	@return $width;',
		'};',
		'',
		'body {',
		'	width: $width();',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('implicit @return', function() {
	assert.compileTo([
		'$width = @function {',
		'	div {',
		'		margin: 0;',
		'	}',
		'};',
		'',
		'body {',
		'	width: $width();',
		'}',
	], [
		'body {',
		'	width: null;',
		'}',
	]);
});

test('$arguments', function() {
	assert.compileTo([
		'$arguments = @function {',
		'	@return $arguments;',
		'};',
		'',
		'body {',
		'	-foo: $arguments(foo, bar)',
		'}',
	], [
		'body {',
		'	-foo: foo, bar;',
		'}',
	]);
});

test('not modify arguments by direct assignment', function() {
	assert.compileTo([
		'$modify = @function $param {',
		'	$param = 1;',
		'	@return $param;',
		'};',
		'',
		'body {',
		'	$arg = 0;',
		'	-foo: $modify($arg) $arg;',
		'}',
	], [
		'body {',
		'	-foo: 1 0;',
		'}',
	]);
});