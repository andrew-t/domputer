rm -rf dist

node node_modules/.bin/babel \
	--ignore node_modules,test \
	. \
	--out-dir dist

node node_modules/.bin/node-sass \
	style.scss > dist/style.css
