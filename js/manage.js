(function(w){

	Handlebars.registerHelper('trueFalse', function(val, options){
		if(val === 'true') {
			return options.fn();
		}
		return options.inverse();
	});

	var packageModel = Backbone.Model.extend({
		parse : function(response) {
			if(response.data && response.status)
				return response.data;
			return response;
		},
	});

	var packageCollection = Backbone.Collection.extend({
		parse : function(response) {
			return response.data;
		},
		url : function() {
			return 'manage/packages'
		},
		model : packageModel
	});

	var packages = w.packages = new packageCollection();

	var editId = false;

	var tableView = Backbone.View.extend({
		collection : packages,
		template : Handlebars.compile($('#tbodyTemplate').html()),
		events : {
			"click .delete": function(e){

				var id = $(e.currentTarget).data('id');
				if(id) {
					var model = this.collection.get(id);
					if(confirm('Are you sure you want to remove ' + model.attributes.name + '?'))
						model.destroy();
				}
			},
			"click .edit": function(e){
				var id = $(e.currentTarget).data('id');
				if(id) {
					editId = id;
					var model = this.collection.get(id);
					$('#name').val(model.attributes.name);
					$('#api').val(model.attributes.api);
					$('#rate').val(model.attributes.rate);
					if(model.attributes.enabled === 'true') {
						$("#enabled").prop( "checked", true );
					} else {
						$("#enabled").prop( "checked", false );
					}
					if(model.attributes.list === 'true') {
						$("#list").prop( "checked", true );
					} else {
						$("#list").prop( "checked", false );
					}
					if(model.attributes.insert === 'true') {
						$("#insert").prop( "checked", true );
					} else {
						$("#insert").prop( "checked", false );
					}
					if(model.attributes.update === 'true') {
						$("#update").prop( "checked", true );
					} else {
						$("#update").prop( "checked", false );
					}
					if(model.attributes.remove === 'true') {
						$("#remove").prop( "checked", true );
					} else {
						$("#remove").prop( "checked", false );
					}
				}
			}
		},
		initialize : function() {
			var self = this;
			this.collection.on('add', function(){
				self.render();
			});
			this.collection.on('change', function(){
				self.render();
			});
			this.collection.on('remove', function(){
				self.render();
			});
			this.collection.fetch();
		},
		render : function() {
			this.$el.html(this.template({ data : _.pluck(this.collection.toArray(), 'attributes') || []}));
		}
	});

	var table = w.table = new tableView({
		el : $('#tbody')[0]
	});

	$('#genApiKey').click(function() {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < 24; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
		if($('#api').val() !== '' && editId) {
			if (confirm('Are you sure you want to change the API Key?'))
				return $('#api').val(text);
			else
				return;
		}
		return $('#api').val(text);
	});

	$('#form').on('submit', function(){
		var enabled = 'false';
		var list = 'false';
		var insert = 'false';
		var update = 'false';
		var remove = 'false';
		var name = $('#name').val().replace(/[^0-9A-Za-z]/g,'').toLowerCase();
		if($('#enabled').is(':checked'))
			enabled = 'true';
		if($('#list').is(':checked'))
			list = 'true';
		if($('#insert').is(':checked'))
			insert = 'true';
		if($('#update').is(':checked'))
			update = 'true';
		if($('#remove').is(':checked'))
			remove = 'true';
		var data = {
			name : name,
			enabled : enabled,
			list : list,
			insert : insert,
			update : update,
			remove : remove,
			api : $('#api').val() || null,
			rate : parseInt($('#rate').val(), 10) || 0,
		};
		if(editId) {
			packages.get(editId).save(data);
		} else {
			packages.create(data);
		}
		editId = false;
		this.reset();
		return false;
	});
})(this);