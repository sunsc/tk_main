var reportPage = {
	getGradeUrl : '/reports/get_grade_report',
	getClassUrl : '/reports/get_class_report',
	getPupilUrl : '/reports/get_pupil_report',
	Gradedata : null,
	ClassData : null,
	PupilData : null,
	defaultColor: "#51b8c1",
	chartColor : ['#a2f6e6','#6cc2bd','#15a892','#88c2f8','#6789ce','#254f9e','#eccef9','#bf9ae0','#8d6095'],
	init: function(){
		//给左上角导航添加事件
		reportPage.bindEvent();
		$('#report_menus .report_click_menu').on('click', function() {
			var dataType = $(this).attr('data_type');
			var reportId = $(this).attr('report_id');
			var reportName = $(this).attr('report_name');
			$('#reportName').html(reportName);
            if(!reportId){
                return false;
            }
			var params = "report_id=" + reportId;
			if(dataType == 'grade'){
				$('#reportContent').load('/reports/grade',function(){
                    reportPage.baseFn.getReportAjax(dataType, reportPage.getGradeUrl,params);
				});
			}else if (dataType == 'klass') {
				$('#reportContent').load('/reports/klass',function(){
                    reportPage.baseFn.getReportAjax(dataType, reportPage.getClassUrl,params);
				});
				
			}else if (dataType == 'pupil') {
				$('#reportContent').load('/reports/pupil',function(){
                    reportPage.baseFn.getReportAjax("pupil", reportPage.getPupilUrl,params);
				});
			};
		});
		/*默认显示*/
		$('#report_menus .report_click_menu:first').trigger('click');
	},
	bindEvent: function(){
		/*顶部导航*/
		$('.dropdown_box').hover(function() {
			$('.dropdown_menu>li>ul').attr('class', 'submit_menu');
			$('.dropdown_menu').show();
			$('.dropdown_menu>li').on('mouseover', function() {
				$(this).addClass('active').siblings('li').removeClass('active');
				$(this).children('ul').show();
				$(this).siblings('li').children('ul').hide();
				var screenHeight = Math.floor($(window).height());
				var bodyHeight = Math.ceil($(this).children('ul').offset().top + $(this).children('ul').height() - $(document).scrollTop());
				if (bodyHeight > screenHeight) {
					$(this).children('ul').attr('class', 'active');
				}
			});
		}, function() {
			$('.dropdown_menu').hide();
			$('.dropdown_menu>li>ul').hide();
			$('.dropdown_menu>li').removeClass('active');
		});
		/*
		$(document).on('click','#tab-menu li[data-id]',function(event){

			$select = $(this).attr('data-id');
			$('#myTabContent div.tab-pane').hide();
			$('#'+$select+'').fadeIn();
			$('#tab-menu li[data-id]').each(function(){
				$(this).removeClass('active');
			})
			$(this).addClass('active');
		});
		*/
		$(document).on('click','#xialatab',function(event){
			var $this = $(this).children('ul');
			if($this.is(':hidden')){
				$this.slideDown();
			}else{
				$this.slideUp();
			}
		});
		$(document).on('show.bs.collapse','.panel-collapse',function(){
			$(this).prev().removeClass('collapse-close');
			$(this).prev().addClass('collapse-open');
		});
		$(document).on('hide.bs.collapse','.panel-collapse',function(){
			$(this).prev().removeClass('collapse-open');
			$(this).prev().addClass('collapse-close');
		});
	},
	/*基础方法*/
	baseFn: {
		getReportAjax: function(type, url, params){
			$.ajax({
				url: url,
				type: "GET",
				data: params,
				dataType: "json",
				success: function(data){
					//$('#reportContent')[0].style = "position:relative;display:flex;"
					//$('#reportContent')[0].style = "display: block;"
					if(type=="grade"){
						reportPage.Grade.createReport(data);
					} else if(type=="klass"){
						reportPage.Class.createReport(data);
					} else if(type=="pupil"){
						reportPage.Pupil.createReport(data);
					}
				},
				error: function(data){
					$('#reportContent').html(data.responseJSON.message);
					//$('#reportContent')[0].style = "position:relative;display: flex;"
					//$('#reportContent')[0].style = "display: block;"
				}
			});
		},
		/*答题情况*/
		getAnswerCaseTable : function(data){
			if(data != null){
				var qid = reportPage.baseFn.getArrayKeysNoModify(data);
				var correctRatio = reportPage.baseFn.getArrayValue(data);
				var str = '';
				for(var i = 0; i < qid.length ; i++){
					str += '<tr><td>'+qid[i]+'</td><td>'+correctRatio[i]+'</td></tr>';
				};
				return str;
			}else{
				return '';
			};
		},
		/*处理数据表(type是班级还是个人)*/
		getTableStr: function(obj, type) {
			var tableHtmlStr = '';
			//创建一级指标table ------ knowledge;
			var level1Arr = reportPage.baseFn.getArrayValue(obj);
			for (var i = 0; i < level1Arr.length; i++) {
				var level1HtmlStr = '';
				//取得一级指标的键名;
				var level1Name = level1Arr[i].label;
				var level1NameHtmlStr = '<td class="one-level">' + level1Name + '</td>';
				var level1ValueHtmlStr = '';
				//取得一级指标的键值对value；
				var level1Value = level1Arr[i].value;
				var level1ValueArr = type == 'class' ? reportPage.Class.creatClassValueArr(level1Value) : reportPage.Pupil.creatPuilValueArr(level1Value);
				//插入具体数据;
				for (var k = 0; k < level1ValueArr.length; k++) {
					var iNum = level1ValueArr[k];
					if(iNum < 0 && iNum > -20){
						level1ValueHtmlStr += '<td class="one-level-content one-level-wrong wrong">' + iNum + '</td>';
					}else if(iNum < -20){
						level1ValueHtmlStr += '<td class="one-level-content one-level-wrong wrong more-wrong">' + iNum + '</td>';
					}else{
						level1ValueHtmlStr += '<td class="one-level-content">' + iNum + '</td>';
					};
				};
				var level1HtmlStr = '<tr>' + level1NameHtmlStr + level1ValueHtmlStr + '</tr>';

				//创建二级指标表格数据
				var level2HtmlStr = "";
				if (level1Arr[i].items) {
					var level2Arr= reportPage.baseFn.getArrayValue(level1Arr[i].items);
					for (var j = 0; j < level2Arr.length; j++) {
						var level2NameHtmlStr = '<td>' + level2Arr[j].label + '</td>';
						var level2ValueHtmlStr = '';
						var level2Value = level2Arr[j].value;
						var level2ValueArr = type == 'class' ? reportPage.Class.creatClassValueArr(level2Value) : reportPage.Pupil.creatPuilValueArr(level2Value);
						for (var g = 0; g <level2ValueArr.length ; g++) {
							var iNum = level2ValueArr[g];
							if(iNum < 0 && iNum > -20){
								level2ValueHtmlStr += '<td class="wrong">' + iNum + '</td>';
							}else if(iNum < -20){
								level2ValueHtmlStr += '<td class="wrong more-wrong">' + iNum + '</td>';
							}else{
								level2ValueHtmlStr += '<td>' + iNum + '</td>';
							};
						};
						level2HtmlStr += '<tr>' + level2NameHtmlStr + level2ValueHtmlStr + '</tr>';
					}
				} else {
					return;
				}
				tableHtmlStr += level1HtmlStr + level2HtmlStr;
			}
			return tableHtmlStr;
		},
		/*处理获取scale图表数据*/
		getScale : function(obj) {
			var goodArr = [],
				faildArr = [],
				excellentArr = [];
			for (var i = 0; i < obj.length; i++) {
				excellentArr.push({
					name: '(得分率 ≥ 85)',
					value: obj[i].excellent_pupil_percent,
					yAxisIndex: i,
					itemStyle: {
						normal: {
							barBorderRadius: [20, 0, 0, 20],
							color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
								offset: 0,
								color: '#086a8e'
							}, {
								offset: 1,
								color: '#65026b'
							}])
						}
					},
				});
				goodArr.push({
					name: '( 60 ≤ 得分率 < 85)',
					value: obj[i].good_pupil_percent,
					yAxisIndex: i,
					itemStyle: {
						normal: {
							barBorderRadius: 0,
							color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
								offset: 0,
								color: '#71ecd0'
							}, {
								offset: 1,
								color: '#13ab9b'
							}])
						}
					},
				});
				faildArr.push({
					name: '(得分率 < 60)',
					value: obj[i].failed_pupil_percent,
					itemStyle: {
						normal: {
							barBorderRadius: [0, 20, 20, 0],
							color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
								offset: 0,
								color: '#fa8471'
							}, {
								offset: 1,
								color: '#f6f1c5'
							}])
						}
					},
				});
			}
			return obj = {
				excellent: excellentArr,
				good: goodArr,
				failed: faildArr
			}
		},
