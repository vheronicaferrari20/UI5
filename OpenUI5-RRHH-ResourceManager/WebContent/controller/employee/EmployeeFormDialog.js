sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast'
], function (Object,JSONModel,dataEvents,MessageToast) {
	"use strict";
	return Object.extend("App.controller.employee.EmployeeFormDialog", {
		_oController : undefined,

		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oController = sap.ui.xmlview("App.view.employee.EmployeeForm").getController();
				this._oDialog = sap.ui.xmlfragment("App.view.employee.EmployeeFormDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}
			
			this._acceptButton =  sap.ui.getCore().byId('acceptButton');

			return this._oDialog;
		},
		
		open : function (oView, EmployeeId) {

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();

			this._oController.openFromDialog(EmployeeId);

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			//this._oController.getView().addDependent(oDialog);
			
			oDialog.setModel(this._oController.getView().getModel("EmployeeModel"), "EmployeeModel");
			// open dialog
			oDialog.open();

		},

		onCloseDialog : function (oEvent) {
			this._getDialog().destroy();
			this._oDialog = undefined;
		}

		

	});
});