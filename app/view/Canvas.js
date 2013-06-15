Ext.define('Spriter.view.Canvas', {
    extend: 'Ext.panel.Panel',
    title: '图片显示区',
	alias: 'widget.spritecanvas',
    columnWidth: 1,
    height: 700,
	html: '<div id="viewport" style="position: relative; width: 700px; height: 400px;"></div>'
});