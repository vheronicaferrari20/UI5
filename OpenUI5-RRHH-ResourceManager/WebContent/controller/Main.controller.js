sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents'
	], function(Controller,dataEvents) {
	"use strict";

	return Controller.extend("App.controller.Main", {
		
		onInit: function() {
			
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._buttons = [];
			this._buttons.push(this.getView().byId("home"));
			this._buttons.push(this.getView().byId("resources"));
			this._buttons.push(this.getView().byId("requirements"));
			this._buttons.push(this.getView().byId("recruitings"));
			this._buttons.push(this.getView().byId("settings"));
			
			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.select_menu_main.channel, dataEvents.select_menu_main.name,this.onSuscribeSelectMenuMain , this);
			this._eventBus.subscribe(dataEvents.people_flow_full_screen.channel, dataEvents.people_flow_full_screen.name,this.onSuscribePeopleFlowFullScreen , this);
		},

		onSuscribeSelectMenuMain: function(channel, event, data){
			this.cleanActiveButtons(data.route);
		},

		onSuscribePeopleFlowFullScreen : function(channel, event, data) {
			this.getOwnerComponent().setHeaderVisible(!data.fullScreen);
		},
		
		navTo : function( oControlEvent	){
			var id = oControlEvent.getParameters().id;
			id = id.split('--')[1].toLowerCase();

			if (id != 'settings') {
				this.cleanActiveButtons(id);
				this._oRouter.navTo(id);
			} else {
				this.getView().byId("settings").setPressed(false);
				var oButton = oControlEvent.getSource();
				// create menu settings
				if (!this._menuSettings) {
					this._menuSettings = sap.ui.xmlfragment(
						"App.view.MenuSettingsMain",
						this
					);
					this._menuSettings.attachEvent('close',function (oControlEvent){
						alert();
					});

					this.getView().addDependent(this._menuSettings);
				}
	 
				var eDock = sap.ui.core.Popup.Dock;
				this._menuSettings.open(true, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
			}
			
			
		},

		
		onPressGoHome : function(oEvent){
			this._oRouter.navTo("home");
		},	

		handleMenuItemPress : function (oEvent) {
			this._oRouter.navTo(oEvent.getParameter("item").getId());
		},
		
		cleanActiveButtons : function(id) {
			jQuery.each(this._buttons,function(i,button){
				if (button.getId().split('--')[1] == id){
					button.setPressed(true);
				} else {
					button.setPressed(false);
				}
			});
		},
		
		activeButtonById : function(id){
			this.getView().byId(id).setPressed(true);
		},

		onPressLogout : function(oEvent){
			
			jQuery.removeCookie("api_token", {domain : '.grupoassa.com'} );
			jQuery.removeCookie("api_access_token", {domain : '.grupoassa.com'});
			
            window.location.href = "./";
				
		} 
	});
});


