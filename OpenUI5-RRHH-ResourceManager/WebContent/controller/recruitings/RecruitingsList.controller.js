sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/controller/recruitings/RecruitingsViewSettingsDialog',
		'App/model/formatter',
		'App/model/recruitings'
	], function(Controller,JSONModel,dataEvents,ConfirmDialog,Filter,RecruitingsViewSettingsDialog, formatter, recruitings) {
	"use strict";

	return Controller.extend("App.controller.recruitings.RecruitingsList", {
		
		formatter : formatter,

		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._ModelName = "RecruitingsModel";

			this._ViewSettingsDialog = new RecruitingsViewSettingsDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._Table = this.getView().byId("recruitingsListTable");

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._Model = recruitings.getModel();

			console.log("este es el modelo recruitings",this._Model);

			this.getView().setModel(this._Model,this._ModelName);

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this.getData();

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_recruitings.channel, dataEvents.update_viewsettings_recruitings.name,this.onSuscribeUpdateViewsettings, this);
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

		onSearch : function (oEvt) { // a desarrollar. Preguntar a Fran...

            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            var binding = this._Table.getBinding("items");
            if (sQuery && sQuery.length > 0) {
                var filter1 = new Filter("pais/name", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter1);
                aFilters.push(filter2);
                this._filterSearh = new Filter(aFilters);
            } else {
                this._filterSearh = undefined;
            }

            this.applyFilterSorters();

        },

		onItemPressTable : function(oEvent){
			var that = this;
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			if (data.asignacion.opportunityLineItem) {
				this._oRouter.navTo("requirements_detail_asignacion", 
					{
						opportunityId : data.asignacion.opportunity,
						opportunityLineItemId : data.asignacion.opportunityLineItem,
						asignacionId: data.asignacion.id
					});

			} else {
				this._oRouter.navTo("requirements_detail_asignacion_without_oli", 
					{
						opportunityId : data.opportunity,
						asignacionId: data.asignacion.id
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
			recruitings.loadData(bRefresh, this._filterSearh, this._aFilters, this._aSorters);
		},

		// formatters
		perfiles : function(
			CountPerfiles, 
			CountPerfilesDraft, 
			CountPerfilesReservados, 
			CountPerfilesAsignados, 
			CountPerfilesRecruiting) {
			
			return (CountPerfiles) ? (CountPerfiles + " [D:"+CountPerfilesDraft+"; R:"+CountPerfilesReservados+"; A:"+CountPerfilesAsignados+"; Rc:"+CountPerfilesRecruiting+"]") : '';
		},

		getEstado : function(estado, employee) {
			if (estado == 'FINALIZADO' && typeof employee == 'object') {
				return "FINALIZADO \n" + employee.fullName;
			} else {
				return estado;
			}
		}
			
	});
		
});