sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/model/formatter',
		'App/model/employeeDetail'
		
	], function(Controller, JSONModel, dataEvents, formatter, employeeDetail) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesForm", {
		
		formatter : formatter,

		onInit : function() {
			this._Model = employeeDetail.getModel();
			this.getView().setModel(this._Model, 'EmployeeModel');

			this._objectPageHeader = this.getView().byId("ObjectPageLayoutHeaderTitle");

			this._oRouter = sap.ui.core.routing.Router.getRouter("AppRouter");
			this._oRouter.getRoute("resources_form").attachPatternMatched(this._onObjectMatched, this);

			this._eventBus = sap.ui.getCore().getEventBus();
		},

		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/

		_onObjectMatched : function(oEvent) {
			this._Id = oEvent.getParameter("arguments").id;
			
			this.getData();
			
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"resources"});
		},

		openFromDialog : function (Id) {
			console.log("openFromDialog");
			this._Id = Id;
			
			this.getData();
		},

		onPressGoResources : function(oEvent){
			this._oRouter.navTo('resources');
		},

		getData : function(){
			console.log('pasa por getData con ID: '+this._Id);
			var that = this;
			employeeDetail
				.loadDataById(this._Id)
				.then(function(data){
					if (data) {
						that._objectPageHeader.setObjectImageURI(
							SERVER_DELIVERY_TOOLS + "/api/Avatars/" + data.userNameGA
							);
					}
				});
		
		},

		getUriAvatar : function(){
			alert();
			//var uri = SERVER_DELIVERY_TOOLS + '/api/Avatars/saguero'; //-->Se comenta para testing-Vero
			var uri = 'http://api.grupoassa.com:3001/api/Avatars/saguero';
			console.log("uri", uri); 
			return uri;
		}


	
	});
});
