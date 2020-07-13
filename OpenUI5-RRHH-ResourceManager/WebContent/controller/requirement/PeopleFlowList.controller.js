sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/controller/requirement/PeopleFlowDialog',
		'App/data/dataEvents',
		'App/model/formatter',
		'App/controller/requirement/AsignacionDetailDialog',
		'App/controller/requirement/MoverFechaDialog',
		'App/controller/ConfirmDialog'
		
		
	], function(Controller,JSONModel,PeopleFlowDialog,dataEvents, formatter,AsignacionDetailDialog, MoverFechaDialog, ConfirmDialog) {
	"use strict";

	return Controller.extend("App.controller.requirement.PeopleFlowList", {

		formatter : formatter,
		
		onInit : function() {

			this._ConfirmDialog = new ConfirmDialog();

			this._MoverFechaDialog = new MoverFechaDialog();

			this._AsignacionDetailDialog = new AsignacionDetailDialog();

			this._peopleFlowDialog = new PeopleFlowDialog();

			this._deleteButton = this.getView().byId("deleteButton");

			this._requirementsPeopleFlowTable = this.getView().byId("requirementsPeopleFlowTable");

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("requirements_detail").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_without_oli").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_asignacion").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
			this._oRouter.getRoute("requirements_detail_asignacion_without_oli").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);

			this._eventBus = sap.ui.getCore().getEventBus();
			this._MyKPracticeModules_KPracticeMasterModel = this.getOwnerComponent().getModel('MyKPracticeModules_KPracticeMasterModel');
			
		},

		onAfterRendering: function(){
			this._MyKPracticeModules_KPracticeMasterModel = this.getOwnerComponent().getModel('MyKPracticeModules_KPracticeMasterModel');

		},

		_onObjectMatched : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
		},

		_onObjectMatchedDetailAsignacion : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
		},
		

 		onSelectionChange : function(oEvent){
 			this._deleteButton.setEnabled(true);
 		},

		onPressDelete : function(oEvent){
			var oItem = this._requirementsPeopleFlowTable.getSelectedItem();
			var sPath = oItem.getBindingContext("PeopleFlowModel").getPath();
			var asignacion = this.getView().getModel("PeopleFlowModel").getProperty(sPath);
			var that = this;

			this._deleteButton.setEnabled(false);
			this._ConfirmDialog.open(
				'Confirm',
				'Ud esta seguro que desea eliminar este requerimiento',
				function(){
					jQuery.ajax({
						url : PROXY + '/asignacion/' + asignacion.id,
						method : 'DELETE',
						dataType : 'JSON',
						success : function(data) {
							that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
							that._deleteButton.setEnabled(true);
						}
					});
				},
				function(){
					that._requirementsPeopleFlowTable.removeSelections(true);
				}
				);
		},

		onPressAddPeopleFlow : function(oEvent){
			this._peopleFlowDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
		},

		onItemPressTable : function(oEvent){
			var oItem = oEvent.getSource();
			var sPath = oItem.getBindingContext("PeopleFlowModel").getPath();
			var path = (sPath.length > 0) ? sPath.slice(1,sPath.length) : undefined;
			this._AsignacionDetailDialog.open(this.getView(), this.getView().getModel('PeopleFlowModel'), path);
		},

		moverFechaOnPress : function(oEvent) {
			this._MoverFechaDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
		},

		getEstado : function(peopleFlow) {
			if (peopleFlow.estado == 'RESERVADO' || peopleFlow.estado == 'ASIGNADO') {
				return peopleFlow.estado + '\n' + peopleFlow.candidato.fullName;
			} else {
				return peopleFlow.estado;
			}
		}

	});
});