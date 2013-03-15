{
	var _ = require('../helper');
	var Node = require('../node');

	var N = function() {
		Node.apply(this, arguments);

		this.loc = options.loc || {
			line: line(),
			column: column(),
			offset: offset()
		};
	};
	N.prototype = Object.create(Node.prototype);
}

root
	= comment:(c:multiLineComment {return new N('comment', [c]);})? _ rules:(r:rootRules _ {return r;})? {
		if (!rules) rules = [];
		if (comment) rules.unshift(comment);
		return new N('root', rules);
	}

rootRules
	= first:rootRule rest:(_ r:rootRule {return r;})* {
		rest.unshift(first);
		return rest;
	}

rootRule
	= ruleset
	/ assignment
	/ media
	/ void
	/ block
	/ import
	/ if
	/ for
	/ mixin
	/ keyframes
	/ fontFace
	/ charset

ruleset
	= selectorList:selectorList _ ruleList:ruleList {
		return new N('ruleset', [selectorList, ruleList]);
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s;})* {
		rest.unshift(first);
		return new N('selectorList', rest);
	}

selector
	= combinator:(c:nonSpaceCombinator _ {return c;})? compoundSelector:compoundSelector {
		if (combinator) compoundSelector.unshift(combinator);
		return new N('selector', compoundSelector);
	}

compoundSelector
	= first:simpleSelector rest:(c:combinator s:simpleSelector {s.unshift(c); return s;})* {
		if (rest.length) rest = first.concat(_.flatten(rest));
		else rest = first;

		return rest;
	}

combinator
	= _ nonSpaceCombinator:nonSpaceCombinator _ {
		return nonSpaceCombinator;
	}
	/ spaceCombinator

nonSpaceCombinator
	= value:[>+~] {
		return new N('combinator', [value]);
	}

spaceCombinator
	= s {
		return new N('combinator', [' ']);
	}

simpleSelector
	= first:(baseSelector / suffixSelector) rest:suffixSelector* {
		rest.unshift(first);
		return rest;
	}

baseSelector
	= selectorInterpolation
	/ typeSelector
	/ universalSelector
	/ ampersandSelector

suffixSelector
	= hashSelector
	/ classSelector
	/ attributeSelector
	/ negationSelector
	/ pseudoSelector

selectorInterpolation
	= value:variable {
		return new N('selectorInterpolation', [value]);
	}

typeSelector
	= value:identifier {
		return new N('typeSelector', [value]);
	}

universalSelector
	= '*' {
		return new N('universalSelector');
	}

ampersandSelector
	= '&' value:identifier? {
		return new N('ampersandSelector', [value || null]);
	}

hashSelector
	= '#' value:identifier {
		return new N('hashSelector', [value]);
	}

classSelector
	= '.' value:identifier {
		return new N('classSelector', [value]);
	}

attributeSelector
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ l:list {return [o, l];})? _ ']' {
		if (rest) rest.unshift(name);
		else rest = [name];
		return new N('attributeSelector', rest);
	}

negationSelector
	= ':not'i '(' _ argument:negationArgument _ ')' {
		return new N('negationSelector', [argument]);
	}

negationArgument
	= classSelector
	/ typeSelector
	/ attributeSelector
	/ pseudoSelector
	/ hashSelector
	/ universalSelector

pseudoSelector
	= ':' doubled:':'? value:(pseudoFunction / identifier) {
		return new N('pseudoSelector', [value], {doubled: !!doubled});
	}

pseudoFunction
	= name:identifier '(' _ argument:pseudoArgument _ ')' {
		return new N('call', [name, argument]);
	}

pseudoArgument
	= first:pseudoElement rest:(_ a:pseudoElement {return a;})* {
		rest.unshift(first);
		return new N('pseudoArgument', rest);
	}

pseudoElement
	= [-+] / dimension / number / string / identifier

ruleList
	= '{' _ rules:rules? _ '}' {
		return new N('ruleList', rules || []);
	}

rules
	= first:rule rest:(_ r:rule {return r})* {
		rest.unshift(first);
		return rest;
	}

rule
	= ruleset
	/ property
	/ assignment
	/ extend
	/ media
	/ void
	/ block
	/ import
	/ if
	/ for
	/ mixin
	/ return
	/ keyframes
	/ fontFace

property
	= star:'*'? name:identifier _ ':' _ value:list _ priority:'!important'? _ semicolon {
		if (star) {
			if (name.type === 'identifier')
				name.children.unshift(star);
			else
				name = new N('identifier', [star, name]);
		}
		return new N('property', [name, value, priority || null]);
	}

