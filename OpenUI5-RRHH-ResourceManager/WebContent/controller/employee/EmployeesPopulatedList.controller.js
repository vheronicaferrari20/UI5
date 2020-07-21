sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/controller/employee/EmployeesPopulatedViewSettingsDialog',
		'App/model/formatter',
		'App/model/employee',
		'sap/ui/model/Sorter',
		'App/controller/employee/EmployeeFormDialog'
	], function(Controller,JSONModel,dataEvents,ConfirmDialog,Filter,EmployeesPopulatedViewSettingsDialog, formatter, employeeModel, Sorter, EmployeeFormDialog) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesPopulatedList", {
		formatter : formatter,

		onInit : function() {

			console.log("on init");

			this._EmployeeFormDialog = new EmployeeFormDialog();

			this._oRouter = sap.ui.core.routing.Router.getRouter("AppRouter");

			this._ModelName = "EmployeesModel";

			this._ViewSettingsDialog = new EmployeesPopulatedViewSettingsDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._Table = this.getView().byId("employeesPopulatedListTable");

			this._busyIndicator = this.getView().byId("busyIndicator");

			this._Table.attachSelectionChange(this.publishAasignacionSelected, this);

			
			//this._Table.updateFinished(this.updateFinished);

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this._deleteButton = this.getView().byId("deleteButton");

			this._Model = employeeModel.getModel();

			if (this._Model.getProperty("/data") == undefined) {
				
				employeeModel.loadData();
			}

			var rootModel = new JSONModel({
				skillFieldName : 'name',
				idiomaFieldName : 'vIdioma'
			});

			this.getView().setModel(rootModel);

			this.getView().setModel(this._Model,this._ModelName);

			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_populated_employees.channel, dataEvents.update_viewsettings_populated_employees.name,this.onSuscribeUpdateViewsettings, this);
			this._eventBus.subscribe(dataEvents.asignacion_preferencias.channel, dataEvents.asignacion_preferencias.name,this.onSuscribAasignacionPreferencias, this);
			//this._eventBus.subscribe(dataEvents.asignacion_getSelected.channel, dataEvents.asignacion_getSelected.name,this.onSuscribAasignacionGetSelected, this);
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

		onSuscribAasignacionPreferencias : function(channel, event, preferencias) {
			var pDesde, pHasta;
			for (var i= 0; i < preferencias.length; i++){
				if (preferencias[i].type == "disponibilidad") {
					this._pDesde = new Date(preferencias[i].key[0]);
					pDesde  = preferencias[i].key[0];
					this._pHasta = new Date(preferencias[i].key[1]);
					pHasta = preferencias[i].key[1];
				}
			}
			function matchingPreferences(data, preferencias) {
				return new Promise(function(resolve, reject){
					//inicializa los totales
					for (var i = 0; i < preferencias.length; i++) {
						preferencias[i].total = 0;
					}

					for (var codEmpleado in data){
						data[codEmpleado].preferencia = 0;
						data[codEmpleado].stars = 0;
						data[codEmpleado].maxStars = preferencias.length;
						data[codEmpleado].mykSkillMatching = undefined;

						for (var j = 0; j < preferencias.length; j++){
							switch(preferencias[j].type) {
								case 'pais':
									if (data[codEmpleado].pais.codPais == preferencias[j].key){
										data[codEmpleado].preferencia++;
										data[codEmpleado].stars++;
										preferencias[j].total++;
									}
									
									break;
								case 'seniority':
									if (data[codEmpleado].codCategoriaEmpleado == preferencias[j].key){
										data[codEmpleado].preferencia++;
										data[codEmpleado].stars++;
										preferencias[j].total++;
									}
									
									break;
								case 'skill':
								//0 KPracticeID
								//1 KSubpracticeID
								//2 KModuleID
								//3 KSubmoduleID
								//4 KLevelID
									//console.log("skill");
									var puntajeMax = 0;
									var mykSkillMatching = {};

									if (!("mykSkills" in data[codEmpleado])) {
										break;
									}

									for (var k = 0; k < data[codEmpleado].mykSkills.length; k++){
										var skillsAux = preferencias[j].key.split('__');
										//console.log("skillsAux",skillsAux);
										var skills = [];
										if (skillsAux.length < 4) { break;}
										for (var q = 0; q < skillsAux.length; q++){
											if (skillsAux[q] != '-1' && skillsAux[q].length > 0) {
												skills.push(skillsAux[q]);
											}
										}

										var puntajeA, puntajeB, puntajeC, puntajeD, puntaje = 0;

										if (skills.length == 2) {
											puntajeA = 1;
											puntajeB = 0;
											puntajeC = 0;
											
										}

										if (skills.length == 3) {
											puntajeA = 0.75;
											puntajeB = 0.25;
											puntajeC = 0;
										}

										if (skills.length == 4) {
											puntajeA = 0.50;
											puntajeB = 0.25;
											puntajeC = 0.25;
										}

										if (skills.length == 5) {
											puntajeA = 0.40;
											puntajeB = 0.20;
											puntajeC = 0.20;
											puntajeD = 0.20;
										}

										// dos skills de busqueda
										if (skills.length >= 2) {
											if (data[codEmpleado].mykSkills[k].KPracticeID == skills[0] && 
												data[codEmpleado].mykSkills[k].KSubpracticeID == skills[1]) {
												puntaje += puntajeA;
											}
										}
										

										// tres skills de busqueda
										if (skills.length >= 3) {
											if (data[codEmpleado].mykSkills[k].KPracticeID == skills[0] && 
												data[codEmpleado].mykSkills[k].KSubpracticeID == skills[1] &&
												data[codEmpleado].mykSkills[k].KModuleID == skills[2]) {
												puntaje += puntajeB;
											}
										}

										// cuatro skills de busqueda
										if (skills.length >= 4) {
											if (data[codEmpleado].mykSkills[k].KPracticeID == skills[0] && 
												data[codEmpleado].mykSkills[k].KSubpracticeID == skills[1] &&
												data[codEmpleado].mykSkills[k].KModuleID == skills[2] &&
												data[codEmpleado].mykSkills[k].KSubmoduleID == skills[3]) {
												puntaje += puntajeC;
											}
										}

										// cuatro skills de busqueda y Level
										if (skills.length == 5) {
											if (data[codEmpleado].mykSkills[k].KPracticeID == skills[0] && 
												data[codEmpleado].mykSkills[k].KSubpracticeID == skills[1] &&
												data[codEmpleado].mykSkills[k].KModuleID == skills[2] &&
												data[codEmpleado].mykSkills[k].KSubmoduleID == skills[3] && 
												parseInt(data[codEmpleado].mykSkills[k].LevelID) >= parseInt(skills[4])) {
												puntaje += puntajeD + parseInt(data[codEmpleado].mykSkills[k].LevelID) / 10;
											}
										}

										if (puntaje > puntajeMax){
											puntajeMax = puntaje;
											mykSkillMatching = data[codEmpleado].mykSkills[k]; 
										}
									}
									
									if (puntajeMax > 0) {

										//console.log("cargando preferencia, ",data[codEmpleado], puntajeMax );
										//console.log("puntajeMax", puntajeMax);

										data[codEmpleado].preferencia += (puntajeMax >= 1) ? (puntajeMax + 6) : puntajeMax;
										data[codEmpleado].stars = (puntajeMax >= 1)  ? (data[codEmpleado].stars + 1) : (data[codEmpleado].stars + 0.5);
										data[codEmpleado].mykSkillMatching = mykSkillMatching;
										if (puntajeMax >= 1) {
											preferencias[j].total++;
										}

									}
									
									break;
								case 'idioma':
									var idiomaMatching = undefined;
									var idiomaKeys = preferencias[j].key.split('__');

									var languageID = idiomaKeys[0];
									var activityID = idiomaKeys[1];
									var levelID = idiomaKeys[2];

									var maxPuntaje = 0;

									for (var k = 0; k < data[codEmpleado].myklanguages.length; k++){

										//solo El idioma
										if (idiomaKeys.length == 1) {
											if (data[codEmpleado].myklanguages[k].LanguageID == languageID){
												idiomaMatching = data[codEmpleado].myklanguages[k];
											}
										}

										// idioma actividad y level
										if (idiomaKeys.length == 3) {
											if (data[codEmpleado].myklanguages[k].LanguageID == languageID &&
												data[codEmpleado].myklanguages[k].Activity_LanguageID == activityID &&
												data[codEmpleado].myklanguages[k].Level_LanguageID == levelID){
												idiomaMatching = data[codEmpleado].myklanguages[k];
											}
										}
										
									}
									if (idiomaMatching) {

										data[codEmpleado].preferencia++;
										data[codEmpleado].stars++;
										data[codEmpleado].idiomaMatching = idiomaMatching;
										preferencias[j].total++;
									}
									break;
								case 'viaja':
									if (data[codEmpleado].viaja.length) {
										if (data[codEmpleado].viaja[0].value == preferencias[j].key){
											data[codEmpleado].preferencia++;
											data[codEmpleado].stars++;
											preferencias[j].total++;
										}
									}
									break;
								case 'disponibilidad':
									if (! ('_asignaciones' in data[codEmpleado]) ){
										data[codEmpleado].preferencia++;
										data[codEmpleado].stars++;
										data[codEmpleado].disponibilidad = "Diponible";

										preferencias[j].total++;
									} else {
										data[codEmpleado].disponibilidad = "Ocupado";
									}
									break;	


							}
						}
					}

					resolve({ data : data, preferencias : preferencias});
				});

			}

			var that = this;

			that._showBusyIndicator = true;
			that._busyIndicator.setVisible(true);

			new Promise(function(resolve, reject){
				var salir = false;

				var intervarFn = setInterval(function(){
					var loading = that._Model.getProperty('/loading');
					console.log("loading", loading);
					if (! that._Model.getProperty('/loading')){
						clearInterval(intervarFn);
						resolve();

					}

				},500);
				

			}).then(function(){

				employeeModel.getAsignacionesByRango(pDesde,pHasta);

				new Promise(function(resolve, reject){
				var salir = false;

				var intervarFn = setInterval(function(){
					if (! that._Model.getProperty('/loading')){
						clearInterval(intervarFn);
						resolve();

					}

				},500);
				

			}).then(function(){

				var data = that._Model.getProperty('/data');

				//that._Model.setProperty('/loading', true);

				//console.log("'/loading', true", " get ", that._Model.getProperty('/loading'));
			    console.log("set visible true");
			    
				matchingPreferences(data,preferencias).then(function(data){
					var aSorters = [];
					aSorters.push(new Sorter('preferencia', true));
					that._aSorters = aSorters;
					that._Model.setProperty('/data',data.data);
					that.applyFilterSorters();
					that._eventBus.publish(dataEvents.asignacion_preferencias_totales.channel,dataEvents.asignacion_preferencias_totales.name,data.preferencias);
					that.publishAasignacionSelected("holla");
					//that._Model.setProperty('/loading', false);
					//console.log("'/loading', get ", that._Model.getProperty('/loading'));


				});

			});

				

			});

			

		},

		calcularDisponibilidad : function(asignaciones) {
			var result = "";
			if (!this._pDesde || !this._pHasta) {
				return "";
			}
			if (!asignaciones) {
				result = "D";
			} else {
				// ordeno de menor a mayor las asignaciones teniendo en cuenta la fecha desde
				asignaciones.sort(
						function(a, b) {
							var desde = new Date(a.desde);
							var hasta = new Date(b.desde);
							return desde.getTime() - hasta.getTime();
						}
					);
				var inicio , fin, ultimoHasta, intervalosVacios = false;
				if (asignaciones.length > 0){
					inicio = new Date(asignaciones[0].desde);
					fin = new Date(asignaciones[0].hasta);
					ultimoHasta = new Date(asignaciones[0].hasta);
				}
				for (var i = 1 ; i < asignaciones.length; i++){
					var auxDesde = new Date(asignaciones[i].desde);
					var auxHasta = new Date(asignaciones[i].hasta);
					if (auxDesde.getTime() < inicio.getTime()) {
						inicio = auxDesde;
					}
					if (auxHasta.getTime() > fin.getTime()) {
						fin = auxHasta;
					}
					if (ultimoHasta.getTime() < auxDesde.getTime()){
						intervalosVacios = true;
					}
					ultimoHasta = auxHasta;
				}

				if (inicio.getTime() <= this._pDesde.getTime() &&
					fin.getTime() >= this._pHasta.getTime() &&
					!intervalosVacios
					){
					result =  "O";
				} else {
					result = "P";
				}
			}

			return result;

		},

		publishAasignacionSelected : function(d) {
			var oItem = this._Table.getSelectedItem();
			if (oItem) {
				var path = oItem.getBindingContext(this._ModelName).getPath();
				var data = this._Model.getProperty(path);
				this._eventBus.publish(dataEvents.asignacion_employee_selected.channel,dataEvents.asignacion_employee_selected.name,data);
			} else {
				this._eventBus.publish(dataEvents.asignacion_employee_selected.channel,dataEvents.asignacion_employee_selected.name,undefined);
			}
			
		},

		updateFinished : function() {
			
			if (this._showBusyIndicator == true) {
				console.log("update finish");
				this._busyIndicator.setVisible(false);
				this._showBusyIndicator = false;
			}
			
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
				var filter1 = new Filter("codEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("fullName", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter3 = new Filter("vCategoriaEmpleado", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter1);
				aFilters.push(filter2);
				aFilters.push(filter3);
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
			this._EmployeeFormDialog.open(this.getView(),data.codEmpleado);
			//this._oRouter.getTargets().display("resources_form",{id : data.codEmpleado});
			//this._oRouter.navTo("resources_form_dialog",{id : data.codEmpleado});
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
				'Ud esta seguro que desea eliminar este Skill',
				function(){
					jQuery.ajax({
						//url : PROXY + '/skill/' + data.id, //url:'http://api.grupoassa.com:1337 //-->se comenta para pruebas -Vero
						url : 'http://api.grupoassa.com:1337/skill/' + data.id, // ---> Test Vero
						method : 'DELETE',
						dataType : 'JSON',
						success : function(data){
							that.getData();
							that._Table.removeSelections(true);
						},
						error : function(err){
							alert("err");
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
			//this._deleteButton.setEnabled(false);
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

			if (!binding) {
				return;
			}

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
			employeeModel.loadData();
		},

		onExit : function() {
			this._eventBus.unsubscribe(dataEvents.update_viewsettings_populated_employees.channel, dataEvents.update_viewsettings_populated_employees.name,this.onSuscribeUpdateViewsettings, this);
			this._eventBus.unsubscribe(dataEvents.asignacion_preferencias.channel, dataEvents.asignacion_preferencias.name,this.onSuscribAasignacionPreferencias, this);
			this.destroy();
		},

		toSkill: function(skillMatching) {
			var that = this;
			var skill = "";

			console.log("skillMatching",skillMatching);

			if (skillMatching) {
				skill += skillMatching.KPracticeDescription_Code + ' ' +
					skillMatching.KSubpracticeDescription_Code + ' ' +
					skillMatching.KModuleDescription_Code + ' ' +
					skillMatching.KSubmoduleDescription_Code + '\n';
			}
			

			return skill;
		},

		toLevelSkill: function(skillMatching) {
			var level = "";
			if (skillMatching) {
				switch (skillMatching.Knowledge_LevelDescription_Code) {
					case 'Básico':
						level = 'Bas';
						break;
					case 'Intermedio':
						level = 'Int';
						break;
					case 'Avanzado':
						level = 'Avz';
						break;
					case 'Experto':
						level = 'Exp';
						break;
				}
			}
			

			return level;
		},


		limitTextTo30 : function(text){
			var r = text;
			if (text.length > 30) {
				r = text.substring(0,30) + "...";
			}
			return r;
		},

		toCoeInd : function(cluster, codIndustria) {
			var r = codIndustria;

			if (cluster != '0') {
				r = cluster;
			}
			return r;
		}



		
			
	});
});