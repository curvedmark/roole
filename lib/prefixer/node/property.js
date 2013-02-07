var Node = require('../../node')
var PropertyNamePrefixer = require('../propertyNamePrefixer')
var LinearGradientPrefixer = require('../linearGradientPrefixer')

var Prefixer = require('../prefixer')

Prefixer.prototype.visitProperty = function(propertyNode) {
	var propertyNameNode = propertyNode.children[0]
	var propertyValueNode = propertyNode.children[1]

	var propertyName = propertyNameNode.children[0]
	var propertyNodes = []

	switch (propertyName) {
	case 'background':
	case 'background-image':
		var options = {
			prefixes: this.prefixes
		}
		var prefixedPropertyValueNodes = new LinearGradientPrefixer().prefix(propertyValueNode, options)

		prefixedPropertyValueNodes.forEach(function(prefixedPropertyValueNode) {
			var propertyClone = Node.clone(propertyNode, false)
			propertyClone.children = [propertyNameNode, prefixedPropertyValueNode]
			propertyNodes.push(propertyClone)
		})

		break

	default:
		var options = {
			prefixes: this.prefixes
		}
		var prefixedPropertyNameNodes = new PropertyNamePrefixer().prefix(propertyNameNode, options)

		prefixedPropertyNameNodes.forEach(function(prefixedPropertyNameNode) {
			var propertyClone = Node.clone(propertyNode, false)
			propertyClone.children = [prefixedPropertyNameNode, propertyValueNode]
			propertyNodes.push(propertyClone)
		})
	}

	if (!propertyNodes.length)
		return

	propertyNodes.push(propertyNode)
	return propertyNodes
}