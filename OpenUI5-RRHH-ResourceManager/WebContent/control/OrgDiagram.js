sap.ui.define([
	'sap/ui/core/Control',
	'App/orgdiagram/js/jquery/jquery-ui-1.10.2.custom.min',
    'App/orgdiagram/js/primitives.min',
    'sap/m/Slider'
    
], function (Control,jqueryui,primitiv, Slider) {
	"use strict";
	return Control.extend("App.control.OrgDiagram", {

		metadata : {
			properties : {
				dataConfig : {type : "array", defaultValue:[]},
                zoom : {type : "int", defaultValue:3}
			},
			aggregations : {
			},
			events : {
				change : {
					parameters : {
						dataConfig : {type : "array"},
                        zoom : {type : "int"}
					}
				},
                onPressAdd : {}
			}
		},

    
		init : function () {
            var that = this;
            this.configureOptions();
		},

        setDataConfig : function(ivalue){
            this._options.items = ivalue;
            this.setProperty("dataConfig", ivalue, true);
            if (this._options) {
                jQuery("#basicdiagram" + this.getId()).orgDiagram(this._options);
                this.renderOrgDiagram(this.getZoom());
            }
        },

        setZoom : function(iValue){
            this.setProperty("zoom", iValue, true);
            if (this._options) {
                this.renderOrgDiagram(iValue);
            }
        },

		onAfterRendering : function() {
            var that = this;
            setTimeout(function(){
                jQuery("#basicdiagram" + that.getId()).orgDiagram(that._options);
                that.renderOrgDiagram(that.getZoom());
            },5);
		},

        renderOrgDiagram : function(nZoom) {

            jQuery("#basicdiagram" + this.getId()).orgDiagram({
                        defaultTemplateName: "Zoom" + nZoom
                    });
            jQuery("#basicdiagram" + this.getId()).orgDiagram("update", primitives.orgdiagram.UpdateMode.Refresh);

            $(".orgdiagram").scrollLeft( ( $("div[class='placeholder orgdiagram']").width() - jQuery("#basicdiagram" + this.getId()).width() ) / 2);

        },

		renderer : function (oRM, oControl) {
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.writeClasses();
            oRM.write(">");
            oRM.write('<link rel="stylesheet" type="text/css" href="orgdiagram/js/jquery/ui-lightness/jquery-ui-1.10.2.custom.css">');
            oRM.write('<link rel="stylesheet" type="text/css" href="orgdiagram/css/primitives.latest.css">');
            oRM.write('<div id="basicdiagram'+ oControl.getId()+'" style="width: 100%; height: 88vh;  position: relative; background-color:white;" />');
            oRM.write("</div>");
		},

        configureOptions : function() {

            var that = this;

            var options = new primitives.orgdiagram.Config();
            
            /*CARGA DE DATOS*/
            options.items = [];//this.getData();

            /* COFIGURACION DEL GRAFICO*/
            options.cursorItem = 0;
            options.onItemRender = this.onTemplateRender;
            
            /*carga los templates para el zoom*/
            options.templates = [this.getZoom0Template(), this.getZoom1Template(), this.getZoom2Template(),this.getZoom3Template(), this.getZoom4Template()];
            options.hasSelectorCheckbox = primitives.common.Enabled.True;
            //options.pageFitMode = primitives.common.PageFitMode.None;
            options.hasSelectorCheckbox = primitives.common.Enabled.False;
            options.orientationType = primitives.common.OrientationType.Top;
            
            /*zoom por default*/
            options.defaultTemplateName = "Zoom3";
            
          
            options.onCursorRender = this.onCursorRender;
            

            options.normalLevelShift = 20;
            options.dotLevelShift = 10;
            options.lineLevelShift = 10;
            options.normalItemsInterval = 20;
            options.dotItemsInterval = 10;
            options.lineItemsInterval = 10;

            options.arrowsDirection = primitives.common.GroupByType.Children;
            options.pageFitMode = primitives.orgdiagram.PageFitMode.None;

            //orientacion
            options.verticalAlignment = primitives.common.VerticalAlignmentType.Middle;
            options.horizontalAlignment = primitives.common.HorizontalAlignmentType.Top;

            options.onButtonClick = function(e, data) {
                if (data.name == 'edit') {
                    that.fireOnPressAdd({asignacionId : data.context.id});
                }
                
                
            };

            this._options = options;

        },

        // private functions
        onTemplateRender :  function (event, data) {
                switch (data.renderingMode) {
                    case primitives.common.RenderingMode.Create:
                        /* Initialize widgets here */
                        break;
                    case primitives.common.RenderingMode.Update:
                        /* Update widgets here */
                        break;
                }

                var itemConfig = data.context;

                data.element.find("[name=photo]").attr({ "src": itemConfig.image, "alt": itemConfig.title });
                data.element.find("[name=titleBackground]").css({ "background": itemConfig.itemTitleColor, "color" : "white" });
                data.element.parent().find("table").css({"color" : "white" });
                data.element.find("[name=label]").text(itemConfig.percent * 100.0 + '%');

                var fields = ["title", "description", "phone", "email"];
                for (var index = 0; index < fields.length; index++) {
                    var field = fields[index];

                    var element = data.element.find("[name=" + field + "]");
                    if (element.text() != itemConfig[field]) {
                        element.text(itemConfig[field]);
                    }
                }
            },

        getZoom0Template : function () {
                var result = new primitives.orgdiagram.TemplateConfig();
                result.name = "Zoom0";

                result.itemSize = new primitives.common.Size(100, 10);
                result.minimizedItemSize = new primitives.common.Size(3, 3);
                result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);
                result.onCursorRender = this.onCursorRender;

                var itemTemplate = jQuery(
                  '<div class="bp-item">'
                    + '<div name="title" class="bp-item" style="top: 0px; left: 0px; width: 100px; height: 10px; font-size: 8px; text-align:center;"></div>'
                + '</div>'
                ).css({
                    width: result.itemSize.width + "px",
                    height: result.itemSize.height + "px"
                }).addClass("bp-item");
                result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                return result;
            },

        getZoom1Template : function () {
                var result = new primitives.orgdiagram.TemplateConfig();
                
                result.name = "Zoom1";

                result.itemSize = new primitives.common.Size(120, 28);
                result.minimizedItemSize = new primitives.common.Size(3, 3);
                result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


                var itemTemplate = jQuery(
                  '<div class="bp-item">'
                    + '<div name="title" class="bp-item" style="top: 0px; left: 0px; width: 120px; height: 12px; font-size: 10px; text-align:center;"></div>'
                    + '<div name="description" class="bp-item" style="top: 14px; left: 0px; width: 120px; height: 12px; font-size: 10px; text-align:center;"></div>'
                + '</div>'
                ).css({
                    width: result.itemSize.width + "px",
                    height: result.itemSize.height + "px"
                }).addClass("bp-item");
                result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                return result;
            },

        getZoom2Template : function () {
                var result = new primitives.orgdiagram.TemplateConfig();
                 result.onCursorRender = this.onCursorRender;
            
                var buttons = [];
                
                buttons = this.getButtons();

                /*buttons.push(new primitives.orgdiagram.ButtonConfig("add", "ui-icon-plusthick", "Add"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("edit", " ui-icon-pencil", "Edit"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("delete", "ui-icon-closethick", "Delete"));*/


                result.hasButtons = primitives.common.Enabled.True;

                result.buttons = buttons;
                
                result.name = "Zoom2";

                result.itemSize = new primitives.common.Size(140, 64);
                result.minimizedItemSize = new primitives.common.Size(3, 3);
                result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


                var itemTemplate = jQuery(
                  '<div class="bp-item">'
                    + '<div class="bp-item bp-photo-frame" style="top: 0px; left: 0px; width: 50px; height: 60px; overflow: hidden;">'
                        + '<img name="photo" style="height:60px; width:50px;" />'
                    + '</div>'
                    + '<div name="title" class="bp-item" style="top: 2px; left: 56px; width: 84px; height: 12px; font-size: 10px; overflow: hidden;"></div>'
                    + '<div name="email" class="bp-item" style="top: 14px; left: 56px; width: 84px; height: 12px; font-size: 10px; overflow: hidden;"></div>'
                    + '<div name="description" class="bp-item" style="top: 28px; left: 56px; width: 84px; height: 62px; font-size: 10px; overflow: hidden;">' +
                   /* '<ul class="ui-widget ui-helper-clearfix" style="position: absolute; width: 24px; height: 86px; top: 28px; left: 338px; padding: 0px; margin: 0px; visibility: inherit;"><li data-buttonname="wrench" class="orgdiagrambutton ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only" role="button" aria-disabled="false" title="" style="position: absolute; top: 0px; left: 0px; width: 16px; height: 16px; padding: 3px;"><span class="ui-button-icon-primary ui-icon ui-icon-wrench"></span><span class="ui-button-text"></span></li><li data-buttonname="delete" class="orgdiagrambutton ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only" role="button" aria-disabled="false" title="" style="position: absolute; top: 26px; left: 0px; width: 16px; height: 16px; padding: 3px;"><span class="ui-button-icon-primary ui-icon ui-icon-close"></span><span class="ui-button-text"></span></li><li data-buttonname="add" class="orgdiagrambutton ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only" role="button" aria-disabled="false" title="" style="position: absolute; top: 52px; left: 0px; width: 16px; height: 16px; padding: 3px;"><span class="ui-button-icon-primary ui-icon ui-icon-person"></span><span class="ui-button-text"></span></li></ul>'+*/
                    '</div>'
                + '</div>'
                ).css({
                    width: result.itemSize.width + "px",
                    height: result.itemSize.height + "px"
                }).addClass("bp-item");
                result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                return result;
            },

            onCursorRender : function (event, data) {
            
                
                switch (data.renderingMode) {
                    case primitives.common.RenderingMode.Create:
                        break;
                    case primitives.common.RenderingMode.Update:
                        /* Update widgets here */
                        break;
                }

                var buttons = [];
                // It is not nessesary to use ButtonConfig class here. We can use regular noname objects as well.
                buttons = getButtons();
                
              /*  buttons.push(new primitives.orgdiagram.ButtonConfig("add", "ui-icon-plusthick", "Add"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("edit", " ui-icon-pencil", "Edit"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("delete", "ui-icon-closethick", "Delete"));
             */          
                
                if (buttons.length > 0) {
                    var topOffset = 2;
                    var buttonsInterval = 10;
                    // Cursor template contains several div elements so we have to select div we are going to use as buttons container
                    var buttonsPanel = data.element.find(".buttons-panel");

                    // Clean up contents of buttons panel first
                    buttonsPanel.empty();

                    for (index = 0; index < buttons.length; index += 1) {
                        buttonConfig = buttons[index];
                        // We use data-buttonname attriute to pass button name to orgchart onButtonClick event
                        button = jQuery('<li data-buttonname="' + buttonConfig.name + '"></li>')
                            .css({
                                position: "absolute",
                                top: topOffset + "px",
                                left: "0px",
                                width: buttonConfig.size.width + "px",
                                height: buttonConfig.size.height + "px",
                                padding: "3px"
                            })
                            .addClass("orgdiagrambutton"); // This class forces widget to consider button as its own. 
                            //Otherwise you have to listen to onMouseClick event and use target in order to recognize button click.

                        buttonsPanel.append(button);

                        button.button({
                            icons: { primary: buttonConfig.icon },
                            text: buttonConfig.text,
                            label: buttonConfig.label
                        });

                        if (!primitives.common.isNullOrEmpty(buttonConfig.tooltip)) {
                            if (button.tooltip != null) {
                                button.tooltip({ content: buttonConfig.tooltip });
                            }
                        }
                        topOffset += buttonsInterval + buttonConfig.size.height;
                    }
                }
            },
            
            getZoom3Template : function () {
                var result = new primitives.orgdiagram.TemplateConfig();
                var buttons = [];
                
                buttons = this.getButtons();
                
                /*buttons.push(new primitives.orgdiagram.ButtonConfig("add", "ui-icon-plusthick", "Add"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("edit", " ui-icon-pencil", "Edit"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("delete", "ui-icon-closethick", "Delete"));*/
                
                
                result.hasButtons = primitives.common.Enabled.True;
                
                result.buttons = buttons;
                
                
                result.name = "Zoom3";

                result.itemSize = new primitives.common.Size(160, 86);
                result.minimizedItemSize = new primitives.common.Size(3, 3);
                result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


                var itemTemplate = jQuery(
                  '<div class="bp-item bp-corner-all bt-item-frame">'
                    + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame" style="top: 2px; left: 2px; width: 156px; height: 18px; overflow: hidden; text-align:center;">'
                        + '<div name="title" class="bp-item bp-title" style="top: 2px; left: 2px; width: 152px; height: 14px; font-size: 11px; overflow: hidden;">'
                        + '</div>'
                    + '</div>'
                    + '<div class="bp-item bp-photo-frame" style="top: 22px; left: 2px; width: 50px; height: 60px; overflow: hidden;">'
                        + '<img name="photo" style="height:60px; width:50px;" />'
                    + '</div>'
                    + '<div name="email" class="bp-item" style="top: 22px; left: 56px; width: 98px; height: 13px; font-size: 11px; overflow: hidden;"></div>'
                    + '<div name="description" class="bp-item" style="top: 37px; left: 56px; width: 98px; height: 39px; font-size: 11px; overflow: hidden;"></div>'
                + '</div>'
                ).css({
                    width: result.itemSize.width + "px",
                    height: result.itemSize.height + "px"
                }).addClass("bp-item bp-corner-all bt-item-frame");
                result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                return result;
            },
            
            getButtons : function (){
                var buttons = [];
                // It is not nessesary to use ButtonConfig class here. We can use regular noname objects as well.
                               
                buttons.push(new primitives.orgdiagram.ButtonConfig("edit", " ui-icon-pencil", "Edit"));
                
                return buttons;
            },
            

            onButtonClick : function (e, data) {

                this.fireOnPressAdd({id : data.id});
                //var message = "User clicked '" + data.name + "' button for item '" + data.context.title + "'.";
                //message += (data.parentItem != null ? " Parent item '" + data.parentItem.title + "'" : "");
                //alert(message);
            },

            getZoom4Template : function () {
                var result = new primitives.orgdiagram.TemplateConfig();
                var buttons = [];
                buttons = this.getButtons();
               /* buttons.push(new primitives.orgdiagram.ButtonConfig("wrench", "ui-icon-wrench", "Edit"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("delete", "ui-icon-close", "Delete"));
                buttons.push(new primitives.orgdiagram.ButtonConfig("add", "ui-icon-person", "Add"));
           */     
                result.hasButtons = primitives.common.Enabled.True;
                
                result.buttons = buttons;
                
                
                result.name = "Zoom4";

                result.itemSize = new primitives.common.Size(220, 120);
                result.minimizedItemSize = new primitives.common.Size(3, 3);
                result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


                var itemTemplate = jQuery(
                  '<div class="bp-item bp-corner-all bt-item-frame">'
                    + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame" style="top: 2px; left: 2px; width: 216px; height: 20px; overflow: hidden;">'
                        + '<div name="title" class="bp-item bp-title" style="top: 3px; left: 6px; width: 208px; height: 18px; overflow: hidden;">'
                        + '</div>'
                    + '</div>'
                    + '<div class="bp-item bp-photo-frame" style="top: 26px; left: 2px; width: 50px; height: 60px; overflow: hidden;">'
                        + '<img name="photo" style="height:60px; width:50px;" />'
                    + '</div>'
                    + '<div name="phone" class="bp-item" style="top: 26px; left: 56px; width: 162px; height: 18px; font-size: 12px; overflow: hidden;"></div>'
                    + '<div name="email" class="bp-item" style="top: 44px; left: 56px; width: 162px; height: 18px; font-size: 12px; overflow: hidden;"></div>'
                    + '<div name="description" class="bp-item" style="top: 62px; left: 56px; width: 162px; height: 36px; font-size: 10px; overflow: hidden;"></div>'
                + '</div>'
                ).css({
                    width: result.itemSize.width + "px",
                    height: result.itemSize.height + "px"
                }).addClass("bp-item bp-corner-all bt-item-frame");
                result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                return result;
            }

	});
});
