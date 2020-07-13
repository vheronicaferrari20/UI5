sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/model/formatter'
	], function(Controller,formatter) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeeFormDetalle", {

		formatter : formatter

	});
});
