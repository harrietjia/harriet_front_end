$(function(){
	$('.btn').button({
		icons : {
			primary : 'ui-icon-search',
			// secondary : 'ui-icon-triangle-1-s'  字后面
		},
	}).click(function(){
		if($('.search').val()){
			$(location).attr('href', 'question.html');
		}
	});

	$('.question_btn').button({
		icons : {
			primary : 'ui-icon-lightbulb',
		},
	}).click(function(){
		if($.cookie('user')){
			$('#question').dialog('open');
		}else{
			$('#error').dialog('open');
			setTimeout(function(){
				$('#error').dialog('close');
				$('#login').dialog('open');
			},1000);
		}
	});



	$('.search').autocomplete({
			delay : 0,
			autoFocus : true,
			// async :false,

			source : function(request,response){
				var term =request.term;
				var result1 =[];

				//结果第一条是自己输入
				result1.push(term);

				$.ajax({
					url : 'show_title.php',
					type : 'POST',
					data : {
						keywords : $(".search").val(),
					},
					success : 	function(response1,status,xhr){
									var json = $.parseJSON(response1);

									$.each(json, function(index,value){
										result1[index+1] = value.title;
									});

									response(result1);
								},
				});


				// alert(result1.length);
			},


		});




	$.ajax({
		url : 'show_content.php',
		type : 'POST',
		success : function(response,status,xhr){
			var json = $.parseJSON(response);
			var html = '';
			var arr =[];
			var summary = [];
			$.each(json, function(index,value){
				html += '<h4>' +value.user+ '发表于 '+value.date+'</h4>';
				html += '<h3>'+value.title+'</h3>';
				html += '<div class="editor">'+value.content+'</div>';
				html += '<div class="bottom"><span class="comment" data_id="'+value.id+'">'+value.count+'条评论</span><span class="up">收起</span></div><hr noshade="noshade" size="1" /><div class="comment_list"></div>';
			});
			$('.content').append(html);

			$.each($('.editor'),function(index,value){
				arr[index] = $(value).html();
				summary[index] = arr[index].substring(0,200);

				if(summary[index].substring(199,200) == '<'){
					summary[index] = replacePos(summary[index],200,'');
				}

				if(summary[index].substring(198,200) == '</'){
					summary[index] = replacePos(summary[index],200,'');
					summary[index] = replacePos(summary[index],199,'');
				}

				if(arr[index].length > 200){
					summary[index] += '...<span class="down">显示全部</span>';
					$(value).html(summary[index]);
				}

				$('.bottom .up').hide();
			});

			$.each($('.editor'),function(index,value){
				$(this).on('click','.down',function(){
					$('.editor').eq(index).html(arr[index]);
					$(this).hide();
					$('.bottom .up').eq(index).show();
				});
			});

			$.each($('.bottom'),function(index,value){
				$(this).on('click','.up',function(){
					$('.editor').eq(index).html(summary[index]);
					$(this).hide();
					$('.editor .down').eq(index).show();
				});
			});

			$.each($('.bottom'),function(index,value){
				$(this).on('click','.comment',function(){
					var comment_this =this;
					if($.cookie('user')){
						if(!$('.comment_list').eq(index).has('form').length){

							$.ajax({
								url : 'show_comment.php',
								type : 'POST',
								data : {
									titleid : $(comment_this).attr('data_id'),
								},
								beforeSend : function(jqXHR,settings){
									$('.comment_list').eq(index).append('<dl class="comment_load"><dd>正在加载评论</dd></dl>');
								},
								success : function(response,status){
									$('.comment_list').eq(index).find('.comment_load').hide();
									var count = 0;
									var json_comment = $.parseJSON(response);

									$.each(json_comment, function (index2, value) {
										count =value.count;
									$('.comment_list').eq(index).append('<dl class="comment_content"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
									});

									$('.comment_list').eq(index).append('<dl><dd><span class="load_more">加载更多评论</span></dd></dl>');
									var page = 2;

									if (page > count) {
										$('.comment_list').eq(index).find('.load_more').off('click');
										$('.comment_list').eq(index).find('.load_more').hide();
									}

									$('.comment_list').eq(index).find('.load_more').button().on('click', function () {
										$('.comment_list').eq(index).find('.load_more').button('disable');

										$.ajax({
											url : 'show_comment.php',
											type : 'POST',
											data : {
												titleid : $(comment_this).attr('data_id'),
												page : page,
											},

											beforeSend : function (jqXHR, settings) {
												$('.load_more').html('<img src="img/more_load.gif" />');
											},

											success : function (response, status) {
												var json_comment_more = $.parseJSON(response);

												$.each(json_comment_more, function (index3, value) {

													$('.comment_list').eq(index).find('.comment_content').last().after('<dl class="comment_content"><dt>' + value.user + '</dt><dd>' + value.comment + '</dd><dd class="date">' + value.date + '</dd></dl>');
												});

												$('.load_more').html('加载更多评论');

												$('.comment_list').eq(index).find('.load_more').button('enable');
													page++;

												if (page > count) {
													$('.comment_list').eq(index).find('.load_more').off('click');
													$('.comment_list').eq(index).find('.load_more').hide();
												}
										},
									});
								});

									$('.comment_list').eq(index).append('<form><dl class="comment_add"><dt><textarea name="comment"></textarea></dt><dd><input type="hidden" name="titleid" value="'+$(comment_this).attr('data_id')+'" /><input type="hidden" name="user" value="'+$.cookie('user')+'" /><input type="button" value="发表" /></dd></dl></form>');

									$('.comment_list').eq(index).find('input[type=button]').button().click(function(){
										var _this =this;
										$('.comment_list').eq(index).find('form').ajaxSubmit({
											url : 'add_comment.php',
											type : 'POST',
											beforeSubmit : function(){
												$('#loading').dialog('open');
												$(_this).button('disable');
											},

											success : function(responseText,statusText){
												if(responseText){
													$(_this).button('enable');
													$('#loading').css('background','url(img/success.gif) no-repeat 20px center').html('数据新增成功');
													setTimeout(function(){
														$('#loading').dialog('close');

														//提交评论，自动显示
														var date = new Date();
														$('.comment_list').eq(index).prepend('<dl class="comment_content"><dt>' + $.cookie('user') + '</dt><dd>' + $('.comment_list').eq(index).find('textarea').val() + '</dd><dd>' + date.getFullYear() + '-' + (date.getMonth()+ 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' +
														date.getMinutes() + ':' + date.getSeconds() + '</dd></dl>');

														$('#loading').css('background','url(img/loading.gif) no-repeat 20px center').html('数据交互中。。');
														$('.comment_list').eq(index).find('form').resetForm();
													},1000);
												}
											},
										});
									});


								},
							});
						}
						if ($('.comment_list').eq(index).is(':hidden')) {
							$('.comment_list').eq(index).show();
						} else {
							$('.comment_list').eq(index).hide();
						}
					}else{
						$('#error').dialog('open');
						setTimeout(function(){
							$('#error').dialog('close');
							$('#login').dialog('open');
						},1000) ;
					}
				});
			});

			/*以高度来截取内容，不可取
			$.each($('.editor'),function(index,value){
				arr[index] = $(value).height();
				if($(value).height() > 145){
					$(value).next('.bottom').find('.up').hide();
				}

				$(value).height(145);
			});

			$.each($('.bottom .down'),function(index,value){
				$(this).click(function(){
					$(this).parent().prev().height(arr[index]);
					$(this).hide();
					$(this).parent().find('.up').show();
				});
			});

			$.each($('.bottom .up'),function(index,value){
				$(this).click(function(){
					$(this).parent().prev().height(145);
					$(this).hide();
					$(this).parent().find('.down').show();
				});
			});
			*/

		},
	});

	$('#question').dialog({
			autoOpen : false,
			modal : true,
			resizable : false,
			width : 500,
			height : 360,
			buttons : {
				'发布' :function(){
					$(this).ajaxSubmit({
						url : 'add_content.php',
						type : 'POST',
						data : {
							user : $.cookie('user'),
							content : $('.uEditorIframe').contents().find('#iframeBody').html(),
						},
						beforeSubmit : function(){
							$('#loading').dialog('open');
							$('#question').dialog('widget').find('button').eq(1).button('disable');
						},
						success : function(responseText,statusText){

						if(responseText){
							$('#question').dialog('widget').find('button').eq(1).button('enable');
							$('#loading').css('background','url(img/success.gif) no-repeat 20px center').html('数据新增成功');
							setTimeout(function(){
								$('#loading').dialog('close');
								$('#question').dialog('close');
								$('#loading').css('background','url(img/loading.gif) no-repeat 20px center').html('数据交互中。。');
								$('#question').resetForm();
								$('.uEditorIframe').contents().find('#iframeBody').html('请输入问题描述！');
							},1000);
						}

					},
					});
				},
			},
	});

	$('.uEditorCustom').uEditor();

	$('#error').dialog({
		autoOpen :false,
		modal :true,
		closeOnEscape :false,
		resizable : false,
		draggable : false,
		width : 180,
		height : 50,
	}).parent().find('.ui-widget-header').hide();




	// $.cookie('user','ljh1',{
	// 	expires : 7,
	// 	path : '/',
	// });
	// $.cookie('ccc','harriet');

	// alert($.cookie('user'));
	// alert($.cookie().ccc);
	// $.removeCookie('user',{
	// 	path : '/',
	// });

	$('#member,#logout').hide();

	// jQuery中添加自定义或函数方法
	$.cookieFun = function(){
		$('#member,#logout').show();
		$('#reg_a,#login_a').hide();
		$('#member').html($.cookie('user'));
	};


	if($.cookie('user')){
		$.cookieFun();
	}else{
		$('#member,#logout').hide();
		$('#reg_a,#login_a').show();
	}


	$('#logout').click(function(){
		$.removeCookie('user');
		window.location.href = '/jquery/';
	});

	$('#loading').dialog({
		autoOpen :false,
		modal :true,
		closeOnEscape :false,
		resizable : false,
		draggable : false,
		width : 180,
		height : 50,
	}).parent().find('.ui-widget-header').hide();

	$('#reg_a').click(function(){
		$('#reg').dialog('open');
	});


		$('#reg').dialog({
			// title : '会员注册',
			autoOpen : false,
			modal : true,
			resizable : false,
			width : 320,
			height : 340,
			buttons : {
				'提交' :function(){
					$(this).submit();
				},
				'取消' :function(){
					$(this).dialog('close');
				}
			},
			closeText : '关闭',
		}).validate({

			submitHandler : function(form){
				$(form).ajaxSubmit({
					url : 'add.php',
					type : 'POST',

					beforeSubmit : function(formData,jqForm,options){
						$('#loading').dialog('open');
						$('#reg').dialog('widget').find('button').eq(1).button('disable');
					},

					success : function(responseText,statusText){

						if(responseText){
							$('#reg').dialog('widget').find('button').eq(1).button('enable');
							$('#loading').css('background','url(img/success.gif) no-repeat 20px center').html('数据新增成功');
							$.cookie('user',$('#user').val());
							setTimeout(function(){
								$('#loading').dialog('close');
								$('#reg').dialog('close');
								$('#loading').css('background','url(img/loading.gif) no-repeat 20px center').html('数据交互中。。');
								$('#reg').resetForm();
								$('#reg span.star').html('*').removeClass('success');
								$.cookieFun();
							},1000);
						}

					},

				});
			},

			showErrors : function(errorMap,errorList){
				//获取错误个数
				var  errors=this.numberOfInvalids();

				if(errors > 0){
					$('#reg').dialog('option','height', errors*20+340);
				}else{
					$('#reg').dialog('option','height',340);
				}

				this.defaultShowErrors();
			},

			highlight : function(element, errorClass){
				$(element).css('border','1px solid #630');
				$(element).parent().find('span').html('*').removeClass('success');
			},

			unhighlight : function(element,errorClass){
				$(element).css('border','1px solid #ccc');
				$(element).parent().find('span').html('&nbsp;').addClass('success');
			},

			errorLabelContainer : 'ol.reg_error',
			wrapper : 'li',

			rules : {
				user : {
					required : true,
					minlength : 2,
					remote :{
						url : 'is_user.php',
						type : 'POST',
					},
				},
				password : {
					required : true,
					minlength : 6,
				},
				email : {
					required : true,
					email : true,
				},
			},
			messages : {
				user :{
					required : '帐号不能为空',
					minlength : jQuery.format('帐号不能少于{0}位数'),
					remote : '帐号被占用了',
				},
				password : {
					required : '密码不能为空',
					minLength : jQuery.format('密码不能少于{0}位数'),
				},
				email : {
					required : '邮箱不能为空',
					email : '请输入正确的邮箱地址',
				},
			},
		});



		$('#reg input[type=radio]').button();
		// $('#reg').buttonset();



		$('#birthday').datepicker({
			// dateFormat : 'yy-MM-DD',
			// showWeek : true,
			// weekHeader : 'wk',
			// appendText : 'datepicker',
			// monthNames : ['一月','二月','third','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
			// firstDay : 2,
			// altField : '#abc',
			// altFormat : 'dd/mm/yy',


			// numberOfMonths : [3,2],
			// showOtherMonths : true,
			// selectOtherMonths : true,
			// changeMonth : true,
			// changeYear : true,
			// showButtonPanel: true,
			// closeText : 'close',
			// currentText : '今天dd',
			// navigationAsDateFormat : true,
			// yearSuffix : '年份',
			// showMonthAfterYear: true,

			// maxDate : 0,
			// yearRange: '1950:2020',
			// minDate : -10000,
			// maxDate : 0, //可以用 new Date(2007,1,1)
			// defaultDate : -1, //可以用'1m+3'
			// hideIfNoPrevNext : true,
			// gotoCurrent : false,

			showAnim : 'clip',
			duration : 300,

			beforeShowDay : function (date) {
				if (date.getDate() == 1) {
					return [false,'a','不能选择'];
				} else {
					return [true];
				}
			},

		});

		// alert($('#birthday').datepicker('getDate'));
		// $('#birthday').datepicker('setDate', '2018-04-03');

		// $('#reg input[title]').tooltip();



		$('#reg input[title]').tooltip({		//提示
			// disabled : true,
			// content : 'change',
			// items :'input',  过滤功能
			// tooltopClass : 'a'，  引入class a 的css样式
			position : {
				my : 'left center',
				at : 'right+5 center'
			},
			show : false,
			hide : false,
			// create : function(e,ui){
			// 	alert('message');
			// },
		});

		// $('#password').tooltip('option','content','提示内容');

		// on 方法
		// $('#user').on('tooltipopen',function(){
		// 	alert('message');
		// });

		// var host = ['affs','ffdgd','bks','afsv'];



		$('#email').autocomplete({
			delay : 0,
			autoFocus : true,
			source : function(request,response){
				//获取用户输入的内容
				// alert(request.term);
				//绑定数据源
				// response(['aa','aaaa','aaaaaa','bb']);

				var hosts = ['qq.com','163.com','263.com','sina.com','gmail.com'],
				 term =request.term,
				 name =term,
				 host ='',
				 ix =term.indexOf('@'),
				 result =[];

				//结果第一条是自己输入
				result.push(term);

				 if(ix > -1){
				 	name =term.slice(0,ix);
				 	host =term.slice(ix + 1);
				 }

				 if (name) {
				 	var findedHosts =[];

				 	if(host){
				 		findedHosts = $.grep(hosts,function(value,index){
				 			return value.indexOf(host) > -1
				 		});
				 	}else{
				 		findedHosts = hosts;
				 	}

				 	var findedResult = $.map(findedHosts, function(value,index){
				 		return name + '@' +value;
				 	});

				 	result = result.concat(findedResult);
				 }

				 response(result);

			},
			// minLength : 2,
			// delay : 50,
			// autoFocus : true,  第一项自动选定
			// focus : function(e,ui){
			// 	alert(ui.item.label);
			// 	ui.item.value = 123;
			// },
			// change : function (e, ui) {
			// 	alert('change');
			// },
			// search : function (e, ui) {
			// 	alert('s');
			// },
			// response : function(e,ui){
			// 	alert('搜索完毕！');
			// 	alert(ui.content[0].value);
			// }
		});

		// $('#email').autocomplete('search', 'a');

		$('#login_a').click(function(){
			$('#login').dialog('open');
		});

		$('#login').dialog({
			autoOpen : false,
			width :320,
			height : 240,
			resizable : false,
			modal : true,
			buttons : {
				'登录' :function(){
					$(this).submit();
				},
			},
			closeText : '关闭',
		}).validate({

			submitHandler : function(form){
				$(form).ajaxSubmit({
					url : 'login.php',
					type : 'POST',

					beforeSubmit : function(formData,jqForm,options){
						$('#loading').dialog('open');
						$('#login').dialog('widget').find('button').eq(1).button('disable');
					},

					success : function(responseText,statusText){

						if(responseText){
							$('#login').dialog('widget').find('button').eq(1).button('enable');
							$('#loading').css('background','url(img/success.gif) no-repeat 20px center').html('登录成功');
							if($('#expires').is(':checked')){
								$.cookie('user',$('#login_user').val(),{
									expires : 7,
								});
							}else{
								$.cookie('user',$('#login_user').val());
							}

							setTimeout(function(){
								$('#loading').dialog('close');
								$('#login').dialog('close');
								$('#loading').css('background','url(img/loading.gif) no-repeat 20px center').html('数据交互中。。');
								$('#login').resetForm();
								$('#login span.star').html('*').removeClass('success');
								$.cookieFun();
							},1000);
						}

					},

				});
			},

			showErrors : function(errorMap,errorList){
				//获取错误个数
				var  errors=this.numberOfInvalids();

				if(errors > 0){
					$('#login').dialog('option','height', errors*20+240);
				}else{
					$('#login').dialog('option','height',240);
				}

				this.defaultShowErrors();
			},

			highlight : function(element, errorClass){
				$(element).css('border','1px solid #630');
				$(element).parent().find('span').html('*').removeClass('success');
			},

			unhighlight : function(element,errorClass){
				$(element).css('border','1px solid #ccc');
				$(element).parent().find('span').html('&nbsp;').addClass('success');
			},

			errorLabelContainer : 'ol.login_error',
			wrapper : 'li',

			rules : {
				login_user : {
					required : true,
					minlength : 2,

				},
				login_password : {
					required : true,
					minlength : 6,
					remote : {
						url : 'login.php',
						type : 'POST',
						data : {
							login_user : function(){
								return $('#login_user').val();
							},
						},
					},
				},

			},
			messages : {
				login_user :{
					required : '帐号不能为空',
					minlength : jQuery.format('帐号不能少于{0}位数'),

				},
				login_password : {
					required : '密码不能为空',
					minLength : jQuery.format('密码不能少于{0}位数'),
					remote : '帐号或密码不正确',
				},

			},
		});

		$('#tabs').tabs({
			collapsible : true,
			// disabled : [0],
			// event : 'mouseover',
			// active : false,
			// heightStyle : 'auto',
			// hide : true,
			// show : true,

			// create : function (event, ui) {
			// 	alert($(ui.tab.get()).html());
			// 	alert($(ui.panel.get()).html());
			// },

			// activate : function(event,ui){
			// 	alert('切换到另一个tab后触发');
			// 	alert($(ui.oldTab.get()).html());
			// 	alert($(ui.oldPanel.get()).html());
			// 	alert($(ui.newTab.get()).html());
			// 	alert($(ui.newPanel.get()).html());
			// },

			// beforeActivate : function(event,ui){
			// 	// alert('切换前');
			// 	alert($(ui.oldTab.get()).html());
			// },

			// load : function (event, ui) {
			// 	// alert('ajax 加载后触发！');
			// 	alert($(ui.tab.get()).html());
			// 	alert($(ui.panel.get()).html());
			// },

			// beforeLoad : function (event, ui) {
			// 	ui.ajaxSettings.url = 'tab2.html';

			// 	ui.jqXHR.success(function (responseText) {
			// 		alert(responseText);
			// 	});
			// },

		});

		// $('#btn1').click(function(){
		// 	$('#tabs').tabs('load',0);
		// });


		$('#accordion').accordion({
			collapsible : true,
			// active : 1,
			// active : false,
			heightStyle : 'content',
			header : 'h3',
			icons: {
			"header": "ui-icon-plus",
			"activeHeader": "ui-icon-minus",
			},
		});


		function replacePos(strObj,pos,replaceText){
			return strObj.substring(0,pos-1) + replaceText + strObj.substr(pos,strObj.length);
		}


});
