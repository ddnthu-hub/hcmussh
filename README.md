# HỆ THỐNG HỖ TRỢ TRA CỨU, ĐỊNH HƯỚNG NGÀNH VÀ DỰ ĐOÁN TUYỂN SINH USSH

Website hỗ trợ thí sinh tìm hiểu thông tin tuyển sinh, tra cứu điểm chuẩn, khám phá ngành học phù hợp và tham khảo khả năng trúng tuyển dựa trên dữ liệu tuyển sinh được sử dụng trong hệ thống.

> **Lưu ý:** Kết quả dự đoán và định hướng chỉ mang tính tham khảo, không thay thế thông báo tuyển sinh chính thức của nhà trường.

---

## Demo

**Website:** https://hcmussh.vercel.app

---

## 1. Giới thiệu

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
```

---

## 2. Các chức năng chính

### 2.1. Tra cứu điểm chuẩn

Cho phép thí sinh tra cứu dữ liệu tuyển sinh theo các tiêu chí như:

* Năm tuyển sinh
* Ngành
* Hệ đào tạo
* Phương thức xét tuyển
* Tổ hợp
* Mức điểm

Kết quả được hiển thị dưới dạng bảng để người dùng dễ dàng so sánh các ngành và chương trình đào tạo.

### 2.2. Định hướng ngành

Chức năng định hướng ngành hỗ trợ người dùng khám phá mức độ phù hợp giữa sở thích, khả năng và đặc điểm cá nhân với các ngành đào tạo trong hệ thống.

Kết quả được sử dụng nhằm cung cấp thông tin tham khảo trong quá trình lựa chọn ngành học.

### 2.3. Dự đoán trúng tuyển

Người dùng có thể nhập các thông tin điểm số để hệ thống tính toán điểm xét tuyển dự kiến và tham khảo khả năng trúng tuyển dựa trên dữ liệu tuyển sinh được sử dụng trong hệ thống.

Kết quả dự đoán không phải là kết quả tuyển sinh chính thức.

### 2.4. Mục tiêu điểm

Chức năng Mục tiêu điểm giúp người dùng trả lời câu hỏi:

> Nếu muốn hướng tới ngành đã chọn, tôi cần đạt khoảng bao nhiêu điểm và hiện tại còn thiếu bao nhiêu điểm?

Chức năng sử dụng điểm chuẩn tham chiếu thực tế để xây dựng mục tiêu.

### 2.5. Phân bố điểm

Trang Phân bố điểm cung cấp thông tin trực quan về điểm của người dùng tham gia hệ thống.

Dữ liệu được xây dựng từ các điểm thực tế được người dùng cung cấp theo cơ chế của hệ thống.

---

## 3. Quy trình sử dụng hệ thống

Quy trình sử dụng website được thiết kế theo hướng:

```text
Tra cứu thông tin tuyển sinh
            ↓
Tra cứu điểm chuẩn
            ↓
Tìm hiểu ngành học
            ↓
Định hướng ngành
            ↓
Nhập điểm cá nhân
            ↓
Dự đoán trúng tuyển
            ↓
Xem mục tiêu điểm
            ↓
