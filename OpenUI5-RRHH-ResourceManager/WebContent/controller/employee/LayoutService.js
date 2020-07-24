sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var LayoutService = {

			/** ID de Columnas de Empleados
			 *      id="legajotCol"
                    id= "apeNomCol">
                    id="categoriaCol"
                    id="paisCol"
                    id="siteCol"
                    id="estructuraCol"
                    id="equipoCol"
                    id="industriaCol"
                    id="practicaCol"
                    id="subPracticaCol"
                    id="clienteCol"
                    id="fechaIniCol"
                    id="fechaLibCol"
                    id="comentariosCol"
                    orden: Legajo, nombre, Cluster, País, 
                    Práctica, Subpráctica, Plan de capacitación, 
                    Fecha de inicio, fecha de liberación, Site y Delivery.
			 */
			
			
		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "App-employeesTable-legajotCol",
					order: 0,
					//text: "Legajo",
					visible: true
				},
				{
					id: "App-employeesTable-apeNomCol",
					order: 1,
					//text: "Nombre y Apellido",
					visible: true
				}, 
				{
					id: "App-employeesTable-clusterCol",
					order: 2,
					//text: "Cluster",
					visible: true
				},
				{
					id: "App-employeesTable-categoriaCol",
					//order: 0,
					//text: "Dimensions",
					visible: false
				},
				{
					id: "App-employeesTable-paisCol",
					order: 3,
					//text: "Pais",
					visible: true
				},
				{
					id: "App-employeesTable-practicaCol", 
					order: 4,
					//text: "Practica",
					visible: true
				},
				{
					id: "App-employeesTable-subPracticaCol", 
					order: 5,
					//text: "SubPractica",
					visible: true
				},
				{
					id: "App-employeesTable-fechaIniCol", 
					order: 6,
					//text: "Fecha de Inicio",
					visible: true
				},
				{
					id: "App-employeesTable-fechaLibCol", 
					order: 7,
					//text: "Fecha de Liberacion",
					visible: true
				},
				{
					id: "App-employeesTable-siteCol",
					order: 8,
					//text: "Site",
					visible: true
				},
				{
					id: "App-employeesTable-estructuraCol",
					//order: 9,
					//text: "Price",
					visible: true
				},
				{
					id: "App-employeesTable-equipoCol",
					//order: 10,
					//text: "Price",
					visible: true
				},
				{
					id: "App-employeesTable-industriaCol",
					//order: 11,
					//text: "Price",
					visible: false
				},
				{
					id: "App-employeesTable-clienteCol", 
					//order: 12,
					//text: "Price",
					visible: true
				},
				{
					id: "App-employeesTable-comentariosCol", 
					//order: 13,
					//text: "Price",
					visible: true
				}
			]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [
					{
								id: "App-employeesTable-legajotCol",
									//order: 0,
									//text: "Product",
									visible: true
								},
								{
									id: "App-employeesTable-apeNomCol",
									//order: 1,
									//text: "Supplier",
									visible: false
								},
								{
									id: "App-employeesTable-categoriaCol",
									//order: 4,
									//text: "Dimensions",
									visible: false
								},
								{
									id: "App-employeesTable-paisCol",
									//order: 2,
									//text: "Weight",
									visible: true
								},
								{
									id: "App-employeesTable-siteCol",
									//order: 3,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-estructuraCol",
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-equipoCol",
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-industriaCol",
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-practicaCol", 
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-subPracticaCol", 
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-clienteCol", 
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-fechaIniCol", 
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-fechaLibCol", 
									//order: 4,
									//text: "Price",
									visible: true
								},
								{
									id: "App-employeesTable-comentariosCol", 
									//order: 4,
									//text: "Price",
									visible: true
								}
							]
			};

			//set personalization
			this._oBundle = oInitialData;

			//reset personalization, i.e. display table as defined
	//		this._oBundle = null;

			oDeferred.resolve();
			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return LayoutService;

});