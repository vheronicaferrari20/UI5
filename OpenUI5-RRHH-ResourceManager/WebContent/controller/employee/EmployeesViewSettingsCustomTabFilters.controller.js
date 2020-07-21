sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'sap/ui/model/json/JSONModel',
		'sap/m/InputListItem',
		'sap/m/Input',
		'sap/m/StandardListItem',
		'sap/m/Switch',
		'sap/m/HBox'
		
	], function(Controller,dataEvents,JSONModel, InputListItem, Input, StandardListItem, Switch, HBox) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesViewSettingsCustomTabFilters", {
		
		onInit : function() {
			console.log('onInit en CustomTabFilters');
			this._navContainer = this.getView().byId("navContainer");
			this._customFilters = this.getView().byId("customFilters");

			this._addButton = this.getView().byId("addButton");
			this._editButton = this.getView().byId("editButton");
			this._deleteButton = this.getView().byId("deleteButton");

			this._filterDefaultSwitch = this.getView().byId("filterDefaultSwitch");
			this._titleFilter = this.getView().byId("titleFilter");

			this._ModelName = "FiltersModel";
			this._DetailModelName = "DetailFilterModel";
			
			this._Model = new JSONModel([{index: -1, name : "Nada"}]);
			this._DetailModel =  new JSONModel();

			this.getView().setModel(this._Model, this._ModelName);

			this.getView().setModel(this._DetailModel, this._DetailModelName);

			this.getAll();
		},

		onBeforeRendering : function() {
			console.log('onBeforeRendering en CustomTabFilters');
			if (!this._defineComponenet) {
				this._defineComponenet = true;
				var AppComponent = sap.ui.getCore().getComponent("__component0");
				this._ViewSettingsDialog = AppComponent.getEmployeesViewSettingsDialog().getEmployeeViewSettingsDialog();
				this._UserPreferencesMasterModel = AppComponent.getModel("UserPreferencesMasterModel");
				
				this._ViewSettingsDialog._getDialog().attachBeforeClose(function(){
					this.detachAll();
				}, this);
				var that = this;
				var count = 0;
				this._ViewSettingsDialog.attachConfirm(function(oConfirm){
					that._initialState = false;

					var oParams = oConfirm.getParameters();
					if ('filterStringCustom' in oParams) {
						return;
					}
					oParams.filterStringCustom = (that._filterName) ? that._ViewSettingsDialog._rb.getText("VIEWSETTINGS_FILTERTEXT").concat(" " + that._filterName) : false;
					if (oParams.filterStringCustom) {
						that._ViewSettingsDialog.fireConfirm(oParams);
					}
				});

				this._ViewSettingsDialog.attachCancel(function(){
					that._customFilters.setSelectedItem(that._initialState);
					that._customFilters.fireSelectionChange({
						listItem : that._initialState
					});
					that._initialState = false;
				});
			}

		},

		onAfterRendering : function() {
			console.log('onAfterRendering en CustomTabFilters');
			if (!this._initialState) {
				this._initialState = this._customFilters.getSelectedItem();
				if (!this._initialState) {
					var oItems = this._customFilters.getItems();
					this._initialState = oItems[oItems.length-1];
				}
				this._customFilters.setSelectedItem(this._initialState);
				this._customFilters.fireSelectionChange({
					listItem : this._initialState
				});
				
			}
		},

		onItemPropertyChanged : function(oEvent) {
			console.log('onItemPropertyChanged en CustomTabFilters');
			var oItem = oEvent.getParameters().listItem;
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var filter = this._Model.getProperty(path);

			if (filter.index == -1) {
				this._editButton.setEnabled(false);
				this._deleteButton.setEnabled(false);
				this._filterName = false;
				this.resetFilters();
			} else {
				this._editButton.setEnabled(true);
				this._deleteButton.setEnabled(true);
				this.setStatusViewSettings(filter);
				this._filterName = filter.name;
			}
			
		},


		onPressAdd : function(oEvent) {
			console.log('onPressAdd en CustomTabFilters');
			var that = this;

			var oInput = new Input({
				width : "100%",
				submit : onSubmitAdd
			});
			var oSwitch = new Switch({
				customTextOff : "Privado",
				customTextOn : "Publico"
			});
			var oHBox = new HBox({
				items : [oSwitch,oInput]
			});
			oInput.addEventDelegate({
			    onAfterRendering: function(){
			        oInput.focus();
			    }
			});

			var oItem = new InputListItem({
				content : [oInput]
			});
			
			this._customFilters.addItem(oItem);


			this._addButton.setEnabled(false);

			function onSubmitAdd(oEvent) {
				console.log('onSubmitAdd en CustomTabFilters');
				// validamos el texto
				var value = oEvent.getParameters().value;
				if (value.length == 0 ) {

					return false;
				}
				
				// se destruye el item
				oInput.destroy();
				oItem.destroy();
				
				that._addButton.setEnabled(true);
				
				that.createFilter(value);

				that.setDetailFilter({name : value, public : false, default : false})

				that.toEdit();
			}

		},

		setDetailFilter : function(filter) {
			this._DetailModel.setData(filter);
			this._DetailModel.setProperty("/filterString", this._ViewSettingsDialog.getSelectedFilterString());
		},

		addFilterItemToList : function(filter) {
			//  se genera nuevo item
			var data = this._Model.getProperty("/");
			data.push(filter);
			this._Model.setProperty("/",data); 
			
			var items = this._customFilters.getItems();
			if (items.length > 0){
				items[items.length -1].setSelected(true);
			}
			
		},

		toListCustomFilters : function() {
			this._navContainer.back();
			this.detachAll();
		},

		onPressEdit : function(oEvent) {
			var oItem = this._customFilters.getSelectedItem();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var filter = this._Model.getProperty(path);
			this.setDetailFilter(filter);
			this.toEdit();
		},

		groupListSelectionChange : function() {
			this.onUpdateFilter();
			this._DetailModel.setProperty("/filterString", this._ViewSettingsDialog.getSelectedFilterString());
		},
			
		sortListSelectionChange : function() {
			this.onUpdateFilter();
			this._DetailModel.setProperty("/filterString", this._ViewSettingsDialog.getSelectedFilterString());
		},

		filterListSelectionChange : function() {
			this.onUpdateFilter();
			this._DetailModel.setProperty("/filterString", this._ViewSettingsDialog.getSelectedFilterString());
		},

		toEdit : function() {
			this._navContainer.to(this.getView().byId("detailCustomFilters"));
			
			this.attachAll();
			
		},

		onUpdateFilter : function(oEvent) {

			var obj = this._DetailModel.getData();
			obj.default = this._filterDefaultSwitch.getState();
			obj.settings = this.getStatusViewSettings();
			jQuery.ajax({
				//url : PROXY + "/filter/" + obj.id, //-->se comenta para pruebas - Vero
				url: 'http://api.grupoassa.com:1337/filter/' + obj.id, // ---> Test Vero
				method : "PUT",
				data : obj,
				context : this,
				success : function(data) {
					this._UserPreferencesMasterModel.setProperty("/employeeDefaultFilter", data.employeeDefaultFilter);
				},
				error : function(error) {
					console.log("error", error);
				}
			});

		},

		onPressDelete : function(oEvent) {
			var item = this._customFilters.getSelectedItem();
			var oItem = this._customFilters.getSelectedItem();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var filter = this._Model.getProperty(path);
			if ('id' in filter) {
				jQuery.ajax({
					//url : PROXY + "/filter/" + filter.id, //-->se comenta para pruebas - Vero
					url: 'http://api.grupoassa.com:1337/filter/' + filter.id, // ---> Test Vero
					method : "DELETE",
					context : this,
					success : function(data) {
						this._customFilters.removeItem(item);
					}
				});
				
			}
		},

		getAll : function() {
			console.log('getAll en CustomTabFilters');
			//Inicio ajax --->Test pruebas locales	
			/**
			var where ='{"fechaEgresoEmpleado" : null, "codEmpleado" : {"!" : "0"} }';
			jQuery.ajax({
				url:'http://api.grupoassa.com:1337/employee',
				method : 'GET',
				data: {
					where : where, //'{"fechaEgresoEmpleado" : null, "codEmpleado" : {"!" : "0"}, "pais":"ARG" }',
					populate : 'mentor,coach,pais,industria,myk,myk.skills,myk.languages,viaja,proyectosActuales,practica,subPractica,comentarios,site,estructura,equipo',
					//skip : skip,
					//limit : limit
				},
				success : function(data){
					this.setDataFilterList(data);
					
					if (data.length > 0) {
						var dataObj = model.getProperty('/data');
						if (dataObj.length == 0) {
							dataObj = {};
						}
						for (var i=0; i < data.length; i++){
							dataObj[data[i].codEmpleado] = data[i];
						}
						
						model.setProperty('/data',dataObj);
						//model.refresh(true);
						if (data.length == limit) {
							return _loadData(skip + limit, model, resolve, reject);
						} else {
							model.setProperty('/loading',false);
							currentPromise = null;
							return resolve(dataObj);
							//model.refresh(true);
						}
						model.setProperty('/loading',false);
						currentPromise = null;
						return resolve(model.getProperty('/data'));
					} else {
						model.setProperty('/loading',false);
						currentPromise = null;
						return resolve(model.getProperty('/data'));
						//model.refresh(true);
					}
					
					 * 
					
				}, 
				error : function(error){
					console.log("error", error);
				}
			});
	 */// Fin ajax --->Test pruebas locales	
			
			
		
			jQuery.ajax({
				//url : PROXY + "/filter", // --->Se comenta para pruebas en locales http://api.grupoassa.com:1337
				url : "http://api.grupoassa.com:1337/filter", // ---> Test Vero
				method : "GET",
				context : this,
				success : function(data) {
					this.setDataFilterList(data);
				}
			});

		},

		setDataFilterList : function(data) {
			var dataModel = this._Model.getData();
			if (!dataModel) {
				dataModel = [];
			}
			dataModel = dataModel.concat(data);
			this._Model.setProperty("/",dataModel);
		},

		createFilter : function(name) {
			var obj = {
				name : name,
				public : false,
				settings : this.getStatusViewSettings(),
				entity : "EMPLOYEE"
			}

			jQuery.ajax({
				//url : PROXY + "/filter", //-->Se comenta para pruebas - Vero
				url: 'http://api.grupoassa.com:1337/filter/', // ---> Test Vero
				method : "POST",
				data : obj,
				context : this,
				success : function(data) {
					this.setDetailFilter(data);
					this.addFilterItemToList(data);
				},
				error : function(error) {
					console.log("error", error);
				}
			});
			
		},

		getStatusViewSettings : function() {

			var filterCompoundKeys = this._ViewSettingsDialog.getSelectedFilterCompoundKeys();
			var sortItemId = this._ViewSettingsDialog.getSelectedSortItem();
			var sortDescending = this._ViewSettingsDialog.getSortDescending();
			var groupItemId = this._ViewSettingsDialog.getSelectedGroupItem();
			var groupDescending = this._ViewSettingsDialog.getGroupDescending();
			
			var sortItems = this._ViewSettingsDialog.getSortItems();
			var groupItems = this._ViewSettingsDialog.getGroupItems();

			var sortItemKey, groupItemKey;

			for (var i = 0; i < sortItems.length; i++){
				if (sortItemId == sortItems[i].getId()){
					sortItemKey = sortItems[i].getKey();
					break;
				}
			}

			for (var i = 0; i < groupItems.length; i++){
				if (groupItemId == groupItems[i].getId()){
					groupItemKey = groupItems[i].getKey();
					break;
				}
			}

			return {
				filterCompoundKeys : filterCompoundKeys,
				sortItemKey : sortItemKey,
				sortDescending : sortDescending,
				groupItemKey : groupItemKey,
				groupDescending : groupDescending
			};
		},

		setStatusViewSettings : function(filter) {
			filter = this.parseStringToBoolean(filter);

			this.resetFilters();
			if ('filterCompoundKeys' in filter.settings) {
				this._ViewSettingsDialog.setSelectedFilterCompoundKeys(filter.settings.filterCompoundKeys);
			}

			var sortItems = this._ViewSettingsDialog.getSortItems();
			var groupItems = this._ViewSettingsDialog.getGroupItems();

			for (var i = 0; i < sortItems.length; i++){
				if (filter.settings.sortItemKey == sortItems[i].getKey()){
					this._ViewSettingsDialog.setSelectedSortItem(filter.settings.sortItemKey);
					break;
				}
			}

			for (var i = 0; i < groupItems.length; i++){
				if (filter.settings.groupItemKey == groupItems[i].getKey()){
					this._ViewSettingsDialog.setSelectedGroupItem(filter.settings.groupItemKey);
					break;
				}
			}

			this._ViewSettingsDialog.setSortDescending(filter.settings.sortDescending);
			this._ViewSettingsDialog.setGroupDescending(filter.settings.groupDescending);
		},

		resetFilters : function() {
			var filtersCompoundKeys = this._ViewSettingsDialog.getSelectedFilterCompoundKeys();
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

			this._ViewSettingsDialog.setSelectedFilterCompoundKeys(filtersCompoundKeys);
			this._ViewSettingsDialog.setSortDescending(false);
			this._ViewSettingsDialog.setGroupDescending(false);

			var sortItems = this._ViewSettingsDialog.getSortItems();
			var groupItems = this._ViewSettingsDialog.getGroupItems();

			if (sortItems.length > 0) {
				this._ViewSettingsDialog.setSelectedSortItem(sortItems[0].getKey());
			}
			
			for (var i = 0 ; i < groupItems.length ; i++) {
					groupItems[i].setProperty('selected', false, true);
			}

			var groupList = this._ViewSettingsDialog._groupList.getItems();
			var oItemGroupNone = groupList[groupList.length-1];
			oItemGroupNone.setProperty('selected', true, true);
			this._ViewSettingsDialog._updateListSelection(this._ViewSettingsDialog._groupList, oItemGroupNone);
			this._ViewSettingsDialog.setAssociation("selectedGroupItem", oItemGroupNone, true);

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
		},

		detachAll : function() {
			this._ViewSettingsDialog._groupList.detachSelectionChange(this.groupListSelectionChange, this);
			this._ViewSettingsDialog._sortList.detachSelectionChange(this.sortListSelectionChange, this);
			var filterItems = this._ViewSettingsDialog.getFilterItems();
			for (var i = 0; i < filterItems.length; i++) {
				var items = filterItems[i].getItems();
				for (var j = 0; j < items.length; j++) {
					items[j].detachItemPropertyChanged(this.filterListSelectionChange, this);
				}
			}

		},

		attachAll : function() {
			this._ViewSettingsDialog._groupList.attachSelectionChange(this.groupListSelectionChange, this);
			this._ViewSettingsDialog._sortList.attachSelectionChange(this.sortListSelectionChange, this);

			var filterItems = this._ViewSettingsDialog.getFilterItems();
			for (var i = 0; i < filterItems.length; i++) {
				var items = filterItems[i].getItems();
				for (var j = 0; j < items.length; j++) {
					items[j].attachItemPropertyChanged(this.filterListSelectionChange, this);
				}
			}
		}
	});
});
