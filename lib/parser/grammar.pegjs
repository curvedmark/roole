{
	var _ = require('../helper');
	var indent = '';
	var loc = options.loc ? function() {
		return options.loc;
	} : function () {
		return {
			line: line(),
			column: column(),
			offset: offset(),
			filename: options.filename
		};
	};
}

root
	= comments:_c rules:rules _ {
		return {
			type: 'root',
			comments: comments,
			children: rules,
		};
	}

rules
	= rule*

rule
	= comments:_c ruleset:ruleset { ruleset.comments = comments; return ruleset; }
	/ comments:_c prop:property { prop.comments = comments; return prop; }
	/ _ assignment:assignment { return assignment; }
	/ _ extend:extend { return extend; }
	/ comments:_c media:media { media.comments = comments; return media; }
	/ _ voidNode:void { return voidNode; }
	/ _ block:block { return block; }
	/ comments:_c imp:import { imp.comments = comments; return imp; }
	/ _ ifNode:if { return ifNode; }
	/ _ forNode:for { return forNode; }
	/ _ mixin:mixin { return mixin; }
	/ _ returnNode:return { return returnNode; }
	/ comments:_c kfs:keyframes { kfs.comments = comments; return kfs; }
	/ comments:_c ff:fontFace { ff.comments = comments; return ff; }
	/ _ module:module { return module; }
	/ comments:_c page:page { page.comments = comments; return page; }
	/ comments:_c charset:charset { charset.comments = comments; return charset; }

ruleset
	= selectorList:selectorList _ ruleList:ruleList {
		return {
			type: 'ruleset',
			children: [selectorList, ruleList],
			loc: loc(),
		};
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s;})* {
		rest.unshift(first);
		return {
			type: 'selectorList',
			children: rest,
			loc: loc(),
		};
	}

selector
	= combinator:(c:nonSpaceCombinator _ {return c;})? compoundSelector:compoundSelector {
		if (combinator) compoundSelector.unshift(combinator);
		return {
			type: 'selector',
			children: compoundSelector,
			loc: loc(),
		};
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
		return {
			type: 'combinator',
			children: [value],
			loc: loc(),
		};
	}

spaceCombinator
	= s {
		return {
			type: 'combinator',
			children: [' '],
			loc: loc(),
		};
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
		return {
			type: 'selectorInterpolation',
			children: [value],
			loc: loc(),
		};
	}

typeSelector
	= value:identifier {
		return {
			type: 'typeSelector',
			children: [value],
			loc: loc(),
		};
	}

universalSelector
	= '*' {
		return {
			type: 'universalSelector',
			loc: loc(),
		};
	}

ampersandSelector
	= '&' value:partialIdentifier? {
		return {
			type: 'ampersandSelector',
			children: [value || null],
			loc: loc(),
		};
	}

hashSelector
	= '#' value:identifier {
		return {
			type: 'hashSelector',
			children: [value],
			loc: loc(),
		};
	}

classSelector
	= '.' value:identifier {
		return {
			type: 'classSelector',
			children: [value],
			loc: loc(),
		};
	}

attributeSelector
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ l:list {return [o, l];})? _ ']' {
		if (rest) rest.unshift(name);
		else rest = [name];
		return {
			type: 'attributeSelector',
			children: rest,
			loc: loc(),
		};
	}

negationSelector
	= ':not'i arg:negationArgumentList {
		return {
			type: 'negationSelector',
			children: [arg],
			loc: loc(),
		};
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
		return {
			type: 'pseudoSelector',
			doubleColon: !!doubleColon,
			children: [name, arg || null],
			loc: loc(),
		};
	}

pseudoArgumentList
	= '(' _ arg:pseudoArgument _ ')' {
		return arg;
	}

pseudoArgument
	= first:pseudoElement rest:(_ a:pseudoElement {return a;})* {
		rest.unshift(first);
		return {
			type: 'pseudoArgument',
			children: rest,
			loc: loc(),
		};
	}

pseudoElement
	= [-+] / dimension / number / string / identifier

ruleList
	= '{' rules:rules _ '}' {
		return {
			type: 'ruleList',
			children: rules,
			loc: loc(),
		};
	}

