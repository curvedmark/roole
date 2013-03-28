/**
 * Evaluator
 *
 * Eliminate dynamic constructs (e.g., variable, @if, @for).
 */
'use strict';

var Visitor = require('../visitor');
var Scope = require('./scope');
var Evaluator = module.exports = function() {};

Evaluator.prototype = new Visitor();

Evaluator.prototype.evaluate = function(ast) {
	this.scope = new Scope();

	return this.visit(ast);
};

require('./node/root');
require('./node/ruleset');
require('./node/selector');
require('./node/selectorInterpolation');
require('./node/classSelector');
require('./node/assignment');
require('./node/call');
require('./node/function');
require('./node/return');
require('./node/variable');
require('./node/identifier');
require('./node/string');
require('./node/range');
require('./node/logical');
require('./node/equality');
require('./node/relational');
require('./node/arithmetic');
require('./node/unary');
require('./node/media');
require('./node/mediaQuery');
require('./node/mediaQueryInterpolation');
require('./node/void');
require('./node/block');
require('./node/if');
require('./node/for');
require('./node/keyframes');
require('./node/keyframe');
require('./node/module');
require('./node/fontFace');