=======
		},
		
		handleNormTable : function(data){
			var classValue = reportPage.baseFn.getArrayValue(data);

			var normkeyArr = reportPage.baseFn.getKeysNoModify(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(reportPage.baseFn.getArrayValue(data)[0])));
			var classNameArr = reportPage.baseFn.getArrayKeysNoModify(data);

			var thStr = '<td class="grade-titlt">班级</td>';
			for(var i = 0 ; i < normkeyArr.length ; i++){
				thStr += '<td>'+normkeyArr[i]+'</td>';
			}
			var allStr = '';
			for(var i = 0 ; i < classNameArr.length ; i++){
				var str = '';
				for(var k = 0 ; k < normkeyArr.length ; k++){
					var iNum = reportPage.baseFn.getValue(data[i][1][k][1])[0];
					if(iNum > -20  && iNum < 0){
						str += '<td class="wrong">'+iNum+'</td>';
					}else if(iNum < -20 ){
						str += '<td class="wrong more-wrong">'+iNum+'</td>';
					}else{
						str += '<td>'+iNum+'</td>';
					}
//					str += '<td>'+iNum+'</td>';
				}
				if(classValue[i] == '年级'){
					str = '<td>年级</td>'+ str ;
				}else{
					str = '<td>'+classNameArr[i]+'</td>'+ str ;
				}
				allStr += '<tr>'+str+'</tr>';
			}
			return allStr = '<tr>'+thStr+'</tr>' + allStr;
		},
		/*获取诊断图的数据*/
		getGradeDiagnoseData : function(obj){
			return obj = {
				knowledge : {
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_med_avg_diff))),
					yaxis : {
						Alllines : {
							grade_average_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_3lines.grade_average_percent))),
							grade_diff_degree: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_3lines.grade_diff_degree))),
							grade_median_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_3lines.grade_median_percent)))
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_med_avg_diff)))
					}
				},
				skill : {
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_med_avg_diff))),
					yaxis : {
						Alllines : {
							grade_average_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_3lines.grade_average_percent))),
							grade_diff_degree: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_3lines.grade_diff_degree))),
							grade_median_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_3lines.grade_median_percent)))
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_med_avg_diff)))
					}
				},
				ability : {
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_med_avg_diff))),
					yaxis : {
						Alllines : {
							grade_average_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_3lines.grade_average_percent))),
							grade_diff_degree: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_3lines.grade_diff_degree))),
							grade_median_percent: reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_3lines.grade_median_percent)))
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_med_avg_diff)))
					}
				},
				disperse : {
					knowledge : reportPage.Grade.handleDisperse(obj.dimesion_disperse.knowledge),
					skill : reportPage.Grade.handleDisperse(obj.dimesion_disperse.skill),
					ability : reportPage.Grade.handleDisperse(obj.dimesion_disperse.ability),
				}
			}
		},
		getGradeNumScaleData : function(obj){
			return obj = {
				knowledge :{
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_knowledge),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_knowledge))
				},
				skill : {
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_skill),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_skill))
				},
				ability : {
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_ability),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_ability))
				},
			}
		},
		getFourSectionsData : function(obj){
			return arr = {
				knowledge : {
					le0 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.knowledge))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.knowledge)))
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.knowledge))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.knowledge)))
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.knowledge))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.knowledge)))
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.knowledge))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.knowledge)))
					}
				},
				skill : {
					le0 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.skill))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.skill)))
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.skill))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.skill)))
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.skill))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.skill)))
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.skill))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.skill)))
					}
				},
				ability : {
					le0 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.ability))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level0.ability)))
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.ability))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level25.ability)))
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.ability))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level50.ability)))
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.ability))),
						yaxis : reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.level75.ability)))
					}
				}
>>>>>>> Stashed changes
			}
			return obj = {
				excellent: excellentArr,
				good: goodArr,
				failed: faildArr
			}
		},
		getBarDiff: function(obj){
			var arr = reportPage.baseFn.getValue(obj);
			var len = arr.length;
			var upArr = [];
			var downArr = [];
			for (var i = 0; i < len; i++) {
				if (arr[i] >= 0) {
					upArr.push({
						value: arr[i],
						label: {
							normal:{
								position: 'top'
							}
						},
						itemStyle: {
							normal: {
								color: reportPage.defaultColor
							}
						}
					});
					downArr.push({
						value: 0,
						label: {
							normal:{
								show: false
							}
						},
						itemStyle: {
							normal: {
								//color: "#c90303"
								color: "#ffffff"
							}
						}
					});
				} else if (arr[i] < 0) {
					upArr.push({
						value: 0,
						label: {
							normal:{
								show: false
							}
						},
						itemStyle: {
							normal: {
								//color: "#c90303"
								color: "#ffffff"
							}
						}
					});
					downArr.push({
						value: arr[i],
						label: {
							normal:{
								position: 'bottom'
							}
						},
						itemStyle: {
							normal: {
								color: "#c90303"
							}
						}
					});
				};
			};
			return obj = {
				up: upArr,
				down: downArr
			}
		},
		/*处理获取diff正负值*/
		getDiff: function(obj) {
			var arr = reportPage.baseFn.getValue(obj);
			var len = arr.length;
			var upArr = [];
			var downArr = [];
			for (var i = 0; i < len; i++) {
				if (arr[i] >= 0) {
					upArr.push({
						value: arr[i],
						symbolSize: 5
					});
					downArr.push({
						value: 0,
						symbolSize: 0
					});
				} else if (arr[i] < 0) {
					downArr.push({
						value: arr[i],
						symbolSize: 5
					});
					upArr.push({
						value: 0,
						symbolSize: 0
					});
				};
			};
			reportPage.baseFn.pushArr(upArr);
			reportPage.baseFn.pushArr(downArr);
			return obj = {
				up: upArr,
				down: downArr
			}
		},
		pushArr: function(obj) {
			if (Object.prototype.toString.call(obj[0]) == "[object String]") {
				obj.push('');
				obj.unshift('');
			} else {
				obj.push({
					value: 0,
					symbolSize: 0
				});
				obj.unshift({
					value: 0,
					symbolSize: 0
				});
			};
			return obj;
		},
		/*获取对象的key数组*/
		getKeys: function(obj) {
			if(obj){
				//return Object.keys(obj);
				return reportPage.baseFn.modifyKey($.map(Object.keys(obj), function(value, index) {
					return [value];
				}));
			}else{
				return [];
			}
		},
		/*获取对象的value数组*/
		getValue: function(obj) {
			return $.map(obj, function(value, index) {
				return [value];
			});
		},
		/*获取答对题的key数组*/
		getArrayKeys: function(obj) {
			if(obj){
				return reportPage.baseFn.modifyKey($.map(obj, function(value, index) {
					return [value[0]];
				}));
			}else{
				return [];
			}
		},
