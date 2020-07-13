sap.ui.define([
	'sap/ui/core/Control',
	'App/dhtmlxGantt_v4.0.0/codebase/dhtmlxgantt',
	'App/dhtmlxGantt_v4.0.0/codebase/ext/dhtmlxgantt_smart_rendering',
    'sap/m/RadioButton',
    'sap/m/Button'
], function (Control,Gantt,dhtmlxgantt_smart_rendering,RadioButton, Button) {
	"use strict";
	return Control.extend("App.control.DhtmlxGantt", {
		
		metadata : {
			properties : {
				data : {type : "object", defaultValue:{}},
				config : {type : "object", defaultValue:{}},
				height : {type : "string", defaultValue: '100%'},
				width : {type : "string", defaultValue: '100%'}
			},
			aggregations : {
                _radioButtonDay : {type : "sap.m.RadioButton", multiple: false, visibility : "hidden"},
                _radioButtonMonth : {type : "sap.m.RadioButton", multiple: false, visibility : "hidden"},
                _radioButtonYear : {type : "sap.m.RadioButton", multiple: false, visibility : "hidden"},
                _ButtonAll : {type : "sap.m.Button", multiple: false, visibility : "hidden"}
			},
			events : {
				change : {
					parameters : {
						data : {type : "object"},
						height : {type : "string"},
						width : {type : "string"}
					}
				},
                onTaskDblClick : {}
			}
		},
		
		_dataGantt : undefined,

        _gantt : undefined,

		setData : function(iValue) {
			
			//gantt.parse(iValue);
			this._dataGantt= iValue;
            console.log("_dataGantt",this._dataGantt);
		},// get number of columns in timeline
       
        setScaleConfig : function (value){
                switch (value) {
                    case "1":
                        gantt.config.scale_unit = "year";
                        gantt.config.step = 1;
                        gantt.config.date_scale = "%d %M";
                        gantt.config.subscales = [];
                        gantt.config.scale_height = 27;
                        gantt.templates.date_scale = null;
                        break;
                    case "2":
                        var weekScaleTemplate = function(date){
                            var dateToStr = gantt.date.date_to_str("%d %M");
                            var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                            return dateToStr(date) + " - " + dateToStr(endDate);
                        };

                        gantt.config.scale_unit = "week";
                        gantt.config.step = 1;
                        gantt.templates.date_scale = weekScaleTemplate;
                        gantt.config.subscales = [
                            {unit:"day", step:1, date:"%D" }
                        ];
                        gantt.config.scale_height = 50;
                        break;
                    case "3":
                        gantt.config.scale_unit = "month";
                        gantt.config.date_scale = "%F, %Y";
                        gantt.config.subscales = [
                            {unit:"day", step:1, date:"%j, %D" }
                        ];
                        gantt.config.scale_height = 50;
                        gantt.templates.date_scale = null;
                        break;
                    case "4":
                        gantt.config.scale_unit = "year";
                        gantt.config.step = 1;
                        gantt.config.date_scale = "%Y";
                        gantt.config.min_column_width = 50;

                        gantt.config.scale_height = 90;
                        gantt.templates.date_scale = null;


                        gantt.config.subscales = [
                            {unit:"month", step:1, date:"%M" }
                        ];
                        break;
                }
        },
		_onDay : function (oEvent){
            this.setScaleConfig("1");
		    gantt.render();
            
        },
        _onMonth : function (oEvent){
            this.setScaleConfig("3");
		    gantt.render();
        },
        _onYear : function (oEvent){
            this.setScaleConfig("4");
		    gantt.render();
        },
        _showAll : function (oEvent){
            
            
             //Setting available scales
             function getUnitsBetween(from, to, unit, step) {
                    var start = new Date(from),
                            end = new Date(to);
                    var units = 0;
                    while (start.valueOf() < end.valueOf()) {
                        units++;
                        start = gantt.date.add(start, step, unit);
                    }
                    return units;
                }
            
            function toggleMode(toggle) {
                toggle.enabled = !toggle.enabled;
                if (toggle.enabled) {
                    toggle.innerHTML = "Set default Scale";
                    //Saving previous scale state for future restore
                    saveConfig();
                    zoomToFit();
                } else {

                    toggle.innerHTML = "Zoom to Fit";
                    //Restore previous scale state
                    restoreConfig();
                    gantt.render();
                }
            }

            var cachedSettings = {};
            function saveConfig() {
                var config = gantt.config;
                cachedSettings = {};
                cachedSettings.scale_unit = config.scale_unit;
                cachedSettings.date_scale = config.date_scale;
                cachedSettings.step = config.step;
                cachedSettings.subscales = config.subscales;
                cachedSettings.template = gantt.templates.date_scale;
                cachedSettings.start_date = config.start_date;
                cachedSettings.end_date = config.end_date;
            }
            function restoreConfig() {
                applyConfig(cachedSettings);
            }

            function applyConfig(config, dates) {
                gantt.config.scale_unit = config.scale_unit;
                if (config.date_scale) {
                    gantt.config.date_scale = config.date_scale;
                    gantt.templates.date_scale = null;
                }
                else {
                    gantt.templates.date_scale = config.template;
                }

                gantt.config.step = config.step;
                gantt.config.subscales = config.subscales;

                if (dates) {
                    gantt.config.start_date = gantt.date.add(dates.start_date, -1, config.unit);
                    gantt.config.end_date = gantt.date.add(gantt.date[config.unit + "_start"](dates.end_date), 2, config.unit);
                } else {
                    gantt.config.start_date = gantt.config.end_date = null;
                }
            }
            
            var scaleConfigs = [
                // minutes
                { unit: "minute", step: 1, scale_unit: "hour", date_scale: "%H", subscales: [
                    {unit: "minute", step: 1, date: "%H:%i"}
                ]
                },
                // hours
                { unit: "hour", step: 1, scale_unit: "day", date_scale: "%j %M",
                    subscales: [
                        {unit: "hour", step: 1, date: "%H:%i"}
                    ]
                },
                // days
                { unit: "day", step: 1, scale_unit: "month", date_scale: "%F",
                    subscales: [
                        {unit: "day", step: 1, date: "%j"}
                    ]
                },
                // weeks
                {unit: "week", step: 1, scale_unit: "month", date_scale: "%F",
                    subscales: [
                        {unit: "week", step: 1, template: function (date) {
                            var dateToStr = gantt.date.date_to_str("%d %M");
                            var endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                            return dateToStr(date) + " - " + dateToStr(endDate);
                        }}
                    ]},
                // months
                { unit: "month", step: 1, scale_unit: "year", date_scale: "%Y",
                    subscales: [
                        {unit: "month", step: 1, date: "%M"}
                    ]},
                // quarters
                { unit: "month", step: 3, scale_unit: "year", date_scale: "%Y",
                    subscales: [
                        {unit: "month", step: 3, template: function (date) {
                            var dateToStr = gantt.date.date_to_str("%M");
                            var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
                            return dateToStr(date) + " - " + dateToStr(endDate);
                        }}
                    ]},
                // years
                {unit: "year", step: 1, scale_unit: "year", date_scale: "%Y",
                    subscales: [
                        {unit: "year", step: 5, template: function (date) {
                            var dateToStr = gantt.date.date_to_str("%Y");
                            var endDate = gantt.date.add(gantt.date.add(date, 5, "year"), -1, "day");
                            return dateToStr(date) + " - " + dateToStr(endDate);
                        }}
                    ]},
                // decades
                {unit: "year", step: 10, scale_unit: "year", template: function (date) {
                    var dateToStr = gantt.date.date_to_str("%Y");
                    var endDate = gantt.date.add(gantt.date.add(date, 10, "year"), -1, "day");
                    return dateToStr(date) + " - " + dateToStr(endDate);
                },
                    subscales: [
                        {unit: "year", step: 100, template: function (date) {
                            var dateToStr = gantt.date.date_to_str("%Y");
                            var endDate = gantt.date.add(gantt.date.add(date, 100, "year"), -1, "day");
                            return dateToStr(date) + " - " + dateToStr(endDate);
                        }}
                    ]}
            ];
            
            
        
            var project = gantt.getSubtaskDates(),
				areaWidth = gantt.$task.offsetWidth;

            for (var i = 0; i < scaleConfigs.length; i++) {
                var columnCount = getUnitsBetween(project.start_date, project.end_date, scaleConfigs[i].unit, scaleConfigs[i].step);
                if ((columnCount + 2) * gantt.config.min_column_width <= areaWidth) {
                    break;
                }
            }

            if (i == scaleConfigs.length) {
                i--;
            }

            applyConfig(scaleConfigs[i], project);
            gantt.render();
            
            
            
        },
        
		init : function () {
            /*SAGUERO: se agrega radio button y boton para manejo de gannt*/
            
           /* this.setAggregation("_radioButtonDay", new RadioButton({
             
                class:"radioButtonGantt",
				text: "Dia",
				select: this._onDay.bind(this)
			}));*/
            this.setAggregation("_radioButtonMonth", new RadioButton({
             
                class:"radioButtonGantt",
				text: "Mes",
				select: this._onMonth.bind(this)
			}));
            
            this.setAggregation("_radioButtonYear", new RadioButton({
               
                class:"radioButtonGantt",
				text: "Año",
				select: this._onYear.bind(this)
			}));
            
            this.setAggregation("_ButtonAll", new Button({
                type: "Emphasized",
                class:"ButtonGantt",
				text: "Ajustar Zoom",
				press: this._showAll.bind(this)
			}));
			
            /****End SAGUERO*******/
            
            
			gantt.config.xml_date = "%d/%m/%Y";
			gantt.config.readonly = true;
            gantt.config.min_column_width = 60;
            gantt.config.scale_height = 60;
            gantt.config.row_height = 22;
            var that = this;
            gantt.attachEvent("onTaskDblClick", function(id,e){
                that.fireOnTaskDblClick({asignacionId : id});
            });

		},

		onAfterRendering : function() {
            gantt.init('gantt_here' + this.getId());
            gantt.clearAll();
			gantt.parse(this._dataGantt); 
		},
		
		renderer : function (oRM, oControl) {
           
            /*SAGUERO: se agrega radio button y boton para manejo de gannt*/
            oRM.write("<div class='customToolGantt'>");
            oRM.renderControl(oControl.getAggregation("_ButtonAll"));
			oRM.renderControl(oControl.getAggregation("_radioButtonMonth"));
            oRM.renderControl(oControl.getAggregation("_radioButtonYear"));
            oRM.write("</div>");
            /****End SAGUERO*******/
            
            
            oRM.write('<link rel="stylesheet" type="text/css" href="dhtmlxGantt_v4.0.0/codebase/dhtmlxgantt.css">');
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			oRM.write('<div class="dhtmlxgantt" style="height:' + oControl.getHeight() + '; width:'+oControl.getWidth() +' ;" id="gantt_here'+ oControl.getId()+'">');
			oRM.write("</div>");
		},

        onExit : function() {
            alert();
        }
	});
});
