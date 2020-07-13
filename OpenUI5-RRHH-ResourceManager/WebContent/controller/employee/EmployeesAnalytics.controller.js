sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'sap/ui/model/json/JSONModel',
		'App/model/employee'
		
	], function(Controller,dataEvents,JSONModel,employeeModel) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesAnalytics", {
		
		onInit : function() {

			this._Model = employeeModel.getModel();

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			this._configChartModel = new JSONModel({
				configChart : {
					type: 'horizontalBar',
					data: {
					    labels: [],
					    datasets: []
					}
				}
			});

			this.getView().setModel(this._configChartModel);

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_employees.channel, dataEvents.update_viewsettings_employees.name,this.onSuscribeUpdateViewsettings, this);

			this._eventBus.subscribe(dataEvents.employee_binding.channel, dataEvents.employee_binding.name,this.onSuscribeBinding, this);

		},
		
		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/	
		
		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._aSorters = data.aSorters;
			this._aFilters = data.aFilters;

		},

		onSuscribeBinding : function(channel, event, data){
			var labels = [];
			var dataset = {
				label : "Empleados",
				data : []
			};
			// Agrupamos por CATEGORIA -- DEFAULT
			var group;
			var groupName;
			var sPath;
			var obj = { id : -1};
			for (var i = 0; i < data.aSorters.length; i++) {
				if (data.aSorters[i].vGroup) {
					switch(data.aSorters[i].sPath){
						case "pais/name":
							groupName = "name";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("PaisMasterModel").getJSON());
							obj[groupName] = "Sin Pais";
							group.push(obj);
						break;
						case "site/siteEmplDescri":
							groupName = "siteEmplDescri";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("SitesMasterModel").getJSON());
							obj[groupName] = "Sin Site";
							group.push(obj);
						break;
						case "estructura/nomEstructura":
							groupName = "nomEstructura";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("EstructurasMasterModel").getJSON());
							obj[groupName] = "Sin Estructura";
							group.push(obj);
						break;
						case "equipo/nomEquipo":
							groupName = "nomEquipo";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("EquiposMasterModel").getJSON());
							obj[groupName] = "Sin Equipo";
							group.push(obj);
						break;
						case "industria/name":
							groupName = "name";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("IndustriaMasterModel").getJSON());
							obj[groupName] = "Sin Industria";
							group.push(obj);
						break;
						case "practica/name":
							groupName = "name";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("PracticaMasterModel").getJSON());
							obj[groupName] = "Sin Practica";
							group.push(obj);
						break;
						case "subPractica/name":
							groupName = "name";
							sPath = data.aSorters[i].sPath;
							group = JSON.parse(this.getOwnerComponent().getModel("SubPracticaMasterModel").getJSON());
							obj[groupName] = "Sin Sub Practica";
							group.push(obj);
						break;
					}
				}
			}

			if (!group) {
				group = this.getOwnerComponent().getModel("CategoriaMasterModel").getData();
				groupName = "name";
				sPath = "vCategoriaEmpleado";
			}
			
			for (var i=0; i < group.length; i++) {
				labels.push(group[i][groupName]);
				dataset.data.push(0);
			}

			for (var i=0; i < data.aIndices.length; i++) {
				var employee = this._Model.getProperty("/data/" + data.aIndices[i] + "/" + sPath);
				var iLabel;
				if (employee !== undefined ) {
					iLabel = labels.indexOf(employee);
				} else {
					iLabel = group.length - 1;
				}
				//var iLabel = labels.indexOf(employee);
				dataset.data[iLabel]++;
			}

			// QUITO LOS VALORES EN CERO
			var nLabels = [];
			var nDatasetData = [];
			for (var i = 0; i < dataset.data.length; i++) {
				if (dataset.data[i] > 0) {
					nLabels.push(labels[i]);
					nDatasetData.push(dataset.data[i]);
				}
			}

			dataset.data = nDatasetData;

			this._configChartModel.setProperty("/configChart/data",
				{
					labels : nLabels,
					datasets : [dataset]
				});
			this._configChartModel.refresh(true);

		},


		

	
	});
});
