sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast) {
	"use strict";
	return Object.extend("App.controller.requirement.IdiomaEditorDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.IdiomaEditorDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._languageSelect = sap.ui.getCore().byId('lenguageSelect');
			this._activityLangugeSelect = sap.ui.getCore().byId('activityLangugeSelect');

			this._levelLanguageSelect = sap.ui.getCore().byId('levelLanguageSelect');

			return this._oDialog;
		},

		
		open : function (oView,data) {

			console.log("data ",data);

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			var that = this;

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);

			this._languageSelect.setSelectedKey(data.language);

			if (data.activity) {
				this._activityLangugeSelect.setSelectedKey(data.activity);
			} else {
				this._activityLangugeSelect.setSelectedKey(3);
			}

			if (data.level) {
				this._levelLanguageSelect.setSelectedKey(data.level);
			}

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
				language : {
					key : this._languageSelect.getSelectedKey(),
					text: this._languageSelect.getSelectedItem().mProperties.text
				},
				activity : {
					key : this._activityLangugeSelect.getSelectedKey(),
					text: this._activityLangugeSelect.getSelectedItem().mProperties.text
				},
				level : {
					key : this._levelLanguageSelect.getSelectedKey(),
					text: this._levelLanguageSelect.getSelectedItem().mProperties.text
				}
			}

			this._eventBus.publish(dataEvents.update_viewsettings_requirements_edit_languages.channel, dataEvents.update_viewsettings_requirements_edit_languages.name,data);
			
			this.onCloseDialog();
		}
	});	
});