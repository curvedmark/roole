{
	var _ = require('../helper');
	var Node = require('../node');

	var N = function() {
		var node = Node.apply(this, arguments);

		node.loc = options.loc || {
			line: line(),
			column: column(),
			offset: offset()
		};

		return node;
	};
}

root
	= comment:(c:multiLineComment {return N('comment', [c]);})? _ rules:(r:rootRules _ {return r;})? {
		if (!rules) rules = [];
		if (comment) rules.unshift(comment);
		return N('root', rules);
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
	/ module
	/ page
	/ charset

ruleset
	= selectorList:selectorList _ ruleList:ruleList {
		return N('ruleset', [selectorList, ruleList]);
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s;})* {
		rest.unshift(first);
		return N('selectorList', rest);
	}

selector
	= combinator:(c:nonSpaceCombinator _ {return c;})? compoundSelector:compoundSelector {
		if (combinator) compoundSelector.unshift(combinator);
		return N('selector', compoundSelector);
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
		return N('combinator', [value]);
	}

spaceCombinator
	= s {
		return N('combinator', [' ']);
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
		return N('selectorInterpolation', [value]);
	}

typeSelector
	= value:identifier {
		return N('typeSelector', [value]);
	}

universalSelector
	= '*' {
		return N('universalSelector');
	}

ampersandSelector
	= '&' value:partialIdentifier? {
		return N('ampersandSelector', [value || null]);
	}

hashSelector
	= '#' value:identifier {
		return N('hashSelector', [value]);
	}

classSelector
	= '.' value:identifier {
		return N('classSelector', [value]);
	}

attributeSelector
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ l:list {return [o, l];})? _ ']' {
		if (rest) rest.unshift(name);
		else rest = [name];
		return N('attributeSelector', rest);
	}

negationSelector
	= ':not'i arg:negationArgumentList {
		return N('negationSelector', [arg]);
	}

negationArgumentList
	= '(' _ arg:negationArgument _ ')' {
		return arg;
	}

negationArgument
	= classSelector
	/ typeSelector
	/ attributeSelector
	/ pseudoSelector
	/ hashSelector
	/ universalSelector

pseudoSelector
	= ':' doubled:':'? name:identifier arg:pseudoArgumentList? {
		return N('pseudoSelector', [name, arg || null], {doubled: !!doubled});
	}

pseudoArgumentList
	= '(' _ arg:pseudoArgument _ ')' {
		return arg;
	}

pseudoArgument
	= first:pseudoElement rest:(_ a:pseudoElement {return a;})* {
		rest.unshift(first);
		return N('pseudoArgument', rest);
	}

pseudoElement
	= [-+] / dimension / number / string / identifier

ruleList
	= '{' _ rules:rules? _ '}' {
		return N('ruleList', rules || []);
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
	/ module
	/ fontFace

property
	= star:'*'? name:identifier _ ':' _ value:list _ priority:'!important'? _ semicolon {
		if (star) {
			if (name.type === 'identifier')
				name.children.unshift(star);
			else
				name = N('identifier', [star, name]);
		}
		return N('property', [name, value, priority || null]);
	}

semicolon
	= &('}')
	/ ';' (_ ';')*

list
	= first:logicalOr rest:(separator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return N('list', rest);
	}
	/ logicalOr

separator
	= _ commaSeparator:commaSeparator _ {
		return commaSeparator;
	}
	/ nonCommaSeparator

commaSeparator
	= value:',' {
		return N('separator', [value]);
	}

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return N('separator', [value]);
	}

nonCommaList
	= first:logicalOr rest:(nonCommaSeparator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return N('list', rest);
	}
	/ logicalOr

logicalOr
	= first:logicalAnd rest:(_ 'or'i _ e:logicalAnd {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = N('logical', [node, 'or', operand]);
		});
		return node;
	}

logicalAnd
	= first:equality rest:(_ 'and'i _ e:equality {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = N('logical', [node, 'and', operand]);
		});
		return node;
	}

equality
	= first:relational rest:((_ o:('isnt'i / 'is'i) _ {return o;}) relational)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = N('equality', [node, operator, operand]);
		});
		return node;
	}

