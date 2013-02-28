{
	var _ = require('../helper')
	var Node = require('../node')

	var N = function() {
		var node = Node.apply(this, arguments)

		node.loc = options.loc || {
			line: line(),
			column: column(),
			offset: offset()
		}

		return node
	}
}

root
	= comment:(c:multiLineComment {return N('comment', [c])})? _ rules:(r:rootRules _ {return r})? {
		if (!rules) rules = []
		if (comment) rules.unshift(comment)
		return N('root', rules)
	}

rootRules
	= first:rootRule rest:(_ r:rootRule {return r})* {
		rest.unshift(first)
		return rest
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
	/ mixinCall
	/ keyframes
	/ fontFace
	/ charset

ruleset
	= selectorList:selectorList _ ruleList:ruleList {
		return N('ruleset', [selectorList, ruleList])
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s})* {
		rest.unshift(first)
		return N('selectorList', rest)
	}

selector
	= combinator:(c:nonSpaceCombinator _ {return c})? compoundSelector:compoundSelector {
		if (combinator) compoundSelector.unshift(combinator)
		return N('selector', compoundSelector)
	}

compoundSelector
	= first:simpleSelector rest:(c:combinator s:simpleSelector {s.unshift(c); return s})* {
		if (rest.length) rest = first.concat(_.flatten(rest))
		else rest = first

		return rest
	}

combinator
	= _ nonSpaceCombinator:nonSpaceCombinator _ {
		return nonSpaceCombinator
	}
	/ spaceCombinator

nonSpaceCombinator
	= value:[>+~] {
		return N('combinator', [value])
	}

spaceCombinator
	= s {
		return N('combinator', [' '])
	}

simpleSelector
	= first:(baseSelector / suffixSelector) rest:suffixSelector* {
		rest.unshift(first)
		return rest
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
		return N('selectorInterpolation', [value])
	}

typeSelector
	= value:identifier {
		return N('typeSelector', [value])
	}

universalSelector
	= '*' {
		return N('universalSelector')
	}

ampersandSelector
	= '&' {
		return N('ampersandSelector')
	}

hashSelector
	= '#' value:identifier {
		return N('hashSelector', [value])
	}

classSelector
	= '.' value:identifier {
		return N('classSelector', [value])
	}

attributeSelector
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ l:list {return [o, l]})? _ ']' {
		if (rest) rest.unshift(name)
		else rest = [name]
		return N('attributeSelector', rest)
	}

negationSelector
	= ':not'i '(' _ argument:negationArgument _ ')' {
		return N('negationSelector', [argument])
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
		return N('pseudoSelector', [value], {doubled: !!doubled})
	}

pseudoFunction
	= name:rawIdentifier '(' _ argument:pseudoArgument _ ')' {
		return N('function', [name, argument])
	}

pseudoArgument
	= first:pseudoElement rest:(_ a:pseudoElement {return a})* {
		rest.unshift(first)
		return N('pseudoArgument', rest)
	}

pseudoElement
	= [-+] / dimension / number / string / identifier

ruleList
	= '{' _ rules:rules? _ '}' {
		return N('ruleList', rules || [])
	}

rules
	= first:rule rest:(_ r:rule {return r})* {
		rest.unshift(first)
		return rest
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
	/ mixinCall
	/ keyframes
	/ fontFace

property
	= star:'*'? name:identifier _ ':' _ value:list _ priority:'!important'? _ semicolon {
		if (star) {
			if (name.type === 'identifier')
				name.children.unshift(star)
			else
				name = N('identifier', [star, name])
		}
		return N('property', [name, value, priority || null])
	}

semicolon
	= &('}')
	/ ';' (_ ';')*

list
	= first:logicalOrExpression rest:(separator logicalOrExpression)+ {
		rest = _.flatten(rest)
		rest.unshift(first)
		return N('list', rest)
	}
	/ logicalOrExpression

separator
	= _ commaSeparator:commaSeparator _ {
		return commaSeparator
	}
	/ nonCommaSeparator

commaSeparator
	= value:',' {
		return N('separator', [value])
	}

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return N('separator', [value])
	}

