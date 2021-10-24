
let tab_NapThe = require('../../Models/NapThe');
let NhaMang    = require('../../Models/NhaMang');
let MenhGia    = require('../../Models/MenhGia');

let UserInfo   = require('../../Models/UserInfo');

let config     = require('../../../config/thecao');
let request    = require('request');
let validator  = require('validator');

let crypto = require('crypto');

module.exports = function(client, data){
	if (!!data && !!data.nhamang && !!data.menhgia && !!data.mathe && !!data.seri && !!data.captcha) {
		if (!validator.isLength(data.captcha, {min: 4, max: 4})) {
			client.red({notice:{title:'LỖI', text:'Captcha không đúng', load: false}});
		}else if(validator.isEmpty(data.nhamang)) {
			client.red({notice:{title:'LỖI', text:'Vui lòng chọn nhà mạng...', load: false}});
		}else if(validator.isEmpty(data.menhgia)) {
			client.red({notice:{title:'LỖI', text:'Vui lòng chọn mệnh giá thẻ...', load: false}});
		}else if(validator.isEmpty(data.mathe)) {
			client.red({notice:{title:'LỖI', text:'Vui lòng nhập mã thẻ cào...', load: false}});
		}else if(validator.isEmpty(data.seri)) {
			client.red({notice:{title:'LỖI', text:'Vui lòng nhập seri ...', load: false}});
		}else{
			let checkCaptcha = new RegExp('^' + data.captcha + '$', 'i');
				checkCaptcha = checkCaptcha.test(client.captcha);
			if (checkCaptcha) {
				let nhaMang = ''+data.nhamang;
				let menhGia = ''+data.menhgia;
				let maThe   = ''+data.mathe;
				let seri    = ''+data.seri;

				let check1 = NhaMang.findOne({name:nhaMang, nap:true}).exec();
				let check2 = MenhGia.findOne({name:menhGia, nap:true}).exec();

				Promise.all([check1, check2])
				.then(values => {
					if (!!values[0] && !!values[1] && maThe.length > 11 && seri.length > 11) {

						let nhaMang_data = values[0];
						let menhGia_data = values[1];

						tab_NapThe.findOne({'uid':client.UID, 'nhaMang':nhaMang, 'menhGia':menhGia, 'maThe':maThe, 'seri':seri}, function(err, cart){
							if (cart !== null) {
								client.red({notice:{title:'THẤT BẠI', text:'Bạn đã yêu cầu nạp thẻ này trước đây.!!', load: false}});
							}else{
								tab_NapThe.create({'uid':client.UID, 'nhaMang':nhaMang, 'menhGia':menhGia, 'maThe':maThe, 'seri':seri, 'time': new Date()}, function(error, create){
									if (!!create) {
										//client.red({notice:{title:'THÔNG BÁO', text:'Yêu cầu nạp thẻ thành công.!!', load: false}});

										let cID = create._id.toString();
										let sign = config.APP_PASSWORD+maThe+'charging'+config.APP_ID+cID+seri+nhaMang_data.name;
										console.log('sign='+sign);
										sign = crypto.createHash('md5').update(sign).digest('hex');

										request.post({
											url: config.URL,
											form: {
												partner_id: config.APP_ID,
												sign:       sign,
												command:    'charging',
												code:       maThe,
												serial:     seri,
												telco:      nhaMang_data.name,
												amount:     menhGia,
												request_id: cID,
											}
										},
										function(err, httpResponse, body){
											try {
												let data = JSON.parse(body);
												console.log(body);
												if (data['status'] == '1') {
												//if (false) {
													let nhan = menhGia_data.values;
													tab_NapThe.updateOne({'_id':cID}, {$set:{nhan:nhan, status:1}}).exec();
													UserInfo.findOneAndUpdate({'id':client.UID}, {$inc:{red:nhan}}, function(err2, user) {
														client.red({notice:{title:'THÀNH CÔNG', text:'Nạp thẻ thành công...', load: false}, user:{red: user.red*1+nhan}});
													});
												}else if (data['status'] == '99') {
												//}else if (true) {
													// Chờ kết quả tiếp theo
													UserInfo.findOne({'id':client.UID}, 'red name', function(err3, dU){
														if (dU) {
															client.redT.telegram.sendMessage(idNumbertele, dU.name +' gủi yêu cầu NẠP Tiền từ  🐂🐿🐭🍓THẺ CÀO🐂🐿🐭🍓  Mệnh giá : ' + menhGia_data  +" VND", {parse_mode:'markdown', reply_markup:{remove_keyboard: true}});
														}
													});
													client.red({loading:{text: 'Đang chờ sử lý...'}});
												}else{
													tab_NapThe.updateOne({'_id': cID}, {$set:{status:2}}).exec();
													client.red({notice:{title:'THẤT BẠI', text: "Thẻ lỗi ..!  Hãy Xem Lại." , load: false}});
												}
											} catch(e){
												client.red({notice:{title:'THẤT BẠI', text: 'Hệ thống nạp thẻ tạm thời không hoạt động, Vui lòng quay lại sau.!', load: false}});
											}
										});
									
									}else{
										client.red({notice:{title:'BẢO TRÌ', text: 'Hệ thống nạp thẻ tạp thời không hoạt động, vui lòng giữ lại thẻ và quay lại sau.', load: false}});
									}
								});
							}
						});
					}else{
						client.red({notice:{title:'THẤT BẠI', text:'Thẻ nạp không được hỗ trợ.!!', load: false}});
					}
				});
			}else{
				client.red({notice:{title:'NẠP THẺ', text:'Captcha không đúng', load: false}});
			}
		}
	}
	client.c_captcha('chargeCard');
}
