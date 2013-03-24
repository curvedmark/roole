'use strict';

var assert = require('../assert');

suite('@for');

test('loop natural range', function() {
	assert.compileTo([
		'@for $i in 1..3 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
		'',
		'.span-2 {',
		'	width: 120px;',
		'}',
		'',
		'.span-3 {',
		'	width: 180px;',
		'}',
	]);
});

test('loop natural exclusive range', function() {
	assert.compileTo([
		'@for $i in 1...3 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
		'',
		'.span-2 {',
		'	width: 120px;',
		'}',
	]);
});

test('loop one number range', function() {
	assert.compileTo([
		'@for $i in 1..1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
	]);
});

test('loop empty range', function() {
	assert.compileTo([
		'@for $i in 1...1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'',
	]);
});

test('loop reversed range', function() {
	assert.compileTo([
		'@for $i in 3..1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-3 {',
		'	width: 180px;',
		'}',
		'',
		'.span-2 {',
		'	width: 120px;',
		'}',
		'',
		'.span-1 {',
		'	width: 60px;',
		'}',
	]);
});

test('loop reversed exclusive range', function() {
	assert.compileTo([
		'@for $i in 3...1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-3 {',
		'	width: 180px;',
		'}',
		'',
		'.span-2 {',
		'	width: 120px;',
		'}',
	]);
});

test('loop with positive step', function() {
	assert.compileTo([
		'@for $i by 2 in 1..4 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
		'',
		'.span-3 {',
		'	width: 180px;',
		'}',
	]);
});

test('loop with positive step for reversed range', function() {
	assert.compileTo([
		'@for $i by 2 in 3..1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-3 {',
		'	width: 180px;',
		'}',
		'',
		'.span-1 {',
		'	width: 60px;',
		'}',
	]);
});

test('loop with negative step', function() {
	assert.compileTo([
		'@for $i by -1 in 1...3 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-2 {',
		'	width: 120px;',
		'}',
		'',
		'.span-1 {',
		'	width: 60px;',
		'}',
	]);
});

test('loop with negative step for reversed range', function() {
	assert.compileTo([
		'@for $i by -2 in 3..1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
		'',
		'.span-3 {',
		'	width: 180px;',
		'}',
	]);
});

test('not allow step number to be zero', function() {
	assert.failAt([
		'@for $i by 0 in 1..3 {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], {line: 1, column: 12});
});

test('only allow step number to be numberic', function() {
	assert.failAt([
		'@for $i by a in 1..3 {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], {line: 1, column: 12});
});

test('loop list', function() {
	assert.compileTo([
		'$icons = foo bar, qux;',
		'@for $icon in $icons {',
		'	.icon-$icon {',
		'		content: "$icon";',
		'	}',
		'}',
	], [
		'.icon-foo {',
		'	content: "foo";',
		'}',
		'',
		'.icon-bar {',
		'	content: "bar";',
		'}',
		'',
		'.icon-qux {',
		'	content: "qux";',
		'}',
	]);
});

test('loop number', function() {
	assert.compileTo([
		'@for $i in 1 {',
		'	.span-$i {',
		'		width: $i * 60px;',
		'	}',
		'}',
	], [
		'.span-1 {',
		'	width: 60px;',
		'}',
	]);
});

test('loop null', function() {
	assert.compileTo([
		'@for $i in null {',
		'	body {',
		'		margin: 0;',
		'	}',
		'}',
		'',
		'body {',
		'	-foo: $i;',
		'}',
	], [
		'body {',
		'	-foo: null;',
		'}',
	]);
});

test('loop list with index', function() {
	assert.compileTo([
		'@for $icon, $i in foo bar, qux {',
		'	.icon-$icon {',
		'		content: "$i $icon";',
		'	}',
		'}',
	], [
		'.icon-foo {',
		'	content: "0 foo";',
		'}',
		'',
		'.icon-bar {',
		'	content: "1 bar";',
		'}',
		'',
		'.icon-qux {',
		'	content: "2 qux";',
		'}',
	]);
});

test('loop list with index with negative step', function() {
	assert.compileTo([
		'@for $icon, $i by -1 in foo bar, qux {',
		'	.icon-$icon {',
		'		content: "$i $icon";',
		'	}',
		'}',
	], [
		'.icon-qux {',
		'	content: "2 qux";',
		'}',
		'',
		'.icon-bar {',
		'	content: "1 bar";',
		'}',
		'',
		'.icon-foo {',
		'	content: "0 foo";',
		'}',
	]);
});

test('loop value with index', function() {
	assert.compileTo([
		'@for $icon, $i in foo {',
		'	.icon-$icon {',
		'		content: "$i $icon";',
		'	}',
		'}',
	], [
		'.icon-foo {',
		'	content: "0 foo";',
		'}',
	]);
});

test('loop null with index', function() {
	assert.compileTo([
		'@for $value, $i in null {}',
		'',
		'body {',
		'	-foo: $value $i;',
		'}',
	], [
		'body {',
		'	-foo: null null;',
		'}',
	]);
});