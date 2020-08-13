sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'App/controller/employee/EmployeesViewSettingsDialog',
		'sap/ui/model/Filter',
		'App/model/formatter',
		'App/model/employee',
		'sap/ui/core/util/Export',
		'sap/ui/core/util/ExportTypeCSV',
		'sap/ui/model/ListBinding',
		'sap/m/TablePersoController',
		'./LayoutService',

	], function(Controller,JSONModel,dataEvents,ConfirmDialog,EmployeesViewSettingsDialog,Filter, formatter, employeeModel, Export, ExportTypeCSV,
			    ListBinding,TablePersoController, LayoutService) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesList", {
		formatter : formatter,

		onInit : function() {
			console.log('Hola Git, o hellow Git aja');
			this._employeesViewSettingsDialog = this.getOwnerComponent().getEmployeesViewSettingsDialog();
			this._ViewSettingsDialog = this.getOwnerComponent().getEmployeesViewSettingsDialog();
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._ModelName = "EmployeesModel";

			this._Table = this.getView().byId("employeesListTable");
			console.log('OnInit del controler de EmployeeList');

			// this._infoFilterBar = this.getView().byId("infoFilterBar");

			// this._infoFilterLabelTotal =
			// this.getView().byId("infoFilterLabelTotal");
			
			// this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._Model = employeeModel.getModel();

			this.getView().setModel(this._Model,this._ModelName);
			
			// Inicio Test Vero
			this._infoFilterLabelTotal = this.getView().byId("infoFilterLabelTotal");
            this._serchField = this.getView().byId("serchField");
			// Fin test Vero
			
			 		
			// *************Inicio de Test Vero
			// var oPersId = {container: "mycontainer-1", item: "myitem-1"};
			
			// var oProvider =
			// sap.ushell.Container.getService("Personalization").getPersonalizer(oPersId);
			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this._Table, // this.byId("employeesListTable"),
				componentName: "App",
				persoService: LayoutService  // oProvider
			}).activate();
			// *************FIN de Test Vero

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_employees.channel, dataEvents.update_viewsettings_employees.name,this.onSuscribeUpdateViewsettings, this);
			this._eventBus.subscribe(dataEvents.refresh_employee_actions.channel, dataEvents.refresh_employee_actions.name,this.onSuscribeRefresh, this);
			this._eventBus.subscribe(dataEvents.export_employee_actions.channel, dataEvents.export_employee_actions.name,this.onSuscribeExport, this);
			this._eventBus.subscribe(dataEvents.search_employee_actions.channel, dataEvents.search_employee_actions.name,this.onSuscribeSearch, this);

			// Inicio Test Vero
			this._eventBus.subscribe(dataEvents.employee_binding.channel, dataEvents.employee_binding.name,this.onSuscribeBinding, this);
			// Fin test Vero
						
			this.getData();
		},

		/*
		 * **************************************************************************************
		 * ON SUSCRIBE METHODS
		 * **************************************************************************************
		 */	
		
		onSuscribeUpdateViewsettings : function(channel, event, data){
			
			/**
			 * //Se comenta para Test de Ordenamiento por Nro de Legajo
			 * this._aSorters = data.aSorters; this._aFilters = data.aFilters;
			 * 
			 * //this._infoFilterBar.setVisible(data.aFilters.length > 0);
			 * //this._infoFilterLabel.setText(data.filterString);
			 * 
			 * this.applyFilterSorters();
			 */
			// -->Inicio de Nueva logica para Ordenamiento x Nro de Legajo
			this._aSorters = data.aSorters;
			this._aFilters = data.aFilters; 
			// var newSort = []; //para guardar numbers
			var flagSort = false // flag

			if ( this._aSorters[0].sPath === "codEmpleado") {
				flagSort = true			
			} 
				
		    this.applyFilterSorters(flagSort);
			// --->Fin Nueva Logica para Ordenamiento x Nro de Legajo
		    // Inicio Test Vero
				// this._infoFilterLabel.setText(data.filterString);
					this._infoFilterLabelTotal.setText(data.filterString);
		   // Fin test Vero
		},
		// Inicio Test Vero
		onSuscribeBinding : function(channel, event, data) {
			
			this._infoFilterLabelTotal.setText("Total ("+data.aIndices.length +")"); // Comentado para testing-Vero

		},
		// Fin test Vero
       
		onSuscribeRefresh : function(channel, event, data) {

			this.getData();
			this._Table.removeSelections(true);
		},

		onSuscribeExport : function(channel, event, data) {

			this.dataExport();
		},

		onSuscribeSearch : function(channel, event, data) {
			
			this.search(data.sQuery);
			this._serchField.setValue(data.sQuery);
		},

		/*
		 * **************************************************************************************
		 * ON EVENTS METHODS
		 * **************************************************************************************
		 */
		
		 onPressConfig : function(oEvent){
				
				this._ViewSettingsDialog.open(this.getView());

			},
			
		 onPressRefresh : function(oEvent, data){

				this._eventBus.publish( dataEvents.refresh_employee_actions.channel,
					                    dataEvents.refresh_employee_actions.name);
				this._infoFilterLabelTotal.setText("Total ("+data.aIndices.length +")");
				console.log('infoFilterLabelTotal: '+this._infoFilterLabelTotal);
			},

		 onSearch : function (oEvt) {

				this._eventBus.publish( dataEvents.search_employee_actions.channel,
		                                dataEvents.search_employee_actions.name,
		                                {
			                               sQuery : oEvt.getSource().getValue()
		                                });
			},
			
		 onDataExport : function(oEvent) {

				this._eventBus.publish(
					dataEvents.export_employee_actions.channel,
					dataEvents.export_employee_actions.name);

			},
		
		 search : function (sQuery) {
			console.log('search: '+ sQuery);
			// this.getData();
			// add filter for search
			var aFilters = [];
			var binding = this._Table.getBinding("items");
			console.log('binding: '+ binding);
			if (sQuery && sQuery.length > 0) {
				var filter1 = new Filter("codEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("fullName", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter3 = new Filter("vCategoriaEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				// var filter4 = new Filter("pais",
				// sap.ui.model.FilterOperator.Contains, sQuery); //Test
				// Vero:"ARG"
				aFilters.push(filter1);
				aFilters.push(filter2);
				aFilters.push(filter3);
				// aFilters.push(filter4); //Test Vero:"ARG"
				this._filterSearh = new Filter(aFilters);
				// binding.filter(new Filter(aFilters));
			} else {
				// binding.filter([]);
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
		 * **************************************************************************************
		 * **************************************************************************************
		 * **************************************************************************************
		 */

		applyFilterSorters : function(flagSort){   // -->Se agregan los
													// parametros flagSort,
													// aIndices -Test SORT
			var binding = this._Table.getBinding("items");					
			var filters = [];

			if (this._filterSearh) {
				filters.push(this._filterSearh)  // binding.filter(data._filterSearh);
			}

			for (var i=0; i < this._aFilters.length; i++){
				filters.push(this._aFilters[i]);
			}
			
			// Inicio de Modificacion para nueva Logica
			binding.filter(filters);
						
			function sortDescending(a, b) {return b-a;} 
            function sortAscending(a, b) {return a-b;} 
            
          // SORT DESC
            if (this._aSorters.length > 0){
                if(this._aSorters[0].bDescending === true){
	    			binding.aIndices.sort(sortDescending); 			
		    	}
          // SORT ASC
			    if (this._aSorters[0].bDescending === false) { 
				    binding.aIndices.sort(sortAscending);				
			    }
            }
            
			if (flagSort != true){
				binding.sort(this._aSorters); 
			} 
			
			this._eventBus.publish(
				dataEvents.employee_binding.channel,
				dataEvents.employee_binding.name,
				{
					aFilters : binding.aFilters,
					aIndices : binding.aIndices,
					aSorters : binding.aSorters
				})
				this._Table.getBinding("items").refresh();
				if(binding.aIndices.length > 0){
					// this._infoFilterLabelTotal.setText("Total
					// ("+binding.aIndices.length +")");
				}

		},

		getData : function() {
			console.log('llamada al getData ');
			var that = this;
			// that._infoFilterLabelTotal.setText("");
			employeeModel
				.loadData()
				.then(function(employees){
					var total = Object.keys(employees).length;
					// that._infoFilterLabelTotal.setText("Total: " + total);
					that.applyFilterSorters();
					that.settings();
				});
			
		},

		settings : function() {
			console.log('llamada al settings ');
			jQuery.ajax({
				// url : PROXY + "/UserPreferences/myPreferences",
				// //http://api.grupoassa.com:1337/ //-->Se comenta para test-
				// Vero
				url : "http://api.grupoassa.com:1337/UserPreferences/myPreferences", // --->Test
																						// Vero
				method : "GET",
				data : {populate : "employeeDefaultFilter"},
				context : this,
				success : function(data) {
					this._employeesViewSettingsDialog.setStatusViewSettingsAndConfirm(data.employeeDefaultFilter);
				}
			});
		},
		
		// *************Inicio de Test Vero
		onLayoutButtonPress: function (oEvent) {
			// console.log('Pasa x onLayoutoButtonPress');
			this._oTPC.openDialog();
		},
		// *************Fin de Test Vero
		
		// export data to csv
		dataExport : function() {

			// recupero los datos de como se muestran el la tabla
			var binding =  this._Table.getBinding("items");
			
			var oTPC = this._oTPC;

			var rows = [];
			var columns = []; 
			var j = 0;
			
			for (var i = 0; i < binding.aIndices.length; i++) {
				rows.push(binding.oList[binding.aIndices[i]]);
			}
			
			for (var i = 0; i < oTPC._oPersonalizations.aColumns.length; i++) {
				//console.log( '_oPersonalizations: '+oTPC._oPersonalizations.aColumns[i].id );

				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-legajoCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Legajo",
							template : { content : "{codEmpleado}" }
						},  
						j++;
					}
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-apeNomCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Apellido y Nombre",
							template : { content : "{fullName}"	}
						    },
						j++;
					}
				}
				
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-clusterCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Cluster",
							template : { content : "{cluster}" } 
				            },
				        j++;    
				    }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-idPaisCol'){	
				    if(oTPC._oPersonalizations.aColumns[i].visible == true){
				    	columns[j] = {
							name : "ID Pais", 
							template : { content : "{pais/codPais}" }
				            },
				         j++;
				      } 
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-paisCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "País",
							template : { content : "{pais/name}" }
						},
						j++;
			      }
				}							
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-idCategoriaCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "ID Categoria",
							template : { content : "{codCategoriaEmpleado}" }
						},
						j++;
			       }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-categoriaCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Categoria",
							template : { content : "{vCategoriaEmpleado}" }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-idPracticaCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "ID Práctica",
							template : { content : "{practica/codArea}" }
						},
						j++;
			       }
				} 						
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-practicaCol'){
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Práctica",
							template : { content : "{practica/name}" }
						},
						j++;
			       }
				}	
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-idSubPracticaCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "ID SubPráctica",
							template : { content : "{subPractica/codDivision}" }
						},
						j++;
			        }
				}	
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-subPracticaCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "SubPráctica",
							template : { content : "{subPractica/name}" }
						},
						j++;
					}
				} 						
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-fechaIniCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Fecha de Inicio",
							template : { content : {path : 'proyectosActuales/0/desde', formatter : this.formatter.formatDate} }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-fechaLibCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Fecha de Liberacion",
							template : { content : { path : 'proyectosActuales/0/hasta', formatter : this.formatter.formatDate } }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-siteCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Site",
							template : { content : "{site/siteEmplDescri}" }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-estructuraCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Estructura",
							template : { content : "{estructura/nomEstructura}" }
						},
						j++;
			        }
				}						 
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-equipoCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Equipo",
							template : { content : "{equipo/nomEquipo}" }
						},
						j++;
			       }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-industriaCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Industria",
							template : { content : "{industria/name}" }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-clienteCol'){		
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Proyecto Actual",
							template : { content : "{proyectosActuales/0/opportunity/Account} {proyectosActuales/0/opportunity/Name}" }
						},
						j++;
			        }
				}
				if(oTPC._oPersonalizations.aColumns[i].id == 'App-employeesListTable-comentariosCol'){	
					if(oTPC._oPersonalizations.aColumns[i].visible == true){
						columns[j] = {
							name : "Comentarios",
							template : { content : {path : 'comentarios',formatter : this.formatter.mostrarUltimoComentario} }
						},
						j++;
			         }
				}
			} //Fin for

			var oExport = new Export({
 
				// Type that will be used to generate the content. Own
				// ExportType's can be created to support other formats
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),
 
				// Pass in the model created above
				models : new JSONModel(rows),
 
				// binding information for the rows aggregation
				rows : {
					path : "/"
				},
 
				// column definitions with column name and binding info for the
				// content
				//Se recorre las columas para saber cuales fueron activadas y armar la definicion
			           // var countryid = country[indice];
				//oTPC._oPersonalizations.aColumns[0].id
				
				columns : columns  
						
					
				
					/**[
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
				]*/
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