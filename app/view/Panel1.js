Ext.define('Spriter.view.Panel1', {
	extend: 'Ext.panel.Panel',
	title: '从多个icon图拼合成一张Sprite图',
	alias: 'widget.spritetype1',
	layout: 'card',


    initComponent: function() {
    	var navigate, step1, step2;

    	navigate = function(panel, direction) {
          var layout = panel.getLayout();
          layout[direction]();
          Ext.getCmp('move-prev1').setDisabled(!layout.getPrev());
          Ext.getCmp('move-next1').setDisabled(!layout.getNext());
        };

        step1 = {
        	id: 'step1a',
        	items: [
        		{
        			border: 0,
        			margin: 10,
        			html: 'Step.1 选择上传icon图(可多选), 选择要生成的Sprite图片尺寸，选完所有后点击进入下一步'
        		},
        		{
        			border: 0,
        			margin: 10,
                    id: 'upload1',
        			html: '<input id="upload1" multiple type="file" />'
        		},
        		{
        			border: 0,
        			margin: 10,
                    xtype: 'numberfield',
                    fieldLabel: 'Sprite宽度',
                    id: 'set-width1',
                    value: 720,
                    size: 6
        		},
        		{
        			border: 0,
        			margin: 10,
                    xtype: 'numberfield',
                    fieldLabel: 'Sprite高度',
                    id: 'set-height1',
                    value: 480,
                    size: 6
        		},
        		{
        			border: 0,
        			margin: 10,
                    xtype: 'numberfield',
                    fieldLabel: 'icon间距',
                    id: 'set-padding1',
                    value: 10,
                    size: 4
        		}
        	]
        };

        step2 = {
        	id: 'step2a',
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
                    value: '',
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
                    value: '前缀+icon图名',
                    editable: false,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'type'],
                        data: [{name: '前缀+icon图名', type: '1'},{name: '前缀+序号', type: '2'}]
                    })
        		},
                {
                    border: 0,
                    margin: 10,
                    xtype: 'textfield',
                    cls: 'set-url',
                    value: '',
                    fieldLabel: '预定css中图片地址'
                },
                {
                    border: 0,
                    margin: 10,
                    xtype: 'checkbox',
                    cls: 'add-hover',
                    value: '',
                    fieldLabel: '-hover后缀添加:hover'
                }
        	]
        };

        this.bbar = [
	        {
	          id: 'move-prev1', 
	          text: 'back', 
	          handler: function(btn) {
	            navigate(btn.up('panel'), "prev")
	          },
	          disabled: true
	        }, '-&gt;', {
	          id: 'move-next1', 
	          text: 'next', 
	          handler: function(btn) {
	            navigate(btn.up('panel'), "next")
	          },
              disabled: true
	        }
	      ];
        this.items = [step1, step2, {xtype: 'spritesave'}];

        this.callParent(arguments);
    }
});