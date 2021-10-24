
let Bank         = require('../../../Models/Bank/Bank');
let Bank_history = require('../../../Models/Bank/Bank_history');

let validator    = require('validator');
var Helpers    = require('../../../Helpers/Helpers');
var UserInfo     = require('../../../Models/UserInfo');

module.exports = function(client, data){
	if (!!data.bank && !!data.name) {
		let hinhthuc = data.hinhthuc>>0;
		let money    = data.money>>0;
		if (hinhthuc < 1 && hinhthuc > 3) {
			client.red({notice: {title:'LỖI', text: 'Vui lòng chọn đúng hình thức nạp...'}});
		} else if (!validator.isLength(data.bank, {min: 4, max: 17})) {
			client.red({notice: {title:'LỖI', text: 'Ngân hàng không hợp lệ...'}});
		}else if (money < 100000) {
			client.red({notice: {title:'LỖI', text: 'Nạp tối thiểu 200.000, tối đa 1.000.000.000'}});
		}else if (!validator.isLength(data.name, {min: 6, max: 32})) {
			client.red({notice: {title:'LỖI', text: 'Họ tên không hợp nên...'}});
		}else{
			if(data.bank == "MOMO" ){
				if (hinhthuc === 1) {
						if (!!data.khop) {
								Bank_history.create({uid:client.UID, bank:data.bank, number:'MOMO', name:data.name, info:data.khop, hinhthuc:hinhthuc, money:money, time:new Date()});
								client.red({notice: {title:'THÀNH CÔNG', text: 'Gửi yêu cầu nạp MOMO thành công...'}});
								UserInfo.findOne({'id':client.UID}, 'red name', function(err3, dU){
						if (dU) {
							client.redT.telegram.sendMessage(idNumbertele, dU.name +' gủi yêu cầu NẠP Tiền từ  😈🎁🌽MOMO😈🎁🌽 : ' + Helpers.numberWithCommas(money)  +" VND", {parse_mode:'markdown', reply_markup:{remove_keyboard: true}});
						}
					});
						}else{
							client.red({notice: {title:'LỖI', text: 'Dữ liệu không đúng.'}});
							return void 0;
						}
					}
			}else{
				console.log("bank");
				Bank.findOne({number:data.bank}, '', function(err, bank){
				if (!!bank) {
					if (hinhthuc === 1) {
						if (!!data.khop) {
							Bank_history.create({uid:client.UID, bank:bank.bank, number:bank.number, name:data.name, info:data.khop, hinhthuc:hinhthuc, money:money, time:new Date()});
						}else{
							client.red({notice: {title:'LỖI', text: 'Dữ liệu không đúng.'}});
							return void 0;
						}
					}else if (hinhthuc === 2) {
						if (!!data.stk) {
							Bank_history.create({uid:client.UID, bank:bank.bank, number:bank.number, name:data.name, branch:data.stk, hinhthuc:hinhthuc, money:money, time:new Date()});
						}else{
							client.red({notice: {title:'LỖI', text: 'Dữ liệu không đúng.'}});
							return void 0;
						}
					}else if (hinhthuc === 3) {
						if (!!data.namego) {
							Bank_history.create({uid:client.UID, bank:bank.bank, number:bank.number, name:data.name, namego:data.namego, hinhthuc:hinhthuc, money:money, time:new Date()});
						}else{
							client.red({notice: {title:'LỖI', text: 'Dữ liệu không đúng.'}});
							return void 0;
						}
					}
					client.red({notice: {title:'THÀNH CÔNG', text: 'Gửi yêu cầu nạp thành công...'}});
					UserInfo.findOne({'id':client.UID}, 'red name', function(err3, dU){
						if (dU) {
							client.redT.telegram.sendMessage(idNumbertele, dU.name +' gủi yêu cầu NẠP Tiền từ  😍❣️❣️🏵️  BANK 😍❣️❣️🏵️: ' + Helpers.numberWithCommas(money)  +" VND", {parse_mode:'markdown', reply_markup:{remove_keyboard: true}});
						}
					});
				}else{
					client.red({notice: {title:'LỖI', text: 'Ngân hàng không tồn tại...'}});
				}
			});
			}
			
		}
	}
}