<<<<<<< Updated upstream
		/*获取答对题的value数组*/
		getArrayValue: function(obj) {
			return $.map(obj, function(value, index) {
				return [value[1]];
			});
		},
		getBarValue: function(obj){
			var arr = reportPage.baseFn.getValue(obj);
			var len = arr.length;
			var result = [];
			for (var i = 0; i < len; i++) {
				result.push({
					value: arr[i],
					label: {
						normal:{
							position: 'top'
						}
					},
					itemStyle: {
						normal: {
							color: reportPage.defaultColor
						}
					}
				});
=======
		handleClassPupilNum : function(obj){
			var normkeyArr = reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(reportPage.baseFn.getArrayValue(obj.good_pupil_percent)[0])));
			var classNameArr = reportPage.baseFn.getArrayKeys(obj.good_pupil_percent);
			var normNum = normkeyArr.length;
			var colorArr = [] ;
			var normNameArr = [];
			for(var i = 0 ; i < normNum; i++){
				colorArr.push(reportPage.chartColor[i]);
				normNameArr.push({name:normkeyArr[i],icon:'rect'});
			};
			return obj = {
				excellent_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.excellent_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				},
				good_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.good_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				},
				failed_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.failed_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				}
			};
		},
		handleCheckpoint : function(obj){
			var normkeyArr = reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(reportPage.baseFn.getArrayValue(obj.average_percent)[0])));
			var classNameArr = reportPage.baseFn.getArrayKeys(obj.average_percent);
			var normNum = normkeyArr.length;
			var colorArr = [] ;
			var normNameArr = [];
			for(var i = 0 ; i < normNum; i++){
				colorArr.push(reportPage.chartColor[i]);
				normNameArr.push({name:normkeyArr[i],icon:'rect'});
			};
			return obj = {
				average_percent : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.average_percent,colorArr,normkeyArr,normNum,classNameArr)
				},
				diff_degree : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.diff_degree,colorArr,normkeyArr,normNum,classNameArr)
				},
				med_avg_diff : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.med_avg_diff,colorArr,normkeyArr,normNum,classNameArr)
				},
				median_percent : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.median_percent,colorArr,normkeyArr,normNum,classNameArr)
				},
>>>>>>> Stashed changes
			};
			return result;
		},
<<<<<<< Updated upstream
		/*获取对象的key数组*/
		getKeysNoModify: function(obj) {
			if(obj){
				//return Object.keys(obj);
				return $.map(Object.keys(obj), function(value, index) {
					return [value];
				});
			}else{
				return [];
			}
		},
		/*获取答对题的key数组*/
		getArrayKeysNoModify: function(obj) {
			if(obj){
				return $.map(obj, function(value, index) {
					return [value[0]];
				});
			}else{
				return [];
			}
=======
		handleNorm : function(obj,colorArr,normkeyArr,normNum,classNameArr){
			var classValue = reportPage.baseFn.getArrayValue(obj);
			var classNum = classNameArr.length;
			var allArr = [];
			var series = [];
			for(var i = 0 ; i < normNum ; i++){
				var arr = [];
				for(var k = 0 ; k < classNum ; k++){
					arr.push(reportPage.baseFn.getValue(classValue[k][i][1])[0]);
				};
				allArr.push(arr);
			};
			for(var j = 0 ; j < normNum ; j++){
				series.push({
					name:normkeyArr[j],
		            type:'line',
		            barMaxWidth: 10,
		            stack: "总量",
		            symbol:'circle',
		            symbolSize:5,
		            lineStyle:{normal:{width:1}},
		            smooth:true,
		            areaStyle: {
		              	normal: {
		                	color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
			                  	offset: 0,
			                  	color:colorArr[j] 
		               		}, {
		                  		offset: 1,
		                  		color: '#f4fcfb'
		                	}]),
		                	opacity:0.9,
		            }},
		            data:allArr[j],
		            z:j+1
				})
			};
			return series;