relational
	= first:range rest:((_ o:$([<>]'='?) _ {return o;}) range)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = N('relational', [node, operator, operand]);
		});
		return node;
	}

range
	= from:additive _ operator:$('..' '.'?) _ to:additive {
		return N('range', [from, operator, to]);
	}
	/ additive

additive
	= first:multiplicative rest:((_ c:[-+] s {return c;} / [-+]) multiplicative)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = N('arithmetic', [node, operator, operand]);
		})
		return node;
	}

multiplicative
	= first:unary rest:((_ c:'/' s {return c;} / s c:'/' _ {return c;} / _ c:[*%] _ {return c;}) unary)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = N('arithmetic', [node, operator, operand]);
		});
		return node;
	}

unary
	= call
	/ operator:[-+] operand:call {
		return N('unary', [operator, operand]);
	}

call
	= value:primary argumentLists:argumentList* {
		var node = value;
		argumentLists.forEach(function(argumentList) {
			node = N('call', [node, argumentList]);
		})
		return node;
	}

argumentList
	= '(' _ args:args? _ ')' {
		return N('argumentList', args || []);
	}

args
	= first:nonCommaList rest:(_ ',' _ s:nonCommaList {return s;})* {
		rest.unshift(first);
		return rest;
	}

accessor
	= '[' _ range:range _ ']' {
		return range;
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
	= first:identifierStart rest:(variable / interpolation / partialRawIdentifier)+ {
		if (Array.isArray(first)) {
			rest = first.concat(rest);
		} else {
			rest.unshift(first);
		}
		return N('identifier', rest);
	}
	/ value:rawIdentifier {
		return N('identifier', [value]);
	}
	/ variable
	/ interpolation

identifierStart
	= rawIdentifier
	/ dash:'-'? variable:variable {
		return dash ? [dash, variable] : variable;
	}
	/ dash:'-'? interpolation:interpolation {
		return dash ? [dash, interpolation] : interpolation;
	}

partialIdentifier
	= values:(partialRawIdentifier / variable / interpolation)+ {
		return N('identifier', values);
	}

rawIdentifier
	= $('-'? [_a-z]i partialRawIdentifier?)

partialRawIdentifier
	= $([-_a-z0-9]i+)

interpolation
	= '{' _ variable:variable _ '}' {
		return variable;
	}

variable
	= '$' value:rawIdentifier {
		return N('variable', [value]);
	}

string
	= "'" value:$(([^\n\r\f\\'] / '\\' .)*) "'" {
		return N('string', [value], {quote: "'"});
	}
	/ '"' values:($(([^\n\r\f\\"{$] / '\\' .)+) / variable / interpolation / '{')* '"' {
		if (!values.length) values.push('');
		return N('string', values, {quote: '"'});
	}

percentage
	= value:rawNumber '%' {
		return N('percentage', [value]);
	}

dimension
	= value:rawNumber unit:rawIdentifier {
		return N('dimension', [value, unit]);
	}

number
	= value:rawNumber {
		return N('number', [value]);
	}

rawNumber = value:$([0-9]* '.' [0-9]+ / [0-9]+) {
		return +value
	}

color
	= '#' rgb:$[0-9a-z]i+ {
		if (rgb.length !== 3 && rgb.length !== 6)
			return

		return N('color', [rgb]);
	}

function
	= '@function'i _ parameterList:parameterList _ ruleList:ruleList {
		return N('function', [parameterList, ruleList]);
	}

parameterList
	= parameters:parameters restParameter:(_ ',' _ p:restParameter {return p;})?{
		if (restParameter) parameters.push(restParameter);
		return N('parameterList', parameters);
	}
	/ restParameter:restParameter? {
		var parameters = [];
		if (restParameter) parameters.push(restParameter);
		return N('parameterList', parameters);
	}

parameters
	= first:parameter rest:(_ ',' _ p:parameter {return p;})* {
		rest.unshift(first);
		return rest;
	}

parameter
	= variable:variable value:(_ '=' _ s:nonCommaList {return s;})? {
		return N('parameter', [variable, value || null]);
	}

restParameter
	= '...' variable:variable {
		return N('restParameter', [variable]);
	}

boolean
	= 'true'i {
		return N('boolean', [true]);
	}
	/ 'false'i {
		return N('boolean', [false]);
	}

null
	= 'null'i {
		return N('null');
	}

assignment
	= variable:variable _ operator:$([-+*/?]? '=') _ value:list _ semicolon {
		return N('assignment', [variable, operator, value]);
	}

media
	= '@media'i _ mediaQueryList:mediaQueryList _ ruleList:ruleList {
		return N('media', [mediaQueryList, ruleList]);
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q;})* {
		rest.unshift(first);
		return N('mediaQueryList', rest);
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(_ 'and'i _ m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first);
		return N('mediaQuery', rest);
	}

mediaInterpolation
	= value:variable {
		return N('mediaInterpolation', [value]);
	}

mediaType
	= modifier:(m:('only'i / 'not'i) _ {return m;})? value:identifier {
		return N('mediaType', [modifier || null, value]);
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:list _ {return v;})? ')' {
		return N('mediaFeature', [name, value || null]);
	}

extend
	= '@extend'i _ selectorList:selectorList _ semicolon {
		return N('extend', [selectorList]);
	}

void
	= '@void'i _ ruleList:ruleList {
		return N('void', [ruleList]);
	}

block
	= '@block'i _ ruleList:ruleList {
		return N('block', [ruleList]);
	}

import
	= '@import'i _ value:(string / url / variable) _ mediaQueryList:(m:mediaQueryList _ {return m;})? semicolon {
		return N('import', [value, mediaQueryList || null]);
	}

url
	= 'url('i _ value:(string / urlAddr) _ ')' {
		return N('url', [value]);
	}

urlAddr
	= value:$([!#$%&*-~]+) {
		return value;
	}

if
	= '@if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return N('if', [condition, consequence, alternative || null]);
	}

elseIf
	= '@else'i _ 'if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return N('if', [condition, consequence, alternative || null]);
	}

else
	= '@else'i _ ruleList:ruleList {
		return ruleList;
	}

for
	= '@for'i _ value:variable _ index:(',' _ i:variable _ {return i})? step:('by'i _ a:additive _ {return a;})? 'in'i _ list:list _ ruleList:ruleList {
		return N('for', [value, index || null, step || null, list, ruleList]);
	}

mixin
	= '@mixin'i _ name:variable argumentList:argumentList _ semicolon {
		return N('call', [name, argumentList], {mixin: true});
	}

return
	= '@return'i _ list:list _ semicolon {
		return N('return', [list]);
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p;})? 'keyframes'i _ name:identifier _ keyframeList:keyframeList {
		return N('keyframes', [prefix || null, name, keyframeList]);
	}

keyframeList
	= '{' _ keyframeRules:keyframeRules? _ '}' {
		return N('keyframeList', keyframeRules || []);
	}

keyframeRules
	= first:keyframeRule rest:(_ k:keyframeRule {return k;})* {
		rest.unshift(first);
		return rest
	}

keyframeRule
	= keyframe
	/ assignment

keyframe
	= keyframeSelectorList:keyframeSelectorList _ propertyList:propertyList {
		return N('keyframe', [keyframeSelectorList, propertyList]);
	}

keyframeSelectorList
	= first:keyframeSelector rest:(_ ',' _ k:keyframeSelector {return k;})* {
		rest.unshift(first);
		return N('keyframeSelectorList', rest);
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return N('keyframeSelector', [value]);
	}

propertyList
	= '{' propertyRules:(_ p:propertyRules {return p})? _ '}' {
		return N('ruleList', propertyRules || []);
	}

propertyRules
	= first:propertyRule rest:(_ p:propertyRule {return p;})* {
		rest.unshift(first);
		return rest;
	}

propertyRule
	= property
	/ assignment

fontFace
	= '@font-face'i _ propertyList:propertyList {
		return N('fontFace', [propertyList]);
	}

module
	= '@module'i _ name:additive _ separator:('with' _ s:list {return s;})? _ ruleList:ruleList {
		return N('module', [name, separator || null, ruleList]);
	}

page
	= '@page'i name:(_ ':' i:identifier {return i;})? _ propertyList:propertyList {
		return N('page', [name || null, propertyList]);
	}

charset
	= '@charset'i _ value:string _ semicolon {
		return N('charset', [value]);
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