property
	= star:'*'? name:identifier _ ':' _ value:list _ priority:'!important'? _ semicolon {
		if (star) {
			if (name.type === 'identifier') name.children.unshift(star);
			else name = {
				type: 'identifier',
				children: [star, name],
				loc: loc(),
			};
		}
		return {
			type: 'property',
			priority: priority || '',
			children: [name, value],
			loc: loc(),
		};
	}

semicolon
	= &('}')
	/ ';' (_ ';')*

list
	= first:logicalOr rest:(separator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return {
			type: 'list',
			children: rest,
			loc: loc(),
		};
	}
	/ logicalOr

separator
	= _ commaSeparator:commaSeparator _ {
		return commaSeparator;
	}
	/ nonCommaSeparator

commaSeparator
	= value:',' {
		return {
			type: 'separator',
			children: [value],
			loc: loc(),
		};
	}

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return {
			type: 'separator',
			children: [value],
			loc: loc(),
		};
	}

nonCommaList
	= first:logicalOr rest:(nonCommaSeparator logicalOr)+ {
		rest = _.flatten(rest);
		rest.unshift(first);
		return {
			type: 'list',
			children: rest,
			loc: loc(),
		};
	}
	/ logicalOr

logicalOr
	= first:logicalAnd rest:(_ 'or'i _ e:logicalAnd {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = {
				type: 'logical',
				children: [node, 'or', operand],
				loc: loc(),
			};
		});
		return node;
	}

logicalAnd
	= first:equality rest:(_ 'and'i _ e:equality {return e;})* {
		var node = first;
		rest.forEach(function(operand) {
			node = {
				type: 'logical',
				children: [node, 'and', operand],
				loc: loc(),
			};
		});
		return node;
	}

equality
	= first:relational rest:((_ o:('isnt'i / 'is'i) _ {return o;}) relational)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = {
				type: 'equality',
				children: [node, operator, operand],
				loc: loc(),
			};
		});
		return node;
	}

relational
	= first:range rest:((_ o:$([<>]'='?) _ {return o;}) range)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = {
				type: 'relational',
				children: [node, operator, operand],
				loc: loc(),
			};
		});
		return node;
	}

range
	= from:additive _ operator:$('..' '.'?) _ to:additive {
		return {
			type: 'range',
			children: [from, operator, to],
			loc: loc(),
		};
	}
	/ additive

additive
	= first:multiplicative rest:((_ c:[-+] s {return c;} / [-+]) multiplicative)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = {
				type: 'arithmetic',
				children: [node, operator, operand],
				loc: loc(),
			};
		})
		return node;
	}

multiplicative
	= first:unary rest:((_ c:'/' s {return c;} / s c:'/' _ {return c;} / _ c:[*%] _ {return c;}) unary)* {
		var node = first;
		rest.forEach(function(array) {
			var operator = array[0];
			var operand = array[1];
			node = {
				type: 'arithmetic',
				children: [node, operator, operand],
				loc: loc(),
			};
		});
		return node;
	}

unary
	= call
	/ operator:[-+] operand:call {
		return {
			type: 'unary',
			children: [operator, operand],
			loc: loc(),
		};
	}

call
	= value:primary argumentLists:argumentList* {
		var node = value;
		argumentLists.forEach(function(argumentList) {
			node = {
				type: 'call',
				children: [node, argumentList],
				loc: loc(),
			};
		})
		return node;
	}

argumentList
	= '(' _ args:args? _ ')' {
		return {
			type: 'argumentList',
			children: args || [],
			loc: loc(),
		};
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
		if (Array.isArray(first)) rest = first.concat(rest);
		else rest.unshift(first);
		return {
			type: 'identifier',
			children: rest,
			loc: loc(),
		};
	}
	/ value:rawIdentifier {
		return {
			type: 'identifier',
			children: [value],
			loc: loc(),
		};
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
		return {
			type: 'identifier',
			children: values,
			loc: loc(),
		};
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
		return {
			type: 'variable',
			children: [value],
			loc: loc(),
		};
	}