>>>>>>> Stashed changes
		},
		modifyKey: function(arr){
			for(var i =0; i < arr.length; i++){
				c_arr = arr[i].split("");
				labelInterval = (c_arr.length > 10)? 2:1;
				for(var j =0; j < c_arr.length; j++){
					if(labelInterval == 1){
						if(c_arr[j] == "（" || c_arr[j] == "("){
							c_arr[j] = "︵";
						} else if(c_arr[j] == "）" || c_arr[j] == ")"){
							c_arr[j] = "︶";
						}}
					if((j+1)%labelInterval == 0 ){
						c_arr[j]+= "\n";
					}
				}
				arr[i] = c_arr.join("");
			}
			return arr;
		}
	},
	/*处理年级数据*/
	Grade: {
		createReport : function(data){
			//设置年级表头；
			var basicData = data.data.basic;
			var gradeNavStr = '<b>学校</b>：<span>'+basicData.school
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>年级</b>：<span>'+basicData.grade
			    +'&nbsp;|</span>&nbsp;&nbsp;'+'<b>班级数量</b>：<span>'+basicData.klass_count
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>学生数量</b>：<span>'+basicData.pupil_number
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>学期</b>：<span>'+basicData.term
			    //+'&nbsp;|</span>&nbsp;&nbsp;'+'<b>难度</b>：<span>'+basicData.levelword2
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试类型</b>：<span>'+basicData.quiz_type
			    +'&nbsp;|</span>&nbsp;&nbsp;'+'<b>测试日期</b>：<span>'+basicData.quiz_date+'</span>';
			$('#grade-top-nav').html(gradeNavStr);
			//创建年级的第一个诊断图;
			var grade_charts = reportPage.Grade.getGradeDiagnoseData(data.data.charts);
			var objArr = [grade_charts.knowledge,grade_charts.skill,grade_charts.ability];
			var nodeArrLeft = ['knowledge_diagnose_left','skill_diagnose_left','ability_diagnose_left'];
			var nodeArrRight = ['knowledge_diagnose_right','skill_diagnose_right','ability_diagnose_right'];
			for(var i = 0 ; i < objArr.length ; i++){
				var optionLeft = echartOption.getOption.Grade.setGradeDiagnoseLeft(objArr[i]);
				var optionRight = echartOption.getOption.Grade.setGradeDiagnoseRight(objArr[i]);
				echartOption.createEchart(optionLeft,nodeArrLeft[i]);
				echartOption.createEchart(optionRight,nodeArrRight[i]);
			}
			//创建年级分型图;
			echartOption.createEchart(echartOption.getOption.Grade.setGradePartingChartOption(grade_charts.disperse),'parting-chart');

			$('#tab-menu li[data-id]').on('click', function (e) {
				var $dataId = $(e.target).attr('data-id');
				$('#myTabContent div.tab-pane').hide();
				$('#'+$dataId+'').fadeIn();
				$('#tab-menu li[data-id]').each(function(){
					$(this).removeClass('active');
				})
				$(this).addClass('active');

				if($dataId == 'grade-NumScale'){
					//创建人数比例图
					var NumScaleObj = reportPage.Grade.getGradeNumScaleData(data.data.each_level_number);
					var objArr = [NumScaleObj.knowledge,NumScaleObj.skill,NumScaleObj.ability];
					var nodeArr = ['KnowledgeScale','SkillScale','AbilityScale'];
					for(var i = 0 ; i < objArr.length ; i++){
						var option = echartOption.getOption.Grade.setGradeScaleOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					}
				}else if($dataId == 'grade-FourSections'){
					var FourSections = reportPage.Grade.getFourSectionsData(data.data.four_sections);
					var objArr = [FourSections.knowledge.le75,FourSections.skill.le75,FourSections.ability.le75,FourSections.knowledge.le50,FourSections.skill.le50,FourSections.ability.le50,FourSections.knowledge.le25,FourSections.skill.le25,FourSections.ability.le25,FourSections.knowledge.le0,FourSections.skill.le0,FourSections.ability.le0,];
					var nodeArr = ['knowledge_Four_L75','skill_Four_L75','ability_Four_L75','knowledge_Four_L50','skill_Four_L50','ability_Four_L50','knowledge_Four_L25','skill_Four_L25','ability_Four_L25','knowledge_Four_L0','skill_Four_L0','ability_Four_L0'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setFourSectionsOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-checkpoint-knowledge'){
					var Checkpoints = reportPage.Grade.getCheckpointData(data.data.each_checkpoint_horizon);
					var objArr = [Checkpoints.knowledge.average_percent,Checkpoints.knowledge.median_percent,Checkpoints.knowledge.med_avg_diff,Checkpoints.knowledge.diff_degree];
					var nodeArr = ['knowledge_Grade_average_percent','knowledge_Grade_median_percent','knowledge_Grade_med_avg_diff','knowledge_Grade_diff_degree'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-checkpoint-skill'){
					var Checkpoints = reportPage.Grade.getCheckpointData(data.data.each_checkpoint_horizon);
					var objArr = [Checkpoints.skill.average_percent,Checkpoints.skill.median_percent,Checkpoints.skill.med_avg_diff,Checkpoints.skill.diff_degree];
					var nodeArr = ['skill_Grade_average_percent','skill_Grade_median_percent','skill_Grade_med_avg_diff','skill_Grade_diff_degree'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-checkpoint-ability'){
					var Checkpoints = reportPage.Grade.getCheckpointData(data.data.each_checkpoint_horizon);
					var objArr = [Checkpoints.ability.average_percent,Checkpoints.ability.median_percent,Checkpoints.ability.med_avg_diff,Checkpoints.ability.diff_degree];
					var nodeArr = ['ability_Grade_average_percent','ability_Grade_median_percent','ability_Grade_med_avg_diff','ability_Grade_diff_degree'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-checkpoint-total'){
					var Checkpoints = reportPage.Grade.getCheckpointData(data.data.each_checkpoint_horizon);
					var objArr = [Checkpoints.total.average_percent,Checkpoints.total.median_percent,Checkpoints.total.med_avg_diff,Checkpoints.total.diff_degree];
					var nodeArr = ['total_Grade_average_percent','total_Grade_median_percent','total_Grade_med_avg_diff','total_Grade_diff_degree'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-classPupilNum-knowledge'){
					var ClassPupilNum = reportPage.Grade.getClassPupilNumData(data.data.each_class_pupil_number_chart);
					var objArr = [ClassPupilNum.knowledge.excellent_pupil_percent,ClassPupilNum.knowledge.good_pupil_percent,ClassPupilNum.knowledge.failed_pupil_percent];
					var nodeArr = ['knowledge_excellent','knowledge_good','knowledge_faild'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-classPupilNum-skill'){
					var ClassPupilNum = reportPage.Grade.getClassPupilNumData(data.data.each_class_pupil_number_chart);
					var objArr = [ClassPupilNum.skill.excellent_pupil_percent,ClassPupilNum.skill.good_pupil_percent,ClassPupilNum.skill.failed_pupil_percent];
					var nodeArr = ['skill_excellent','skill_good','skill_faild'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-classPupilNum-ability'){
					var ClassPupilNum = reportPage.Grade.getClassPupilNumData(data.data.each_class_pupil_number_chart);
					var objArr = [ClassPupilNum.ability.excellent_pupil_percent,ClassPupilNum.ability.good_pupil_percent,ClassPupilNum.ability.failed_pupil_percent];
					var nodeArr = ['ability_excellent','ability_good','ability_faild'];
					for(var i = 0 ; i < nodeArr.length ; i++){
						var option = echartOption.getOption.Grade.setCheckpointOption(objArr[i]);
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'grade-checkpoint-table-knowledge'){
					var avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.knowledge.average_percent);
					$('#knowledge_average_percent').html(avg_table);
					var med_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.knowledge.median_percent);
					$('#knowledge_median_percent').html(med_table);
					var med_avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.knowledge.med_avg_diff);
					$('#knowledge_med_avg_diff').html(med_avg_table);
					var diff_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.knowledge.diff_degree);
					$('#knowledge_diff_degree').html(diff_table);
				}else if($dataId == 'grade-checkpoint-table-skill'){
					var avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.skill.average_percent);
					$('#skill_average_percent').html(avg_table);
					var med_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.skill.median_percent);
					$('#skill_median_percent').html(med_table);
					var med_avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.skill.med_avg_diff);
					$('#skill_med_avg_diff').html(med_avg_table);
					var diff_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.skill.diff_degree);
					$('#skill_diff_degree').html(diff_table);
				}else if($dataId == 'grade-checkpoint-table-ability'){
					var avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.ability.average_percent);
					$('#ability_average_percent').html(avg_table);
					var med_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.ability.median_percent);
					$('#ability_median_percent').html(med_table);
					var med_avg_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.ability.med_avg_diff);
					$('#ability_med_avg_diff').html(med_avg_table);
					var diff_table = reportPage.Grade.handleNormTable(data.data.each_checkpoint_horizon.ability.diff_degree);
					$('#ability_diff_degree').html(diff_table);
				}else if($dataId == 'grade-classPupilNum-table-knowledge'){
					var excellent_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.knowledge.excellent_pupil_percent);
					$('#knowledge_excellent_table').html(excellent_table);
					var good_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.knowledge.good_pupil_percent);
					$('#knowledge_good_table').html(good_table);
					var faild_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.knowledge.failed_pupil_percent);
					$('#knowledge_failed_table').html(faild_table);
				}else if($dataId == 'grade-classPupilNum-table-skill'){
					var excellent_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.skill.excellent_pupil_percent);
					$('#skill_excellent_table').html(excellent_table);
					var good_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.skill.good_pupil_percent);
					$('#skill_good_table').html(good_table);
					var faild_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.skill.failed_pupil_percent);
					$('#skill_failed_table').html(faild_table);
				}else if($dataId == 'grade-classPupilNum-table-ability'){
					var excellent_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.ability.excellent_pupil_percent);
					$('#ability_excellent_table').html(excellent_table);
					var good_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.ability.good_pupil_percent);
					$('#ability_good_table').html(good_table);
					var faild_table = reportPage.Grade.handleNormTable(data.data.each_class_pupil_number_chart.ability.failed_pupil_percent);
					$('#ability_failed_table').html(faild_table);
				}else if($dataId == 'grade-answerCase'){
					var excellent_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.excellent);
					$('#excellent_answerCase_table').html(excellent_table);
					var good_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.good);
					$('#good_answerCase_table').html(good_table);
					var faild_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.failed);
					$('#failed_answerCase_table').html(faild_table);
				}else if($dataId == 'grade-readReport-three'){
					$('#grade-readReport-three').html(data.data.report_explanation.three_dimesions);
				}else if($dataId == 'grade-readReport-statistics'){
					$('#grade-readReport-statistics').html(data.data.report_explanation.statistics);
				}else if($dataId == 'grade-readReport-data'){
					$('#grade-readReport-data').html(data.data.report_explanation.data);
				}
			});
		},
		
		handleNormTable : function(data){
			var classArr = reportPage.baseFn.getArrayKeysNoModify(data);
			var classValue = reportPage.baseFn.getArrayValue(data);
			var normArr = reportPage.baseFn.getKeysNoModify(reportPage.baseFn.getArrayValue(data)[0]);
			var thStr = '<td class="grade-titlt">班级</td>';
			for(var i = 0 ; i < normArr.length ; i++){
				thStr += '<td>'+normArr[i]+'</td>';
			}
			var allStr = '';
			for(var i = 0 ; i < classArr.length ; i++){
				var str = '';
				for(var k = 0 ; k < normArr.length ; k++){
					var iNum = reportPage.baseFn.getValue(reportPage.baseFn.getArrayValue(data)[i])[k];
					if(iNum > -20  && iNum < 0){
						str += '<td class="wrong">'+iNum+'</td>';
					}else if(iNum < -20 ){
						str += '<td class="wrong more-wrong">'+iNum+'</td>';
					}else{
						str += '<td>'+iNum+'</td>';
					}
//					str += '<td>'+iNum+'</td>';
				}
				if(classValue[i] == '年级'){
					str = '<td>年级</td>'+ str ;
				}else{
					str = '<td>'+classArr[i]+'</td>'+ str ;
				}
				allStr += '<tr>'+str+'</tr>';
			}
			return allStr = '<tr>'+thStr+'</tr>' + allStr;
		},
		/*获取诊断图的数据*/
		getGradeDiagnoseData : function(obj){
			console.log(obj);
			return obj = {
				knowledge : {
//					xaxis : reportPage.baseFn.pushArr(reportPage.baseFn.getKeys(obj.knowledge_med_avg_diff)),
					xaxis : reportPage.baseFn.getKeys(obj.knowledge_med_avg_diff),
					yaxis : {
						/*Alllines : {
							grade_average_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.knowledge_3lines.grade_average_percent)),
							grade_diff_degree: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.knowledge_3lines.grade_diff_degree)),
							grade_median_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.knowledge_3lines.grade_median_percent))
						},*/
						Alllines : {
							grade_average_percent: reportPage.baseFn.getValue(obj.knowledge_3lines.grade_average_percent),
							grade_diff_degree: reportPage.baseFn.getValue(obj.knowledge_3lines.grade_diff_degree),
							grade_median_percent: reportPage.baseFn.getValue(obj.knowledge_3lines.grade_median_percent)
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(obj.knowledge_med_avg_diff)
					},
				},
				skill : {
//					xaxis : reportPage.baseFn.pushArr(reportPage.baseFn.getKeys(obj.skill_med_avg_diff)),
					xaxis : reportPage.baseFn.getKeys(obj.skill_med_avg_diff),
					yaxis : {
/*						Alllines : {
							grade_average_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.skill_3lines.grade_average_percent)),
							grade_diff_degree: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.skill_3lines.grade_diff_degree)),
							grade_median_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.skill_3lines.grade_median_percent))
						},*/
						Alllines : {
							grade_average_percent:reportPage.baseFn.getValue(obj.skill_3lines.grade_average_percent),
							grade_diff_degree:reportPage.baseFn.getValue(obj.skill_3lines.grade_diff_degree),
							grade_median_percent:reportPage.baseFn.getValue(obj.skill_3lines.grade_median_percent)
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(obj.skill_med_avg_diff)
					},
					
				},
				ability : {
//					xaxis : reportPage.baseFn.pushArr(reportPage.baseFn.getKeys(obj.ability_med_avg_diff)),
					xaxis : reportPage.baseFn.getKeys(obj.ability_med_avg_diff),
					yaxis : {
						/*Alllines : {
							grade_average_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.ability_3lines.grade_average_percent)),
							grade_diff_degree: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.ability_3lines.grade_diff_degree)),
							grade_median_percent: reportPage.baseFn.pushArr(reportPage.baseFn.getValue(obj.ability_3lines.grade_median_percent))
						},*/
						Alllines : {
							grade_average_percent: reportPage.baseFn.getValue(obj.ability_3lines.grade_average_percent),
							grade_diff_degree: reportPage.baseFn.getValue(obj.ability_3lines.grade_diff_degree),
							grade_median_percent: reportPage.baseFn.getValue(obj.ability_3lines.grade_median_percent)
						},
						med_avg_diff : reportPage.baseFn.getBarDiff(obj.ability_med_avg_diff)
					},
				},
				disperse : {
					knowledge : reportPage.Grade.handleDisperse(obj.dimesion_disperse.knowledge),
					skill : reportPage.Grade.handleDisperse(obj.dimesion_disperse.skill),
					ability : reportPage.Grade.handleDisperse(obj.dimesion_disperse.ability),
				}
			}
		},
		getGradeNumScaleData : function(obj){
			return obj = {
				knowledge :{
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_knowledge),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_knowledge))
				},
				skill : {
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_skill),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_skill))
				},
				ability : {
					yaxis : reportPage.baseFn.getKeysNoModify(obj.grade_ability),
					data : reportPage.Grade.creatGradeScaleArr(reportPage.baseFn.getValue(obj.grade_ability))
				},
			}
		},
		getFourSectionsData : function(obj){
			return arr = {
				knowledge : {
<<<<<<< Updated upstream
					le0 : {
						xaxis : reportPage.baseFn.getKeys(obj.level0.knowledge),
						yaxis : reportPage.baseFn.getBarValue(obj.level0.knowledge),
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(obj.level25.knowledge),
						yaxis : reportPage.baseFn.getBarValue(obj.level25.knowledge),
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(obj.level50.knowledge),
						yaxis : reportPage.baseFn.getBarValue(obj.level50.knowledge),
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(obj.level75.knowledge),
						yaxis : reportPage.baseFn.getBarValue(obj.level75.knowledge),
					}
				},
				skill : {
					le0 : {
						xaxis : reportPage.baseFn.getKeys(obj.level0.skill),
						yaxis : reportPage.baseFn.getBarValue(obj.level0.skill),
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(obj.level25.skill),
						yaxis : reportPage.baseFn.getBarValue(obj.level25.skill),
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(obj.level50.skill),
						yaxis : reportPage.baseFn.getBarValue(obj.level50.skill),
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(obj.level75.skill),
						yaxis : reportPage.baseFn.getBarValue(obj.level75.skill),
					}
				},
				ability : {
					le0 : {
						xaxis : reportPage.baseFn.getKeys(obj.level0.ability),
						yaxis : reportPage.baseFn.getBarValue(obj.level0.ability),
					},
					le25 : {
						xaxis : reportPage.baseFn.getKeys(obj.level25.ability),
						yaxis : reportPage.baseFn.getBarValue(obj.level25.ability),
					},
					le50 : {
						xaxis : reportPage.baseFn.getKeys(obj.level50.ability),
						yaxis : reportPage.baseFn.getBarValue(obj.level50.ability),
					},
					le75 : {
						xaxis : reportPage.baseFn.getKeys(obj.level75.ability),
						yaxis : reportPage.baseFn.getBarValue(obj.level75.ability),
					}
				}
=======
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_cls_mid_gra_avg_diff_line))),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.knowledge_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_cls_mid_gra_avg_diff_line))),
							avg:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.knowledge_gra_cls_avg_diff_line)))
						}
					}
				},
				skill : {
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_cls_mid_gra_avg_diff_line))),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.skill_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_cls_mid_gra_avg_diff_line))),
							avg:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.skill_gra_cls_avg_diff_line)))
						}
					}
				},
				ability : {
					xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_cls_mid_gra_avg_diff_line))),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.ability_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_cls_mid_gra_avg_diff_line))),
							avg:reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(obj.ability_gra_cls_avg_diff_line)))
						}
					}
				}
			};
		},
		getClassDiagnoseAllLine : function(data){
			return obj = {
				class_average_percent:reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.class_average_percent))),
				class_median_percent:reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.class_median_percent))),
				diff_degree:reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.diff_degree))),
				grade_average_percent:reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.grade_average_percent)))
