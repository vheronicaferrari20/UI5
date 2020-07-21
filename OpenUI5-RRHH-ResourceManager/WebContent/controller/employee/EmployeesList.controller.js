sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/model/formatter',
		'App/model/employee',
		'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
		'sap/ui/model/ListBinding'
	], function(Controller,JSONModel,dataEvents,ConfirmDialog,Filter, formatter, employeeModel, Export, ExportTypeCSV, ListBinding) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesList", {
		formatter : formatter,

		onInit : function() {

			this._employeesViewSettingsDialog = this.getOwnerComponent().getEmployeesViewSettingsDialog();

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._ModelName = "EmployeesModel";

			this._Table = this.getView().byId("employeesListTable");
			console.log('OnInit del controler de EmployeeList');

			//this._infoFilterBar = this.getView().byId("infoFilterBar");

			//this._infoFilterLabelTotal = this.getView().byId("infoFilterLabelTotal");
			
			//this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._Model = employeeModel.getModel();

			this.getView().setModel(this._Model,this._ModelName);

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_employees.channel, dataEvents.update_viewsettings_employees.name,this.onSuscribeUpdateViewsettings, this);
			this._eventBus.subscribe(dataEvents.refresh_employee_actions.channel, dataEvents.refresh_employee_actions.name,this.onSuscribeRefresh, this);
			this._eventBus.subscribe(dataEvents.export_employee_actions.channel, dataEvents.export_employee_actions.name,this.onSuscribeExport, this);
			this._eventBus.subscribe(dataEvents.search_employee_actions.channel, dataEvents.search_employee_actions.name,this.onSuscribeSearch, this);

			this.getData();
		},

		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/	
		
		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._aSorters = data.aSorters;
			this._aFilters = data.aFilters;

			//this._infoFilterBar.setVisible(data.aFilters.length > 0);
			//this._infoFilterLabel.setText(data.filterString);

			this.applyFilterSorters();
		},

		onSuscribeRefresh : function(channel, event, data) {

			this.getData();
			this._Table.removeSelections(true);

		},

		onSuscribeExport : function(channel, event, data) {

			this.dataExport();

		},

		onSuscribeSearch : function(channel, event, data) {

			this.search(data.sQuery);

		},

		/*
		***************************************************************************************
		* ON EVENTS METHODS
		***************************************************************************************
		*/

		search : function (sQuery) {
			console.log('search: '+ sQuery);
			//this.getData();
			// add filter for search
			var aFilters = [];
			var binding = this._Table.getBinding("items");
			console.log('binding: '+ binding);
			if (sQuery && sQuery.length > 0) {
				var filter1 = new Filter("codEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("fullName", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter3 = new Filter("vCategoriaEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				//var filter4 = new Filter("pais", sap.ui.model.FilterOperator.Contains, sQuery); //Test Vero:"ARG"				
				aFilters.push(filter1);
				aFilters.push(filter2);
				aFilters.push(filter3);
				//aFilters.push(filter4); //Test Vero:"ARG"
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
			this._oRouter.navTo("resources_form",{id : data.codEmpleado});
		},

		onSelectionChangeTable : function(oEvent){
			this._deleteButton.setEnabled(true);
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

			this._eventBus.publish(
				dataEvents.employee_binding.channel,
				dataEvents.employee_binding.name,
				{
					aFilters : binding.aFilters,
					aIndices : binding.aIndices,
					aSorters : binding.aSorters
				});

			//this._infoFilterLabelTotal.setText("Total ("+binding.aIndices.length +")");
		},

		getData : function() {
			console.log('llamada al getData ');
			var that = this;
			//that._infoFilterLabelTotal.setText("");
			employeeModel
				.loadData()
				.then(function(employees){
					//var total = Object.keys(employees).length;
					//that._infoFilterLabelTotal.setText("Total: " + total);
					that.applyFilterSorters();
					that.settings();
				});
		},

		settings : function() {
			console.log('llamada al settings ');
			jQuery.ajax({
				//url : PROXY + "/UserPreferences/myPreferences", //http://api.grupoassa.com:1337/ //-->Se comenta para test- Vero
				url : "http://api.grupoassa.com:1337/UserPreferences/myPreferences", // --->Test Vero
				method : "GET",
				data : {populate : "employeeDefaultFilter"},
				context : this,
				success : function(data) {
					this._employeesViewSettingsDialog.setStatusViewSettingsAndConfirm(data.employeeDefaultFilter);
				}
			});
		},

		// export data to csv
		dataExport : function() {

			// recupero los datos de como se muestran el la tabla
			var binding =  this._Table.getBinding("items");

			var rows = [];

			for (var i = 0; i < binding.aIndices.length; i++) {
				rows.push(binding.oList[binding.aIndices[i]]);
			}

			var oExport = new Export({
 
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),
 
				// Pass in the model created above
				models : new JSONModel(rows),
 
				// binding information for the rows aggregation
				rows : {
					path : "/"
				},
 
				// column definitions with column name and binding info for the content
 
				columns : [
				{
					name : "Legajo",
					template : {
						content : "{codEmpleado}"
					}
				},           
				{
					name : "Apellido y Nombre",
					template : {
						content : "{fullName}"
					}
				}, 
				{
					name : "Categoría",
					template : {
						content : "{vCategoriaEmpleado}"
					}
				},
				{
					name : "País",
					template : {
						content : "{pais/name}"
					}
				},
				{
					name : "Site",
					template : {
						content : "{site/siteEmplDescri}"
					}
				},
				{
					name : "Estructura",
					template : {
						content : "{estructura/nomEstructura}"
					}
				},
				{
					name : "Equipo",
					template : {
						content : "{equipo/nomEquipo}"
					}
				},
                {
					name : "Industria",
					template : {
						content : "{industria/name}"
					}
				},
                {
					name : "Práctica",
					template : {
						content : "{practica/name}"
					}
				},
				{
					name : "SubPráctica",
					template : {
						content : "{subPractica/name}"
					}
				},
				{
					name : "Proyecto Actual",
					template : {
						content : "{proyectosActuales/0/opportunity/Account} {proyectosActuales/0/opportunity/Name}"
					}
				},
				{
					name : "Fecha Inicio",
					template : {
						content : { path : 'proyectosActuales/0/desde', formatter : this.formatter.formatDate}
					}
				},
				{
					name : "Fecha Liberación",
					template : {
						content : { path : 'proyectosActuales/0/hasta', formatter : this.formatter.formatDate}
					}
				},
				{
					name : "Comentarios",
					template : {
						content : {path : 'comentarios',formatter : this.formatter.mostrarUltimoComentario}
					}
				}
				]
			});

			// download exported file
			oExport.saveFile("Empleados").catch(function(oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function() {
				oExport.destroy();
			});
		}			
	});
});