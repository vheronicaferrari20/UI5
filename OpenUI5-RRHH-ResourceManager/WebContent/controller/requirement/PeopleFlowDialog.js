sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast) {
	"use strict";
	return Object.extend("App.controller.requirement.PeopleFlowDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.PeopleFlowDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._practicaSelect = sap.ui.getCore().byId('practicaSelect');
			this._subPracticaSelect = sap.ui.getCore().byId('subPracticaSelect');

			this._modulesSelect = sap.ui.getCore().byId('modulesSelect');
			this._subModulesSelect = sap.ui.getCore().byId('subModulesSelect');
			

			this._senioritySelect = sap.ui.getCore().byId('senioritySelect');
			this._idiomaSelect = sap.ui.getCore().byId('idiomaSelect');
			this._cantidadInput = sap.ui.getCore().byId('cantidadInput');
			this._desdeTimePicker = sap.ui.getCore().byId('desdeTimePicker');
			this._hastaTimePicker = sap.ui.getCore().byId('hastaTimePicker');
			this._viajeCheckBox = sap.ui.getCore().byId('viajeCheckBox');
			this._comentariosTextArea = sap.ui.getCore().byId('comentariosTextArea');
			this._dependeComboBox = sap.ui.getCore().byId('dependeComboBox');
			this._paisSelect = sap.ui.getCore().byId('paisSelect');
			this._porcentajeSelect = sap.ui.getCore().byId('porcentajeSelect');

			return this._oDialog;
		},


		setSelectedskills : function(KPracticeID, KSubpracticeID, KModuleID, KSubmoduleID) {

			KModuleID = (KModuleID == '') ? '-1' : KModuleID;
			KSubmoduleID = (KSubmoduleID == '') ? '-1' : KSubmoduleID;


			this._KPracticeIDSelected = KPracticeID;
			this._KSubpracticeIDSelected = KSubpracticeID;
			this._KModuleIDSelected = KModuleID;


			//selected practica
			this._practicaSelect.setSelectedKey(KPracticeID);

			//filter items subpractica
			this.filterItemsSubPractica(KPracticeID);
			this._subPracticaSelect.setSelectedKey(KSubpracticeID);
			
			this.filterItemsModule(KSubpracticeID);
			if (KModuleID == '-1' ) {
				var item = new Item({key:'-1', text:'Ninguno'});
				this._modulesSelect.addItem(item);
				this._modulesSelect.setSelectedItem(item);
			} else {
				this._modulesSelect.setSelectedKey(KModuleID);
			}
			
			
			
			this.filterItemsSubModule(KModuleID);
			if (KSubmoduleID == '-1' ) {
				var item = new Item({key:'-1', text:'Ninguno'});
				this._subModulesSelect.addItem(item);
				this._subModulesSelect.setSelectedItem(item);
			} else {
				this._subModulesSelect.setSelectedKey(KSubmoduleID);
			}
			

		},

		fireFirstSet : function(){
			var items = this._practicaSelect.getBinding('items');
			if (items.aIndices.length) {
				this._KPracticeIDSelected  = items.oList[items.aIndices[0]].KPracticeID;
				this._filterItemsSubPractica(items.oList[items.aIndices[0]].KPracticeID);
			}

		},

		onChangePractica: function(oEvent){

			this._KPracticeIDSelected = this._practicaSelect.getSelectedKey();

			this._filterItemsSubPractica(this._practicaSelect.getSelectedKey());

		},

		onChangeSubPractica: function(oEvent){

			this._KSubpracticeIDSelected = this._subPracticaSelect.getSelectedKey();

			this._filterItemsModule(this._subPracticaSelect.getSelectedKey());

		},

		onChangeModules: function(oEvent){

			this._KModuleIDSelected = this._modulesSelect.getSelectedKey();

			this._filterItemsSubModule(this._modulesSelect.getSelectedKey());

		},

		filterItemsSubPractica: function(key) {
			var items = this._subPracticaSelect.getBinding('items');
			items.filter(new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , key));
			return items;
		},

		_filterItemsSubPractica : function(key){

			var items = this.filterItemsSubPractica(key);

			if (items.aIndices.length) {
				this._KSubpracticeIDSelected = items.oList[items.aIndices[0]].KSubpracticeID;
				this._filterItemsModule(items.oList[items.aIndices[0]].KSubpracticeID);
			}

		},

		filterItemsModule : function(key){
			var items = this._modulesSelect.getBinding('items');
			console.log("items",items);
			items.filter(new Filter([new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , this._KPracticeIDSelected),
				new Filter(
				'KSubpracticeID', sap.ui.model.FilterOperator.EQ , key)], true));
			return items;
		},



		_filterItemsModule : function(key){
			
			var items = this.filterItemsModule(key);

			if (items.aIndices.length) {
				var item = new Item({key:'-1', text:'Ninguno'});
				this._modulesSelect.addItem(item);
				this._modulesSelect.setSelectedItem(item);
				this._KModuleIDSelected = '-1';//items.oList[items.aIndices[0]].KModuleID;
				this._filterItemsSubModule('-1');
			}

		},

		filterItemsSubModule : function(key){
			var items = this._subModulesSelect.getBinding('items');
			items.filter(new Filter([new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , this._KPracticeIDSelected),
				new Filter(
				'KSubpracticeID', sap.ui.model.FilterOperator.EQ , this._KSubpracticeIDSelected),
				new Filter(
				'KModuleID', sap.ui.model.FilterOperator.EQ , key)],true));
			return items;
		},

		_filterItemsSubModule : function(key){
			
			var items = this.filterItemsSubModule(key);

			var item = new Item({key:'-1', text:'Ninguno'});
			this._subModulesSelect.addItem(item);
			this._subModulesSelect.setSelectedItem(item);
		},
		
		generatePorcentajes : function(){
			var porcentajes = [];
			for (var i = 1; i <= 10; i++ ){
				porcentajes.push({key : i * 10, value : i * 10});
			}
			return porcentajes;
		},

		open : function (oView, opportunityID, opportunityLineItemId) {
			this._eventBus = sap.ui.getCore().getEventBus();

			this._opportunityID  = opportunityID;
			this._opportunityLineItemId = opportunityLineItemId;

			console.log("this._opportunityID",this._opportunityID);
			console.log("this._opportunityLineItemId",this._opportunityLineItemId);

			
			var oDialog = this._getDialog();

			//oDialog.setModel(new JSONModel(oView.getModel('SkillCategoryMasterModel')).getData(),'SkillCategoryModel' );
			//oDialog.setModel(new JSONModel(oView.getModel('SkillMasterModel')).getData(),'SkillModel' );
			
			oDialog.setModel(new JSONModel({porcentajes : this.generatePorcentajes()}) );

			var that = this;



			oDialog.addEventDelegate({  
			     "onAfterRendering": function () {  
			         //that._filterItemsBySkillCategory(that._skillCategorySelect.getSelectedKey());
			         that.fireFirstSet();

			         that._idiomaSelect.addItem(
			         		new Item({text:'Ninguno', key:0})
			         	);
			         var oItemNingunoDepende = new Item({text:'Ninguno', key:0});
			         that._dependeComboBox.addItem(oItemNingunoDepende);
			         that._dependeComboBox.setSelectedItem(oItemNingunoDepende);
			     }  
			}, this);  
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();
		},

		openToEdit : function (oView, oAsignacion) {
			console.log("oAsignacion",oAsignacion);
			this._eventBus = sap.ui.getCore().getEventBus();

			this._asignacionId  = oAsignacion.id;
			
			var oDialog = this._getDialog();

			oDialog.setModel(new JSONModel(oView.getModel('SkillCategoryMasterModel')).getData(),'SkillCategoryModel' );
			oDialog.setModel(new JSONModel(oView.getModel('SkillMasterModel')).getData(),'SkillModel' );
			oDialog.setModel(new JSONModel({porcentajes : this.generatePorcentajes(),
											editMode : true}) );
			var that = this;

			oDialog.addEventDelegate({  
			     "onAfterRendering": function () {  
			         that._idiomaSelect.addItem(
			         		new Item({text:'Ninguno', key:0})
			         	);
			         var items = that._dependeComboBox.getItems();
			         that._dependeComboBox.addItem(
			         		new Item({text:'Ninguno', key:0})
			         	);
			         for (var i = 0; i < items.length; i++) {
			         	if (items[i].getKey() == that._asignacionId){
			         		that._dependeComboBox.removeItem(items[i]);
			         	}
			         }

			        if (oAsignacion.skills.length) {
			        	that.setSelectedskills(
			        		oAsignacion.skills[0].KPracticeID,
			        		oAsignacion.skills[0].KSubpracticeID,
			        		oAsignacion.skills[0].KModuleID,
			        		oAsignacion.skills[0].KSubmoduleID);
						
					}
			     }  
			}, this);  
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();

			// set values
			console.log("oAsignacion",oAsignacion);
			//this._skillCategorySelect.setSelectedKey(oAsignacion.skill.skillCategory);
			//this._skillSelect.setSelectedKey(oAsignacion.skill.id);

			
			this._senioritySelect.setSelectedKey(oAsignacion.seniority.codCategoria);
			this._idiomaSelect.setSelectedKey((oAsignacion.idioma != null) ? oAsignacion.idioma.Catalogue_Code : 0);
			this._desdeTimePicker.setDateValue(new Date(oAsignacion.desde));
			this._hastaTimePicker.setDateValue(new Date(oAsignacion.hasta));
			this._viajeCheckBox.setSelected(oAsignacion.viaje);
			this._dependeComboBox.setSelectedKey((oAsignacion.parent != null) ?  oAsignacion.parent.id : 0);
			this._porcentajeSelect.setSelectedKey(oAsignacion.porcentaje);
			this._paisSelect.setSelectedKey(oAsignacion.pais.codPais);
		},
		
		onCloseDialog : function (oEvent) {
			console.log("cerrando el dialogo");
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onPressAcept : function(oEvent){


			if (this.validateForm()){
				this.onCloseDialog();
				var that = this;

				var obj = {
					desde : this._desdeTimePicker.getDateValue(),

			  		hasta : this._hastaTimePicker.getDateValue(),

			  		viaje : this._viajeCheckBox.getSelected(),

			  		skills : {
			  			KPracticeID: this._practicaSelect.getSelectedKey(),
						KSubpracticeID: this._subPracticaSelect.getSelectedKey(),
						KModuleID: (this._modulesSelect.getSelectedKey() != '-1') ? this._modulesSelect.getSelectedKey() : null,
						KSubmoduleID:(this._subModulesSelect.getSelectedKey() != '-1') ? this._subModulesSelect.getSelectedKey() : null
			  		},

			  		seniority : this._senioritySelect.getSelectedKey(),

			  		parent : 0,

			  		idioma : 0,

			  		porcentaje : this._porcentajeSelect.getSelectedKey(),

			  		pais : this._paisSelect.getSelectedKey()
				}

				if (this._opportunityID) {
					obj.opportunity = this._opportunityID;
				}

				if (this._opportunityLineItemId) {
					obj.opportunityLineItem = this._opportunityLineItemId;
				}

				if (this._comentariosTextArea.getValue().trim().length > 0 && this._opportunityID) {
					obj.comentarios = { nota : this._comentariosTextArea.getValue()};
				}

				if (this._idiomaSelect.getSelectedKey() > 0) {
					obj.idioma = this._idiomaSelect.getSelectedKey();
				}

				if (this._dependeComboBox.getSelectedKey()){
					obj.parent = this._dependeComboBox.getSelectedKey();
				} 


				if (this._asignacionId) {

					//Update
					jQuery.ajax({
						url : PROXY + '/asignacion/' + this._asignacionId,
						method : 'PUT',
						data : obj
					}); 

				} else {

					//Create
					for (var i = 0; i < this._cantidadInput.getValue(); i++){
						jQuery.ajax({
							url : PROXY + '/asignacion',
							method : 'POST',
							data : obj
						}); 

					}

				}

				
				
			}
		},

		validateForm : function() {
			
			var result = true;

			/*if (!this._skillCategorySelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Ingrese una Categoría");
			}

			if (!this._skillSelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Ingrese un Skill");
			}*/

			if (!this._senioritySelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Ingrese un Seniority");
			}

			if (this._cantidadInput.getValue().length == 0 ) {
				result = false;
				this._cantidadInput.setValueState("Error");
				this._cantidadInput.setValueStateText("Este campo es requerido");
				this._cantidadInput.setShowValueStateMessage(true);
			} else if (! parseInt(this._cantidadInput.getValue()) || this._cantidadInput.getValue() < 1 ) {
				result = false;
				this._cantidadInput.setValueState("Error");
				this._cantidadInput.setValueStateText("Ingrese un valor válido");
				this._cantidadInput.setShowValueStateMessage(true);
			} else {
				this._cantidadInput.setValueState("None");
				this._cantidadInput.setShowValueStateMessage(false);
			}

			if (! this._desdeTimePicker.getDateValue()) {
				result = false;
				this._desdeTimePicker.setValueState("Error");
				this._desdeTimePicker.setValueStateText("Este campo es requerido");
				this._desdeTimePicker.setShowValueStateMessage(true);
			} else {
				this._desdeTimePicker.setValueState("None");
				this._desdeTimePicker.setShowValueStateMessage(false);
			}

			if (! this._hastaTimePicker.getDateValue()) {
				result = false;
				this._hastaTimePicker.setValueState("Error");
				this._hastaTimePicker.setValueStateText("Este campo es requerido");
				this._hastaTimePicker.setShowValueStateMessage(true);
			} else {
				this._hastaTimePicker.setValueState("None");
				this._hastaTimePicker.setShowValueStateMessage(false);
			}

			if (this._desdeTimePicker.getDateValue() && this._hastaTimePicker.getDateValue() ) {
				if (this._desdeTimePicker.getDateValue() > this._hastaTimePicker.getDateValue()) {
					result = false;
					
					this._hastaTimePicker.setValueState("Error");
					this._hastaTimePicker.setValueStateText("La fecha Hasta debe ser mayor/igual a la feche Desde");
					this._hastaTimePicker.setShowValueStateMessage(true);

					this._desdeTimePicker.setValueState("Error");
					this._desdeTimePicker.setValueStateText("La fecha Desde debe ser menor/igual a la feche Hasta");
					this._desdeTimePicker.setShowValueStateMessage(true);

				} else {
					this._hastaTimePicker.setValueState("None");
					this._hastaTimePicker.setShowValueStateMessage(false);
					this._desdeTimePicker.setValueState("None");
					this._desdeTimePicker.setShowValueStateMessage(false);
				}
			}

			return result;
		}

		

	});
});