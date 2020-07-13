sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/ObjectStatus",
	'sap/ui/core/format/DateFormat'
], function (Control,ObjectStatus,DateFormat) {
	"use strict";
	return Control.extend("App.control.ItemStatus", {
		
		metadata : {
			properties : {
				value: 	{type : "string", defaultValue : ""}
			},
			aggregations : {
				_ObjectStatus : {type : "sap.m.ObjectStatus",multiple: false, visibility : "visible"},
				
			},
			events : {
				change : {
					parameters : {
						value : {type : "string"}
					}
				}
			}
		},
		
		setValue: function (iValue) {
			if (iValue == 'D') {
				// DISPONIBLE
				this.getAggregation("_ObjectStatus").setState("Success");
				this.getAggregation("_ObjectStatus").setIcon("sap-icon://accept");
			} else if (iValue == 'O') {
				// Totalmente ocupado
				this.getAggregation("_ObjectStatus").setState("Error");
				this.getAggregation("_ObjectStatus").setIcon("sap-icon://decline");
			} else if (iValue == 'P') {
				// Parcialmente disponible
				this.getAggregation("_ObjectStatus").setState("Warning");
				this.getAggregation("_ObjectStatus").setIcon("sap-icon://message-warning");
			}
		},
		
		init : function () {
			this.setAggregation("_ObjectStatus", new ObjectStatus({
				state : "None",
				icon : "sap-icon://alert"
			}));
		},
		
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_ObjectStatus"));
			oRM.write("</div>");
		}
	});
});