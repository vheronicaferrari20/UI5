sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/controller/user/UserFormDialog',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/controller/user/UserViewSettingsDialog'
	], function(Controller,JSONModel,UserFormDialog,dataEvents,ConfirmDialog,Filter,UserViewSettingsDialog) {
	"use strict";

	return Controller.extend("App.controller.user.UsersList", {
		
		onInit : function() {

			this._ModelName = "UsersModel";

			this._ViewSettingsDialog = new UserViewSettingsDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._FormDialog = new UserFormDialog();

			this._Table = this.getView().byId("usersListTable");

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._deleteButton = this.getView().byId("deleteButton");

			this._Model = new JSONModel();

			this.getView().setModel(this._Model,this._ModelName);

			this.getData();

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.add_user.channel, dataEvents.add_user.name,this.onSuscribeAdd , this);
			this._eventBus.subscribe(dataEvents.update_user.channel, dataEvents.update_user.name,this.onSuscribeUpdate , this);
			this._eventBus.subscribe(dataEvents.delete_user.channel, dataEvents.delete_user.name,this.onSuscribeDelete , this);
			this._eventBus.subscribe(dataEvents.update_viewsettings_user.channel, dataEvents.update_viewsettings_user.name,this.onSuscribeUpdateViewsettings, this);
		},

		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/	
		
		onSuscribeAdd : function(){
			this.getData();			
		},

		onSuscribeUpdate : function(){
			this.getData();			
		},

		onSuscribeDelete : function(){
			this.getData();			
		},

		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._aSorters = data.aSorters;
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
			var sQuery = oEvt.getSource().getValue();
			var binding = this._Table.getBinding("items");
			if (sQuery && sQuery.length > 0) {
				var filter1 = new Filter("userNameGA", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter1);
				this._filterSearh = new Filter(aFilters);
				//binding.filter(new Filter(aFilters));
			} else {
				//binding.filter([]);
				this._filterSearh = undefined;
			}

			this.applyFilterSorters();
 
		},

		onItemPressTable : function(oEvent){
			var that = this;
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			this._FormDialog.openToEdit(this.getView(),data);
		},

		onSelectionChangeTable : function(oEvent){
			this._deleteButton.setEnabled(true);
		},

		onPressDelete : function(oEvent){
			var oItem = this._Table.getSelectedItem();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			var that = this;

			this._deleteButton.setEnabled(false);
			this._ConfirmDialog.open(
				'Confirm',
				'Ud esta seguro que desea eliminar este Usuario',
				function(){
					jQuery.ajax({
						//url : PROXY + '/user/' + data.userNameGA,  //-->Se comenta para test- Vero
						url : 'http://api.grupoassa.com:1337/user/' + data.userNameGA,  // --->Test Vero
						method : 'DELETE',
						dataType : 'JSON',
						success : function(data){
							that.getData();
							that._Table.removeSelections(true);
						}
					});
				},
				function(){
					that._Table.removeSelections(true);
				}
				);
		},

		onPressRefresh : function(oEvent){
			this.getData();
			this._deleteButton.setEnabled(false);
			this._Table.removeSelections(true);
		},

		onPressAdd : function(oEvent) {
			this._FormDialog.open(this.getView());
		},

		onPressConfig : function(oEvent){
			this._ViewSettingsDialog.open(this.getView());

		},

		/*
		***************************************************************************************
		***************************************************************************************
		***************************************************************************************
		*/

		applyFilterSorters : function(){
			var binding = this._Table.getBinding("items");

			binding.sort(this._aSorters);
			
			var filters = [];

			if (this._filterSearh) {
				filters.push(this._filterSearh)
				//binding.filter(data._filterSearh);
			}

			for (var i=0; i < this._aFilters.length; i++){
				filters.push(this._aFilters[i]);
			}

			binding.filter(filters);

		},

		getData : function() {
			var that = this;
			this._Table.setBusy(true);

			jQuery.ajax({
				//url : PROXY + "/user",  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/user',  // --->Test Vero
				method : "GET",
				dataType : "JSON",
				data : {
					populate : 'employee'
				},
				success : function(data){
					that._Table.setBusy(false);
					that._Model.setData(data);
				}
			});
		}

		
			
	});
});