nonCommaList
	= first:logicalOrExpression rest:(nonCommaSeparator logicalOrExpression)+ {
		rest = _.flatten(rest)
		rest.unshift(first)
		return N('list', rest)
	}
	/ logicalOrExpression

logicalOrExpression
	= first:logicalAndExpression rest:(_ 'or'i _ e:logicalAndExpression {return e})* {
		var node = first
		rest.forEach(function(operand) {
			node = N('logicalExpression', [node, 'or', operand])
		})
		return node
	}

logicalAndExpression
	= first:equalityExpression rest:(_ 'and'i _ e:equalityExpression {return e})* {
		var node = first
		rest.forEach(function(operand) {
			node = N('logicalExpression', [node, 'and', operand])
		})
		return node
	}

equalityExpression
	= first:relationalExpression rest:((_ o:('isnt'i / 'is'i) _ {return o}) relationalExpression)* {
		var node = first
		rest.forEach(function(array) {
			var operator = array[0]
			var operand = array[1]
			node = N('equalityExpression', [node, operator, operand])
		})
		return node
	}

relationalExpression
	= first:range rest:((_ o:$([<>]'='?) _ {return o}) range)* {
		var node = first
		rest.forEach(function(array) {
			var operator = array[0]
			var operand = array[1]
			node = N('relationalExpression', [node, operator, operand])
		})
		return node
	}

range
	= from:additiveExpression _ operator:$('..' '.'?) _ to:additiveExpression {
		return N('range', [from, operator, to])
	}
	/ additiveExpression

additiveExpression
	= first:multiplicativeExpression rest:((_ c:[-+] s {return c} / [-+]) multiplicativeExpression)* {
		var node = first
		rest.forEach(function(array) {
			var operator = array[0]
			var operand = array[1]
			node = N('arithmeticExpression', [node, operator, operand])
		})
		return node
	}

multiplicativeExpression
	= first:unaryExpression rest:((_ c:'/' s {return c} / s c:'/' _ {return c} / _ c:'*' _ {return c}) unaryExpression)* {
		var node = first
		rest.forEach(function(array) {
			var operator = array[0]
			var operand = array[1]
			node = N('arithmeticExpression', [node, operator, operand])
		})
		return node
	}
	/ unaryExpression

unaryExpression
	= primary
	/ operator:[-+] operand:unaryExpression {
		return N('unaryExpression', [operator, operand])
	}

primary
	= '(' _ list:list _ ')' {
		return list
	}
	/ variable
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
	= values:(rawIdentifier / d:'-'? v:(variable / interpolation) {return d ? [d,v] : v})+ {
		values = _.flatten(values)
		if (values.length === 1 && typeof values[0] !== 'string')
			return values[0]

		return N('identifier', values)
	}

rawIdentifier
	= value:$('-'? [_a-z]i [-_a-z0-9]i*) {
		return value
	}

interpolation
	= '{' _ variable:variable _ '}' {
		return variable
	}

variable
	= '$' value:rawIdentifier {
		return N('variable', [value])
	}

