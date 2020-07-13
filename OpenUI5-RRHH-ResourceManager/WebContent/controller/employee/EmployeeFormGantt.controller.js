sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/model/formatter'
	], function(Controller,formatter) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeeFormGantt", {

		formatter : formatter,

		onInit : function() {
			this._PlannigCalendar = this.getView().byId('employeePlannigCalendar');
			this._oRouter = sap.ui.core.routing.Router.getRouter("AppRouter");
		},

		onBeforeRendering : function() {
			this._Model = this.getView().getModel('EmployeeModel');
		},

		handleAppointmentSelect : function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (oAppointment) {
				var aKeys =  oAppointment.getKey().split(',');
				var opportunityId = aKeys[0];
				var opportunityLineItemId = aKeys[1];
				var asignacionId = aKeys[2];

				if (opportunityLineItemId) {
					this._oRouter.navTo("requirements_detail_asignacion", 
						{
							opportunityId : opportunityId,
							opportunityLineItemId : opportunityLineItemId,
							asignacionId : asignacionId
						});
				} else {
					this._oRouter.navTo("requirements_detail_asignacion_without_oli", 
						{
							opportunityId : opportunityId,
							asignacionId : asignacionId
						});
				}
				
			}
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
					this._Model.setProperty('/startDate',startDate);
				}
			}
			this._PlannigCalendar.selectAllRows(false);
		}


	});
});
