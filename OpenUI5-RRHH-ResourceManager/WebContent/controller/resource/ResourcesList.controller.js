sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
	], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("App.controller.resource.ResourcesList", {
		
		onInit : function() {
			
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("resources").attachPatternMatched(this._onObjectMatched, this);
			this._Table = this.getView().byId('resourcesTable');
			this._Model = new JSONModel();
			this.getView().setModel(this._Model,'ResourcesModel');
			this.getData();
		},
		
		_onObjectMatched : function() {
			
		},
		
		onItemPressTableResource : function(oEvent){
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext().getPath().split('/')[2];
			this._oRouter.navTo("resources_form",{
				id : path
			});
			
			
		},

		getData : function(){
			var that = this;
			jQuery.ajax({
				//url : PROXY + '/employee',  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/employee',  // --->Test Vero
				method : 'GET',
				dataType : 'JSON',
				success : function(data){
					that._Model.setData(data);
				},
				error : function(err){

				}
			});
		}
		
		
	
	});
});