'use strict';

var assert = require('../assert');

suite('identifier');

test('starting with a dash', function() {
	assert.compileTo([
		'body {',
		'	-webkit-box-sizing: border-box;',
		'}',
	], [
		'body {',
		'	-webkit-box-sizing: border-box;',
		'}',
	]);
});

test('not allow starting with double-dash', function() {
	assert.failAt([
		'body {',
		'	--webkit-box-sizing: border-box;',
		'}',
	], {line: 2, column: 3});
});

test('interpolate identifier', function() {
	assert.compileTo([
		'$name = star;',
		'.icon-$name {',
		'	float: left;',
		'}',
	], [
		'.icon-star {',
		'	float: left;',
		'}',
	]);
});

test('interpolate number', function() {
	assert.compileTo([
		'$num = 12;',
		'.icon-$num {',
		'	float: left;',
		'}',
	], [
		'.icon-12 {',
		'	float: left;',
		'}',
	]);
});

test('interpolate string', function() {
	assert.compileTo([
		'$name = "star";',
		'.icon-$name {',
		'	float: left;',
		'}',
	], [
		'.icon-star {',
		'	float: left;',
		'}',
	]);
});

test('not allow interpolating function', function() {
	assert.failAt([
		'$name = @function {',
		'	body {',
		'		margin: auto;',
		'	}',
		'};',
		'.icon-$name {',
		'	float: left;',
		'}',
	], {line: 6, column: 7});
});

test('interpolate multiple variables', function() {
	assert.compileTo([
		'$size = big;',
		'$name = star;',
		'.icon-$size$name {',
		'	float: left;',
		'}',
	], [
		'.icon-bigstar {',
		'	float: left;',
		'}',
	]);
});

test('interpolation consists only two variables', function() {
	assert.compileTo([
		'$prop = border;',
		'$pos = -left;',
		'body {',
		'	$prop$pos: solid;',
		'}',
	], [
		'body {',
		'	border-left: solid;',
		'}',
	]);
});

test('braced interpolation', function() {
	assert.compileTo([
		'$prop = border;',
		'body {',
		'	{$prop}: solid;',
		'}',
	], [
		'body {',
		'	border: solid;',
		'}',
	]);
});

test('contain dangling dash', function() {
	assert.compileTo([
		'$prop = border;',
		'$pos = left;',
		'body {',
		'	{$prop}-$pos: solid;',
		'}',
	], [
		'body {',
		'	border-left: solid;',
		'}',
	]);
});

test('contain double dangling dashes', function() {
	assert.compileTo([
		'$module = icon;',
		'$name = star;',
		'.{$module}--{$name} {',
		'	display: inline-block;',
		'}',
	], [
		'.icon--star {',
		'	display: inline-block;',
		'}',
	]);
});

test('start with dangling dash', function() {
	assert.compileTo([
		'$prefix = moz;',
		'$prop = box-sizing;',
		'body {',
		'	-{$prefix}-$prop: border-box;',
		'}',
	], [
		'body {',
		'	-moz-box-sizing: border-box;',
		'}',
	]);
});