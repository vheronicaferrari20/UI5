sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/controller/opportunity/OpportunitiesViewSettingsDialog',
		'App/model/formatter',
		'App/model/opportunities'
	], function(Controller,JSONModel,dataEvents,ConfirmDialog,Filter,OpportunitiesViewSettingsDialog, formatter, opportunities) {
	"use strict";

	return Controller.extend("App.controller.opportunity.OpportunitiesList", {
		
		formatter : formatter,

		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._ModelName = "OpportunityModel";

			this._ViewSettingsDialog = new OpportunitiesViewSettingsDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._Table = this.getView().byId("opportunitiesListTable");

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._Model = opportunities.getModel();

			this.getView().setModel(this._Model,this._ModelName);

			this.getData();

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_opportunities.channel, dataEvents.update_viewsettings_opportunities.name,this.onSuscribeUpdateViewsettings, this);
		},

		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/	
		

		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._aSorters = data.aSorters;
			console.log("data.aSorters", data.aSorters);
			this._aFilters = data.aFilters;

			this._infoFilterBar.setVisible(data.aFilters.length > 0);
			this._infoFilterLabel.setText(data.filterString);

			this.applyFilterSorters();
		},

		/*
		***************************************************************************************
		* ON EVENTS METHODS
		***************************************************************************************
		*/

		onSearch : function (oEvt) {
 
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue().trim();
			var aQuery = [];

			if (sQuery.length > 2 && sQuery[0] == "\"" && sQuery[sQuery.length - 1] == "\""){
				aQuery.push(sQuery.substring(1, sQuery.length-1));
				console.log("sQuery", sQuery.substring(1, sQuery.length-1));
			} else {
				aQuery = sQuery.split(' ');
			}
			
			for (var i = 0; i < aQuery.length; i++){

				if (aQuery[i] && aQuery[i].length > 0) {
					var filters = [];
					aFilters.push({'AccountName' : {'contains' : aQuery[i]}});
					aFilters.push({'Name' : {'contains' : aQuery[i]}});
					aFilters.push({'OpportunityPais' : {'contains' : aQuery[i]}});
					aFilters.push({'StageName' : {'contains' : aQuery[i]}});
					aFilters.push({'Platform__c' : {'contains' : aQuery[i]}});
					aFilters.push({'ServiceType__c' : {'contains' : aQuery[i]}});
				}
			}
			

			this._filterSearh = aFilters;

			this.applyFilterSorters();
 
		},

		onItemPressTable : function(oEvent){
			var that = this;
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			if (data.OpportunityLineItemId) {
				this._oRouter.navTo("requirements_detail", 
					{
						opportunityId : data.Id,
						opportunityLineItemId : data.OpportunityLineItemId
					});

			} else {
				this._oRouter.navTo("requirements_detail_without_oli", 
					{
						opportunityId : data.Id
					});
			}
			
		},

		onPressRefresh : function(oEvent){
			this.getData(true);
		},

		onPressAdd : function(oEvent) {
			this._FormDialog.open(this.getView());
		},

		onPressConfig : function(oEvent){
			this._ViewSettingsDialog.open(this.getView());

		},

		updateStarted : function(oEvent){
			console.log(oEvent.getParameters().reason);

			if ( oEvent.getParameters().reason == 'Growing') {
				this.getData();
			}
		},

		/*
		***************************************************************************************
		***************************************************************************************
		***************************************************************************************
		*/

		applyFilterSorters : function(){

			this.getData(true);

		},

		getData : function(bRefresh) {
			//var that = this;
			//this._Table.setBusy(true);
			var that = this;
			this._Table.setBusy(true);
			opportunities
				.loadData(bRefresh, this._filterSearh, this._aFilters, this._aSorters)
				.then(function(){
					that._Table.setBusy(false);
				});
			
		},

		// formatters
		perfiles : function(
			CountPerfiles, 
			CountPerfilesDraft, 
			CountPerfilesReservados, 
			CountPerfilesAsignados, 
			CountPerfilesRecruiting) {
			
			return (CountPerfiles) ? (CountPerfiles + " [D:"+CountPerfilesDraft+"; R:"+CountPerfilesReservados+"; A:"+CountPerfilesAsignados+"; Rc:"+CountPerfilesRecruiting+"]") : '';
		}
			
	});
});