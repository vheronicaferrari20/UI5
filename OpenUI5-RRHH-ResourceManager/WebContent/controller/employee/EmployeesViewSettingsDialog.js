sap.ui.define([
	"sap/ui/base/Object",
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter'
], function (Object,dataEvents,Filter,Sorter) {
	"use strict";
	return Object.extend("App.controller.employee.EmployeesViewSettingsDialog", {
		_getDialog : function () {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.employee.EmployeesViewSettingsDialog", this);
				this._employeeViewSettingsDialog =  sap.ui.getCore().byId('employeeViewSettingsDialog');
				var groupItems = this._employeeViewSettingsDialog.getGroupItems();
				for (var i = 0; i < groupItems.length; i++) {
					groupItems[i].setEnabled(false);
				}
			}
			
			this._eventBus = sap.ui.getCore().getEventBus();

			return this._oDialog;
		},

		getEmployeeViewSettingsDialog : function() {
			return this._employeeViewSettingsDialog;
		},
		
		open : function (oView) {
			
			this._oView = oView;
			
			var oDialog = this._getDialog();
			
			oView.addDependent(oDialog);
						
			// open dialog
			oDialog.open();


		},
		
		onCloseDialog : function () {
			console.log("onCloseDialog");
		},
		
		handleConfirm : function(oEvent) {

			var filterItems = this._employeeViewSettingsDialog.getSelectedFilterItems();
			var filterString = this._employeeViewSettingsDialog.getSelectedFilterString();
			
			var groupItem = this._employeeViewSettingsDialog.getSelectedGroupItem();
			 
			var mParams = oEvent.getParameters();

 
			// apply sorter to binding
			// (grouping comes before sorting)
			var aSorters = [];
			if (mParams.groupItem && typeof mParams.groupItem.getKey == 'function' ) {
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
			jQuery.each(mParams.filterCompoundKeys, function (key, filter) {
				jQuery.each(filter,function(key, value){
					var aSplit = key.split("___");
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
				
			});
 
			// update filter bar
			//oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			//oView.byId("vsdFilterLabel").setText(mParams.filterString);
			this._eventBus.publish(
				dataEvents.update_viewsettings_employees.channel,
				dataEvents.update_viewsettings_employees.name,
				{
					aSorters : aSorters,
					aFilters : aFilters,
					filterString : (mParams.filterStringCustom) ? mParams.filterStringCustom : mParams.filterString
				});
		},

		onItemPropertyChanged : function(oEvent) {
			if (this._employeeViewSettingsDialog) {
				this._employeeViewSettingsDialog.setSelectedGroupItem("site/siteEmplDescri");
				this._employeeViewSettingsDialog.setSelectedFilterCompoundKeys({estructura: {"estructura/nomEstructura___EQ___Desarrollo SAP":true}});
			}
		},

		////////////////////////////////////////////////////////////

		setStatusViewSettingsAndConfirm : function(filter) {
			if (!filter) {
				return;
			}
			this._getDialog();

			filter = this.parseStringToBoolean(filter);
			var oSortItem, oGroupItem;

			if ('filterCompoundKeys' in filter.settings) {
				this._employeeViewSettingsDialog.setSelectedFilterCompoundKeys(filter.settings.filterCompoundKeys);
			}

			var aFilterItems = this._employeeViewSettingsDialog.getFilterItems();

			var sortItems = this._employeeViewSettingsDialog.getSortItems();
			var groupItems = this._employeeViewSettingsDialog.getGroupItems();


			for (var i = 0; i < sortItems.length; i++){
				if (filter.settings.sortItemKey == sortItems[i].getKey()){
					oSortItem = sortItems[i];
					this._employeeViewSettingsDialog.setSelectedSortItem(filter.settings.sortItemKey);
					break;
				}
			}

			for (var i = 0; i < groupItems.length; i++){
				if (filter.settings.groupItemKey == groupItems[i].getKey()){
					oGroupItem = groupItems[i];
					this._employeeViewSettingsDialog.setSelectedGroupItem(filter.settings.groupItemKey);
					break;
				}
			}

			this._employeeViewSettingsDialog.setSortDescending(filter.settings.sortDescending);
			this._employeeViewSettingsDialog.setGroupDescending(filter.settings.groupDescending);

			var oConfirm = {
				sortItem : oSortItem,
				sortDescending : filter.settings.sortDescending,
				groupItem : oGroupItem,
				groupDescending : filter.settings.groupDescending,
				filterCompoundKeys : filter.settings.filterCompoundKeys,
				filterString : this._employeeViewSettingsDialog._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(" " + filter.name)
			}
			this._employeeViewSettingsDialog.fireConfirm(oConfirm);

		},

		resetFilters : function() {
			var filtersCompoundKeys = this._employeeViewSettingsDialog.getSelectedFilterCompoundKeys();
			for (var k in filtersCompoundKeys) {
				if (typeof  filtersCompoundKeys[k] == 'object') {
					for (var j in filtersCompoundKeys[k]) {
						if (typeof filtersCompoundKeys[k][j] == 'boolean') {
							filtersCompoundKeys[k][j] = false;
						}
					}

				} else if (typeof filtersCompoundKeys[k][j] == 'boolean') {
					filtersCompoundKeys[k] = false;
				}
				
			}

			this._employeeViewSettingsDialog.setSelectedFilterCompoundKeys(filtersCompoundKeys);
			this._employeeViewSettingsDialog.setSortDescending(false);
			this._employeeViewSettingsDialog.setGroupDescending(false);

			var sortItems = this._employeeViewSettingsDialog.getSortItems();
			var groupItems = this._employeeViewSettingsDialog.getGroupItems();

			if (sortItems.length > 0) {
				this._employeeViewSettingsDialog.setSelectedSortItem(sortItems[0].getKey());
			}
			
			for (var i = 0 ; i < groupItems.length ; i++) {
				groupItems[i].setSelected(false);
			}
		},

		parseStringToBoolean : function(filter) {
			
			if (typeof filter == 'object') {
				for (var v in filter) {
					if (typeof filter[v] == 'object') {
						filter[v] = this.parseStringToBoolean(filter[v]);
					} else if (filter[v] === 'true'){
						filter[v] = true;
					} else if (filter[v] === 'false') {
						filter[v] = false;
					}
				}

			} else if (filter === 'true'){
				filter = true;
			} else if (filter === 'false') {
				filter = false;
			}
			return filter;
		}
	});
});