semicolon
	= &('}')
	/ ';' (_ ';')*

list
	= first:logicalOrExpression rest:(separator logicalOrExpression)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return new N('list', rest);
	}
	/ logicalOrExpression

separator
	= _ commaSeparator:commaSeparator _ {
		return commaSeparator;
	}
	/ nonCommaSeparator

commaSeparator
	= value:',' {
		return new N('separator', [value]);
	}

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return new N('separator', [value]);
	}

nonCommaList
	= first:logicalOrExpression rest:(nonCommaSeparator logicalOrExpression)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return new N('list', rest);
	}
	/ logicalOrExpression

logicalOrExpression
	= first:logicalAndExpression rest:(_ 'or'i _ e:logicalAndExpression {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = new N('logicalExpression', [node, 'or', operand]);
		});
		return node;
	}

logicalAndExpression
	= first:equalityExpression rest:(_ 'and'i _ e:equalityExpression {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = new N('logicalExpression', [node, 'and', operand]);
		});
		return node;
	}

equalityExpression
	= first:relationalExpression rest:((_ o:('isnt'i / 'is'i) _ {return o;}) relationalExpression)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = new N('equalityExpression', [node, operator, operand]);
		});
		return node;
	}

relationalExpression
	= first:range rest:((_ o:$([<>]'='?) _ {return o;}) range)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = new N('relationalExpression', [node, operator, operand]);
		});
		return node;
	}

range
	= from:additiveExpression _ operator:$('..' '.'?) _ to:additiveExpression {
		return new N('range', [from, operator, to]);
	}
	/ additiveExpression

additiveExpression
	= first:multiplicativeExpression rest:((_ c:[-+] s {return c;} / [-+]) multiplicativeExpression)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = new N('arithmeticExpression', [node, operator, operand]);
		})
		return node;
	}

multiplicativeExpression
	= first:unaryExpression rest:((_ c:'/' s {return c;} / s c:'/' _ {return c;} / _ c:'*' _ {return c;}) unaryExpression)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = new N('arithmeticExpression', [node, operator, operand]);
		});
		return node;
	}

unaryExpression
	= postfixExpression
	/ operator:[-+] operand:postfixExpression {
		return new N('unaryExpression', [operator, operand]);
	}

postfixExpression
	= call
	/ primary

call
	= name:identifier argumentList:argumentList {
		return new N('call', [name, argumentList]);
	}

argumentList
	= '(' _ args:args? _ ')' {
		return new N('argumentList', args || []);
	}

args
	= first:nonCommaList rest:(_ ',' _ s:nonCommaList {return s;})* {
		rest.unshift(first);
		return rest;
	}

primary
	= '(' _ list:list _ ')' {
		return list;
	}
	/ percentage
	/ dimension
	/ number
	/ color
	/ url
	/ function
	/ boolean
	/ null
	/ identifier
	/ string

identifier
	= values:(rawIdentifier / d:'-'? v:(variable / interpolation) {return d ? [d,v] : v;})+ {
		values = _.flatten(values);
		if (values.length === 1 && typeof values[0] !== 'string')
			return values[0];

		return new N('identifier', values);
	}

rawIdentifier
	= value:$('-'? [_a-z]i [-_a-z0-9]i*) {
		return value;
	}

interpolation
	= '{' _ variable:variable _ '}' {
		return variable;
	}

variable
	= '$' value:rawIdentifier {
		return new N('variable', [value]);
	}

