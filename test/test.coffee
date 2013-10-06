assert = require './assert';
roole = require '..';

test "compile", ->
	assert.compileTo '''
		$prop = box;
		.$prop { {$prop}-sizing: border-$prop }
	''', '''
		.box {
			-webkit-box-sizing: border-box;
			-moz-box-sizing: border-box;
			box-sizing: border-box;
		}
	'''

test "use", ->
	roole.use (node, options)-> { type: 'null' }
	assert.compileTo '''
		body { margin: 0 }
	''', '''
		null
	'''