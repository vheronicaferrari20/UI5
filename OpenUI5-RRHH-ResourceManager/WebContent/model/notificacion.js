sap.ui.define([
	"App/model/models",
	"App/util/ModelTools"
], function(models, ModelTools) {
	"use strict";

	var NotificacionesModel;

	var modelTools = new ModelTools();

	modelTools.limit = 11;

	function loadData(filterSearh, filter, sorter, model) {
		return new Promise(
			function (resolve, reject) {
				_loadData(filterSearh, filter, sorter, model, resolve, reject);
			}
		);
	}

	function _loadData(filterSearh, filter, sorter, model, resolve, reject) {
		var where = modelTools.getWhere(filterSearh, filter);
		var sorter = modelTools.getSort(sorter, "createdAt DESC");
		
		jQuery.ajax({
			//url : PROXY + '/notificacion/pendientes',//-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/notificacion/pendientes', //Test Vero
			method : 'GET',
			data : {
				where : where,
				sort : sorter,
				skip :  modelTools.skip,
				limit : modelTools.limit
			},
			success : function(data) {
				if (data.length > 0) {

					var dataNotificacion = model.getProperty('/data');
					dataNotificacion = dataNotificacion.concat(data);
					model.setProperty('/data',dataNotificacion, true);
				} 
				return resolve(data.length);
			}
		});
		
	}

	function marcarVistoAll(model) {
		return new Promise(function(resolve, reject){
			jQuery.ajax({
				//url : PROXY + '/notificacion/marcarVistoAll', //-->Se comenta para Test-Vero
				url: 'http://api.grupoassa.com:1337/notificacion/marcarVistoAll', //Test Vero
				method : 'POST',
				success : function(){
					model.setProperty("/data",{});
					return resolve();
				},
				error : function() {
					return reject();
				}
			});
		});
	}

	return {
		getModel : function(){

			if (NotificacionesModel) {
				return NotificacionesModel;
			}

			NotificacionesModel = models.createDeviceModel();

			NotificacionesModel.setData({
				loading : false,
				data : []
			});

			return NotificacionesModel;
		},

		loadData : function(bRefresh, filterSearh, filter, sorter, countDeleted) {
			if (! NotificacionesModel ) {
				return;
			}

			if (bRefresh) {
				NotificacionesModel.setData({
					loading : false,
					data : []
				});
				modelTools.setSkip();
				modelTools.setLimit();
			}

			if (countDeleted  > 0 && !bRefresh && modelTools.skip > 0) {
				modelTools.setSkip(modelTools.skip - countDeleted);
			}

			NotificacionesModel.setProperty('/loading',true);

			return loadData(filterSearh, filter, sorter, NotificacionesModel)
				.then(function(count){
					if (count < modelTools.limit) {
						modelTools.setSkip(modelTools.skip + count);
					} else {
						modelTools.setSkip(modelTools.skip + modelTools.limit);
					}
					return;
				});
		},

		pop : function(dataToPop) {
			if (! NotificacionesModel) {
				return;
			} else {
				var data = [dataToPop];
				data = data.concat(NotificacionesModel.getProperty('/data'));
				NotificacionesModel.setProperty('/data',data);
				modelTools.setSkip(modelTools.skip + 1);
			}
		},

		marcarVistoAll : function() {
			if (! NotificacionesModel) {
				return;
			} else {
				return marcarVistoAll(NotificacionesModel);
			}
		}
	};


});