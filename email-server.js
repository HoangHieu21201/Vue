// File: email-server.js (Phiên bản đã sửa lỗi)
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3002;

app.use(cors());

// >> SỬA LỖI: Tăng giới hạn payload cho body-parser
// Các dòng này cho phép server nhận được các gói dữ liệu lớn hơn (lên tới 10MB)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


// Cấu hình transporter cho Nodemailer (Sử dụng Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'figurecollector212@gmail.com', // Email của bạn
        pass: 'umha pivu mxau hxme'       // Mật khẩu ứng dụng của bạn
    }
});

const ADMIN_EMAIL = 'hieuhtpk04060@gmail.com';

// Hàm tạo nội dung email HTML cho khách hàng
const createCustomerEmailHtml = (order) => {
    let itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.name}</td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">${(item.discount).toLocaleString('vi-VN')} ₫</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #333;">Xác nhận đơn hàng #${order.id}</h2>
            <p>Chào ${order.customerInfo.name},</p>
            <p>Cảm ơn bạn đã đặt hàng tại FigureCollector. Đơn hàng của bạn đã được nhận và đang chờ xử lý.</p>
            
            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Chi tiết đơn hàng</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f8f8;">
                        <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: center;">Số lượng</th>
                        <th style="padding: 10px; text-align: right;">Giá</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <p style="text-align: right; margin-top: 20px; font-size: 18px;">
                <strong>Tổng cộng: <span style="color: #d9534f;">${order.total.toLocaleString('vi-VN')} ₫</span></strong>
            </p>

            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Thông tin giao hàng</h3>
            <p><strong>Địa chỉ:</strong> ${order.customerInfo.address}</p>
            <p><strong>Số điện thoại:</strong> ${order.customerInfo.phone}</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">Cảm ơn bạn đã tin tưởng và mua sắm!</p>
        </div>
    `;
};

// Hàm tạo nội dung email cho admin
const createAdminEmailHtml = (order) => {
    let customerEmail = createCustomerEmailHtml(order);
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #d9534f; padding: 20px;">
            <h2 style="color: #d9534f;">🔔 Thông báo đơn hàng mới #${order.id}</h2>
            <p>Một đơn hàng mới vừa được tạo trên hệ thống.</p>
            ${customerEmail}
        </div>
    `;
};

// Endpoint để nhận dữ liệu đơn hàng và gửi email
app.post('/send-order-email', async (req, res) => {
    const order = req.body;

    if (!order || !order.id) {
        return res.status(400).send('Dữ liệu đơn hàng không hợp lệ.');
    }

    try {
        // Gửi email cho khách hàng
        const customerMailOptions = {
            from: '"FigureCollector" <figurecollector212@gmail.com>',
            to: order.customerInfo.email,
            subject: `✅ Xác nhận đơn hàng #${order.id} từ FigureCollector`,
            html: createCustomerEmailHtml(order)
        };
        await transporter.sendMail(customerMailOptions);
        console.log(`Email xác nhận đã gửi tới: ${order.customerInfo.email}`);
        
        // Gửi email cho admin
        const adminMailOptions = {
            from: '"Thông Báo Hệ Thống" <figurecollector212@gmail.com>',
            to: ADMIN_EMAIL,
            subject: `🔔 Có đơn hàng mới #${order.id}`,
            html: createAdminEmailHtml(order)
        };
        await transporter.sendMail(adminMailOptions);
        console.log(`Email thông báo đã gửi tới admin: ${ADMIN_EMAIL}`);

        res.status(200).send('Emails đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).send('Đã có lỗi xảy ra khi gửi email.');
    }
});

app.listen(PORT, () => {
    console.log(`Email server đang chạy tại http://localhost:${PORT}`);
});