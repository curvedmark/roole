/**
 * Prefixer
 *
 * Prefix property nodes, keyframes nodes, etc
 */
'use strict';

var _ = require('../helper');
var Visitor = require('../visitor');
module.exports = Prefixer;

function Prefixer(options) {
	this.options = options;
}

Prefixer.prototype = new Visitor();

Prefixer.prototype.prefix = function(ast) {
	this.prefixes = this.options.prefix.trim().split(/\s+/);
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