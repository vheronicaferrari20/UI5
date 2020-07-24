sap.ui.define([
	"App/model/models",
	"App/model/formatter"
], function(models, formatter) {
	"use strict";



	var RequirementsModel;
	function loadData(skip, model, opportunityId, opportunityLineItemId) {
		return new Promise(
			function (resolve, reject) {
				_loadData(skip, model, opportunityId, opportunityLineItemId, resolve, reject);

			}
		);
	}
	
	function _loadData(skip, model, opportunityId, opportunityLineItemId, resolve, reject) {
		var limit = 100;
		var opportunityLineItem = '';
		if (opportunityLineItemId) {
			opportunityLineItem = '"'+ opportunityLineItemId +'"';
		} else {
			opportunityLineItem = 'null';
		}
		jQuery.ajax({
			//url : PROXY + "/asignacion",  //-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/asignacion', //Test Vero
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : '{"opportunity" : "'+ opportunityId +'", "opportunityLineItem" : ' + opportunityLineItem + ' }',
				populate : 'pais,idioma,skills,seniority,comentarios,comentarios.user_crea,parent,parent.seniority,parent.skill,candidatos,candidatos.employee,candidato,recruiting',
				skip : skip,
				limit : limit },
			success : function(data){
				if (data.length > 0) {
					var dataObj = model.getProperty('/data');
					if (dataObj.length == 0) {
						dataObj = {};
					}
					for (var i=0; i < data.length; i++){
						dataObj[data[i].id] = data[i];
					}
					
					var dataOrgDiagram = generateDataIrgDiagram(dataObj);
					var planningCalendarData = generateDataPlanningCalendar(dataObj);

					model.setProperty('/data',dataObj);
					model.setProperty('/dataOrgDiagram',dataOrgDiagram);
					model.setProperty('/planningCalendarData',planningCalendarData);

					if (data.length == limit) {
						_loadData(skip + limit, model, opportunityId, opportunityLineItemId, resolve, reject);
					} else {
						model.setProperty('/loading',false);
						resolve();
					}
				} else {
					model.setProperty('/loading',false);
				}

			}, 
			error : function(error) {
				reject();
			}
		});
	}
	

	function loadDataByOpportunityAsignacion(model, opportunityId, opportunityLineItemId, asignacionId) {
		var opportunityLineItem = '';
		if (opportunityLineItemId) {
			opportunityLineItem = '"'+ opportunityLineItemId +'"';
		} else {
			opportunityLineItem = 'null';
		}
		jQuery.ajax({
			//url : PROXY + "/asignacion", //-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/asignacion', //Test Vero
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : '{"opportunity" : "'+ opportunityId +'", "opportunityLineItem" : '+opportunityLineItem+' ,"id" : "'+asignacionId+'" }',
				populate : 'pais,idioma,skills,seniority,comentarios,comentarios.user_crea,parent,parent.seniority,parent.skill,candidatos,candidatos.employee,candidato,recruiting'
			},
			success : function(data){
				console.log("loadDataByOpportunityAsignacion");
				if (data.length > 0) {

					var dataObj = model.getProperty('/data');
					dataObj[data[0].id] = data[0];

					var dataOrgDiagram = generateDataIrgDiagram(dataObj);
					var planningCalendarData = generateDataPlanningCalendar(dataObj);

					var d = {
						data : dataObj,
						dataOrgDiagram : dataOrgDiagram,
						planningCalendarData : planningCalendarData,
						loading : false
					}
					model.setProperty('/',d);
				} else {
					model.setProperty('/loading',false);
				}

			}
		});
	}

	function generateDataIrgDiagram(data) {
		var aData = [];
		jQuery.each(data,function(i, dataObj){
			var descripcion = "";
			//SERVER_DELIVERY_TOOLS + "/Avatars/" + dataObj.userNameGA
			var urlAvatar = "orgdiagram/images/photos/male.png";

			if (dataObj.estado == 'DRAFT'){
				if (dataObj.recruiting === true) {
					descripcion += 'Recruiting ' + dataObj.tipoRecruiting + '\n';
				}
				for (var j = 0; j < dataObj.candidatos.length; j++){
					descripcion += dataObj.candidatos[j].EMPLOYEE.fullName + '\n';
				}
			} else if (dataObj.estado == 'RECRUITING'){
				descripcion += 'Recruiting ' + dataObj.tipoRecruiting;
			} else	{
				descripcion = dataObj.candidato.fullName;
				//urlAvatar = SERVER_DELIVERY_TOOLS + "/api/Avatars/" + dataObj.candidato.userNameGA;  //-->Se comenta para Test-Vero
				urlAvatar = 'http://api.grupoassa.com:3001/api/Avatars/'+ dataObj.candidato.userNameGA; //Test Vero
			}
			
			aData.push({
              "id": dataObj.id,
              "parent":  (dataObj.parent) ? dataObj.parent.id : null ,
              "title": dataObj.seniority.name + " " + formatter.toSkill(dataObj.skills), //+ " " +dataObj.skill.vSkillCategory + " " + dataObj.skill.name,
              "description": descripcion,
              "image": urlAvatar,
              "context": null,
              "itemTitleColor": ESTADOS[dataObj.estado].color,
              "minimizedItemShapeType": null,
              "groupTitle": ESTADOS[dataObj.estado].text,
              "groupTitleColor": ESTADOS[dataObj.estado].color,
              "isVisible": true,
              "isActive": true,
              "hasSelectorCheckbox": 0,
              "hasButtons": 1,
              "itemType": 0,
              "adviserPlacementType": 0,
              "childrenPlacementType": 0,
              "templateName": "",
              "showCallout": 0,
              "calloutTemplateName": null,
              "label": "8",
              "showLabel": 0,
              "labelSize": null,
              "labelOrientation": 3,
              "labelPlacement": 0,
              "email": "",
              "phone": "",
              "readmorelabel": "",
              "readmoreurl": ""
            });

		});
		return aData;
	}

	function generateDataPlanningCalendar(data) {
		var aData = [];

		var first = Object.keys(data)[0];
		var startDate = (first) ? new Date(data[first].desde) : null;

		jQuery.each(data, function(key, value ){
			var auxDate = new Date(value.desde);
			if (startDate.getTime() > auxDate.getTime()) {
				startDate = auxDate;
			}
			var descripcion = "";
			if (value.estado == 'DRAFT'){
				if (value.recruiting === true) {
					descripcion += 'Recruiting ' + value.tipoRecruiting + ' - ';
				}
				for (var j = 0; j < value.candidatos.length; j++){
					descripcion += value.candidatos[j].EMPLOYEE.fullName + ' - ';
				}
			} else if (value.estado == 'RECRUITING'){
				descripcion += 'Recruiting ' + value.tipoRecruiting;
			} else	{
				descripcion = value.candidato.fullName;
			}



			aData.push({
				title : value.seniority.name,
				text : formatter.toSkill(value.skills),
				appointments : [
						{
							icon : ESTADOS[value.estado].icon,
							startDate : new Date(value.desde),
							endDate : new Date(value.hasta),
							title : value.estado,
							text : descripcion,
							type : ESTADOS[value.estado].appointmentType,
							key: value.id
						}
					],
				headers : []
            });

		});

		return {
			startDate : startDate,
			data : aData
		};
	}

	return {

		_opportunityId : undefined,

		getModel : function(opportunityId, opportunityLineItemId){

			if (this._opportunityId == opportunityId &&
				this._opportunityLineItemId == opportunityLineItemId &&
				RequirementsModel) {
				console.log("devolviendo model");
				return RequirementsModel;
			}

			this._opportunityId = opportunityId;

			this._opportunityLineItemId = opportunityLineItemId;

			RequirementsModel = models.createDeviceModel();

			//this.loadData();

			return RequirementsModel;

		},

		loadData : function() {
			if (! RequirementsModel ) {
				return;
			}

			RequirementsModel.setData({
				loading : false,
				data : {},
				dataOrgDiagram : [],
				planningCalendarData : {
					startDate : undefined,
					data : []
				}
			});

			RequirementsModel.setProperty('/loading',true);
			return loadData(0,RequirementsModel, this._opportunityId, this._opportunityLineItemId);
		},

		refreshByOpportunityIdAsignacionId : function(opportunityId, opportunityLineItemId ,asignacionId, destroyed, reload){
			
			if (! RequirementsModel || 
				this._opportunityId != opportunityId ||
				this._opportunityLineItemId != opportunityLineItemId) {
				return;
			}

			if (destroyed) {
				var data = RequirementsModel.getProperty('/data');
				delete data[asignacionId];
				var dataOrgDiagram = generateDataIrgDiagram(data);
				var planningCalendarData = generateDataPlanningCalendar(data);
				RequirementsModel.setProperty('/data',data);
				RequirementsModel.setProperty('/dataOrgDiagram',dataOrgDiagram);
				RequirementsModel.setProperty('/planningCalendarData',planningCalendarData);
			} else if (reload) {
				this.loadData();
			}else {
				loadDataByOpportunityAsignacion(RequirementsModel, this._opportunityId, this._opportunityLineItemId, asignacionId);
			}
			
		}
	};
});