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

## 9. DESIGN SYSTEM - QUY TẮC BẮT BUỘC

- Sử dụng **Vanilla CSS (CSS thuần)**, không tự ý thêm CSS Framework.
- Toàn bộ màu sắc dùng chung phải được khai báo và quản lý tập trung tại `src/styles/global.css`.
- Tất cả component phải sử dụng **CSS Variables** từ Design System để đảm bảo tính đồng bộ.
- Không viết trực tiếp (hardcode) mã màu HEX, RGB hoặc HSL trong từng component.
- Màu thương hiệu sử dụng biến `--color-primary`.
- Màu nền sử dụng các biến `--color-background` và `--color-surface`.
- Màu chữ sử dụng các biến `--color-text`, `--color-text-secondary` và `--color-text-muted`.
- Màu trạng thái sử dụng `--color-success` cho trạng thái đúng/thành công và `--color-error` cho trạng thái sai/lỗi.
- Các thuộc tính **border-radius, spacing và transition** phải ưu tiên sử dụng biến CSS chung đã được định nghĩa.
- Không tạo thêm biến CSS trùng lặp nếu các biến hiện có đã đáp ứng được yêu cầu.
- Không tự ý thay đổi bảng màu thương hiệu khi phát triển hoặc bổ sung tính năng mới.
- Nếu cần bổ sung Design Token mới, phải khai báo tại `global.css` và giải thích rõ lý do.
- CSS riêng của từng component phải được viết trong thẻ `<style>` của file `.svelte`, tận dụng cơ chế **Scoped CSS** của Svelte.
- Không tự ý tạo file CSS riêng cho từng component nếu không thực sự cần thiết.
- Không đưa CSS đặc thù của một component vào `global.css`.
- Không cài đặt thêm thư viện UI nếu Vanilla CSS có thể đáp ứng tốt yêu cầu.
- Đảm bảo độ tương phản giữa màu chữ và màu nền, giúp nội dung dễ đọc.
- Các trạng thái **hover, focus, active và disabled** phải có thiết kế đồng bộ, rõ ràng và dễ nhận biết.
- Ưu tiên giao diện tối giản, hiện đại, nhất quán, dễ sử dụng và không gây mất tập trung khi luyện gõ.
- Khi chỉnh sửa giao diện, phải tái sử dụng các Design Token đã có, tránh tạo những quy tắc CSS không cần thiết.

**Mục tiêu:** Xây dựng một hệ thống giao diện thống nhất, dễ quản lý và bảo trì. Khi cần thay đổi màu sắc thương hiệu, chỉ cần chỉnh sửa các biến CSS tại `src/styles/global.css` để toàn bộ website tự động cập nhật mà không phải sửa từng component.