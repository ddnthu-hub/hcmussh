# HỆ THỐNG HỖ TRỢ TRA CỨU, ĐỊNH HƯỚNG NGÀNH VÀ DỰ ĐOÁN TUYỂN SINH USSH

Website hỗ trợ thí sinh tìm hiểu thông tin tuyển sinh, tra cứu điểm chuẩn, khám phá ngành học phù hợp và tham khảo khả năng trúng tuyển dựa trên dữ liệu tuyển sinh được sử dụng trong hệ thống.

> **Lưu ý:** Kết quả dự đoán và định hướng chỉ mang tính tham khảo, không thay thế thông báo tuyển sinh chính thức của nhà trường.

---

## 🌐 Demo

**Website:** https://hcmussh.vercel.app

---

## Giới thiệu

Hệ thống được xây dựng nhằm hỗ trợ thí sinh trong quá trình tìm hiểu và lựa chọn ngành học tại:

**Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh (USSH – ĐHQG-HCM).**

Website tập trung vào việc cung cấp một quy trình tra cứu và tham khảo tuyển sinh theo hướng trực quan:

```text
Tìm hiểu thông tin
        ↓
Tra cứu điểm chuẩn
        ↓
Định hướng ngành học
        ↓
Nhập điểm / dự đoán
        ↓
Xem mục tiêu điểm
        ↓
Tham khảo phân bố điểm
## Năm dự đoán

Hệ thống hiện sử dụng:

```text
Năm dự đoán: 2027
```

Dữ liệu tuyển sinh năm 2026 được sử dụng làm dữ liệu tham chiếu khi phù hợp.

Điểm tham chiếu 2026 **không được xem là điểm chuẩn chính thức của năm 2027**.

---

## Công thức điểm

Tùy phương thức xét tuyển, hệ thống sử dụng các thành phần điểm tương ứng và công thức đã được triển khai trong project.

Các thành phần có thể bao gồm:

* Điểm THPT
* Điểm ĐGNL
* Điểm học bạ
* Thành tích
* Điểm ưu tiên

Các giá trị được chuẩn hóa theo thang điểm tương ứng trước khi tính toán.

Hệ thống không tạo điểm chuẩn 2027 giả để thay thế dữ liệu chính thức.

---

# 5. Mục tiêu điểm

Mục tiêu điểm giúp người dùng trả lời:

> Nếu muốn hướng tới ngành đã chọn, tôi cần đạt khoảng bao nhiêu điểm và hiện tại còn thiếu bao nhiêu điểm?

Chức năng sử dụng điểm chuẩn tham chiếu thực tế để xây dựng mục tiêu.

Người dùng có thể chọn:

* Theo điểm chuẩn tham chiếu
* Cao hơn 0.5 điểm
* Cao hơn 1.0 điểm
* Cao hơn 1.5 điểm
* Cao hơn 2.0 điểm
* Tự nhập mục tiêu

Ví dụ:

```text
Điểm chuẩn tham chiếu 2026: 26.50

Mục tiêu: 27.50

Điểm xét tuyển dự kiến: 25.80

Còn thiếu: 1.70 điểm
```

Nếu điểm dự kiến đã đạt mục tiêu, hệ thống thông báo:

```text
Bạn đã đạt mức mục tiêu.
```

Chức năng này chỉ mang tính tham khảo và không đảm bảo khả năng trúng tuyển.

---

# 6. Phân bố điểm

Trang Phân bố điểm cung cấp thông tin trực quan về điểm của người dùng tham gia hệ thống.

Dữ liệu được xây dựng từ các điểm thực tế được người dùng cung cấp theo cơ chế của hệ thống.

Mỗi thiết bị chỉ đóng góp một điểm thực tế mới nhất vào phân bố.

Các điểm giả định không được đưa vào dữ liệu phân bố điểm thực tế.

Khi chưa đủ dữ liệu:

```text
Chưa có đủ dữ liệu người dùng để xây dựng phân bố điểm.
```

Hệ thống không sử dụng dữ liệu giả để làm đầy biểu đồ.

---

# 7. Quản trị hệ thống

Hệ thống có khu vực quản trị dành cho các tài khoản quản trị được phân quyền.

Các vai trò gồm:

```text
SUPERADMIN
ADMIN
EDITOR
```

Tùy vai trò, người dùng có thể được phép thực hiện các thao tác quản trị khác nhau.

Các chức năng quản trị có thể bao gồm:

* Quản lý dữ liệu tuyển sinh
* Quản lý thành viên quản trị
* Theo dõi hoạt động
* Quản lý nội dung hệ thống
* Xem nhật ký hoạt động

Quyền truy cập được kiểm soát thông qua Firebase Authentication và hệ thống phân quyền của project.

---

# 8. Nhật ký hoạt động

Hệ thống ghi nhận các hoạt động quản trị quan trọng để hỗ trợ theo dõi thao tác.

Nhật ký có thể bao gồm:

* Người thực hiện
* Vai trò
* Hành động
* Thời gian
* Nội dung liên quan

Thông tin người thực hiện được đồng bộ với thông tin thành viên quản trị của hệ thống.

---

# 9. Công nghệ sử dụng

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Recharts

## Backend / Database

* Firebase Authentication
* Cloud Firestore
* Firebase Admin SDK cho các API server-side cần thiết

## AI / dữ liệu

Tùy chức năng được triển khai trong project, hệ thống có thể sử dụng các công cụ xử lý dữ liệu và mô hình để hỗ trợ phân tích.

## Deployment

Website được triển khai trên:

**Vercel**

---

# 10. Dữ liệu

Dữ liệu tuyển sinh được lưu trữ và truy xuất thông qua Cloud Firestore.

Các thông tin tuyển sinh được sử dụng trong hệ thống có thể bao gồm:

* Mã ngành
* Tên ngành
* Hệ đào tạo
* Phương thức xét tuyển
* Năm tuyển sinh
* Tổ hợp
* Điểm chuẩn
* Điểm sàn
* Thông tin ưu tiên và đối tượng nếu có trong dữ liệu

Hệ thống chỉ sử dụng dữ liệu có trong nguồn dữ liệu được cấu hình.

Không tự tạo điểm chuẩn chính thức cho các năm chưa có dữ liệu.

---

# 11. Bảo mật

Các thông tin nhạy cảm không được đưa vào source code công khai.

Các biến môi trường được sử dụng cho project được cấu hình thông qua file môi trường local hoặc Environment Variables của Vercel.

Ví dụ:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_AUTH_DOMAIN=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

RESEND_API_KEY=
```

