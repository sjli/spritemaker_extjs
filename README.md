spritemaker_extjs
=================

css sprite maker with extjs ui<br>

rebuild(require sencha sdk tools):<br>
use the app.js when developing. but if you want to push it online, it's more recomended that to compile all the required js in to one app-all.js. Here is what to do below:
<code>sencha create jsb -a example.html -p myapp.jsb3</code><br>
<code>sencha build -p myapp.jsb3 -d ./</code><br>
<code>java -jar yuicompressor-2.4.8.jar app-all.js -o app-all-min.js</code>
And at last, change the js src to app-all-min.js in example.html.

