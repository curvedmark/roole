assert = require '../assert'

suite 'prefix'

test 'box-sizing', ->
	assert.compileTo '''
		body
			box-sizing: border-box
	''', '''
		body {
			-webkit-box-sizing: border-box;
			-moz-box-sizing: border-box;
			box-sizing: border-box;
		}
	'''

# test 'prefixed property exists', ->
# 	assert.compileTo '''
# 		body
# 			-moz-box-sizing: padding-box
# 			box-sizing: border-box
# 	''', '''
# 		body {
# 			-moz-box-sizing: padding-box;
# 			-webkit-box-sizing: border-box;
# 			box-sizing: border-box;
# 		}
# 	'''

# test 'transition-property', ->
# 	assert.compileTo '''
# 		body
# 			transition-property: transform, border-radius
# 	''', '''
# 		body {
# 			-o-transition-property: -o-transform, border-radius
# 			-moz-transition-property: -moz-transform, -moz-border-radius
# 			-webkit-transition-property: -webkit-transform, -webkit-border-radius
# 			transition-property: -o-transform, -moz-transform, -webkit-transform, transform, -moz-border-radius, -webkit-border-radius, border-radius
# 		}
# 	'''

# #TODO: webkit-gradient()
test 'linear-gradient()', ->
	assert.compileTo '''
		body
			background: linear-gradient(#000, #fff)
	''', '''
		body {
			background: -webkit-linear-gradient(#000, #fff);
			background: -moz-linear-gradient(#000, #fff);
			background: -o-linear-gradient(#000, #fff);
			background: linear-gradient(#000, #fff);
		}
	'''

test 'linear-gradient() with starting position', ->
	assert.compileTo '''
		body
			background: linear-gradient(to bottom, #000, #fff)
	''', '''
		body {
			background: -webkit-linear-gradient(top, #000, #fff);
			background: -moz-linear-gradient(top, #000, #fff);
			background: -o-linear-gradient(top, #000, #fff);
			background: linear-gradient(to bottom, #000, #fff);
		}
	'''

test 'linear-gradient() with starting position consisting of two identifiers', ->
	assert.compileTo '''
		body
			background: linear-gradient(to top left, #000, #fff)
	''', '''
		body {
			background: -webkit-linear-gradient(bottom right, #000, #fff);
			background: -moz-linear-gradient(bottom right, #000, #fff);
			background: -o-linear-gradient(bottom right, #000, #fff);
			background: linear-gradient(to top left, #000, #fff);
		}
	'''

test 'multiple linear-gradient()', ->
	assert.compileTo '''
		body
			background: linear-gradient(#000, #fff), linear-gradient(#111, #eee)
	''', '''
		body {
			background: -webkit-linear-gradient(#000, #fff), -webkit-linear-gradient(#111, #eee);
			background: -moz-linear-gradient(#000, #fff), -moz-linear-gradient(#111, #eee);
			background: -o-linear-gradient(#000, #fff), -o-linear-gradient(#111, #eee);
			background: linear-gradient(#000, #fff), linear-gradient(#111, #eee);
		}
	'''

test 'background with regular value', ->
	assert.compileTo '''
		body
			background: #fff
	''', '''
		body {
			background: #fff;
		}
	'''


# test 'linear-gradient() with starting angle'