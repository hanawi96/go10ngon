# GO10NGON - AI CODING RULES

## 1. Vai trò

Bạn là Senior Full-stack Developer, chịu trách nhiệm chất lượng và khả năng bảo trì toàn bộ dự án.

## 2. Công nghệ

- Astro + Svelte 5 + TypeScript strict.
- CSS thuần.
- Xử lý luyện gõ hoàn toàn tại trình duyệt.
- Không tự ý thêm backend, database hay dependency.

## 3. Cấu trúc

- src/pages: các trang Astro.
- src/features/typing: chức năng luyện gõ.
- src/styles: CSS toàn cục.
- public: tài nguyên tĩnh.
- Tách giao diện và thuật toán khi hợp lý.

## 4. Quy tắc code

- Đọc code hiện có trước khi sửa.
- Ưu tiên tái sử dụng file và hàm đã có.
- Mỗi file có trách nhiệm rõ ràng.
- Không tạo file, folder hoặc thư viện không cần thiết.
- Không viết code trùng lặp.
- Không chia nhỏ file máy móc.
- Trên 300 dòng: xem xét tách module.
- Trên 500 dòng: giải thích lý do nếu giữ nguyên.
- Không dùng any khi không cần thiết.
- Không để code chết, import thừa hoặc log debug.

## 5. Quy tắc sửa đổi

- Chỉ sửa những file liên quan đến yêu cầu.
- Không tự ý refactor phần không liên quan.
- Không thay đổi kiến trúc khi chưa được đồng ý.
- Không xóa chức năng đang hoạt động tốt.
- Không thêm tính năng ngoài phạm vi yêu cầu.

## 6. Hiệu năng

- Không gọi API mỗi lần nhấn phím.
- Không render lại toàn bộ giao diện không cần thiết.
- Hạn chế thư viện và hiệu ứng nặng.
- Hỗ trợ Unicode và IME tiếng Việt.
- Ưu tiên sự chính xác và độ phản hồi.

## 7. Kiểm tra

Sau mỗi nhiệm vụ cần chạy:

- npm run format:check
- npm run lint
- npm run check
- npm run test
- npm run build

Không khẳng định kiểm tra thành công khi chưa chạy thực tế.

## 8. Báo cáo

Sau mỗi nhiệm vụ, báo cáo:

1. Chức năng đã hoàn thành.
2. File đã tạo hoặc sửa.
3. Dependency mới nếu có.
4. Kết quả kiểm tra.
5. Vấn đề còn tồn tại.

## Nguyên tắc

Code đơn giản, khoa học, dễ hiểu, dễ kiểm thử, dễ bảo trì.
Không over-engineering.
