/**
 * Prefixer
 *
 * Prefix property nodes, keyframes nodes, etc
 */
'use strict';

var defaults = require('../defaults');
var _ = require('../helper');
var Visitor = require('../visitor');
var Prefixer = module.exports = function() {};

Prefixer.prototype = new Visitor();

Prefixer.prototype.prefix = function(ast, options) {
	if (options.prefix == null) { options.prefix = defaults.prefix; }
	if (options.skipPrefixed == null) { options.skipPrefixed = defaults.skipPrefixed; }

	this.prefixes = options.prefix.trim().split(/\s+/);
	this.skipPrefixed = options.skipPrefixed;

	return this.visit(ast);
};

Prefixer.prototype.visitRoot =
Prefixer.prototype.visitRuleset =
Prefixer.prototype.visitMedia =
Prefixer.prototype.visitKeyframeList =
Prefixer.prototype.visitKeyframe =
Prefixer.prototype.visitRuleList = Prefixer.prototype.visitNode;

Prefixer.prototype.visitNode = _.noop;

require('./node/ruleset.js');
require('./node/property.js');
require('./node/keyframes.js');