string
	= "'" value:$(([^\n\r\f\\'] / '\\' .)*) "'" {
		return new N('string', [value], {quote: "'"});
	}
	/ '"' values:($(([^\n\r\f\\"{$] / '\\' .)+) / variable / interpolation / '{')* '"' {
		if (!values.length) values.push('');
		return new N('string', values, {quote: '"'});
	}

percentage
	= value:rawNumber '%' {
		return new N('percentage', [value]);
	}

dimension
	= value:rawNumber unit:rawIdentifier {
		return new N('dimension', [value, unit]);
	}

number
	= value:rawNumber {
		return new N('number', [value]);
	}

rawNumber = value:$([0-9]* '.' [0-9]+ / [0-9]+) {
		return +value
	}

color
	= '#' rgb:$[0-9a-z]i+ {
		if (rgb.length !== 3 && rgb.length !== 6)
			return

		return new N('color', [rgb]);
	}

function
	= '@function'i _ parameterList:parameterList _ ruleList:ruleList {
		return new N('function', [parameterList, ruleList]);
	}

parameterList
	= parameters:parameters? {
		return new N('parameterList', parameters || []);
	}

parameters
	= first:parameter rest:(_ ',' _ p:parameter {return p;})* {
		rest.unshift(first);
		return rest;
	}

parameter
	= variable:variable value:(_ '=' _ s:nonCommaList {return s;})? {
		return new N('parameter', [variable, value || null]);
	}

boolean
	= 'true'i {
		return new N('boolean', [true]);
	}
	/ 'false'i {
		return new N('boolean', [false]);
	}

null
	= 'null'i {
		return new N('null');
	}

assignment
	= name:variable _ operator:$([-+*/?]? '=') _ value:list _ semicolon {
		return new N('assignment', [name, operator, value]);
	}

media
	= '@media'i _ mediaQueryList:mediaQueryList _ ruleList:ruleList {
		return new N('media', [mediaQueryList, ruleList]);
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q;})* {
		rest.unshift(first);
		return new N('mediaQueryList', rest);
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(_ 'and'i _ m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first);
		return new N('mediaQuery', rest);
	}

mediaInterpolation
	= value:variable {
		return new N('mediaInterpolation', [value]);
	}

mediaType
	= modifier:(m:('only'i / 'not'i) _ {return m;})? value:identifier {
		return new N('mediaType', [modifier || null, value]);
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:list _ {return v;})? ')' {
		return new N('mediaFeature', [name, value || null]);
	}

extend
	= '@extend'i all:'-all'i? _ selectorList:selectorList _ semicolon {
		return new N('extend', [selectorList], {all: !!all});
	}

void
	= '@void'i _ ruleList:ruleList {
		return new N('void', [ruleList]);
	}

block
	= '@block'i _ ruleList:ruleList {
		return new N('block', [ruleList]);
	}

import
	= '@import'i _ value:(string / url / variable) _ mediaQueryList:(m:mediaQueryList _ {return m;})? semicolon {
		return new N('import', [value, mediaQueryList || null]);
	}

url
	= 'url('i _ value:(string / urlAddr) _ ')' {
		return new N('url', [value]);
	}

urlAddr
	= value:$([!#$%&*-~]+) {
		return value;
	}

if
	= '@if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return new N('if', [condition, consequence, alternative || null]);
	}

elseIf
	= '@else'i _ 'if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return new N('if', [condition, consequence, alternative || null]);
	}

else
	= '@else'i _ ruleList:ruleList {
		return ruleList;
	}

for
	= '@for'i _ value:variable _ index:(',' _ i:variable _ {return i})? step:('by'i _ a:additiveExpression _ {return a;})? 'in'i _ list:list _ ruleList:ruleList {
		return new N('for', [value, index || null, step || null, list, ruleList]);
	}

mixin
	= '@mixin'i _ name:variable argumentList:argumentList _ semicolon {
		var callNode = new N('call', [name, argumentList]);
		return new N('mixin', [callNode]);
	}

return
	= '@return'i _ list:list _ semicolon {
		return new N('return', [list]);
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p;})? 'keyframes'i _ name:identifier _ keyframeList:keyframeList {
		return new N('keyframes', [prefix || null, name, keyframeList]);
	}

keyframeList
	= '{' _ keyframes:keyframeBlocks? _ '}' {
		return new N('keyframeList', keyframes || []);
	}

keyframeBlocks
	= first:keyframe rest:(_ k:keyframe {return k;})* {
		rest.unshift(first);
		return rest
	}

keyframe
	= keyframeSelectorList:keyframeSelectorList _ propertyList:propertyList {
		return new N('keyframe', [keyframeSelectorList, propertyList]);
	}

keyframeSelectorList
	= first:keyframeSelector rest:((_ ',' _) k:keyframeSelector {return k;})* {
		rest.unshift(first);
		return new N('keyframeSelectorList', rest);
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return new N('keyframeSelector', [value]);
	}

propertyList
	= '{' properties:(_ p:properties {return p})? _ '}' {
		return new N('propertyList', properties || []);
	}

properties
	= first:property rest:(_ p:property {return p;})* {
		rest.unshift(first);
		return rest;
	}

fontFace
	= '@font-face'i _ propertyList:propertyList {
		return new N('fontFace', [propertyList]);
	}

charset
	= '@charset'i _ value:string _ semicolon {
		return new N('charset', [value]);
	}

_
	= s?

s
	= (ws / singleLineComment / multiLineComment)+

ws
	= [ \t\r\n\f]+

singleLineComment
	= '//' [^\r\n\f]*

multiLineComment
	= '/*' value:$(([^*] / '*' [^/])*) '*/' {
		return value;
	}

nl
	= '\r\n' / [\n\r\f]

// eof
// 	= !.