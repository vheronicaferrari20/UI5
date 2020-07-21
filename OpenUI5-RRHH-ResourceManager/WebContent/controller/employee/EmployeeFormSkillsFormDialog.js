sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
], function (Object,JSONModel,dataEvents,MessageToast,Filter, Item) {
	"use strict";
	return Object.extend("App.controller.employee.EmployeeFormSkillsFormDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.employee.EmployeeFormSkillsFormDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._practicaSelect = sap.ui.getCore().byId('practicaSelect');
			this._subPracticaSelect = sap.ui.getCore().byId('subPracticaSelect');

			this._modulesSelect = sap.ui.getCore().byId('modulesSelect');
			this._subModulesSelect = sap.ui.getCore().byId('subModulesSelect');

			
			this._acceptButton =  sap.ui.getCore().byId('acceptButton');


			return this._oDialog;
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

		_filterItemsSubPractica : function(key){

			var items = this._subPracticaSelect.getBinding('items');
			items.filter(new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , key));

			if (items.aIndices.length) {
				this._KSubpracticeIDSelected = items.oList[items.aIndices[0]].KSubpracticeID;
				this._filterItemsModule(items.oList[items.aIndices[0]].KSubpracticeID);
			}

		},

		_filterItemsModule : function(key){
			var items = this._modulesSelect.getBinding('items');
			console.log("items",items);
			items.filter(new Filter([new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , this._KPracticeIDSelected),
				new Filter(
				'KSubpracticeID', sap.ui.model.FilterOperator.EQ , key)], true));

			if (items.aIndices.length) {
				var item = new Item({key:'-1', text:'Ninguno'});
				this._modulesSelect.addItem(item);
				this._modulesSelect.setSelectedItem(item);
				this._KModuleIDSelected = '-1';//items.oList[items.aIndices[0]].KModuleID;
				this._filterItemsSubModule('-1');
			}

		},

		_filterItemsSubModule : function(key){
			var items = this._subModulesSelect.getBinding('items');
			items.filter(new Filter([new Filter(
				'KPracticeID', sap.ui.model.FilterOperator.EQ , this._KPracticeIDSelected),
				new Filter(
				'KSubpracticeID', sap.ui.model.FilterOperator.EQ , this._KSubpracticeIDSelected),
				new Filter(
				'KModuleID', sap.ui.model.FilterOperator.EQ , key)],true));
			var item = new Item({key:'-1', text:'Ninguno'});
			this._subModulesSelect.addItem(item);
			this._subModulesSelect.setSelectedItem(item);
		},
		open : function (oView) {

			this._codEmpleado = oView.getModel('EmployeeModel').getProperty('/data').codEmpleado;

			var employeeSkills = oView.getModel('EmployeeModel').getProperty('/data').skills;

			var skills = oView.getModel('SkillMasterModel').getData();

			var SkillsModel = new JSONModel();

			for (var j = 0; j < skills.length; j++) {
				skills[j].visible = true;
			}
			
			for (var i = 0; i < employeeSkills.length; i++) {
				for (var j = 0; j < skills.length; j++) {
					if (employeeSkills[i].id == skills[j].id) {
						skills[j].visible = false;
					}
				}
			}

			SkillsModel.setData(skills);

			this.id = undefined;

			var oDialog = this._getDialog();

			var that = this;

			oDialog.addEventDelegate({  
			     "onAfterRendering": function () {  
			         that.fireFirstSet();
			     }  
			}, this);  

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Nuevo Skill");
			this._acceptButton.setText("Enviar");

			// open dialog
			oDialog.open();

			oDialog.setModel(SkillsModel, 'SkillsModel');
			
		},
		
		onCloseDialog : function (oEvent) {
			this._getDialog().destroy();
			this._oDialog = undefined;
		},

		onPressAccept : function(oEvent){
			if (this.validateForm()){
				var that = this;
				if (this.id === undefined) {
					// ADD SKILL
					jQuery.ajax({
						//url : PROXY + "/myKKnowPracticeModuleConsultants",//--->Se comenta para testing -Vero
						url: 'http://api.grupoassa.com:1337/myKKnowPracticeModuleConsultants',
						method : "POST",
						data:{
							codEmpleado : that._codEmpleado,
							KPracticeID: that._practicaSelect.getSelectedKey(),
							KSubpracticeID: that._subPracticaSelect.getSelectedKey(),
							KModuleID: that._modulesSelect.getSelectedKey(),
							KSubmoduleID: that._subModulesSelect.getSelectedKey(),
						},
						success : function(data) {
							that.onCloseDialog();
							MessageToast.show("Skill agregado con exito!!!");
						},
						error : function(error){
							MessageToast.show("ERROR");
						}
					});
				} 
			}
		},

		validateForm : function() {
			return true;
			var result = true;

			if (! this._practicaSelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Seleccione una práctica por favor.")
			} 

			if (! this._subPracticaSelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Seleccione una sub práctica por favor.")
			} 

			return result;
		},

		clearForm : function() {
			
		},

		

	});
});