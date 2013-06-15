Ext.define('Spriter.view.Panel2', {
	extend: 'Ext.panel.Panel',
	title: '从一张sprite图自动识别图形',
	alias: 'widget.spritetype2',
	layout: 'card',
    id: 'panel2',

    initComponent: function() {
    	var navigate, step1, step2;

    	navigate = function(panel, direction) {
          var layout = panel.getLayout();
          layout[direction]();
          Ext.getCmp('move-prev2').setDisabled(!layout.getPrev());
          Ext.getCmp('move-next2').setDisabled(!layout.getNext());
        };

        step1 = {
        	id: 'step1b',
        	items: [
        		{
        			border: 0,
        			margin: 10,
        			html: 'Step.1 选择要生成的Sprite图片尺寸，完成后自动进入下一步'
        		},
        		{
        			border: 0,
        			margin: 10,
                    id: 'upload2',
        			html: '<input id="upload2" type="file" />'
        		}
        	]
        };

        step2 = {
        	id: 'step2b',
        	items: [
        		{
        			border: 0,
        			margin: 10,
        			html: 'Step.2 确认要生成的class命名规则，然后点击进入下一步（可以拖放图片中的icon位置进行微调）'
        		},
        		{
        			border: 0,
        			margin: 10,
                    xtype: 'textfield',
                    cls: 'set-prefix',
                    value: 'icon_',
                    fieldLabel: '前缀'
        		},
        		{
        			border: 0,
        			margin: 10,
                    xtype: 'combobox',
                    cls: 'set-name-rule',
                    fieldLabel: '命名',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'type',
                    value: '前缀+原图名_序号',
                    editable: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'value'],
                        data: [{name: '前缀+原图名_序号', value: '1'},{name: '前缀+序号', value: '2'}]
                    })
        		}
        	]
        };
        
        this.bbar = [
	        {
	          id: 'move-prev2', 
	          text: 'back', 
	          handler: function(btn) {
	            navigate(btn.up('panel'), "prev")
	          },
	          disabled: true
	        }, '-&gt;', {
	          id: 'move-next2', 
	          text: 'next', 
	          handler: function(btn) {
	            navigate(btn.up('panel'), "next")
	          },
	          disabled: true
	        }
	      ];
        this.items = [step1, step2, {xtype: 'spritesave'}]

        this.callParent(arguments);
    }
});