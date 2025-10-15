// File: vnpay_server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import qs from 'qs';
import { format } from 'date-fns';

const app = express();
const port = 3001; // Cổng riêng cho server này, không đụng tới cổng của Vue

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Thông tin cấu hình VNPay của bạn ---
const vnp_TmnCode = 'B2KJSVEG';
const vnp_HashSecret = '1BVEV6VE0RNMSCR6E5D1WJFWPBBTEZ3W';
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:5173/payment-return'; // URL VNPAY trả về sau khi thanh toán

// Endpoint để frontend gọi và tạo URL thanh toán
app.post('/create_payment_url', (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = format(date, 'yyyyMMddHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    let orderId = req.body.orderId; // Lấy mã đơn hàng từ frontend
    let amount = req.body.amount;
    let bankCode = req.body.bankCode || '';
    
    let orderInfo = req.body.orderDescription || `Thanh toan cho don hang #${orderId}`;
    let orderType = 'billpayment';
    let locale = 'vn';
    let currCode = 'VND';
    
    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': locale,
        'vnp_CurrCode': currCode,
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': orderType,
        'vnp_Amount': amount * 100, // Số tiền nhân 100 theo yêu cầu của VNPay
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate
    };
    if(bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    
    let final_vnp_Url = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    // Trả URL về cho frontend
    res.json({ url: final_vnp_Url });
});

// Hàm sắp xếp các thuộc tính của object
function sortObject(obj) {
	let sorted = {};
	let str = [];
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (let key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

app.listen(port, () => {
    console.log(`[VNPay Server] Đang chạy tại http://localhost:${port}`);
});