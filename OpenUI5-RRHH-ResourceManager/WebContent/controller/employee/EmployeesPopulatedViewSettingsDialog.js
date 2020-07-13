sap.ui.define([
	"sap/ui/base/Object",
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter'
], function (Object,dataEvents,Filter,Sorter) {
	"use strict";
	return Object.extend("App.controller.employee.EmployeesPopulatedViewSettingsDialog", {
		_getDialog : function () {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.employee.EmployeesPopulatedViewSettingsDialog", this);
			}
			
			this._eventBus = sap.ui.getCore().getEventBus();

			return this._oDialog;
		},
		
		open : function (oView) {
			
			this._oView = oView;
			
			var oDialog = this._getDialog();
			
			oView.addDependent(oDialog);
						
			// open dialog
			oDialog.open();
		},
		
		onCloseDialog : function () {
			this._getDialog().close();
		},
		
		handleConfirm : function(oEvent) {
			 
			var mParams = oEvent.getParameters();
 
			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			if (mParams.groupItem) {
				var sPathG = mParams.groupItem.getKey();
				var bDescending = mParams.groupDescending;
				aSorters.push(new Sorter(sPathG, bDescending, function(oContext) {
					var name = oContext.getProperty(sPathG);
					return {
						key: name,
						text: name
					};
				}));
			}
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			
 
			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = undefined;
				if (aSplit.length > 3) {
					sValue2 = aSplit[3];
				}
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
 
			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);

			this._eventBus.publish(
				dataEvents.update_viewsettings_populated_employees.channel,
				dataEvents.update_viewsettings_populated_employees.name,
				{
					aSorters : aSorters,
					aFilters : aFilters,
					filterString : mParams.filterString
				});
		}
	});
});