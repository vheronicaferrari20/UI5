sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
	'App/model/formatter',
	'sap/m/NotificationListItem',
	'sap/ui/unified/Menu',
	'sap/ui/unified/MenuItem',
	'App/controller/ConfirmDialog',
	'App/controller/requirement/SkillsEditorDialog',
	'App/controller/requirement/IdiomaEditorDialog'
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast, formatter, NotificationListItem, Menu, MenuItem, ConfirmDialog,SkillsEditorDialog, IdiomaEditorDialog) {
	"use strict";
	return Object.extend("App.controller.requirement.CandidatosListDialog", {
		formatter : formatter,
		
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.CandidatosListDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._comentariosList = sap.ui.getCore().byId('comentariosList');

			this._feedInput = sap.ui.getCore().byId('feedInput');

			this._addPreferenciaButton = sap.ui.getCore().byId('addPreferenciaButton');

			this._addPreferenciaButton.attachBrowserEvent("tab keyup", function(oEvent){
				this._bKeyboard = oEvent.type == "keyup";
			}, this);

			this._DynamicSideContent = sap.ui.getCore().byId('DynamicSideContent');

			return this._oDialog;
		},

		open : function (oView, AsignacionData) {

			this._ConfirmDialog = new ConfirmDialog();

			this._oView = oView;			

			this._AsignacionId = AsignacionData.id;

			this._eventBus = sap.ui.getCore().getEventBus();

			this._AsignacionModel = new JSONModel(AsignacionData);

			this._PreferenciasModel = new JSONModel();

			this._Model = new JSONModel({isVisibleToAddPreferencia : false});

			var oDialog = this._getDialog();

			oDialog.setModel(this._AsignacionModel,'AsignacionModel' );
			oDialog.setModel(this._PreferenciasModel,'PreferenciasModel' );

			oDialog.setModel(this._Model);

			this._MenuAddPreferencia = new Menu();

			oDialog.addDependent(this._MenuAddPreferencia);
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);

			this.generateTokens(AsignacionData);
			
			//vista del dialog editor de habilidades
			this._SkillsEditorDialog = new SkillsEditorDialog();	

			this._IdiomaEditorDialog = new IdiomaEditorDialog();

			// open dialog
			oDialog.open();

			this._eventBus.subscribe(dataEvents.asignacion_preferencias_totales.channel, dataEvents.asignacion_preferencias_totales.name,this.onSuscribAasignacionPreferenciasTotales, this);
			this._eventBus.subscribe(dataEvents.asignacion_employee_selected.channel, dataEvents.asignacion_employee_selected.name,this.onSuscribAasignacionEmployeeSelected, this);
			this._eventBus.subscribe(dataEvents.update_viewsettings_requirements_edit_skills.channel, dataEvents.update_viewsettings_requirements_edit_skills.name, this.onSuscribeUpdateViewsettingsRequirementsEditSkills, this);
		    
		    this._eventBus.subscribe(dataEvents.update_viewsettings_requirements_edit_languages.channel, dataEvents.update_viewsettings_requirements_edit_languages.name, this.onSuscribeUpdateViewsettingsRequirementsLanguages, this);

		},

		emitAsignacionPreferencias : function(data) {
			this._eventBus.publish(dataEvents.asignacion_preferencias.channel,dataEvents.asignacion_preferencias.name,data);
		},

		onSuscribAasignacionPreferenciasTotales : function(channel, event, preferencias) {
			this._PreferenciasModel.setData(preferencias);
		},

		onSuscribAasignacionEmployeeSelected : function(channel, event, employeeSelected) {
			this._employeeSelected = employeeSelected;
		},

		onSuscribeUpdateViewsettingsRequirementsEditSkills : function(channel, event, data) {
			console.log("onSuscribeUpdateViewsettingsRequirementsEditSkills", data);

			// pasa data a string practicaID__subpractidaID__moduleID_subModuleID
			var skillsKey = data.KPractice.key+"__"+
				data.KSubPractice.key+"__"+
				data.KModule.key+"__"+
				data.KSubModule.key+"__"+
				data.KLevel.key;
			var skillsText = data.KPractice.text+" "+data.KSubPractice.text;

			

			if(data.KModule.key != "-1"){
				console.log("data.KModule",data.KModule);
				//skillsKey+="__"+data.KModule.key;
				skillsText+=" "+data.KModule.text;
				if (data.KSubModule.key != "-1"){
					//skillsKey+="__"+data.KModule.key;
					skillsText+=" "+data.KModule.text;
				}	
			}else{
				//skillsKey+="__"+ -1 + "__" + -1;
			}
			skillsText += " " + data.KLevel.text;
			console.log("skills",skillsKey,skillsText);
			// modifcar prefererencias model, type : "skill"
			// averiguar el path

			var preferenciasData = this._PreferenciasModel.getData();
			var path;
			for (var i =0; i < preferenciasData.length; i++ ) {
				if (preferenciasData[i].type == "skill") {
					path = i;
					break;
				}
			}

			console.log("path", path)

			if (path != undefined) {
				            	
            	//preferenciasData[path].key = "00__00";
            	preferenciasData[path].key = skillsKey;
            	//preferenciasData[path].text = "lal lal";
				preferenciasData[path].text = skillsText;

				
				this._PreferenciasModel.setData(preferenciasData);
				
				//disparar evento para filtrar el listado
				this.emitAsignacionPreferencias(preferenciasData);

				
			}
            
            
		},

		onSuscribeUpdateViewsettingsRequirementsLanguages : function(channel, event, data) {
			console.log("onSuscribeUpdateViewsettingsRequirementsLanguages", data);

			// pasa data a string languageID__activityID__levelID
			var languageKey = data.language.key+"__"+
				data.activity.key+"__"+
				data.level.key;
			var languageText = data.language.text;
			if (data.activity.text) {
				languageText += " " + data.activity.text;
			}
			if (data.level.text) {
				languageText += " " + data.level.text;
			}


			// modifcar prefererencias model, type : "idioma"
			// averiguar el path

			var preferenciasData = this._PreferenciasModel.getData();
			var path;
			for (var i =0; i < preferenciasData.length; i++ ) {
				if (preferenciasData[i].type == "idioma") {
					path = i;
					break;
				}
			}

			console.log("path", path)

			if (path != undefined) {
				            	
            	preferenciasData[path].key = languageKey;
				preferenciasData[path].text = languageText;
				
				this._PreferenciasModel.setData(preferenciasData);
				
				//disparar evento para filtrar el listado
				this.emitAsignacionPreferencias(preferenciasData);
				
			}
            
            
		},

		generateTokens : function(AsignacionData) {
			var preferencias = [];

			if (typeof AsignacionData.seniority === 'object'){
				preferencias.push({
					key : AsignacionData.seniority.codCategoria,
					text : AsignacionData.seniority.name,
					description : 'seniority',
					type : 'seniority',
					icon : 'badge'
				});
			}

			if (typeof AsignacionData.idioma === 'object'){
				preferencias.push({
					key : AsignacionData.idioma.Catalogue_Code,
					text : AsignacionData.idioma.Description_Code,
					description : 'idioma',
					type : 'idioma',
					icon : 'hello-world'
				});
			}

			if (typeof AsignacionData.skills.length){
				if (AsignacionData.skills[0].view) {
					preferencias.push({
						key : AsignacionData.skills[0].view.KPracticeID + '__' + 
							  AsignacionData.skills[0].view.KSubpracticeID + '__' +
							  AsignacionData.skills[0].view.KModuleID + '__' +
							  AsignacionData.skills[0].view.KSubmoduleID,
						text : formatter.toSkill(AsignacionData.skills),
						description : 'skill',
						type : 'skill',
						icon : 'activity-individual'
					});

				}
				
			}

			if (AsignacionData.viaje){
				preferencias.push({
					key : true,
					type : 'viaja',
					text : 'Viaja',
					icon : 'flight'
				});
			}

			if (AsignacionData.desde && AsignacionData.hasta){
				preferencias.push({
					key : [AsignacionData.desde, AsignacionData.hasta],
					text : 'Disponibilidad',
					description : this.formatter.formatDate(AsignacionData.desde) + ' - ' + this.formatter.formatDate(AsignacionData.hasta),
					type : 'disponibilidad',
					icon : 'calendar'
				});
			}

			if (typeof AsignacionData.pais == 'object'){
				preferencias.push({
					key : AsignacionData.pais.codPais,
					text : AsignacionData.pais.name,
					description : 'País',
					type : 'pais',
					icon : 'globe'
				});
			}

			this.emitAsignacionPreferencias(preferencias);

			this._PreferenciasModel.setData(preferencias);
		},
		
		onCloseDialog : function (oEvent) {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onPressAcept : function(oEvent){
			if (this._employeeSelected.codEmpleado) {
				var that = this;
				this._ConfirmDialog.open(
					'Confirm',
					'Se asignara a '+ this._employeeSelected.fullName +' como posible candidato para la asignación. \n ¿Desea Continuar?',
					function(){
						jQuery.ajax({
							url : PROXY + '/asignacion/' + that._AsignacionId + '/candidatos',
							method : 'POST',
							dataType : 'JSON',
							data : {
								employee : that._employeeSelected.codEmpleado,
							},
							success : function(data){
								MessageToast.show(that._employeeSelected.fullName + ' fue agregado con exito');
								that.onCloseDialog();
							},
							error : function(err){
								alert("Error");
							}
						});
					}
					);

			} else {
				MessageToast.show('Seleccione un empleado por favor.');

			}

		
		},

		validateForm : function() {
			
			var result = true;


			return result;
		},

		onPressDeletePreferencia : function(oEvent){
			var oItem = oEvent.getParameter("listItem");
			var sPath = oItem.getBindingContext('PreferenciasModel').getPath()[1];
			var posToDelete = parseInt(sPath);
			var preferencias = this._PreferenciasModel.getData();
			var preferenciaToAdd = preferencias.splice(posToDelete,1);
			this._Model.setProperty('/isVisibleToAddPreferencia', true);
			this._PreferenciasModel.setData(preferencias);

			var menuItem = new MenuItem({text:preferenciaToAdd[0].text, select : this.onSelectMenuAddPreferencia});
			menuItem.dataItem = preferenciaToAdd[0];
			
			this._MenuAddPreferencia.addItem(menuItem);

			this.emitAsignacionPreferencias(preferencias);

		},

		onPressAddPreferencia : function(oEvent) {
			
			var oButton = oEvent.getSource();
 
			var eDock = sap.ui.core.Popup.Dock;
			this._MenuAddPreferencia.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

		},

		onSelectMenuAddPreferencia : function(oEvent) {
			var oMenuItem = oEvent.getSource();
			var oDialog = oMenuItem.getParent().getParent();
			var oMenu = oMenuItem.getParent();
			var preferenciasData = oDialog.getModel('PreferenciasModel').getData();
			preferenciasData.push(oMenuItem.dataItem);
			oDialog.getModel('PreferenciasModel').setData(preferenciasData);

			if (oMenu.getItems().length == 1) {
				oDialog.getModel().setProperty('/isVisibleToAddPreferencia', false);
			}

			sap.ui.getCore().getEventBus().publish(dataEvents.asignacion_preferencias.channel,dataEvents.asignacion_preferencias.name,preferenciasData);

			oMenuItem.destroy();

		},

		onPressToggleSlideContent : function(oEvent){
			console.log("onPressToggleSlideContent");
			this._DynamicSideContent.setShowSideContent(
				! this._DynamicSideContent.getShowSideContent(),
				false);
		},
		
		onPressEditSkills : function (oEvent) {
			var oItem = oEvent.getSource();

			var sPath = oItem.getBindingContext('PreferenciasModel').getPath();
			var data = this._PreferenciasModel.getProperty(sPath);
			 	
			console.log("skills of data",data); 	
			if (data.type == "skill") {
				var skills=data.key.split("__");
				var skillsJson={'KPracticeID':skills[0],'KSubpracticeID':skills[1],'KModuleID':skills[2],'KSubmoduleID':skills[3], KLevelID : skills[4]};
				
				//console.log("skills para todos",skills);
				this._SkillsEditorDialog.open(this._oView,skillsJson);
			}

			if (data.type == "idioma") {
				var languageData = data.key.split("__");
				var obj = {
					language: languageData[0],
					activity: languageData[1],
					level: languageData[2]
				}
				console.log("obj", obj);
				this._IdiomaEditorDialog.open(this._oView,obj);
			}
		}
	});
});