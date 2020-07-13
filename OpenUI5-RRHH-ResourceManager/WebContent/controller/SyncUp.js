sap.ui.define([
		"sap/ui/base/Object"
	], function(Object) {
	"use strict";
	return Object.extend("App.controller.SyncUp", {
		
		_dataLoad : {},
		
		_isDataLoad : function() {
			var r = true;
			jQuery.each(this._dataLoad,function(k,v){
				if (!v) {
					r = false;
				}
			});
			return r;
		},
		
		_fnAction : undefined,
		
		setFnAction : function(fn){
			this._fnAction = fn;
		},
		
		setDataLoad : function(dataLoad) {
			this._dataLoad = {};
			for (var i = 0; i < dataLoad.length; i++){
				this._dataLoad[dataLoad[i]] = false;
			}
		},
		
		setDataLoaded : function(dataLoaded) {
			if (dataLoaded in this._dataLoad) {
				this._dataLoad[dataLoaded] = true;
				if (this._isDataLoad() ){
					if (this._fnAction !== undefined) {
						this._fnAction();
					}
				}
			}
			
		}
	});
});