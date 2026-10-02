# Giao diện mô phỏng VLIS

Ngày thiết kế: 02/10/2026. Mục tiêu: xem xét bố cục và thao tác trên một trang web tĩnh, chưa tạo hệ thống nghiệp vụ hoặc bộ cài sản phẩm.

Ảnh người dùng cung cấp cho thấy thanh ribbon, danh sách lớp bên trái, bản đồ ở giữa và bảng thuộc tính phía dưới. VLIS sử dụng mô hình bố cục này với nhận diện, icon SVG, dữ liệu và mã giao diện viết mới. Hộp lỗi cập nhật trong ảnh không được dùng để suy luận thành phần hay nguyên nhân lỗi của phần mềm gốc.

## Màn hình và thao tác

| Không gian | Thao tác đã mô phỏng | Ý nghĩa |
| --- | --- | --- |
| Bản đồ | Chọn khoanh qua vùng/bảng/bàn phím; tìm kiếm; thu phóng; kéo bản đồ; bật/tắt lớp; đo hai điểm | Đối chiếu hình học và thuộc tính trong cùng phiên |
| Kiểm tra | Chạy ba kiểm tra của tập mẫu; định vị; sửa hai lỗi thuộc tính mẫu | Minh hoạ lỗi chặn và cảnh báo còn tồn tại |
| Thống kê | Diện tích theo sáu mã đất; tỷ lệ; xuất CSV | Tổng hình học vật lý, không cộng trùng phần kết hợp |
| Hồ sơ | Tổng hợp → gửi mẫu → nộp duyệt mẫu → duyệt mẫu; trả lại mở lượt sửa | Tách các trạng thái và giữ snapshot lần gửi trước |
| Kiến trúc | 12 ranh giới mô-đun được đề xuất trong hồ sơ | Chưa phải inventory từ bộ cài |

Các lớp mang level 30/35/04 chỉ minh hoạ cách gắn lớp vào giao diện; không có parser DGN. Không nhập tệp người dùng, không có tài khoản hoặc API giao nộp. Dữ liệu mất khi tải lại trang; có thể xuất mẫu trước khi đóng.

## Tập dữ liệu minh hoạ

[demo-data.js](assets/demo-data.js) tạo 20 polygon liền kề, K001–K020, với tổng diện tích chính xác **341.000 m² = 34,10 ha**. Sáu màu dùng để phân loại mã đất; không tuyên bố là bộ màu bản đồ chính thức. Chú giải đổi theo chế độ loại đất hoặc trạng thái kiểm tra.

Tọa độ là `synthetic_local_metric`, đơn vị m, trục easting/northing, không có geographic datum. Trục bắc của bản đồ là quy ước lưới mẫu. Thước tỷ lệ được tính từ phép biến đổi SVG hiện tại; đo khoảng cách là Euclid trên lưới này. Chưa xác nhận CRS thực tế, chưa thực hiện chuyển đổi hoặc tính diện tích địa chính.

| Khoanh | Chủ đích tạo mẫu | Xử lý trong giao diện |
| --- | --- | --- |
| K006 | Thiếu mã đối tượng | Chặn tổng hợp; nút sửa mẫu gán CNV theo fixture |
| K017 | Diện tích nhãn lớn hơn hình học 150 m² | Chặn tổng hợp; sửa mẫu đưa nhãn về diện tích hình học |
| K012 | Thiếu nguồn kỳ trước | Giữ cảnh báo, không tự chế tạo tài liệu đối chiếu |
| K007 | Có 1.250 m² sử dụng kết hợp NTS | Lưu riêng; không thêm vào tổng diện tích vật lý |

Ngưỡng 0,1 m² trong kiểm tra mẫu là lựa chọn của ví dụ, không phải ngưỡng pháp quy. Các kiểm tra chưa bao gồm topology đầy đủ, CRS, danh mục thực tế, chu chuyển, biểu chính thức hoặc gói TKKK.

JSON xuất ở trạng thái đã gửi/chờ duyệt/đã duyệt lấy từ snapshot đóng băng. Khi trả lại và mở lượt sửa, JSON xuất dữ liệu hiện tại cùng `previousSubmittedSnapshot` để phân biệt hai phiên bản. CSV luôn là bảng xem trước theo hình học mẫu và có nhãn `SYNTHETIC_DEMO`.

## Mã nguồn và xuất bản

Trang nằm ở [index.html](index.html), styling ở [vlis.css](assets/vlis.css), tương tác ở [vlis.js](assets/vlis.js). Tất cả chạy trong trình duyệt, không tải dependency ngoài. Mở qua một máy chủ tĩnh tại thư mục `docs`, hoặc GitHub Pages.

1. Trong repo VLIS, chọn Settings → Pages → Build and deployment → Source → GitHub Actions.
2. Mở Actions → Validate and publish VLIS demo → Run workflow trên nhánh main.
3. Chờ job kiểm tra và triển khai hoàn tất; dùng URL do job deploy trả về. Không coi URL dự kiến là bằng chứng trang đã lên.

Workflow chỉ đóng gói `index.html`, `.nojekyll` và `assets` vào site; hồ sơ Markdown/JSON vẫn được đọc tại repo. Khi Pages chưa bật hoặc đang dùng nguồn branch, workflow ghi hướng dẫn ở summary và bỏ qua deploy. Không dùng secret dài hạn để tự bật Pages.

## Kiểm tra giao diện

[qa/check-ui.cjs](../qa/check-ui.cjs) chạy Chromium, đối chiếu ba khoanh giữa bản đồ/bảng/thông tin, tìm kiếm, lớp/chú giải, luồng lỗi và hồ sơ, JSON/CSV và chiều rộng 1920, 1366, 1024, 390, 320 px. Artifact `vlis-ui-qa` chứa ảnh desktop/mobile và `result.json` của đúng lần chạy. Các dependency QA được cài tạm ngoài repo.

Đây là kiểm tra prototype. C01–C16 trong [specs](../specs/conformance-cases.json) tiếp tục `not_run`. Bản mô phỏng không chứng nhận kết quả thống kê hoặc tương thích phần mềm gốc.

Nguồn triển khai: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Playwright CI](https://playwright.dev/docs/ci). Giấy phép: [MIT](../LICENSE), phạm vi bên ngoài ở [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
