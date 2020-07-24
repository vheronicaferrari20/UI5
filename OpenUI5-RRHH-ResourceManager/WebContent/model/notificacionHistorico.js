sap.ui.define([
	"App/model/models",
	"App/util/ModelTools"
], function(models,ModelTools) {
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
			//url : PROXY + '/notificacion',  //-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/notificacion', //Test Vero
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

		loadData : function(bRefresh, filterSearh, filter, sorter) {
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
		}
	};


});