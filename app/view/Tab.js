Ext.define('Spriter.view.Tab', {
    extend: 'Ext.tab.Panel',
    title: 'Css Sprite生成器 v1.0',
    width: 600,
    height: 300,
    region: 'north',
    alias: 'widget.spritetab',
    items: [
        {xtype: 'spritetype1'},
        {xtype: 'spritetype2'}
    ]
});