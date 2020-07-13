sap.ui.define(
		['sap/ui/core/format/DateFormat'], 
		function (DateFormat) {
	"use strict";
	return {
		
		listDates: function (dates) {
			var datesReturn = "";
			
			var dateFormat = DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
			
			var dateFormatToParse = DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
			
			jQuery.each(dates,function(k,date){
				if ('dFechaDesde' in date && 'dFechaHasta' in date){
					var desde = dateFormat.format(dateFormatToParse.parse(date.dFechaDesde));
					var hasta;
					if (date.dFechaHasta.length > 0){
						var hasta = dateFormat.format(dateFormatToParse.parse(date.dFechaHasta));
						datesReturn += desde + " a " + hasta + "\n";
					} else {
						datesReturn += desde + "\n";
					}
				}
			});
			return datesReturn;
		},
		
		status : function(str_dates, desde, hasta) {
			var dateFormatToParse = DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
			var dates = [];
			var status = true;
			if (typeof str_dates == 'string') {
				dates = str_dates.split(",");
			} 
			desde = dateFormatToParse.parse(desde);
			hasta = dateFormatToParse.parse(hasta);
			
			var toDate = new Date();
			toDate.setHours(12);
			toDate.setMinutes(0);
			toDate.setSeconds(0);
			toDate.setMilliseconds(0);
			
						
			if (toDate.getTime() >=  desde.getTime() && toDate.getTime() <=  hasta.getTime()) {
				jQuery.each(dates,function(k,date){
					var d = date.split(" - ");
					if (d.length == 2) {
						var  desde = dateFormatToParse.parse(d[0]);
						
						var hasta = "";
						if (d[1].length > 0){
							hasta = dateFormatToParse.parse(d[1]);
							if (toDate.getTime() >=  desde.getTime() && toDate.getTime() <=  hasta.getTime()) {
								status = false;
							}
						} else {
							if (toDate.getTime() ==  desde.getTime()){
								status = false;
							}
						}
					}
				}); 
			} else {
				return "";
			}
			return (status) ? "sap-icon://accept" : "sap-icon://decline";
		},
		
		getPeriodo : function(dFechaDesde, dFechaHasta){
			if (dFechaDesde && dFechaHasta){
				var dateFormatToParse = DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
				dFechaDesde = dateFormatToParse.parse(dFechaDesde);
				dFechaHasta =  dateFormatToParse.parse(dFechaHasta);
				var dateFormat = DateFormat.getDateInstance({pattern : "dd 'de' MMM 'de' yyyy" });
				return dateFormat.format(dFechaDesde) + " a " + dateFormat.format(dFechaHasta);
			}
			
		},
		
		formatDate : function(value){
			if (value){
				value = value.split('T')[0];
				var dateFormat = DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
				var dateFormatToParse = DateFormat.getDateInstance({pattern : "yyyy-MM-dd" });
				return dateFormat.format(dateFormatToParse.parse(value));
			}
		},

		formatDateTimeComentarios : function(value){
			if (value){
				var dateFormat = DateFormat.getDateInstance({pattern : "dd/MM/yyyy H:mm" });
				var dateFormatToParse = DateFormat.getDateInstance({pattern : "yyyy-MM-ddTH:mm:ss.Z" });
				return dateFormat.format(dateFormatToParse.parse(value));
			}

		},

		formatDateMagma : function(value){
			if (value){
				value = value.split(' 12:00AM')[0];
				var dateFormat = DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
				return dateFormat.format(new Date(value));
			}
		},
		
		isVisible : function(nRol,nNivelRol){
			return (nRol <= nNivelRol);
		},
		
		formatBool : function(value){
			if (value !== undefined){
				if (typeof value === 'string'){
					value = value.trim();
				}
				return (value === 1 || value === '1' || value === true || value === "true" ) ? 'Si' : 'No';
			}
		},

		formatCommittedOpportunity : function(value) {
			return (value) ? 'Committed' : 'No Committed';
		},

		arrayToString : function (aValue){
			var r = "";
			if (typeof aValue == "object"){
				for (var i = 0; i < aValue.length; i++){
					r += aValue[aValue.length - (i + 1)].nota + '\n';
				}
			}
			return r;
		},

		addCSS : function(value) {
			return (value === true) ? "hola" : "";
		},

		arrayToText : function(aValues, field){
			var r = "";
			if (aValues instanceof Array){
				for (var i = 0; i < aValues.length; i++){
					if (field in aValues[i]) {
						r += aValues[i][field] + ', ';
					}
				}

				if (r.length > 0) {
					r = r.slice(0, r.length - 2);
				}
			}
			return r;
		},

		calcularDuracion : function(desde, hasta) {
			var d1 = new Date(desde);
			var d2 = new Date(hasta);
			var dias = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60  *  24);
			console.log("desde ", desde, " hasta: ", hasta, " dias: ", dias);
			return dias;
		},

		notificationLevel : function(value) {
			if (value == 1) {
				return 'Low';
			} else if (value == 2) {
				return 'Medium';
			} else if (value == 3) {
				return 'High';
			} else {
				return 'None';
			}
		},

		mostrarUltimoComentario : function(comentarios) {
			// teniendo en cuanta que el ultimo comentario generado corresponde al ultimo del array
			var nota = "";
			if (comentarios && comentarios.length > 0){

				nota = comentarios[comentarios.length-1].nota;
			}
			return nota;
		},

		toSkill : function(skills) {
			console.log("skills",skills);
			if (!skills) {return;}
			var that = this;
			var skill = "";

			

			skills.forEach(function(s){
	
				if (s.view) {
					var KPracticeDescription_Code = (s.view.KPracticeDescription_Code) ? s.view.KPracticeDescription_Code : '';
					var KSubpracticeDescription_Code = (s.view.KSubpracticeDescription_Code) ? s.view.KSubpracticeDescription_Code : '';
					var KModuleDescription_Code = (s.view.KModuleDescription_Code) ? s.view.KModuleDescription_Code : '';
					var KSubmoduleDescription_Code = (s.view.KSubmoduleDescription_Code) ? s.view.KSubmoduleDescription_Code : '';
					
					skill += KPracticeDescription_Code + ' ' +
						KSubpracticeDescription_Code + ' ' +
						KModuleDescription_Code + ' ' +
						KSubmoduleDescription_Code + '\n';
				}
				

			});

			return skill;
		}



	};
});