string
	= "'" value:$(([^\n\r\f\\'] / '\\' .)*) "'" {
		return N('string', [value], {quote: "'"})
	}
	/ '"' values:($(([^\n\r\f\\"{$] / '\\' .)+) / variable / interpolation / '{')* '"' {
		if (!values.length) values.push('')
		return N('string', values, {quote: '"'})
	}

percentage
	= value:rawNumber '%' {
		return N('percentage', [value])
	}

dimension
	= value:rawNumber unit:rawIdentifier {
		return N('dimension', [value, unit])
	}

number
	= value:rawNumber {
		return N('number', [value])
	}

rawNumber = value:$([0-9]* '.' [0-9]+ / [0-9]+) {
		return +value
	}

color
	= '#' rgb:$[0-9a-z]i+ {
		if (rgb.length !== 3 && rgb.length !== 6)
			return

		return N('color', [rgb])
	}

function
	= name:rawIdentifier '(' _ argumentList:argumentList _ ')' {
		return N('function', [name, argumentList])
	}

argumentList
	= first:nonCommaList rest:(_ ',' _ s:nonCommaList {return s})* {
		rest.unshift(first)
		return N('argumentList', rest)
	}

boolean
	= 'true'i {
		return N('boolean', [true])
	}
	/ 'false'i {
		return N('boolean', [false])
	}

null
	= 'null'i {
		return N('null')
	}

assignment
	= name:variable _ operator:$([-+*/?]? '=') _ value:(mixin / list) _ semicolon {
		return N('assignment', [name, operator, value])
	}

media
	= '@media'i _ mediaQueryList:mediaQueryList _ ruleList:ruleList {
		return N('media', [mediaQueryList, ruleList])
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q})* {
		rest.unshift(first)
		return N('mediaQueryList', rest)
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(_ 'and'i _ m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first)
		return N('mediaQuery', rest)
	}

mediaInterpolation
	= value:variable {
		return N('mediaInterpolation', [value])
	}

mediaType
	= modifier:(m:('only'i / 'not'i) _ {return m})? value:identifier {
		return N('mediaType', [modifier || null, value])
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:list _ {return v})? ')' {
		return N('mediaFeature', [name, value || null])
	}

extend
	= '@extend'i all:'-all'i? _ selectorList:selectorList _ semicolon {
		return N('extend', [selectorList], {all: !!all})
	}

void
	= '@void'i _ ruleList:ruleList {
		return N('void', [ruleList])
	}

block
	= '@block'i _ ruleList:ruleList {
		return N('block', [ruleList])
	}

import
	= '@import'i _ value:(string / url / variable) _ mediaQueryList:(m:mediaQueryList _ {return m})? semicolon {
		return N('import', [value, mediaQueryList || null])
	}

url
	= 'url('i _ value:(string / urlAddr) _ ')' {
		return N('url', [value])
	}

urlAddr
	= value:$([!#$%&*-~]+) {
		return value
	}

if
	= '@if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e})? {
		return N('if', [condition, consequence, alternative || null])
	}

elseIf
	= '@else'i _ 'if'i _ condition:list _ consequence:ruleList alternative:(_ e:(elseIf / else) {return e})? {
		return N('if', [condition, consequence, alternative || null])
	}

else
	= '@else'i _ ruleList:ruleList {
		return ruleList
	}

for
	= '@for'i _ value:variable _ index:(',' _ i:variable _ {return i})? step:('by'i _ a:additiveExpression _ {return a})? 'in'i _ list:list _ ruleList:ruleList {
		return N('for', [value, index || null, step || null, list, ruleList])
	}

mixin
	= '@mixin' parameterList:(_ p:parameterList {return p})? _ ruleList:ruleList {
		return N('mixin', [parameterList || null, ruleList])
	}

parameterList
	= first:parameter rest:(_ ',' _ p:parameter {return p})* {
		rest.unshift(first)
		return N('parameterList', rest)
	}

parameter
	= variable:variable value:(_ '=' _ s:nonCommaList {return s})? {
		return N('parameter', [variable, value || null])
	}

mixinCall
	= name:variable argumentList:('(' _ a:argumentList? _ ')' {return a}) _ semicolon {
		return N('mixinCall', [name, argumentList || null])
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p})? 'keyframes'i _ name:identifier _ keyframeList:keyframeList {
		return N('keyframes', [prefix || null, name, keyframeList])
	}

keyframeList
	= '{' _ first:keyframe rest:(_ k:keyframe {return k})* _ '}' {
		rest.unshift(first)
		return N('keyframeList', rest)
	}

keyframe
	= keyframeSelectorList:keyframeSelectorList _ propertyList:propertyList {
		return N('keyframe', [keyframeSelectorList, propertyList])
	}

keyframeSelectorList
	= first:keyframeSelector rest:((_ ',' _) k:keyframeSelector {return k})* {
		rest.unshift(first)
		return N('keyframeSelectorList', rest)
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return N('keyframeSelector', [value])
	}

propertyList
	= '{' _ properties:properties _ '}' {
		return N('propertyList', properties)
	}

properties
	= first:property rest:(_ p:property {return p})* {
		rest.unshift(first)
		return rest
	}

fontFace
	= '@font-face'i _ propertyList:propertyList {
		return N('fontFace', [propertyList])
	}

charset
	= '@charset'i _ value:string _ semicolon {
		return N('charset', [value])
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
		return value
	}

nl
	= '\r\n' / [\n\r\f]

// eof
// 	= !.