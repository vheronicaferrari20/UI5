sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var LayoutService = {

			/** ID de Columnas de Oportunidades
			 *      id="cuentaCol" 
                    id="oportunidadCol"
                    id="paisCol"
                    id="etapaCol"
                    id="platformCol"
                    id="serviceTypeCol"
                    id="cierreCol"
                    id="inicioSFCol"
                    id="committedCol"
                    id="perfilesCol"
			 */
			
			
		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "App-opportunitiesTable-cuentaCol",
					order: 0,
					//text: "Cuenta",
					visible: true
				},
				{
					id: "App-opportunitiesTable-oportunidadCol",
					order: 1,
					//text: "Nombre y Apellido",
					visible: true
				}, 
				{
					id: "App-opportunitiesTable-paisCol",
					order: 2,
					//text: "Cluster",
					visible: true
				},				
				{
					id: "App-opportunitiesTable-etapaCol",
					order: 3,
					//text: "ID Pais", 
					visible: true
				},                
				{
					id: "App-opportunitiesTable-platformCol",
					order: 4,
					//text: "Pais", 
					visible: false
				},
				{
					id: "App-opportunitiesTable-serviceTypeCol",
					order: 5,
					//text: "ID Categoria", 
					visible: true
				},                    
				{
					id: "App-opportunitiesTable-cierreCol",
					order: 6,
					//text: "Categoria", 
					visible: false
				},
				{
					id: "App-opportunitiesTable-inicioSFCol", 
					order: 7,
					//text: "ID Practica", 
					visible: true
				},
				{
					id: "App-opportunitiesTable-committedCol", 
					order: 8,
					//text: "Practica", 
					visible: false
				},
				{
					id: "App-opportunitiesTable-perfilesCol", 
					order: 9,
					//text: "SubPractica",
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
							id: "App-opportunitiesTable-cuentaCol",
							order: 0,
							//text: "Cuenta",
							visible: true
						},
						{
							id: "App-opportunitiesTable-oportunidadCol",
							order: 1,
							//text: "Nombre y Apellido",
							visible: true
						}, 
						{
							id: "App-opportunitiesTable-paisCol",
							order: 2,
							//text: "Cluster",
							visible: true
						},				
						{
							id: "App-opportunitiesTable-etapaCol",
							order: 3,
							//text: "ID Pais", 
							visible: true
						},                
						{
							id: "App-opportunitiesTable-platformCol",
							order: 4,
							//text: "Pais", 
							visible: false
						},
						{
							id: "App-opportunitiesTable-serviceTypeCol",
							order: 5,
							//text: "ID Categoria", 
							visible: true
						},                    
						{
							id: "App-opportunitiesTable-cierreCol",
							order: 6,
							//text: "Categoria", 
							visible: false
						},
						{
							id: "App-opportunitiesTable-inicioSFCol", 
							order: 7,
							//text: "ID Practica", 
							visible: true
						},
						{
							id: "App-opportunitiesTable-committedCol", 
							order: 8,
							//text: "Practica", 
							visible: false
						},
						{
							id: "App-opportunitiesTable-perfilesCol", 
							order: 9,
							//text: "SubPractica",
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