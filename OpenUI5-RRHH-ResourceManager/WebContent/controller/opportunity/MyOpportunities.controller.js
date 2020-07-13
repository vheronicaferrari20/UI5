sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/model/myopportunities'
		
	], function(Controller, JSONModel, myopportunities) {
	"use strict";

	return Controller.extend("App.controller.opportunity.MyOpportunities", {
		
		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._tileContainer = this.getView().byId("tileContainer");

			this._editButton = this.getView().byId("editButton");

			this._MyOpportunitiesModel = myopportunities.getModel();

			this.getView().setModel(this._MyOpportunitiesModel,"MyOpportunitiesModel");

			this.getData();
			
		},
		
		getData : function() {
			 myopportunities.loadData();
		},

		onPressTile : function(oEvent) {
			var that = this;
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext("MyOpportunitiesModel").getPath();
			var data = this._MyOpportunitiesModel.getProperty(path);
			console.log("data", data);
			if (data.opportunityLineItem) {
				this._oRouter.navTo("requirements_detail", 
					{
						opportunityId : data.opportunity,
						opportunityLineItemId : data.opportunityLineItem
					});

			} else {
				this._oRouter.navTo("requirements_detail_without_oli", 
					{
						opportunityId : data.opportunity
					});
			}
		},

		onTileMove : function(oEvent) {
			var tiles =  this._tileContainer.getTiles();
			var that = this;
			var tilesToUpdate = [];
			jQuery.each(tiles, function(i, tile){
				var index = that._tileContainer.indexOfTile(tile);
				var id = tile.getBindingContext("MyOpportunitiesModel").getPath().split('/')[2];
				tilesToUpdate.push({
					id : id,
					index : index
				});
			});

			myopportunities.updateIndexes(tilesToUpdate);

		},

		onPressTileDelete : function(oEvent) {

			var that = this;

			var tile = oEvent.getParameter("tile");

			var path = tile.getBindingContext("MyOpportunitiesModel").getPath();
			
			var data = this._MyOpportunitiesModel.getProperty(path);

			this.deleteMyOpportunity(data.id);
		},

		deleteMyOpportunity : function(id) {
			myopportunities.remove(id);
		},

		onPressEdit : function(oEvent) {
			var editable = !this._tileContainer.getEditable();
			this._editButton.setType(
				(editable) ? 'Emphasized' : 'Transparent'
				);
			this._tileContainer.setEditable(editable);
		}
	
	});
});