>>>>>>> Stashed changes
			}
		},
		getCheckpointData : function(obj){
			return obj = {
				knowledge:reportPage.Grade.handleCheckpoint(obj.knowledge),
				skill:reportPage.Grade.handleCheckpoint(obj.skill),
				ability:reportPage.Grade.handleCheckpoint(obj.ability),
				total:reportPage.Grade.handleCheckpoint(obj.total)
			};
		},
		getClassPupilNumData : function(obj){
			return obj = {
				knowledge:reportPage.Grade.handleClassPupilNum(obj.knowledge),
				skill:reportPage.Grade.handleClassPupilNum(obj.skill),
				ability:reportPage.Grade.handleClassPupilNum(obj.ability),
			}
		},
		//分型图
		handleDisperse : function(data){
			var keysArr = reportPage.baseFn.getKeysNoModify(data);
			var valsArr = reportPage.baseFn.getValue(data);
			var arr = [];
			var percentArr = [];
			var maxKey,minKey;
			for(var i = 0 ; i < keysArr.length; i++){
				arr.push({
					name:keysArr[i],value:[valsArr[i].diff_degree,valsArr[i].average_percent]
				});
				percentArr.push(valsArr[i].average_percent);
			};
			maxKey = keysArr[percentArr.indexOf(Math.max.apply(null,percentArr))];
			minKey = keysArr[percentArr.indexOf(Math.min.apply(null,percentArr))];
			return {
				data_node:arr,
				maxkey : maxKey,
				minkey : minKey
			}
		},
		creatGradeScaleArr : function(obj){
			var goodArr = [],faildArr = [],excellentArr = [];
			for(var i = 0 ; i < obj.length ; i++){
				excellentArr.push({
		            name:'(得分率 ≥ 85)',
		            value:obj[i].excellent_pupil_percent,
		            yAxisIndex:i,
		            itemStyle: {
		              	normal: {
			                barBorderRadius:[20, 0, 0, 20],
			                color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
			                  offset: 0,
			                  color: '#086a8e'
			                }, {
			                  offset: 1,
			                  color: '#65026b'
			                }])
			            }
		            },
		        });
				goodArr.push({
		            name:'( 60 ≤ 得分率 < 85)',
		            value:obj[i].good_pupil_percent,
		            yAxisIndex:i,
		            itemStyle: {
		                normal: {
		                    barBorderRadius:0,
		                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
		                      offset: 0,
		                      color: '#71ecd0'
		                    }, {
		                      offset: 1,
		                      color: '#13ab9b'
		                    }])
		                }
		            },
		        });
				faildArr.push({
                    name:'(得分率 < 60)',
                    value:obj[i].failed_pupil_percent,
                    itemStyle: {
                      	normal: {
                        	barBorderRadius: [0, 20, 20, 0],
                        	color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                          	offset: 0,
	                          	color: '#fa8471'
	                        }, {
	                          offset: 1,
	                          color: '#f6f1c5'
	                        }])
	                    }
                    },
                });
