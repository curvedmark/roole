{
	var _ = require('../helper');
	var Node = require('../node');

	var loc = function() {
		return options.loc || {
			line: line(),
			column: column(),
			offset: offset(),
			filename: options.filename
		}
	};
}

root
	= comment:(c:multiLineComment {return Node('comment', [c], {loc: loc()});})? _ rules:(r:rootRules _ {return r;})? {
		if (!rules) rules = [];
		if (comment) rules.unshift(comment);
		return Node('root', rules, {loc: loc()});
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
		return Node('ruleset', [selectorList, ruleList], {loc: loc()});
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s;})* {
		rest.unshift(first);
		return Node('selectorList', rest, {loc: loc()});
	}

selector
	= combinator:(c:nonSpaceCombinator _ {return c;})? compoundSelector:compoundSelector {
		if (combinator) compoundSelector.unshift(combinator);
		return Node('selector', compoundSelector, {loc: loc()});
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
		return Node('combinator', [value], {loc: loc()});
	}

spaceCombinator
	= s {
		return Node('combinator', [' '], {loc: loc()});
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
		return Node('selectorInterpolation', [value], {loc: loc()});
	}

typeSelector
	= value:identifier {
		return Node('typeSelector', [value], {loc: loc()});
	}

universalSelector
	= '*' {
		return Node('universalSelector', {loc: loc()});
	}

ampersandSelector
	= '&' value:partialIdentifier? {
		return Node('ampersandSelector', [value || null], {loc: loc()});
	}

hashSelector
	= '#' value:identifier {
		return Node('hashSelector', [value], {loc: loc()});
	}

classSelector
	= '.' value:identifier {
		return Node('classSelector', [value], {loc: loc()});
	}

attributeSelector
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ l:list {return [o, l];})? _ ']' {
		if (rest) rest.unshift(name);
		else rest = [name];
		return Node('attributeSelector', rest, {loc: loc()});
	}

negationSelector
	= ':not'i arg:negationArgumentList {
		return Node('negationSelector', [arg], {loc: loc()});
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
	= ':' doubleColon:':'? name:identifier arg:pseudoArgumentList? {
		return Node('pseudoSelector', [name, arg || null], {doubleColon: !!doubleColon, loc: loc()});
	}

pseudoArgumentList
	= '(' _ arg:pseudoArgument _ ')' {
		return arg;
	}

pseudoArgument
	= first:pseudoElement rest:(_ a:pseudoElement {return a;})* {
		rest.unshift(first);
		return Node('pseudoArgument', rest, {loc: loc()});
	}

pseudoElement
	= [-+] / dimension / number / string / identifier

ruleList
	= '{' _ rules:rules? _ '}' {
		return Node('ruleList', rules || [], {loc: loc()});
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
				name = Node('identifier', [star, name], {loc: loc()});
		}
		return Node('property', [name, value, priority || null], {loc: loc()});
	}

semicolon
	= &('}')
	/ ';' (_ ';')*

list
	= first:logicalOr rest:(separator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return Node('list', rest, {loc: loc()});
	}
	/ logicalOr

separator
	= _ commaSeparator:commaSeparator _ {
		return commaSeparator;
	}
	/ nonCommaSeparator

commaSeparator
	= value:',' {
		return Node('separator', [value], {loc: loc()});
	}

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return Node('separator', [value], {loc: loc()});
	}

nonCommaList
	= first:logicalOr rest:(nonCommaSeparator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return Node('list', rest, {loc: loc()});
	}
	/ logicalOr

logicalOr
	= first:logicalAnd rest:(_ 'or'i _ e:logicalAnd {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = Node('logical', [node, 'or', operand], {loc: loc()});
		});
		return node;
	}

logicalAnd
	= first:equality rest:(_ 'and'i _ e:equality {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = Node('logical', [node, 'and', operand], {loc: loc()});
		});
		return node;
	}

equality
	= first:relational rest:((_ o:('isnt'i / 'is'i) _ {return o;}) relational)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = Node('equality', [node, operator, operand], {loc: loc()});
		});
		return node;
	}

