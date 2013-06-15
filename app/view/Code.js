Ext.define('Spriter.view.Code', {
    extend: 'Ext.panel.Panel',
	alias: 'widget.spritecode',
	title: 'Css代码',
    region: 'center',
    width: 600,
    autoScroll: true,
    html: '<div id="code" contenteditable style="white-space: pre;"></div>'
});