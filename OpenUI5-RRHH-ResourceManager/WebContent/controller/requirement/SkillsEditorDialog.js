sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast) {
	"use strict";
	return Object.extend("App.controller.requirement.SkillsEditorDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.SkillsEditorDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._practicaSelect = sap.ui.getCore().byId('practicaSelect');
			this._subPracticaSelect = sap.ui.getCore().byId('subPracticaSelect');

			this._modulesSelect = sap.ui.getCore().byId('modulesSelect');
			this._subModulesSelect = sap.ui.getCore().byId('subModulesSelect');
			
			this._levelSelect = sap.ui.getCore().byId('levelSelect');

			return this._oDialog;
		},

		setSelectedskills : function(KPracticeID, KSubpracticeID, KModuleID, KSubmoduleID, KLevelID) {

			KModuleID = (KModuleID == '' || KModuleID == undefined) ? '-1' : KModuleID;
			KSubmoduleID = (KSubmoduleID == '' || KSubmoduleID == undefined) ? '-1' : KSubmoduleID;
			KLevelID = (KLevelID == '' || KLevelID == undefined) ? '-1' : KLevelID;

			this._KPracticeIDSelected = KPracticeID;
			this._KSubpracticeIDSelected = KSubpracticeID;
			this._KModuleIDSelected = KModuleID;

			//selected practica
			this._practicaSelect.setSelectedKey(KPracticeID);

			//filter items subpractica
			this.filterItemsSubPractica(KPracticeID);
			this._subPracticaSelect.setSelectedKey(KSubpracticeID);
			
			this.filterItemsModule(KSubpracticeID);
			this._modulesSelect.addItem(new Item({key:'-1', text:'Ninguno'}));
			this._modulesSelect.setSelectedKey(KModuleID);
			
			
			this.filterItemsSubModule(KModuleID);

			this._subModulesSelect.addItem(new Item({key:'-1', text:'Ninguno'}));
			this._subModulesSelect.setSelectedKey(KSubmoduleID);

			//setSelectedskills

			var item = new Item({key:'-1', text:'Ninguno'});
			this._levelSelect.addItem(item);
			if (KLevelID != '-1') {
				this._levelSelect.setSelectedKey(KLevelID);
			} else {
				this._levelSelect.setSelectedItem(item);
			}

			if (KLevelID != '-1' || KSubmoduleID != '-1' ) {
				this._levelSelect.setEnabled(true);
			}

		},

		onChangePractica: function(oEvent){

			this._KPracticeIDSelected = this._practicaSelect.getSelectedKey();

			this._filterItemsSubPractica(this._practicaSelect.getSelectedKey());

		},

		onChangeSubPractica: function(oEvent){

			this._KSubpracticeIDSelected = this._subPracticaSelect.getSelectedKey();
			//setSelectedskills
			this._filterItemsModule(this._subPracticaSelect.getSelectedKey());

		},

		onChangeModules: function(oEvent){

			this._KModuleIDSelected = this._modulesSelect.getSelectedKey();

			this._filterItemsSubModule(this._modulesSelect.getSelectedKey());

		},

		onChangeSubModules: function(oEvent){

			if (this._subModulesSelect.getSelectedKey() != -1) {
				this._levelSelect.setEnabled(true);
			} else {
				this._levelSelect.setEnabled(false);
				this._levelSelect.setSelectedKey("-1");
			}
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
			this._levelSelect.setEnabled(false);
			this._levelSelect.setSelectedKey("-1");

		},

		open : function (oView,data) {

			console.log("data ",data);

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			var that = this;

			oDialog.addEventDelegate({  
			     "onAfterRendering": function () {

			     	
						/*that._modulesSelect.addItem(
			         		new Item({text:'Ninguno', key:0})
			         	);
						that._subModulesSelect.addItem(
			         		new Item({text:'Ninguno', key:0})
			         	);*/
	
			     	if (data) {
			        	that.setSelectedskills(
			        		data.KPracticeID,
			        		data.KSubpracticeID,
			        		data.KModuleID,
			        		data.KSubmoduleID,
			        		data.KLevelID);
					}
		 		
			     }  
			}, this); 	

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);

			// open dialog
			oDialog.open();
		},
		
		onCloseDialog : function (oEvent) {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onPressAcept : function(oEvent) {
			
			var data = {
				KPractice : {
					key : this._practicaSelect.getSelectedKey(), 
					text : this._practicaSelect.getSelectedItem().mProperties.text
				},
				KSubPractice : {
					key : this._subPracticaSelect.getSelectedKey(), 
					text : this._subPracticaSelect.getSelectedItem().mProperties.text
				},
				KModule : {
					key : this._modulesSelect.getSelectedKey(), 
					text : this._modulesSelect.getSelectedItem().mProperties.text
				},
				KSubModule : {
					key : this._subModulesSelect.getSelectedKey(), 
					text : this._subModulesSelect.getSelectedItem().mProperties.text
				},
				KLevel : {
					key : this._levelSelect.getSelectedKey(), 
					text : this._levelSelect.getSelectedItem().mProperties.text
				}
			}

			console.log("data", data);

			this._eventBus.publish(dataEvents.update_viewsettings_requirements_edit_skills.channel, dataEvents.update_viewsettings_requirements_edit_skills.name,data);
			
			this.onCloseDialog();
		}
	});	
});