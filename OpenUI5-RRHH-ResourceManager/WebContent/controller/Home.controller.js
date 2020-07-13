sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/model/model',
		'sap/m/NotificationListItem',
		'sap/m/Button',
		'App/model/notificacion',
		'App/model/formatter',
		'App/model/notificacionHistorico',
		'App/data/dataEvents'
	], function(Controller,model,NotificationListItem,Button,notificacion,formatter,notificacionHistorico,dataEvents) {
	"use strict";

	return Controller.extend("App.controller.Home", {

		formatter : formatter,

		notificacion : notificacion,
		
		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("home").attachPatternMatched(this._onObjectMatched, this);
			this._eventBus = sap.ui.getCore().getEventBus();
			
		},
		
		_onObjectMatched : function() {
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"home"});

		}

	});
});