relational
	= first:range rest:((_ o:$([<>]'='?) _ {return o;}) range)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = Node('relational', [node, operator, operand], {loc: loc()});
		});
		return node;
	}

range
	= from:additive _ operator:$('..' '.'?) _ to:additive {
		return Node('range', [from, operator, to], {loc: loc()});
	}
	/ additive

additive
	= first:multiplicative rest:((_ c:[-+] s {return c;} / [-+]) multiplicative)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = Node('arithmetic', [node, operator, operand], {loc: loc()});
		})
		return node;
	}

multiplicative
	= first:unary rest:((_ c:'/' s {return c;} / s c:'/' _ {return c;} / _ c:[*%] _ {return c;}) unary)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = Node('arithmetic', [node, operator, operand], {loc: loc()});
		});
		return node;
	}

unary
	= call
	/ operator:[-+] operand:call {
		return Node('unary', [operator, operand], {loc: loc()});
	}

call
	= value:primary argumentLists:argumentList* {
		var node = value;
		argumentLists.forEach(function(argumentList) {
			node = Node('call', [node, argumentList], {loc: loc()});
		})
		return node;
	}

argumentList
	= '(' _ args:args? _ ')' {
		return Node('argumentList', args || [], {loc: loc()});
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
		return Node('identifier', rest, {loc: loc()});
	}
	/ value:rawIdentifier {
		return Node('identifier', [value], {loc: loc()});
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
		return Node('identifier', values, {loc: loc()});
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
		return Node('variable', [value], {loc: loc()});
	}