<<<<<<< Updated upstream
			}
			return obj  = {
				excellent:excellentArr,
				good:goodArr,
				failed:faildArr
			}
=======
			};
			return obj = {
				excenllent : excellent ,
				good : good ,
				faild :faild,
			};
		},
		/*针对班级的字段*/
		creatClassValueArr: function(obj) {
			return obj = [obj.cls_average, obj.cls_average_percent, obj.class_median_percent, obj.gra_average_percent, obj.cls_gra_avg_percent_diff, obj.cls_med_gra_avg_percent_diff, obj.diff_degree, obj.full_score]
		},
	},
	Pupil: {
		createReport : function(data){
			var basicData = data.data.basic;
			var pupilNavStr = '<b>学校</b>：<span>'+basicData.school
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>年级</b>：<span>'+basicData.grade
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>班级</b>：<span>'+basicData.classroom
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>姓名</b>：<span>'+basicData.name
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>性别</b>：<span>'+basicData.sex
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>学期</b>：<span>'+basicData.term
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试类型</b>：<span>'+basicData.quiz_type
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试日期</b>：<span>'+basicData.quiz_date;

			$('#pupil-top-nav').html(pupilNavStr);
			var PupilDiagnoseObj = reportPage.Pupil.getPupilDiagnoseData(data.data);
			var objArr = [PupilDiagnoseObj.knowledge,PupilDiagnoseObj.skill,PupilDiagnoseObj.ability];
			var nodeArr_radar = ['pupil_knowledge_radar','pupil_skill_radar','pupil_ability_radar'];
			var nodeArr_diff = ['pupil_knowledge_diff','pupil_skill_diff','pupil_ability_diff'];
			for(var i = 0 ; i < objArr.length ; i++){
				if(objArr[i].radar.pupil.xaxis.xAxis.length > 0){
					var optionRadar = echartOption.getOption.Pupil.setPupilRadarOption(objArr[i]);
					var optionDiff = echartOption.getOption.Pupil.setPupilDiffOption(objArr[i]);
					echartOption.createEchart(optionRadar,nodeArr_radar[i]);
					echartOption.createEchart(optionDiff,nodeArr_diff[i]);
			    }
			};

			$('#tab-menu li[data-id]').on('click', function (e) {
				var $dataId = $(e.target).attr('data-id');
				if($dataId == 'improve-sugg'){
					$('#improve-sugg').html(data.data.quiz_comment);
				}else if($dataId == 'table-data-knowledge'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.knowledge,'pupil');
					$('#pupil_knowledge_percentile').html(data.data.percentile.knowledge);
					$('#knowledge_data_table').html(tableStr);
				}else if($dataId == 'table-data-skill'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.skill,'pupil');
					$('#pupil_skill_percentile').html(data.data.percentile.skill);
					$('#skill_data_table').html(tableStr);
				}else if($dataId == 'table-data-ability'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.ability,'pupil');
					$('#pupil_ability_percentile').html(data.data.percentile.ability);
					$('#ability_data_table').html(tableStr);
				}
			});
>>>>>>> Stashed changes
		},
		handleClassPupilNum : function(obj){
			var normkeyArr = reportPage.baseFn.getKeys(reportPage.baseFn.getArrayValue(obj.good_pupil_percent)[0]);
			var classNameArr = reportPage.baseFn.getArrayKeys(obj.good_pupil_percent);
			var normNum = normkeyArr.length;
			var colorArr = [] ;
			var normNameArr = [];
			for(var i = 0 ; i < normNum; i++){
				colorArr.push(reportPage.chartColor[i]);
				normNameArr.push({name:normkeyArr[i],icon:'rect'});
			};
			return obj = {
<<<<<<< Updated upstream
				excellent_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.excellent_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				},
				good_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.good_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				},
				failed_pupil_percent : {
					xaxis : classNameArr,
					colorArr:colorArr,
					normNameArr:normNameArr,
					series : reportPage.Grade.handleNorm(obj.failed_pupil_percent,colorArr,normkeyArr,normNum,classNameArr),
				}
			};
		},
		handleCheckpoint : function(obj){
			var normkeyArr = reportPage.baseFn.getKeys(reportPage.baseFn.getArrayValue(obj.average_percent)[0]);
			var classNameArr = reportPage.baseFn.getArrayKeys(obj.average_percent);
			var normNum = normkeyArr.length;
			var colorArr = [] ;
			var normNameArr = [];
			for(var i = 0 ; i < normNum; i++){
				colorArr.push(reportPage.chartColor[i]);
				normNameArr.push({name:normkeyArr[i],icon:'rect'});
			};
			return obj = {
				average_percent : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.average_percent,colorArr,normkeyArr,normNum,classNameArr)
				},
				diff_degree : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.diff_degree,colorArr,normkeyArr,normNum,classNameArr)
				},
				med_avg_diff : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.med_avg_diff,colorArr,normkeyArr,normNum,classNameArr)
				},
				median_percent : {
					xaxis : classNameArr,
					colorArr : colorArr,
					normNameArr : normNameArr,
					series : reportPage.Grade.handleNorm(obj.median_percent,colorArr,normkeyArr,normNum,classNameArr)
				},
			};
=======
				knowledge : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.knowledge_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.knowledge_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.knowledge_pup_gra_avg_diff_line))),
						yaxis :	reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.knowledge_pup_gra_avg_diff_line)))
					}
				},
				skill : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.skill_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.skill_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.skill_pup_gra_avg_diff_line))),
						yaxis :	reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.skill_pup_gra_avg_diff_line)))
					}
				},
				ability : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.ability_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.ability_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.ability_pup_gra_avg_diff_line))),
						yaxis :	reportPage.baseFn.getBarDiff(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data.charts.ability_pup_gra_avg_diff_line)))
					}
				}
			};
		},
		handlePupilRadarData : function (data){
			var arr1 = reportPage.baseFn.getKeys(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data)));
			var dataArr1 = [];
			var dataArr2 = [];
			var len = arr1.length;
			for(var i=0 ; i<len ; i++){
				dataArr1.push({name : arr1[i],max : 100});
				dataArr2.push({name : '' , max : 100});
			}
			var arr2 = reportPage.baseFn.getValue(reportPage.baseFn.extendObj(reportPage.baseFn.getArrayValue(data)));
			return obj = {
				xaxis : { nullAxis : dataArr2.reverse() , xAxis : dataArr1.reverse()},
				yaxis : { yAxis : arr2.reverse()}
			}