> **Không commit các secret như Firebase Private Key, Resend API Key hoặc mật khẩu tài khoản vào repository.**

---

# 12. Chạy project trên máy local

## Yêu cầu

Cần cài đặt:

* Node.js
* npm

Kiểm tra:

```bash
node -v
npm -v
```

## Cài đặt dependency

```bash
npm install
```

## Cấu hình môi trường

Tạo file:

```text
.env.local
```

và khai báo các biến môi trường cần thiết cho project.

Không đưa giá trị secret lên GitHub.

## Chạy development

```bash
npm run dev
```

Sau đó mở địa chỉ local mà Vite cung cấp, thông thường:

```text
http://localhost:3000
```

---

# 13. Build project

Để kiểm tra project có thể build production:

```bash
npm run build
```

## Kiểm tra TypeScript

```bash
npm run lint
```

Project sử dụng TypeScript để kiểm tra lỗi mã nguồn.

---

# 14. Cấu trúc project

Cấu trúc thực tế có thể thay đổi theo phiên bản hiện tại của project.

Các khu vực chính gồm:

```text
src/
├── components/
├── pages/
├── lib/
├── types/
├── styles.css
└── ...
```

Các nhóm chức năng chính được tổ chức theo component/page và các module xử lý dữ liệu.

Không nên thay đổi kiến trúc hoặc xóa file chỉ dựa trên tên file; cần kiểm tra dependency và nơi sử dụng trước khi chỉnh sửa.

---

# 15. Các trang chính

Website hiện gồm các khu vực chính:

| Route           | Chức năng            |
| --------------- | -------------------- |
| `/`             | Trang chủ            |
| `/lookup`       | Tra cứu điểm chuẩn   |
| `/orientation`  | Định hướng ngành     |
| `/du-bao`       | Dự đoán trúng tuyển  |
| `/distribution` | Phân bố điểm         |
| `/guide`        | Cẩm nang / hướng dẫn |

> Route thực tế có thể thay đổi theo phiên bản triển khai hiện tại của project.

---

# 16. Responsive

Website được thiết kế để sử dụng trên nhiều kích thước màn hình:

```text
Desktop
Laptop
Tablet
Mobile
```

Các kích thước kiểm tra quan trọng:

```text
1366 × 768
1280 × 720
1024 × 768
768 × 1024
390 × 844
```

Mục tiêu là đảm bảo:

* Không xuất hiện horizontal scrollbar không cần thiết
* Nội dung không bị cắt
* Bộ lọc dễ sử dụng
* Bảng dữ liệu có khả năng hiển thị phù hợp
* Button và input không bị tràn
* Nội dung tiếng Việt hiển thị chính xác

---

# 17. Giao diện

Giao diện sử dụng hệ màu nhận diện USSH theo hướng:

```text
Navy
Burgundy
White
Dark Text
```

Mục tiêu thiết kế:

```text
Academic
Modern
Clean
Professional
```

Giao diện ưu tiên nền sáng và sử dụng màu thương hiệu làm điểm nhấn để giữ khả năng đọc và phân cấp thông tin.

---

# 18. Lưu ý về kết quả

Các chức năng:

* Định hướng ngành
* Dự đoán trúng tuyển
* Mục tiêu điểm
* Phân bố điểm

được xây dựng nhằm hỗ trợ tham khảo.

Kết quả không phải là:

```text
Điểm chuẩn chính thức
Xác suất tuyển sinh chính thức
Cam kết trúng tuyển
```

Điểm chuẩn và thông tin tuyển sinh chính thức cần được đối chiếu với thông báo của Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM.

---

# 19. Thông tin đơn vị

**Trường Đại học Khoa học Xã hội và Nhân văn**
**Đại học Quốc gia Thành phố Hồ Chí Minh**

### Cơ sở Sài Gòn

10 - 12 Đinh Tiên Hoàng, P. Sài Gòn, TP. HCM

### Cơ sở Linh Xuân

Khu đô thị ĐHQG-HCM, P. Linh Xuân, TP. HCM

# 20. Mục đích xây dựng

Website được xây dựng tập trung vào việc ứng dụng kiến thức về:

* Phân tích dữ liệu
* Phát triển ứng dụng web
* Cơ sở dữ liệu
* Trực quan hóa dữ liệu
* Xử lý dữ liệu tuyển sinh
* Phân tích và dự đoán
* Thiết kế giao diện người dùng

Sản phẩm hướng tới việc xây dựng một công cụ hỗ trợ thí sinh tiếp cận dữ liệu tuyển sinh theo cách trực quan và thuận tiện hơn.

---

## Bản quyền

© 2026 Bản quyền thuộc về Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia Thành phố Hồ Chí Minh

```
```
