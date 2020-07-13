sap.ui.define([
	'sap/ui/core/Control',
	'App/chart/Chart.min'
], function (Control, ChartJs) {
	"use strict";
	return Control.extend("App.control.Chart", {
		
		metadata : {
			properties : {
				config : {type : "object", defaultValue:{}},
			},
			aggregations : {

			},
			events : {
				change : {
					parameters : {
						config : {type : "object"}
					}
				}
			}
		},

		setConfig : function(iValue) {
			this.setProperty("config", iValue, true);
			this.onAfterRendering();
		},

        onAfterRendering : function() {
        	var element = document.getElementById("myChart_"+this.getId());
    		if (element) {
    			this._ctx = element.getContext('2d');
    		} else {
    			this._ctx = undefined;
    		}

        	if (this._ctx && !this._chart) {
        		this._chart = new Chart(this._ctx, this.getConfig());
        		this._chart.update(2000,true);	
        	} else if (this._ctx && this._chart) {
        		this._chart.destroy();
        		this._chart = new Chart(this._ctx, this.getConfig());
        		this._chart.update(2000,true);
        	}
        },

		renderer : function (oRM, oControl) {
           
            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.writeClasses();
            oRM.write(">");

            oRM.write('<canvas id="myChart_'+oControl.getId()+'"></canvas>');
            
            oRM.write("</div>");

		}

	});
});