>>>>>>> Stashed changes
		},
		handleNorm : function(obj,colorArr,normkeyArr,normNum,classNameArr){
			var classValue = reportPage.baseFn.getArrayValue(obj);
			var classNum = classNameArr.length;
			var allArr = [];
			var series = [];
			for(var i = 0 ; i < normNum ; i++){
				var arr = [];
				for(var k = 0 ; k < classNum ; k++){
					arr.push(reportPage.baseFn.getValue(classValue[k])[i]);
				};
				allArr.push(arr);
			};
			for(var j = 0 ; j < normNum ; j++){
				series.push({
					name:normkeyArr[j],
		            type:'line',
		            symbol:'circle',
		            symbolSize:5,
		            lineStyle:{normal:{width:1}},
		            smooth:true,
		            areaStyle: {
		              	normal: {
		                	color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
			                  	offset: 0,
			                  	color:colorArr[j] 
		               		}, {
		                  		offset: 1,
		                  		color: '#f4fcfb'
		                	}]),
		                	opacity:0.9,
		            }},
		            data:allArr[j],
		            z:j+1
				})
			};
			return series;
		},
<<<<<<< Updated upstream
	},
	/*处理班级数据*/
	Class: {
		createReport : function(data){
			var basicData = data.data.basic;
			var classNavStr = '<b>学校</b>：<span>'+basicData.school
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>班级</b>：<span>'+basicData.classroom
			    +'&nbsp;|</span>&nbsp;&nbsp;' +'<b>班级人数</b>：<span>'+basicData.pupil_number
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>学期</b>：<span>'+basicData.term
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试类型</b>：<span>'+basicData.quiz_type
/*			    +'&nbsp;|</span>&nbsp;&nbsp;' +'<b>班级主任</b>：<span>'+basicData.head_teacher
			    +'</span>&nbsp;&nbsp;<b>学科老师</b>：<span>'+basicData.subject_teacher*/
			    +'&nbsp;|</span>&nbsp;&nbsp;' +'<b>测试日期</b>：<span>'+basicData.quiz_date
			    +'</span>';
			$('#class-top-nav').html(classNavStr);
			var DiagnoseObj = reportPage.Class.getClassDiagnoseData(data.data.charts);
			var objArr = [DiagnoseObj.knowledge,DiagnoseObj.skill,DiagnoseObj.ability];
			var nodeArrLeft = ['knowledge_diagnose_left','skill_diagnose_left','ability_diagnose_left'];
			var nodeArrCenter = ['knowledge_diagnose_center','skill_diagnose_center','ability_diagnose_center'];
			var nodeArrRight = ['knowledge_diagnose_right','skill_diagnose_right','ability_diagnose_right'];
			for(var i = 0 ; i < objArr.length ; i++){
				var optionLeft = echartOption.getOption.Class.setClassDiagnoseLeft(objArr[i]);
				var optionCenter = echartOption.getOption.Class.setClassDiagnoseCenter(objArr[i]);
				var optionRight = echartOption.getOption.Class.setClassDiagnoseRight(objArr[i]);
				echartOption.createEchart(optionLeft,nodeArrLeft[i]);
				echartOption.createEchart(optionCenter,nodeArrCenter[i]);
				echartOption.createEchart(optionRight,nodeArrRight[i]);
			};
			$('#tab-menu li[data-id]').on('click', function (e) {
				var $dataId = $(e.target).attr('data-id');
				$('#myTabContent div.tab-pane').hide();
				$('#'+$dataId+'').fadeIn();
				$('#tab-menu li[data-id]').each(function(){
					$(this).removeClass('active');
				})
				$(this).addClass('active');
				if($dataId == 'class-NumScale'){
					var classScaleObj = reportPage.Class.getClassScaleNumData(data.data.each_level_number);
					var objArr = [classScaleObj.dimesions,classScaleObj.class_knowledge,classScaleObj.class_skill,classScaleObj.class_ability];
					var nodeArr = ['scale_dimesions','scale_knowledge','scale_skill','scale_ability'];
					for(var i = 0 ; i　< objArr.length ; i++){
						var option = echartOption.getOption.Class.setClassScaleNumOption(objArr[i]);
						if(i > 0){
							option.legend = { show: false};
							option.grid.right = '3%';
						}
						echartOption.createEchart(option,nodeArr[i]);
					};
				}else if($dataId == 'table-data-knowledge'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.knowledge,'class');
					$('#Class_knowledge_table').html(tableStr);
				}else if($dataId == 'table-data-skill'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.skill,'class');
					$('#Class_skill_table').html(tableStr);
				}else if($dataId == 'table-data-ability'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.ability,'class');
					$('#Class_ability_table').html(tableStr);
				}else if($dataId == 'class-answerCase'){
					var excellent_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.excellent);
					var good_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.good);
					var failed_table = reportPage.baseFn.getAnswerCaseTable(data.data.average_percent.failed);
					$('#class_answer_excellent').html(excellent_table);
					$('#class_answer_good').html(good_table);
					$('#class_answer_failed').html(failed_table);
				}else if($dataId == 'report-read-three'){
					$('#report-read-three').html(data.data.report_explanation.three_dimesions);
				}else if($dataId == 'report-read-checkpoint'){
					$('#report-read-checkpoint').html(data.data.report_explanation.statistics);
				}else if($dataId == 'report-read-data'){
					$('#report-read-data').html(data.data.report_explanation.data);
				}else if($dataId == 'exam-knowledge'){
					$('#exam-knowledge').html(data.data.quiz_comment.knowledge);
				}else if($dataId == 'exam-skill'){
					$('#exam-skill').html(data.data.quiz_comment.skill);
				}else if($dataId == 'exam-ability'){
					$('#exam-ability').html(data.data.quiz_comment.ability);
				}else if($dataId == 'exam-total'){
					$('#exam-total').html(data.data.quiz_comment.total);
				}
			});
=======

