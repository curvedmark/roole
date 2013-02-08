TEST_FILES = \
	test/unit/indent.coffee \
	test/unit/comment.coffee \
	test/unit/selector.coffee \
	test/unit/property.coffee \
	test/unit/ruleset.coffee \
	test/unit/assignment.coffee \
	test/unit/identifier.coffee \
	test/unit/string.coffee \
	test/unit/number.coffee \
	test/unit/percentage.coffee \
	test/unit/dimension.coffee \
	test/unit/url.coffee \
	test/unit/color.coffee \
	test/unit/function.coffee \
	test/unit/list.coffee \
	test/unit/addition.coffee \
	test/unit/subtraction.coffee \
	test/unit/multiplication.coffee \
	test/unit/division.coffee \
	test/unit/relational.coffee \
	test/unit/equality.coffee \
	test/unit/logical.coffee \
	test/unit/range.coffee \
	test/unit/unary.coffee \
	test/unit/expression.coffee \
	test/unit/mediaQuery.coffee \
	test/unit/media.coffee \
	test/unit/import.coffee \
	test/unit/extend.coffee \
	test/unit/void.coffee \
	test/unit/if.coffee \
	test/unit/for.coffee \
	test/unit/mixin.coffee \
	test/unit/scope.coffee \
	test/unit/prefix.coffee \
	test/unit/keyframes.coffee

method-files = $(patsubst %,lib/$(1)/%.js,$(shell grep -oE "\./node/\w+" lib/$(1)/$(1).js))

LIB_FILES = \
	lib/helper.js \
	lib/err.js \
	lib/node.js \
	lib/parser/generatedParser.js \
	lib/parser/index.js \
	lib/visitor.js \
	lib/importer/xhr-loader.js \
	lib/importer/importer.js \
	lib/importer/index.js \
	lib/evaluator/scope.js \
	lib/evaluator/evaluator.js \
	$(call method-files,evaluator) \
	lib/evaluator/index.js \
	lib/extender/extender.js \
	$(call method-files,extender) \
	lib/extender/mediaFilter.js \
	lib/extender/rulesetFilter.js \
	lib/extender/rulesetExtender.js \
	lib/extender/index.js \
	lib/normalizer/normalizer.js \
	$(call method-files,normalizer) \
	lib/normalizer/index.js \
	lib/prefixer/prefixer.js \
	lib/prefixer/propertyNamePrefixer.js \
	lib/prefixer/linearGradientPrefixer.js \
	$(call method-files,prefixer) \
	lib/prefixer/index.js \
	lib/compiler/compiler.js \
	$(call method-files,compiler) \
	lib/compiler/index.js \
	lib/formatter.js \
	lib/roole.js

VERSION = $(shell node -e "console.log(require('./package.json').version)")

parser: lib/parser/generatedParser.js

lib/parser/generatedParser.js: \
	lib/parser/grammar.pegjs \
	node_modules/.bin/pegjs \
	build/json \
	build/mustache \
	lib/parser/generatedParser.js.mustache \
	node_modules/mustache

	cat $< | \
		$(word 2,$^) -e '' --allowed-start-rules root,selector,mediaQuery | \
		$(word 3,$^) content=- | \
		$(word 4,$^) $(word 5,$^) >$@

test: node_modules/.bin/mocha parser
	$< -bu qunit --compilers coffee:coffee-script $(TEST_FILES)

coverage: coverage/index.html

COV_LIB_FILES = $(addprefix coverage/,$(LIB_FILES))
COV_TEST_FILES = $(addprefix coverage/,$(TEST_FILES))
coverage/index.html: \
	node_modules/.bin/mocha \
	$(COV_LIB_FILES) \
	$(COV_TEST_FILES)\
	coverage/lib/importer/fs-loader.js \
	coverage/test/assert.js

	$< \
		-R html-cov \
		-u qunit \
		--compilers coffee:coffee-script \
		$(COV_TEST_FILES) >$@

coverage/lib/%: node_modules/.bin/jscoverage lib/%
	$< $(word 2,$^) $@

coverage/test/%: test/% | coverage/test/unit
	cp $< $@

coverage/test/unit:
	mkdir -p $@

roole: dist/roole.js

min: dist/roole.min.js

dist/roole.js: \
	build/commonjs-stripper \
	build/json \
	build/mustache \
	dist/roole.js.mustache \
	package.json \
	$(LIB_FILES)

	$< $(LIB_FILES) | \
		$(word 2,$^) version=$(VERSION) content=- | \
		$(word 3,$^) $(word 4,$^) >$@

dist/roole.min.js: \
	node_modules/.bin/uglifyjs \
	dist/roole.js \
	build/json \
	build/mustache \
	dist/roole.min.js.mustache \
	package.json

	$< $(word 2,$^) -cm | \
	 	$(word 3,$^) version=$(VERSION) content=- | \
		$(word 4,$^) $(word 5,$^) >$@

browser-test: parser roole test/test.js

test/test.js: \
	build/commonjs-stripper \
	test/assert.js \
	node_modules/.bin/coffee \
	$(TEST_FILES)

	$< $(word 2,$^) >$@
	$< $(TEST_FILES) | $(word 3,$^) -sbp >>$@

node_modules/%:
	npm install

clean:
	rm -rf \
		lib/parser/generatedParser.js \
		coverage \
		dist/roole.js \
		dist/roole.min.js \
		test/test.js

.PHONY: parser test coverage roole min browser-test clean