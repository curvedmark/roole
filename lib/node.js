'use strict'

var Node = module.exports = function(type, children, properties) {
	if (!Array.isArray(children)) {
		properties = children
		children = null
	}

	var node = properties || {}

	node.type = type

	if (children)
		node.children = children

	return node
}

Node.clone = function(node, deep) {
	if (Array.isArray(node))
		return node.map(function(node) {
			return Node.clone(node)
		})

	if (node === null || typeof node !== 'object')
		return node

	var clone = Object.create(node)

	if (deep === undefined)
		deep = true

	if (deep && node.children)
		clone.children = Node.clone(node.children)

	return clone
}

Node.equal = function(node1, node2) {
	if (Array.isArray(node1) || Array.isArray(node2)) {
		if (!Array.isArray(node1) || !Array.isArray(node2))
			return false

		if (node1.length !== node2.length)
			return false

		return node1.every(function(childNode1, i) {
			var childNode2 = node2[i]
			return Node.equal(childNode1, childNode2)
		})
	}

	if (node1 === null ||
	    typeof node1 !== 'object' ||
	    node2 === null ||
	    typeof node2 !== 'object'
	)
		return node1 === node2

	if (node1.type !== node2.type)
		return false

	if (!node1.children && !node2.children)
		return true

	if (!node1.children || !node2.children)
		return false

	return Node.equal(node1.children, node2.children)
}

Node.toNumber = function(node) {
	switch (node.type) {
	case 'number':
	case 'percentage':
	case 'dimension':
		return node.children[0]
	default:
		return null
	}
}

Node.toBoolean = function(node) {
	switch (node.type) {
	case 'boolean':
		return node.children[0]
	case 'number':
	case 'percentage':
	case 'dimension':
		return !!node.children[0]
	case 'identifier':
	case 'string':
		return node.children.length !== 1 || !!node.children[0]
	}

	return true
}

Node.toListNode = function(rangeNode) {
	var fromNode = rangeNode.children[0]
	var fromNumber = fromNode.children[0]

	var operator = rangeNode.children[1]
	var exclusive = operator.length === 3

	var toNode = rangeNode.children[2]
	var toNumber = toNode.children[0]

	var stepNumber = fromNumber < toNumber ? 1 : -1

	var itemNodes = []
	var i = 0
	while (
		exclusive ?
			stepNumber > 0 && fromNumber < toNumber ||
			stepNumber < 0 && fromNumber > toNumber
		:
			stepNumber > 0 && fromNumber <= toNumber ||
			stepNumber < 0 && fromNumber >= toNumber
	) {
		if (i++)
			itemNodes.push(Node('separator', [' '], {loc: rangeNode.loc}))

		var fromClone = Node.clone(fromNode)
		fromClone.children[0] = fromNumber
		itemNodes.push(fromClone)

		fromNumber += stepNumber
	}

	if (!itemNodes.length)
		return Node('null', {loc: rangeNode.loc})

	if (itemNodes.length === 1)
		return itemNodes[0]

	return Node('list', itemNodes, {loc: rangeNode.loc})
}