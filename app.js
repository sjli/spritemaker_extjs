Ext.application({
	requires: ['Ext.container.Viewport'],
	name: 'Spriter',
	appFolder: 'app',

	launch: function() {
		
		Ext.create('Ext.container.Viewport', {
			layout: 'column',
			items: [
				{
					xtype: 'panel',
					layout: 'border',
					width: 600,
					height: document.documentElement.clientHeight,
					items: [
						{xtype: 'spritetab'},
						{xtype: 'spritecode'}
					]
				},
				{xtype: 'spritecanvas'}
				
			]
		});
	},

	controllers: [
		'Maker'
	]
});
