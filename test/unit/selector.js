'use strict';

var assert = require('../assert');

suite('selector');

test('simple selector', function() {
	assert.compileTo([
		'div {',
		'	width: auto;',
		'}',
	], [
		'div {',
		'	width: auto;',
		'}',
	]);
});

test('compound selector', function() {
	assert.compileTo([
		'body div {',
		'	width: auto;',
		'}',
	], [
		'body div {',
		'	width: auto;',
		'}',
	]);
});

test('selector list', function() {
	assert.compileTo([
		'div, p {',
		'	width: auto;',
		'}',
	], [
		'div,',
		'p {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector under selector', function() {
	assert.compileTo([
		'body {',
		'	div {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body div {',
		'	width: auto;',
		'}',
	]);
});

test('nest & selector under selector', function() {
	assert.compileTo([
		'body {',
		'	& {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('nest & selector followed by identifier under selector', function() {
	assert.compileTo([
		'.menu {',
		'	&-item {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'.menu-item {',
		'	width: auto;',
		'}',
	]);
});

test('nest & selector followed by identifier prepended with dash under selector', function() {
	assert.compileTo([
		'.menu {',
		'	&--item {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'.menu--item {',
		'	width: auto;',
		'}',
	]);
});

test('not allow nesting & selector followed by identifier to result in invalid selector', function() {
	assert.failAt([
		'[type=button] {',
		'	&-item {',
		'		width: auto;',
		'	}',
		'}',
	], {line: 2, column: 2});
});

test('nest selector containing & selector under selector', function() {
	assert.compileTo([
		'body {',
		'	html & {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html body {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector starting with combinator under selector', function() {
	assert.compileTo([
		'body {',
		'	> div {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body > div {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector list under selector', function() {
	assert.compileTo([
		'body div {',
		'	p, img {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body div p,',
		'body div img {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector list containing & selector under selector', function() {
	assert.compileTo([
		'body div {',
		'	&, img {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body div,',
		'body div img {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector under selector list', function() {
	assert.compileTo([
		'html, body {',
		'	div {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html div,',
		'body div {',
		'	width: auto;',
		'}',
	]);
});

test('nest & selector under selector list', function() {
	assert.compileTo([
		'html, body {',
		'	& {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html,',
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector containing & selector under selector list', function() {
	assert.compileTo([
		'body, div {',
		'	html & {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html body,',
		'html div {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector starting with combinator under selector list', function() {
	assert.compileTo([
		'body, div {',
		'	> p {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body > p,',
		'div > p {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector list under selector list', function() {
	assert.compileTo([
		'html, body {',
		'	p, img {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html p,',
		'html img,',
		'body p,',
		'body img {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector list containing & selector under selector list', function() {
	assert.compileTo([
		'html, body {',
		'	&, img {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html,',
		'html img,',
		'body,',
		'body img {',
		'	width: auto;',
		'}',
	]);
});

test('nest selector list containing selector starting with combinator under selector list', function() {
	assert.compileTo([
		'body, div {',
		'	> p, img {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body > p,',
		'body img,',
		'div > p,',
		'div img {',
		'	width: auto;',
		'}',
	]);
});

test('deeply nested selector', function() {
	assert.compileTo([
		'html {',
		'	body {',
		'		div {',
		'			width: auto;',
		'		}',
		'	}',
		'}',
	], [
		'html body div {',
		'	width: auto;',
		'}',
	]);
});

test('not allow & selector at the top level', function() {
	assert.failAt([
		'& {',
		'	width: auto;',
		'}',
	], {line: 1, column: 1});
});

test('not allow selector starting with a combinator at the top level', function() {
	assert.failAt([
		'> div {',
		'	width: auto;',
		'}',
	], {line: 1, column: 1});
});

test('not allow & selector at the top level', function() {
	assert.failAt([
		'& {',
		'	width: auto;',
		'}',
	], {line: 1, column: 1});
});

test('interpolating selector', function() {
	assert.compileTo([
		'$sel = " body ";',
		'$sel {',
		'	width: auto;',
		'}',
	], [
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('not allow interpolating invalid selector', function() {
	assert.failAt([
		'$sel = "body #";',
		'$sel {',
		'	width: auto;',
		'}',
	], {line: 2, column: 1});
});

test('not allow interpolating & selector at the top level', function() {
	assert.failAt([
		'$sel = "&";',
		'$sel {',
		'	width: auto;',
		'}',
	], {line: 2, column: 1});
});

test('interpolating selector inside selector', function() {
	assert.compileTo([
		'$sel = "div ";',
		'body $sel {',
		'	width: auto;',
		'}',
	], [
		'body div {',
		'	width: auto;',
		'}',
	]);
});

test('interpolating selector staring with combinator inside selector', function() {
	assert.compileTo([
		'$sel = " >  div";',
		'body $sel {',
		'	width: auto;',
		'}',
	], [
		'body > div {',
		'	width: auto;',
		'}',
	]);
});

test('not allow interpolating & selector inside selector at the top level', function() {
	assert.failAt([
		'$sel = "& div";',
		'body $sel {',
		'	width: auto;',
		'}',
	], {line: 2, column: 6});
});

test('interpolating selector containing & selector and nested under selector', function() {
	assert.compileTo([
		'$sel = "& div";',
		'body {',
		'	html $sel {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'html body div {',
		'	width: auto;',
		'}',
	]);
});

test('not allow interpolating selector list inside selector', function() {
	assert.failAt([
		'$sel = "div, p";',
		'body $sel {',
		'	width: auto;',
		'}',
	], {line: 2, column: 6});
});

test('interpolate identifier', function() {
	assert.compileTo([
		'$sel = div;',
		'$sel {',
		'	width: auto;',
		'}',
	], [
		'div {',
		'	width: auto;',
		'}',
	]);
});

test('universal selector', function() {
	assert.compileTo([
		'* {',
		'	margin: 0;',
		'}',
	], [
		'* {',
		'	margin: 0;',
		'}',
	]);
});

test('attribute selector', function() {
	assert.compileTo([
		'input[type=button] {',
		'	margin: 0;',
		'}',
	], [
		'input[type=button] {',
		'	margin: 0;',
		'}',
	]);
});

test('attribute selector without value', function() {
	assert.compileTo([
		'input[hidden] {',
		'	margin: 0;',
		'}',
	], [
		'input[hidden] {',
		'	margin: 0;',
		'}',
	]);
});

test('pseudo selector', function() {
	assert.compileTo([
		':hover {',
		'	text-decoration: underline;',
		'}',
	], [
		':hover {',
		'	text-decoration: underline;',
		'}',
	]);
});

test('double-colon pseudo selector', function() {
	assert.compileTo([
		'a::before {',
		'	content: " ";',
		'}',
	], [
		'a::before {',
		'	content: " ";',
		'}',
	]);
});

test('multi-line pseudo selector', function() {
	assert.compileTo([
		'body {',
		'	a:hover,',
		'	span:hover {',
		'		text-decoration: underline;',
		'	}',
		'}',
	], [
		'body a:hover,',
		'body span:hover {',
		'	text-decoration: underline;',
		'}',
	]);
});

test('functional pseudo selector', function() {
	assert.compileTo([
		'a:nth-child(2n+1) {',
		'	text-decoration: underline;',
		'}',
	], [
		'a:nth-child(2n+1) {',
		'	text-decoration: underline;',
		'}',
	]);
});

test('functional pseudo selector with identifier', function() {
	assert.compileTo([
		'a:nth-child(odd) {',
		'	text-decoration: underline;',
		'}',
	], [
		'a:nth-child(odd) {',
		'	text-decoration: underline;',
		'}',
	]);
});

test('negation selector', function() {
	assert.compileTo([
		'a:not(.link) {',
		'	text-decoration: none;',
		'}',
	], [
		'a:not(.link) {',
		'	text-decoration: none;',
		'}',
	]);
});