$(function(){


	$('.focus_question').button();
	$('.write_answer').button();

	$.ajax({
		url : 'show_test.php',
		type : 'POST',
		data : {
			titleid : '15',
		},
		success : function(response,status,xhr){
			var json = $.parseJSON(response);
			var html = '';
			var arr =[];
			var summary = [];
			$.each(json, function(index,value){
				html += '<div class="main_left_bottom"><span id="ques_comment">'+value.count+'条评论 </span><span >感谢</span><span >收藏</span></div><hr noshade="noshade" size="1" /><div class="comment_list"></div>';
			});
			$('.main_left_content').append(html);

			$.each($('.main_left_bottom'),function(index,value){
				$(this).on('click','#ques_comment',function(){
					var comment_this =this;
					if($.cookie('user')){
						if(!$('.comment_list').eq(index).has('form').length){

							$.ajax({
								url : 'show_comment.php',
								type : 'POST',
								data : {
									titleid : '15',
								},

								success : function(response,status){
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
												titleid : '15',
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

		},
	});





});
