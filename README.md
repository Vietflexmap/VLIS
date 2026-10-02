# VLIS - nền tảng đặc tả mở cho thống kê, kiểm kê đất đai

VLIS tập hợp phân tích nghiệp vụ, hợp đồng dữ liệu và thiết kế các thành phần độc lập để Vietflexmap có thể phát triển mã nguồn MIT dùng lâu dài. Giai đoạn này cung cấp hồ sơ thiết kế, chưa có ứng dụng, bộ cài hoặc mã thực thi nghiệp vụ.

## Trạng thái ngày 02/10/2026

| Hạng mục | Kết quả thực tế |
| --- | --- |
| Ba PDF người dùng cung cấp | Đã trích xuất nội dung của 50 trang; đối chiếu trực quan các trang chứa quy tắc, lớp dữ liệu và trạng thái hồ sơ |
| Repo VLIS | Được khởi tạo bằng hồ sơ phân tích và giấy phép MIT cho phần viết mới |
| `VBDTKDesktopBasicSetup_x64.exe` trên Drive | Đã tìm thấy và đọc metadata: 730.488.652 byte, khoảng 696,65 MiB |
| Tải bộ cài | Bị từ chối với HTTP 413: giới hạn của kết nối là 268.435.456 byte (256 MiB) |
| Giải nén, phân tích PE/DLL, dịch ngược | Chưa thực hiện vì chưa nhận được byte của bộ cài |
| Kiến trúc của phần mềm gốc | Chưa xác nhận; các mô-đun bên dưới là thiết kế VLIS đề xuất từ tài liệu |
| Tương thích giao nộp chính thức | Chưa kiểm chứng; chưa biết cấu trúc gói và giao thức máy chủ |

Không suy ra .NET, C++, loại CSDL, bộ GIS hoặc thuật toán của bộ cài từ tên tệp hay ảnh giao diện. Bảng chứng cứ ghi rõ phần đã quan sát, phần đề xuất và phần còn chờ.

## Đọc hồ sơ

1. [Phạm vi, nguồn và giới hạn chứng cứ](docs/00-pham-vi-va-nguon.md).
2. [Phân tích nghiệp vụ và các khác biệt giữa tài liệu](docs/01-phan-tich-nghiep-vu.md).
3. [Bản đồ 12 thành phần và ranh giới trách nhiệm](docs/02-ban-do-thanh-phan.md).
4. [Hợp đồng dữ liệu, CRS và định danh](docs/03-hop-dong-du-lieu.md).
5. [Lớp DGN, cú pháp nhãn và quy tắc kiểm tra](docs/04-lop-va-quy-tac.md).
6. [Kế hoạch bóc tách và dịch ngược bộ cài](docs/05-phan-tich-bo-cai.md).
7. [Thiết kế độc lập, giấy phép và lựa chọn công nghệ](docs/06-thiet-ke-doc-lap-mit.md).
8. [Ca kiểm chứng và lộ trình phát triển về sau](docs/07-kiem-chung-va-lo-trinh.md).
9. [Các vấn đề cần xác minh tiếp](docs/08-cau-hoi-chua-giai-quyet.md).

Các tệp JSON trong [specs](specs) là bảng mô tả và ca kiểm chứng dự kiến, chưa phải schema chính thức của TKKK hay bộ kiểm thử đã chạy. [evidence](evidence) lưu provenance và trạng thái phân tích.

## Giá trị nên giữ trong thiết kế mới

- Khôi phục ý nghĩa nghiệp vụ từ level và nhãn CAD, giữ đường dẫn về phần tử nguồn.
- Kiểm tra hình học và thuộc tính trước khi tổng hợp; báo lỗi có vị trí và lý do.
- Tách diện tích hình học, diện tích phân bổ, diện tích kết hợp và diện tích sau điều chỉnh.
- Theo dõi biến động giữa kỳ trước và kỳ hiện tại, giải thích được từng dòng của biểu.
- Đóng băng dữ liệu của mỗi lần giao nộp, ghi lịch sử trả lại và duyệt hồ sơ.
- Phiên bản hóa quy định, danh mục và địa giới để thay đổi quy định không buộc viết lại lõi.

## Giấy phép

[MIT](LICENSE) áp dụng cho nội dung nguyên gốc viết mới trong repo. Bộ cài, DLL, mã dịch ngược, ảnh giao diện, PDF nguồn, dữ liệu thực tế và tài sản của bên thứ ba không được chuyển thành MIT bởi giấy phép này. Repo chỉ dẫn chiếu tài liệu nguồn và ghi nhận các sự kiện kỹ thuật; không phân phối lại bộ cài hoặc tài liệu gốc.

Quy trình đề xuất là phân tích hành vi và giao diện dữ liệu, viết đặc tả độc lập, sau đó triển khai mới và kiểm chứng. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) phân biệt giấy phép của VLIS và các công nghệ đang cân nhắc.
