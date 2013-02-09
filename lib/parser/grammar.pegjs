{
	var indentSizeStack = []
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
	= predent rules:rootRules? {
		return N('root', rules || [])
	}

rootRules
	= first:rootRule rest:(isodent r:rootRule {return r})* {
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
	/ comment
	/ keyframes

comment
	= '/*' value:$(([^*] / '*' [^/])*) '*/' {
		return N('comment', [value])
	}

ruleset
	= selectorList:selectorList indent ruleList:ruleList outdent {
		return N('ruleset', [selectorList, ruleList])
	}

selectorList
	= first:selector rest:(_ ',' _ s:selector {return s} / isodent s:selector {return s})* {
		rest.unshift(first)
		return N('selectorList', rest)
	}

singleLineSelectorList
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
	// / negaSelector
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
	= '[' _ name:identifier rest:(_ o:('^=' / '$=' / '*=' / '~=' / '|=' / '=') _ e:expression {return [o, e]})? _ ']' {
		if (rest) rest.unshift(name)
		else rest = [name]

		return N('attributeSelector', rest)
	}

pseudoSelector
	= ':' doubled:':'? value:identifier {
		return N('pseudoSelector', [value], {doubled: !!doubled})
	}

ruleList
	= first:rule rest:(isodent r:rule {return r})* {
		rest.unshift(first)
		rest = _.flatten(rest)
		return N('ruleList', rest)
	}

rule
	= ruleset
	/ properties
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

properties
	= first:property rest:(_ semicolon _ p:property {return p})* semicolon? {
		rest.unshift(first)
		return rest
	}

semicolon
	= ';' (_ ';')*

property
	= star:'*'? name:identifier _ ':' _ value:expression _ priority:'!important'? {
		if (star) {
			if (name.type === 'identifier')
				name.children.unshift(star)
			else
				name = N('identifier', [star, name])
		}
		return N('property', [name, value, priority || null])
	}

expression
	= list

list
	= first:logicalOrExpression rest:(separator logicalOrExpression)+ {
		rest = _.flatten(rest)
		rest.unshift(first)
		return N('list', rest)
	}
	/ logicalOrExpression

nonCommaList
	= first:logicalOrExpression rest:(nonCommaSeparator logicalOrExpression)+ {
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

nonCommaSeparator
	= value:('/' / s {return ' '}) {
		return N('separator', [value])
	}

commaSeparator
	= value:',' {
		return N('separator', [value])
	}

logicalOrExpression
	= first:logicalAndExpression rest:(s 'or'i s e:logicalAndExpression {return e})* {
		var node = first
		rest.forEach(function(operand) {
			node = N('logicalExpression', [node, 'or', operand])
		})
		return node
	}

logicalAndExpression
	= first:equalityExpression rest:(s 'and'i s e:equalityExpression {return e})* {
		var node = first
		rest.forEach(function(operand) {
			node = N('logicalExpression', [node, 'and', operand])
		})
		return node
	}

equalityExpression
	= first:relationalExpression rest:((s o:('isnt'i / 'is'i) s {return o}) relationalExpression)* {
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
	= '(' _ expression:expression _ ')' {
		return expression
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
	= name:variable _ operator:$([-+*/?]? '=') _ value:(mixin / expression) {
		return N('assignment', [name, operator, value])
	}

variable
	= '$' value:rawIdentifier {
		return N('variable', [value.toLowerCase()])
	}

media
	= '@media'i s mediaQueryList:mediaQueryList indent ruleList:ruleList outdent {
		return N('media', [mediaQueryList, ruleList])
	}

mediaQueryList
	= first:mediaQuery rest:(_ ',' _ q:mediaQuery {return q})* {
		rest.unshift(first)
		return N('mediaQueryList', rest)
	}

mediaQuery
	= first:(mediaInterpolation / mediaType / mediaFeature) rest:(s 'and'i s m:(mediaInterpolation / mediaFeature) {return m})* {
		rest.unshift(first)
		return N('mediaQuery', rest)
	}

mediaInterpolation
	= value:variable {
		return N('mediaInterpolation', [value])
	}

mediaType
	= modifier:(m:('only'i / 'not'i) s {return m})? value:identifier {
		return N('mediaType', [modifier || null, value])
	}

mediaFeature
	= '(' _ name:identifier _ value:(':' _ v:expression _ {return v})? ')' {
		return N('mediaFeature', [name, value || null])
	}

extend
	= '@extend'i s selectorList:singleLineSelectorList {
		return N('extend', [selectorList])
	}

void
	= '@void'i indent ruleList:ruleList outdent {
		return N('void', [ruleList])
	}

block
	= '@block'i indent ruleList:ruleList outdent {
		return N('block', [ruleList])
	}

import
	= '@import'i s value:(string / url / variable) mediaQueryList:(_ m:mediaQueryList {return m})? {
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
	= '@if'i s condition:expression indent consequence:ruleList outdent alternative:(isodent e:(elseIf / else) {return e})? {
		return N('if', [condition, consequence, alternative || null])
	}

elseIf
	= '@else if'i s condition:expression indent consequence:ruleList outdent alternative:(isodent e:(elseIf / else) {return e})? {
		return N('if', [condition, consequence, alternative || null])
	}

else
	= '@else'i indent ruleList:ruleList outdent {
		return ruleList
	}

for
	= '@for'i s value:variable index:(_ ',' _ i:variable {return i})? step:(s 'by'i s a:additiveExpression {return a})? s 'in'i s list:expression indent ruleList:ruleList outdent {
		return N('for', [value, index || null, step || null, list, ruleList])
	}

mixin
	= '@mixin' parameterList:(s p:parameterList {return p})? indent ruleList:ruleList outdent {
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
	= name:variable argumentList:('(' _ a:argumentList? _ ')' {return a}) {
		return N('mixinCall', [name, argumentList || null])
	}

keyframes
	= '@' prefix:('-' p:$([a-z_]i [a-z0-9_]i*) '-' {return p})? 'keyframes'i s name:identifier indent keyframeList:keyframeList outdent {
		return N('keyframes', [prefix || null, name, keyframeList])
	}

keyframeList
	= first:keyframe rest:(isodent k:keyframe {return k})* {
		rest.unshift(first)
		return N('keyframeList', rest)
	}

keyframe
	= keyframeSelectorList:keyframeSelectorList indent propertyList:propertyList outdent {
		return N('keyframe', [keyframeSelectorList, propertyList])
	}

keyframeSelectorList
	= first:keyframeSelector rest:((_ ',' _  / isodent) k:keyframeSelector {return k})* {
		rest.unshift(first)
		return N('keyframeSelectorList', rest)
	}

keyframeSelector
	= value:('from'i / 'to'i / percentage) {
		return N('keyframeSelector', [value])
	}

propertyList
	= first:(properties / property) rest:(isodent p:(properties / property) {return p})* {
		rest.unshift(first)
		rest = _.flatten(rest)
		return N('propertyList', rest)
	}

predent
	= indentedSpaces:_ lines:(nl s:_ {return s})* {
		if (lines.length)
			indentedSpaces = lines[lines.length - 1]

		indentSizeStack.push(indentedSpaces.length)
	}

indent
	= _ lines:(nl s:_ {return s})+ {
		var lastIndentSize = indentSizeStack[indentSizeStack.length - 1]
		var indentSize = lines[lines.length - 1].length

		if (indentSize <= lastIndentSize) return null
		indentSizeStack.push(indentSize)
	}

isodent
	= _ lines:(nl s:_ {return s})+ {
		var lastIndentSize = indentSizeStack[indentSizeStack.length - 1]
		var indentSize = lines[lines.length - 1].length

		if (indentSize > lastIndentSize)
			return null

		if (indentSizeStack.length > 1) {
			var penultimateIndentSize = indentSizeStack[indentSizeStack.length - 2]
			if (indentSize <= penultimateIndentSize)
				return null
		}
	}

outdent
	= _ lines:(nl _)* eof
	/ &(_ lines:(nl s:_ {return s})+ {
		var penultimateIndentSize = indentSizeStack[indentSizeStack.length - 2]
		var indentSize = lines[lines.length - 1].length

		if (indentSize > penultimateIndentSize)
			return null

		indentSizeStack.pop()
	})

_
	= s:s? {
		return s
	}

s
	= [ \t]* '//' [^\r\n\f]*
	/ s:$([ \t]+) {
		return s
	}

nl
	= '\r\n' / [\n\r\f]

eof
	= !.