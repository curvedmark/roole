assert = require './assert';

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