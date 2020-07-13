sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'sap/ui/model/json/JSONModel'
		
	], function(Controller,dataEvents,JSONModel) {
	"use strict";

	return Controller.extend("App.controller.resource.Resources", {
		
		onInit : function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("resources").attachPatternMatched(this._onObjectMatched, this);
			this._eventBus = sap.ui.getCore().getEventBus();

			this.getView().setModel(new JSONModel(
				{
					data : [
						{
							id : 1,
							text : "uno",
							start_date : '2015-01-25',
							duration : 10,
							progress : 1,
							open : true
						},
						{
							id : 2,
							text : "dos",
							start_date : '2015-02-25',
							duration : 10,
							progress : 1,
							open : true
						},
						{
							id : 3,
							text : "tre",
							start_date : '2015-03-25',
							duration : 10,
							progress : 1,
							open : true
						}
					],

					links : []
				}), 'ModelGantt2');
		},

		onBeforeRendering : function(){
			var dataGantt = { data : [], links:[] };
			var model = this.getView().getModel().getProperty('/ResourcesCollection');
			jQuery.each(model,function(i,row){
				var fecha = "26/05/2016";
				
				if (row.fecha_inicio_nuevo_proyecto.trim().length >  0) {
					fecha = row.fecha_inicio_nuevo_proyecto.trim();
				}
				dataGantt.data.push({
					id : row.legajo,
					text : row.fullName,
					start_date : fecha,
					duration : 90,
					progress : 1,
					open : true
				});
			});
			this.getView().setModel(new JSONModel(dataGantt), 'ModelGantt');
		},
		
		_onObjectMatched : function() {
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"resources"});
		}
	
	});
});