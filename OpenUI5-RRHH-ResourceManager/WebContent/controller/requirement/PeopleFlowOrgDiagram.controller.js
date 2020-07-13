sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/controller/requirement/PeopleFlowDialog',
		'App/data/dataEvents',
		'App/model/formatter',
		'App/controller/requirement/AsignacionDetailDialog',
		'App/controller/requirement/MoverFechaDialog',
		'App/model/requirements'
		
	], function(Controller,JSONModel,PeopleFlowDialog,dataEvents, formatter, AsignacionDetailDialog, MoverFechaDialog, requirements) {
	"use strict";

	return Controller.extend("App.controller.requirement.PeopleFlowOrgDiagram", {

		formatter : formatter,

		_fullScreen : false,
		
		onInit : function() {

			this._MoverFechaDialog = new MoverFechaDialog();

			this._AsignacionDetailDialog = new AsignacionDetailDialog();
			
			this._peopleFlowDialog = new PeopleFlowDialog();

			this._fullScreenButton = this.getView().byId('fullScreenButton');

			this._orgDiagram = this.getView().byId('orgDiagram');

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.people_flow_data.channel, dataEvents.people_flow_data.name,this.onSuscribePoepleFlowData , this);
			
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("requirements_detail").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_without_oli").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_asignacion").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
			this._oRouter.getRoute("requirements_detail_asignacion_without_oli").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
		},

		_onObjectMatched : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
		},

		_onObjectMatchedDetailAsignacion : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
		},

		onPressAddPeopleFlow : function(oEvent){
			this._peopleFlowDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
		},

		onChangeSlider : function(oEvent) {
			this._orgDiagram.setZoom(oEvent.getParameters().value);
		},

		onPressFullScreen : function(oEvent){
			this._fullScreen = !this._fullScreen;

			if (!this._fullScreen) {
				this._fullScreenButton.setIcon('sap-icon://full-screen');
			} else {
				this._fullScreenButton.setIcon('sap-icon://exit-full-screen');
			}

			this._eventBus.publish(dataEvents.people_flow_full_screen.channel,dataEvents.people_flow_full_screen.name,{fullScreen : this._fullScreen});
		},

		onPressAdd : function(oEvent){
			var asignacionId = oEvent.getParameter('asignacionId');
			this._AsignacionDetailDialog.open(this.getView(), this.getView().getModel('PeopleFlowModel'), 'data/' + asignacionId);
		},

		moverFechaOnPress : function(oEvent) {
			this._MoverFechaDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
		}
	
	});
});