Tham khảo phân bố điểm
```

Người dùng có thể lựa chọn từng chức năng tùy theo nhu cầu mà không bắt buộc phải thực hiện toàn bộ quy trình.

---

## 4. Công thức điểm

Tùy phương thức xét tuyển, hệ thống sử dụng các thành phần điểm tương ứng và công thức đã được triển khai trong project.

Các thành phần có thể bao gồm:

* Điểm THPT
* Điểm ĐGNL
* Điểm học bạ
* Thành tích
* Điểm ưu tiên

Các giá trị được chuẩn hóa theo thang điểm tương ứng trước khi tính toán.

Hệ thống sử dụng công thức và trọng số theo logic đã được triển khai trong project, không tự ý tạo công thức tuyển sinh mới.

Hệ thống không tạo điểm chuẩn năm 2027 giả để thay thế dữ liệu chính thức.

---

## 5. Mục tiêu điểm

Mục tiêu điểm giúp người dùng xác định mức điểm cần hướng tới dựa trên điểm chuẩn tham chiếu của ngành đã chọn.

Dữ liệu tham chiếu được ưu tiên lấy từ dữ liệu tuyển sinh năm 2026 đang có trong hệ thống.

### Các lựa chọn mục tiêu

Người dùng có thể lựa chọn:

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

Nếu điểm dự kiến đã đạt mục tiêu:

```text
Bạn đã đạt mức mục tiêu.
```

Điểm chuẩn năm 2026 được sử dụng với vai trò **dữ liệu tham chiếu** cho việc xây dựng mục tiêu năm 2027.

> **Lưu ý:** Điểm chuẩn tham chiếu 2026 không phải là điểm chuẩn chính thức của năm 2027. Chức năng Mục tiêu điểm chỉ mang tính tham khảo và không đảm bảo khả năng trúng tuyển.

---

## 6. Phân bố điểm

Trang Phân bố điểm cung cấp thông tin trực quan về điểm thực tế của người dùng tham gia hệ thống.

Dữ liệu phân bố được xử lý theo thiết bị:

* Mỗi thiết bị chỉ đóng góp một điểm thực tế mới nhất.
* Nếu người dùng thực hiện nhiều lần dự đoán bằng điểm giả định thì các điểm này không được đưa vào phân bố điểm thực tế.
* Điểm giả định không được sử dụng để làm đầy biểu đồ.
* Dữ liệu phân bố được xây dựng từ các điểm thực tế đã được cung cấp theo cơ chế của hệ thống.

Khi chưa đủ dữ liệu:

```text
Chưa có đủ dữ liệu người dùng để xây dựng phân bố điểm.
```

Hệ thống không sử dụng dữ liệu giả để làm đầy biểu đồ.

---

## 7. Quản trị hệ thống

Hệ thống có khu vực quản trị dành cho các tài khoản được phân quyền.

Các vai trò quản trị gồm:

```text
SUPERADMIN
ADMIN
EDITOR
```

Tùy theo vai trò, người dùng có thể được phép thực hiện các thao tác quản trị khác nhau.

Các chức năng quản trị có thể bao gồm:

* Quản lý dữ liệu tuyển sinh
* Quản lý thành viên quản trị
* Theo dõi hoạt động
* Quản lý nội dung hệ thống
* Xem nhật ký hoạt động

Quyền truy cập được kiểm soát thông qua Firebase Authentication và hệ thống phân quyền của project.

---

## 8. Nhật ký hoạt động

Hệ thống ghi nhận các hoạt động quản trị quan trọng để hỗ trợ theo dõi thao tác.

Nhật ký có thể bao gồm:

* Người thực hiện
* Vai trò
* Hành động
* Thời gian
* Nội dung liên quan

Thông tin người thực hiện được đồng bộ với thông tin thành viên quản trị của hệ thống.

---

## 9. Công nghệ sử dụng

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React
* Recharts

### Backend / Database

* Firebase Authentication
* Cloud Firestore
* Firebase Admin SDK cho các API server-side cần thiết

### AI / Dữ liệu

Tùy chức năng được triển khai trong project, hệ thống có thể sử dụng các công cụ xử lý dữ liệu và mô hình để hỗ trợ phân tích.

### Deployment

Website được triển khai trên:

**Vercel**

---

## 10. Dữ liệu

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

Đối với chức năng dự đoán năm 2027, dữ liệu năm 2026 có thể được sử dụng làm dữ liệu lịch sử tham chiếu khi phù hợp.

---

## 11. Bảo mật

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

Các thông tin xác thực và quyền truy cập quản trị phải được bảo vệ và không công khai trong tài liệu hoặc source code.

---

## 12. Chạy project trên máy local

### Yêu cầu

Cần cài đặt:

* Node.js
* npm

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

### Cài đặt dependency

```bash
npm install
```

### Cấu hình môi trường

Tạo file:

```text
.env.local
```

và khai báo các biến môi trường cần thiết cho project.

Không đưa giá trị secret lên GitHub.

### Chạy development

```bash
npm run dev
```

Sau đó mở địa chỉ local mà Vite cung cấp, thông thường:

```text
http://localhost:3000
```

---

## 13. Build project

Để kiểm tra project có thể build production:

```bash
npm run build
```

### Kiểm tra TypeScript

```bash
npm run lint
```

Project sử dụng TypeScript để kiểm tra lỗi mã nguồn.

---

## 14. Cấu trúc project

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

## 15. Các trang chính

Website hiện gồm các khu vực chính:

| Route           | Chức năng            |
| --------------- | -------------------- |
| `/`             | Trang chủ            |
| `/lookup`       | Tra cứu điểm chuẩn   |
| `/orientation`  | Định hướng ngành     |
| `/du-bao`       | Dự đoán trúng tuyển  |
| `/distribution` | Phân bố điểm         |
| `/guide`        | Cẩm nang / hướng dẫn |

Route thực tế có thể thay đổi theo phiên bản triển khai hiện tại của project.

---

## 16. Responsive

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

## 17. Giao diện

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

## 18. Lưu ý về kết quả

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

Đặc biệt, điểm chuẩn tham chiếu năm 2026 được sử dụng để hỗ trợ các chức năng dự đoán và mục tiêu điểm năm 2027 khi phù hợp.

Điểm chuẩn và thông tin tuyển sinh chính thức cần được đối chiếu với thông báo của Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM.

---

## 19. Thông tin đơn vị

**Trường Đại học Khoa học Xã hội và Nhân văn**

**Đại học Quốc gia Thành phố Hồ Chí Minh**

### Cơ sở Sài Gòn

10 - 12 Đinh Tiên Hoàng, P. Sài Gòn, TP. HCM

### Cơ sở Linh Xuân

Khu đô thị ĐHQG-HCM, P. Linh Xuân, TP. HCM

---

## 20. Mục đích xây dựng

Website được xây dựng tập trung vào việc ứng dụng các kiến thức về:

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
