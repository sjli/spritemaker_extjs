Ext.define('Spriter.view.Code', {
    extend: 'Ext.panel.Panel',
	alias: 'widget.spritecode',
	title: 'Css代码',
    region: 'center',
    width: 600,
    autoScroll: true,
    html: '<pre id="code" contenteditable style="white-space: pre;"></pre>'
});