string
	= "'" value:$(([^\n\r\f\\'] / '\\' .)*) "'" {
		return {
			type: 'string',
			children: [value],
			quote: "'", loc: loc(),
		};
	}
	/ '"' values:($(([^\n\r\f\\"{$] / '\\' .)+) / variable / interpolation / '{')* '"' {
		if (!values.length) values.push('');
		return {
			type: 'string',
			children: values,
			quote: '"', loc: loc(),
		};
	}

percentage
	= value:rawNumber '%' {
		return {
			type: 'percentage',
			children: [value],
			loc: loc(),
		};
	}

dimension
	= value:rawNumber unit:rawIdentifier {
		return {
			type: 'dimension',
			children: [value, unit],
			loc: loc(),
		};
	}

number
	= value:rawNumber {
		return {
			type: 'number',
			children: [value],
			loc: loc(),
		};
	}

rawNumber = value:$([0-9]* '.' [0-9]+ / [0-9]+) {
		return +value
	}

color
	= '#' rgb:$[0-9a-z]i+ {
		if (rgb.length !== 3 && rgb.length !== 6) return
		return {
			type: 'color',
			children: [rgb],
			loc: loc(),
		};
	}

function
	= '@function'i _ parameterList:parameterList _ ruleList:ruleList {
		return {
			type: 'function',
			children: [parameterList, ruleList],
			loc: loc(),
		};
	}

parameterList
	= parameters:parameters restParameter:(_ ',' _ p:restParameter {return p;})?{
		if (restParameter) parameters.push(restParameter);
		return {
			type: 'parameterList',
			children: parameters,
			loc: loc(),
		};
	}
	/ restParameter:restParameter? {
		var parameters = [];
		if (restParameter) parameters.push(restParameter);
		return {
			type: 'parameterList',
			children: parameters,
			loc: loc(),
		};
	}

parameters
	= first:parameter rest:(_ ',' _ p:parameter {return p;})* {
		rest.unshift(first);
		return rest;
	}

parameter
	= variable:variable value:(_ '=' _ s:nonCommaList {return s;})? {
		return {
			type: 'parameter',
			children: [variable, value || null],
			loc: loc(),
		};
	}

restParameter
	= '...' variable:variable {
		return {
			type: 'restParameter',
			children: [variable],
			loc: loc(),
		};
	}

boolean
	= 'true'i {
		return {
			type: 'boolean',
			children: [true],
			loc: loc(),
		};
	}
	/ 'false'i {
		return {
			type: 'boolean',
			children: [false],
			loc: loc(),
		};
	}

null
	= 'null'i {
		return {
			type: 'null',
			loc: loc(),
		};
	}

assignment
	= variable:variable _ operator:$([-+*/?]? '=') _ value:list _ semicolon {
		return {
			type: 'assignment',
			children: [variable, operator, value],
			loc: loc(),
		};
	}

media
	= '@media'i _ mediaQueryList:mediaQueryList _ ruleList:ruleList {
		return {
			type: 'media',
			children: [mediaQueryList, ruleList],
			loc: loc(),
		};
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q;})* {
		rest.unshift(first);
		return {
			type: 'mediaQueryList',
			children: rest,
			loc: loc(),
		};
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(_ 'and'i _ m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first);
		return {
			type: 'mediaQuery',
			children: rest,
			loc: loc(),
		};
	}

mediaInterpolation
	= value:variable {
		return {
			type: 'mediaInterpolation',
			children: [value],
			loc: loc(),
		};
	}

mediaType
	= modifier:(m:('only'i / 'not'i) _ {return m;})? value:identifier {
		return {
			type: 'mediaType',
			modifier: modifier,
			children: [value],
			loc: loc(),
		};
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:list _ {return v;})? ')' {
		return {
			type: 'mediaFeature',
			children: [name, value || null],
			loc: loc(),
		};
	}

extend
	= '@extend'i _ selectorList:selectorList _ semicolon {
		return {
			type: 'extend',
			children: [selectorList],
			loc: loc(),
		};
	}

void
	= '@void'i _ ruleList:ruleList {
		return {
			type: 'void',
			children: [ruleList],
			loc: loc(),
		};
	}

block
	= '@block'i _ ruleList:ruleList {
		return {
			type: 'block',
			children: [ruleList],
			loc: loc(),
		};
	}

import
	= '@import'i _ value:(string / url / variable) _ mediaQueryList:(m:mediaQueryList _ {return m;})? semicolon {
		return {
			type: 'import',
			children: [value, mediaQueryList || null],
			loc: loc(),
		};
	}

url
	= 'url('i _ value:(string / urlAddr) _ ')' {
		return {
			type: 'url',
			children: [value],
			loc: loc(),
		};
	}

urlAddr
	= value:$([!#$%&*-~]+) {
		return value;
	}

if
	= '@if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return {
			type: 'if',
			children: [condition, consequence, alternative || null],
			loc: loc(),
		};
	}

elseIf
	= '@else'i _ 'if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e;})? {
		return {
			type: 'if',
			children: [condition, consequence, alternative || null],
			loc: loc(),
		};
	}

else
	= '@else'i _ ruleList:ruleList {
		return ruleList;
	}

for
	= '@for'i _ value:variable _ index:(',' _ i:variable _ {return i})? step:('by'i _ a:additive _ {return a;})? 'in'i _ list:list _ ruleList:ruleList {
		return {
			type: 'for',
			children: [value, index || null, step || null, list, ruleList],
			loc: loc(),
		};
	}

mixin
	= '@mixin'i _ name:variable argumentList:argumentList _ semicolon {
		return {
			type: 'call',
			mixin: true,
			children: [name, argumentList],
			loc: loc(),
		};
	}

return
	= '@return'i _ list:list _ semicolon {
		return {
			type: 'return',
			children: [list],
			loc: loc(),
		};
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p;})? 'keyframes'i _ name:identifier _ keyframeList:keyframeList {
		return {
			type: 'keyframes',
			prefix: prefix || '',
			children: [name, keyframeList],
			loc: loc(),
		};
	}

keyframeList
	= '{' keyframeRules:keyframeRules _ '}' {
		return {
			type: 'ruleList',
			children: keyframeRules,
			loc: loc(),
		};
	}

keyframeRules
	= keyframeRule*

keyframeRule
	= comments:_c kf:keyframe { kf.comments = comments; return kf; }
	/ _ assignment:assignment { return assignment; }

keyframe
	= keyframeSelectorList:keyframeSelectorList _ propertyList:propertyList {
		return {
			type: 'keyframe',
			children: [keyframeSelectorList, propertyList],
			loc: loc(),
		};
	}

keyframeSelectorList
	= first:keyframeSelector rest:(_ ',' _ k:keyframeSelector {return k;})* {
		rest.unshift(first);
		return {
			type: 'keyframeSelectorList',
			children: rest,
			loc: loc(),
		};
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return {
			type: 'keyframeSelector',
			children: [value],
			loc: loc(),
		};
	}

propertyList
	= '{' propertyRules:propertyRules _ '}' {
		return {
			type: 'ruleList',
			children: propertyRules,
			loc: loc(),
		};
	}

propertyRules
	= propertyRule*

propertyRule
	= comments:_c prop:property { prop.comments = comments; return prop; }
	/ _ assignment:assignment { return assignment; }

fontFace
	= '@font-face'i _ propertyList:propertyList {
		return {
			type: 'fontFace',
			children: [propertyList],
			loc: loc(),
		};
	}

module
	= '@module'i _ name:additive _ separator:('with' _ s:list {return s;})? _ ruleList:ruleList {
		return {
			type: 'module',
			children: [name, separator || null, ruleList],
			loc: loc(),
		};
	}

page
	= '@page'i name:(_ ':' i:identifier {return i;})? _ propertyList:propertyList {
		return {
			type: 'page',
			children: [name || null, propertyList],
			loc: loc(),
		};
	}

charset
	= '@charset'i _ value:string _ semicolon {
		return {
			type: 'charset',
			children: [value],
			loc: loc(),
		};
	}
_
	= s?

s
	= (ws / singleLineComment / multiLineComment)+

ws
	= $([ \t\r\n\f]+)

singleLineComment
	= '//' [^\r\n\f]*

multiLineComment
	= $('/*' ([^*] / '*' [^/])* '*/')

_c
	= comments:(ws:ws {
		var lines = ws.split(/\r\n|[\n\r\f]/);
		var lastLine = lines[lines.length - 1];
		indent = /^\s*/.exec(lastLine)[0];
	} / singleLineComment {
		return;
	} / comment:multiLineComment {
		var lines = comment.split(/\r\n|[\n\r\f]/);
		var re = new RegExp('^' +  indent);
		return lines.map(function (line) {
			return line.replace(re, '');
		}).join('\n');
	})* {
		return comments.filter(Boolean);
	}