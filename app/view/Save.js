Ext.define('Spriter.view.Save', {
    extend: 'Ext.panel.Panel',
	alias: 'widget.spritesave',
	items: [
        {
            border: 0,
            margin: 10,
            html: 'Step.3 点击保存图片以及css代码（也可以再次拖放图片中的icon位置进行微调，调整后别忘了点击更新来生成新的css）'
        },
        {
            margin: 10,
            xtype: 'button',
            text: '裁去空白',
            cls: 'btn-clip'             
        },
        {
            margin: 10,
            xtype: 'button',
            text: '更新css',
            cls: 'btn-update'             
        },
        {
            margin: 10,
            xtype: 'button',
            text: '下载图片',
            cls: 'btn-down',
            target: '_blank',
            hrefTarget: '_blank'           
        }
    ]
});