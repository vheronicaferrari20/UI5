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

	return Controller.extend("App.controller.requirement.PeopleFlowPlanningCalendar", {

		formatter : formatter,

		_fullScreen : false,
		
		onInit : function() {

			this._MoverFechaDialog = new MoverFechaDialog();

			this._PlannigCalendar = this.getView().byId('peopleFlowPlanningCalendar');

			this._AsignacionDetailDialog = new AsignacionDetailDialog();
			
			this._peopleFlowDialog = new PeopleFlowDialog();

			this._fullScreenButton = this.getView().byId('fullScreenButton');

			this._eventBus = sap.ui.getCore().getEventBus();
			
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("requirements_detail").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_without_oli").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_asignacion").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
			this._oRouter.getRoute("requirements_detail_asignacion_without_oli").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
		},

		_onObjectMatched : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
			this._PeopleFlowModel = requirements.getModel(this._OpportunityId, this._OpportunityLineItemId);
		},

		_onObjectMatchedDetailAsignacion : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null ;
			this._PeopleFlowModel = requirements.getModel(this._OpportunityId, this._OpportunityLineItemId);
		},

		onPressAddPeopleFlow : function(oEvent){
			this._peopleFlowDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
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

		handleAppointmentSelect : function(oEvent) {
			var oAppointment = oEvent.getParameters().appointment;
			var asignacionId = oAppointment.getKey();
			this._AsignacionDetailDialog.open(this.getView(), this.getView().getModel('PeopleFlowModel'), 'data/' + asignacionId);
		},

		onRowSelectionChange : function(oEvent) {
			var rows = oEvent.getParameters().rows;
			if (rows.length >= 0) {
				var aAppointments = rows[0].getAppointments();
				if (aAppointments.length > 0) {
					var startDate = aAppointments[0].getStartDate();
					for (var i = 0; i < aAppointments.length; i++){
						var auxDate = aAppointments[i].getStartDate();
						if (startDate.getTime() > auxDate.getTime()){
							startDate = auxDate;
						}
					}
					this._PeopleFlowModel.setProperty('/planningCalendarData/startDate',startDate);
				}
			}
			this._PlannigCalendar.selectAllRows(false);
		},

		moverFechaOnPress : function(oEvent) {
			this._MoverFechaDialog.open(this.getView(),this._OpportunityId, this._OpportunityLineItemId);
		}
	
	});
});