string
	= "'" value:$(([^\n\r\f\\'] / '\\' .)*) "'" {
		return Node('string', [value], {quote: "'", loc: loc()});
	}
	/ '"' values:($(([^\n\r\f\\"{$] / '\\' .)+) / variable / interpolation / '{')* '"' {
		if (!values.length) values.push('');
		return Node('string', values, {quote: '"', loc: loc()});
	}

percentage
	= value:rawNumber '%' {
		return Node('percentage', [value], {loc: loc()});
	}

dimension
	= value:rawNumber unit:rawIdentifier {
		return Node('dimension', [value, unit], {loc: loc()});
	}

number
	= value:rawNumber {
		return Node('number', [value], {loc: loc()});
	}

rawNumber = value:$([0-9]* '.' [0-9]+ / [0-9]+) {
		return +value
	}

color
	= '#' rgb:$[0-9a-z]i+ {
		if (rgb.length !== 3 && rgb.length !== 6)
			return

		return Node('color', [rgb], {loc: loc()});
	}

function
	= '@function'i _ parameterList:parameterList _ ruleList:ruleList {
		return Node('function', [parameterList, ruleList], {loc: loc()});
	}

parameterList
	= parameters:parameters restParameter:(_ ',' _ p:restParameter {return p;})?{
		if (restParameter) parameters.push(restParameter);
		return Node('parameterList', parameters, {loc: loc()});
	}
	/ restParameter:restParameter? {
		var parameters = [];
		if (restParameter) parameters.push(restParameter);
		return Node('parameterList', parameters, {loc: loc()});
	}

parameters
	= first:parameter rest:(_ ',' _ p:parameter {return p;})* {
		rest.unshift(first);
		return rest;
	}

parameter
	= variable:variable value:(_ '=' _ s:nonCommaList {return s;})? {
		return Node('parameter', [variable, value || null], {loc: loc()});
	}

restParameter
	= '...' variable:variable {
		return Node('restParameter', [variable], {loc: loc()});
	}

boolean
	= 'true'i {
		return Node('boolean', [true], {loc: loc()});
	}
	/ 'false'i {
		return Node('boolean', [false], {loc: loc()});
	}

null
	= 'null'i {
		return Node('null', {loc: loc()});
	}

assignment
	= variable:variable _ operator:$([-+*/?]? '=') _ value:list _ semicolon {
		return Node('assignment', [variable, operator, value], {loc: loc()});
	}

media
	= '@media'i _ mediaQueryList:mediaQueryList _ ruleList:ruleList {
		return Node('media', [mediaQueryList, ruleList], {loc: loc()});
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q;})* {
		rest.unshift(first);
		return Node('mediaQueryList', rest, {loc: loc()});
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(_ 'and'i _ m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first);
		return Node('mediaQuery', rest, {loc: loc()});
	}

mediaInterpolation
	= value:variable {
		return Node('mediaInterpolation', [value], {loc: loc()});
	}

mediaType
	= modifier:(m:('only'i / 'not'i) _ {return m;})? value:identifier {
		return Node('mediaType', [modifier || null, value], {loc: loc()});
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:list _ {return v;})? ')' {
		return Node('mediaFeature', [name, value || null], {loc: loc()});
	}

extend
	= '@extend'i _ selectorList:selectorList _ semicolon {
		return Node('extend', [selectorList], {loc: loc()});
	}

void
	= '@void'i _ ruleList:ruleList {
		return Node('void', [ruleList], {loc: loc()});
	}

block
	= '@block'i _ ruleList:ruleList {
		return Node('block', [ruleList], {loc: loc()});
	}

import
	= '@import'i _ value:(string / url / variable) _ mediaQueryList:(m:mediaQueryList _ {return m;})? semicolon {
		return Node('import', [value, mediaQueryList || null], {loc: loc()});
	}

url
	= 'url('i _ value:(string / urlAddr) _ ')' {
		return Node('url', [value], {loc: loc()});
	}

urlAddr
	= value:$([!#$%&*-~]+) {
		return value;
	}

if
	= '@if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return Node('if', [condition, consequence, alternative || null], {loc: loc()});
	}

elseIf
	= '@else'i _ 'if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return Node('if', [condition, consequence, alternative || null], {loc: loc()});
	}

else
	= '@else'i _ ruleList:ruleList {
		return ruleList;
	}

for
	= '@for'i _ value:variable _ index:(',' _ i:variable _ {return i})? step:('by'i _ a:additive _ {return a;})? 'in'i _ list:list _ ruleList:ruleList {
		return Node('for', [value, index || null, step || null, list, ruleList], {loc: loc()});
	}

mixin
	= '@mixin'i _ name:variable argumentList:argumentList _ semicolon {
		return Node('call', [name, argumentList], {mixin: true, loc: loc()});
	}

return
	= '@return'i _ list:list _ semicolon {
		return Node('return', [list], {loc: loc()});
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p;})? 'keyframes'i _ name:identifier _ keyframeList:keyframeList {
		return Node('keyframes', [prefix || null, name, keyframeList], {loc: loc()});
	}

keyframeList
	= '{' _ keyframeRules:keyframeRules? _ '}' {
		return Node('keyframeList', keyframeRules || [], {loc: loc()});
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
		return Node('keyframe', [keyframeSelectorList, propertyList], {loc: loc()});
	}

keyframeSelectorList
	= first:keyframeSelector rest:(_ ',' _ k:keyframeSelector {return k;})* {
		rest.unshift(first);
		return Node('keyframeSelectorList', rest, {loc: loc()});
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return Node('keyframeSelector', [value], {loc: loc()});
	}

propertyList
	= '{' propertyRules:(_ p:propertyRules {return p})? _ '}' {
		return Node('ruleList', propertyRules || [], {loc: loc()});
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
		return Node('fontFace', [propertyList], {loc: loc()});
	}

module
	= '@module'i _ name:additive _ separator:('with' _ s:list {return s;})? _ ruleList:ruleList {
		return Node('module', [name, separator || null, ruleList], {loc: loc()});
	}

page
	= '@page'i name:(_ ':' i:identifier {return i;})? _ propertyList:propertyList {
		return Node('page', [name || null, propertyList], {loc: loc()});
	}

charset
	= '@charset'i _ value:string _ semicolon {
		return Node('charset', [value], {loc: loc()});
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