>>>>>>> Stashed changes
		},
		getClassDiagnoseData : function(obj){
			return obj = {
				knowledge : {
					xaxis : reportPage.baseFn.getKeys(obj.knowledge_cls_mid_gra_avg_diff_line),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.knowledge_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(obj.knowledge_cls_mid_gra_avg_diff_line),
							avg:reportPage.baseFn.getBarDiff(obj.knowledge_gra_cls_avg_diff_line)
						}
					}
				},
				skill : {
					xaxis : reportPage.baseFn.getKeys(obj.skill_cls_mid_gra_avg_diff_line),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.skill_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(obj.skill_cls_mid_gra_avg_diff_line),
							avg:reportPage.baseFn.getBarDiff(obj.skill_gra_cls_avg_diff_line)
						}
					}
				},
				ability : {
					xaxis : reportPage.baseFn.getKeys(obj.ability_cls_mid_gra_avg_diff_line),
					yaxis : {
						all_line : reportPage.Class.getClassDiagnoseAllLine(obj.ability_all_lines),
						diff : {
							mid:reportPage.baseFn.getBarDiff(obj.ability_cls_mid_gra_avg_diff_line),
							avg:reportPage.baseFn.getBarDiff(obj.ability_gra_cls_avg_diff_line)
						}
					}
				}
			};
		},
		getClassDiagnoseAllLine : function(data){
			return obj = {
				class_average_percent:reportPage.baseFn.getValue(data.class_average_percent),
				class_median_percent:reportPage.baseFn.getValue(data.class_median_percent),
				diff_degree:reportPage.baseFn.getValue(data.diff_degree),
				grade_average_percent:reportPage.baseFn.getValue(data.grade_average_percent)
			}
		},
		getClassScaleNumData : function(data){
			return obj = {
				dimesions : reportPage.Class.getClassScaleGradeData(data.class_three_dimesions,['能力-班级','技能-班级','知识-班级']),
				class_knowledge : reportPage.Class.getClassScaleGradeData(data.class_grade_knowledge,['知识-年级','知识-班级']),
				class_skill :reportPage.Class.getClassScaleGradeData(data.class_grade_skill,['技能-年级','技能-班级']),
				class_ability :reportPage.Class.getClassScaleGradeData(data.class_grade_ability,['能力-年级','能力-班级'])
			};
<<<<<<< Updated upstream
=======
			return obj;
		},
		/*获取对象的key数组*/
		getKeys: function(obj) {
			if(obj){
				//return Object.keys(obj);
				return reportPage.baseFn.modifyKey($.map(Object.keys(obj), function(value, index) {
					return [value];
				}));
			}else{
				return [];
			}
		},
		/*获取对象的value数组*/
		getValue: function(obj) {
			if(obj){
				return $.map(obj, function(value, index) {
					return [value];
				});
		    } else {
		    	return [];
		    } 
		},
		/*获取答对题的key数组*/
		getArrayKeys: function(obj) {
			if(obj){
				return reportPage.baseFn.modifyKey($.map(obj, function(value, index) {
					return [value[0]];
				}));
			}else{
				return [];
			}
		},
		/*获取答对题的value数组*/
		getArrayValue: function(obj) {
			if(obj){
				return $.map(obj, function(value, index) {
					return [value[1]];
				});
		    } else {
		    	return [];
		    }
>>>>>>> Stashed changes
		},
		getClassScaleGradeData : function(data,yaxis){
			return obj = {
				yaxis : yaxis ,
				data : reportPage.Class.handleClassScaleData(data),
			};
		},
		handleClassScaleData : function(data){
			var keys = reportPage.baseFn.getKeys(data);
			var values = reportPage.baseFn.getValue(data);
			var excellent = [], good = [],faild = [];
			for(var i = keys.length-1 ; i >=0  ; i--){
				excellent.push({
					name:''+keys[i]+'(得分率 ≥ 85)',
                    value: values[i].excellent_pupil_percent,
                    yAxisIndex:1,
                    itemStyle: {
                      	normal: {
                        	barBorderRadius:[20, 0, 0, 20],
                        	color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                         		offset: 0,
	                          		color: '#086a8e'
                        		}, {
	                          		offset: 1,
	                          		color: '#65026b'
                        	}])
                      	}
                    },
				});
				good.push({
                    name:''+keys[i]+'(60 ≤ 得分率 < 85)',
                    value: values[i].good_pupil_percent,
                    itemStyle: {
                      	normal: {
	                        barBorderRadius:0,
	                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                          	offset: 0,
	                          	color: '#71ecd0'
	                        }, {
	                          	offset: 1,
	                          	color: '#13ab9b'
	                        }])
                      	}
                    },
                });
				faild.push({
                    name:''+keys[i]+'(得分率 < 60)',
                    value:values[i].failed_pupil_percent,
                    itemStyle: {
                      	normal: {
	                        barBorderRadius: [0, 20, 20, 0],
	                        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
	                          	offset: 0,
	                          	color: '#fa8471'
	                        }, {
	                          	offset: 1,
	                          	color: '#f6f1c5'
	                        }])
                      	}
                    },
                });
			};
			return obj = {
				excenllent : excellent ,
				good : good ,
				faild :faild,
			};
		},
		/*针对班级的字段*/
		creatClassValueArr: function(obj) {
			return obj = [obj.cls_average, obj.cls_average_percent, obj.class_median_percent, obj.gra_average_percent, obj.cls_gra_avg_percent_diff, obj.cls_med_gra_avg_percent_diff, obj.diff_degree, obj.full_score]
		},
	},
	Pupil: {
		createReport : function(data){
			var basicData = data.data.basic;
			var pupilNavStr = '<b>学校</b>：<span>'+basicData.school
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>年级</b>：<span>'+basicData.grade
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>班级</b>：<span>'+basicData.classroom
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>姓名</b>：<span>'+basicData.name
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>性别</b>：<span>'+basicData.sex
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>学期</b>：<span>'+basicData.term
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试类型</b>：<span>'+basicData.quiz_type
			    +'&nbsp;|</span>&nbsp;&nbsp;<b>测试日期</b>：<span>'+basicData.quiz_date;

			$('#pupil-top-nav').html(pupilNavStr);
			console.log(data.data);
			var PupilDiagnoseObj = reportPage.Pupil.getPupilDiagnoseData(data.data);
			console.log(PupilDiagnoseObj.knowledge.diff.xaxis);
			console.log(PupilDiagnoseObj.knowledge.diff.yaxis);
			var objArr = [PupilDiagnoseObj.knowledge,PupilDiagnoseObj.skill,PupilDiagnoseObj.ability];
			var nodeArr_radar = ['pupil_knowledge_radar','pupil_skill_radar','pupil_ability_radar'];
			var nodeArr_diff = ['pupil_knowledge_diff','pupil_skill_diff','pupil_ability_diff'];
			for(var i = 0 ; i < objArr.length ; i++){
				var optionRadar = echartOption.getOption.Pupil.setPupilRadarOption(objArr[i]);
				var optionDiff = echartOption.getOption.Pupil.setPupilDiffOption(objArr[i]);
				echartOption.createEchart(optionRadar,nodeArr_radar[i]);
				echartOption.createEchart(optionDiff,nodeArr_diff[i]);
			}
			$('#tab-menu li[data-id]').on('click', function (e) {
				var $dataId = $(e.target).attr('data-id');
				$('#myTabContent div.tab-pane').hide();
				$('#'+$dataId+'').fadeIn();
				$('#tab-menu li[data-id]').each(function(){
					$(this).removeClass('active');
				})
				$(this).addClass('active');
				if($dataId == 'improve-sugg'){
					$('#improve-sugg').html(data.data.quiz_comment);
				}else if($dataId == 'table-data-knowledge'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.knowledge,'pupil');
					$('#knowledge_data_table').html(tableStr);
				}else if($dataId == 'table-data-skill'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.skill,'pupil');
					$('#skill_data_table').html(tableStr);
				}else if($dataId == 'table-data-ability'){
					var tableStr = reportPage.baseFn.getTableStr(data.data.data_table.ability,'pupil');
					$('#ability_data_table').html(tableStr);
				}
			})
		},
		getPupilDiagnoseData : function(data){
			return obj = {
				knowledge : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.knowledge_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.knowledge_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(data.charts.knowledge_pup_gra_avg_diff_line),
						yaxis :	reportPage.baseFn.getBarDiff(data.charts.knowledge_pup_gra_avg_diff_line),
					}
				},
				skill : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.skill_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.skill_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(data.charts.skill_pup_gra_avg_diff_line),
						yaxis :	reportPage.baseFn.getBarDiff(data.charts.skill_pup_gra_avg_diff_line),
					}
				},
				ability : {
					radar : {
						grade : reportPage.Pupil.handlePupilRadarData(data.charts.ability_radar.grade_average),
						pupil : reportPage.Pupil.handlePupilRadarData(data.charts.ability_radar.pupil_average),
					},
					diff : {
						xaxis : reportPage.baseFn.getKeys(data.charts.ability_pup_gra_avg_diff_line),
						yaxis :	reportPage.baseFn.getBarDiff(data.charts.ability_pup_gra_avg_diff_line),
					}
				}
			};
		},
		handlePupilRadarData : function (data){
			var arr1 = reportPage.baseFn.getKeys(data);
			var dataArr1 = [];
			var dataArr2 = [];
			var len = arr1.length;
			for(var i=0 ; i<len ; i++){
				dataArr1.push({name : arr1[i],max : 100});
				dataArr2.push({name : '' , max : 100});
			}
<<<<<<< Updated upstream
			var arr2 = reportPage.baseFn.getValue(data);
			return obj = {
				xaxis : { nullAxis : dataArr2 , xAxis : dataArr1},
				yaxis : { yAxis : arr2}
			}
		},
		/*针对个人的字段*/
		creatPuilValueArr: function(obj) {
//			return obj = [obj.average_percent, obj.gra_average_percent, obj.pup_gra_avg_percent_diff, obj.average, obj.full_score, obj.correct_qzp_count];
			return obj = [obj.average_percent, obj.gra_average_percent, obj.pup_gra_avg_percent_diff, obj.average, obj.full_score];
		}
=======
			return arr;
		},
		extendObj: function(obj_arr){
		  var result = {};
		  var key = "";

          for(var i=0; i < obj_arr.length; i++){
          	$.extend(result, obj_arr[i]);
          }
          return result;
>>>>>>> Stashed changes
		}
	},
}