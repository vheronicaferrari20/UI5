sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";
	return Object.extend("App.util.ModelTools", {

		_defaultSkip : 0,

		_defaultLimit : 25,

		skip : 0,

		limit : 25,

		setSkip : function(value) {
			console.log("set skip");
			if (value) {
				this.skip = value;
			} else {
				this.skip = this._defaultSkip;
			}
		},

		setLimit : function(value) {
			if (value) {
				this.limit = value;
			} else {
				this.limit = this._defaultLimit;
			}
		},

		getWhere : function(filterSearh, filter) {

			var where = {};

			if (filterSearh && filterSearh.length){
				where.or = filterSearh;
			}

			if (filter) {
				for (var i = 0; i < filter.length; i++) {
					if (!(filter[i].sPath in where)) {
						where[filter[i].sPath] = filter[i].oValue1;
					} else {
						if (typeof where[filter[i].sPath] == 'string') {
							where[filter[i].sPath] = [where[filter[i].sPath]]
						}
						where[filter[i].sPath].push(filter[i].oValue1);
					}
				}
			}

			if (jQuery.isEmptyObject(where)) {
				where = undefined;
			} else {
				where = JSON.stringify(where);
			}
			return where;
		},

		getSort : function(sorter, sorterDefault) {
			var sorterQuery;

			if (sorter) {
				var aSorter = [];
				for (var i = 0; i < sorter.length; i++){
					if (sorter[i].bDescending) {
						aSorter.push(sorter[i].sPath +  " DESC");
					} else {
						aSorter.push(sorter[i].sPath +  " ASC");
					}
					sorterQuery = aSorter.join(",");
				}
			} else if (sorterDefault){
				sorterQuery = sorterDefault;
			}

			return sorterQuery;
		}
		
	});
});