var areaObj = {
	province: null,
	city: null,
	district: null,
	
	init: function(){
		areaObj.province = $('#province_rid');
		areaObj.city = $("#city_rid");
		areaObj.district = $("#district_rid");

		areaObj.province.on('change',function(){
			console.log("change");
	    	areaObj.reset_city_list(areaObj.province);
		});

/*		areaObj.city.on('DOMNodeInserted',function(){
			reset_district_list($(this).find(':selected'));
		})*/

		areaObj.city.on('change',function(){
			areaObj.reset_district_list(areaObj.city);
		});
    },

    reset_city_list: function(current_province){
    	
		if(current_province.val() != ''){
			areaObj.city.find('option').remove();
			areaObj.district.find('option:gt(0)').remove();
			$.get('/managers/areas/get_city',{province_rid:current_province.val()},function(data){
				var len = data.length;
				var str = '';
				str += '<option value="'+data[0].rid+'" selected="selected">'+data[0].name_cn+'</option>';
				for(var i=1;i<len;i++){
					str += '<option value="'+data[i].rid+'">'+data[i].name_cn+'</option>';
				}
				areaObj.city.append(str);
			});
		}else{
			areaObj.city.find('option:gt(0)').remove();
			areaObj.district.find('option:gt(0)').remove();
		}	
	},

	reset_district_list: function(current_city){
		if(current_city.val() != ''){
			areaObj.district.find('option').remove();
			$.get('/managers/areas/get_district',{city_rid:current_city.val()},function(data){
				var len = data.length;
				var str = '';
				for(var i=0;i<len;i++){
					str += '<option value="'+data[i].rid+'">'+data[i].name_cn+'</option>';
				}
				areaObj.district.append(str);
			})
		}else{
			areaObj.district.find('option:gt(0)').remove();
		}	
	}
}

$(document).ready(function(){
	areaObj.init();
});
