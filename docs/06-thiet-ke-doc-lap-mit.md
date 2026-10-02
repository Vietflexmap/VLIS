# Thiết kế độc lập và mục tiêu MIT

## Hướng triển khai

MIT áp dụng cho phần nguyên gốc viết mới của VLIS. Tải được EXE, đọc assembly hoặc dịch ngược thành C# không tự chuyển quyền của phần mềm gốc cho dự án. Cách làm phù hợp với mục tiêu chủ động dài hạn là học hành vi và hợp đồng dữ liệu, ghi thành đặc tả độc lập, rồi triển khai mới và kiểm chứng. Đây là chính sách nguồn của dự án; chưa đánh giá đầy đủ EULA của bộ cài vì chưa đọc được payload.

## Quy trình phân tách

1. Nhóm phân tích giữ binary và output dịch ngược trong khu vực riêng, ghi sự kiện/hành vi cùng bằng chứng.
2. Đặc tả công khai mô tả đầu vào, đầu ra, ràng buộc, lỗi, độ chính xác và sự khác biệt giữa các profile.
3. Người triển khai dùng đặc tả và fixture nguyên gốc, không lấy các tệp dịch ngược làm mã nguồn khởi đầu.
4. Người kiểm chứng so sánh output bằng các ca có quyền sử dụng; ghi rõ phiên bản, hash mẫu và kết quả thực.
5. Khi một người từng xem mã dịch ngược tham gia triển khai, phải ghi nhận provenance; không gọi quy trình đó là clean-room nghiêm ngặt chỉ vì đổi tên biến hoặc viết lại bằng ngôn ngữ khác.

Hiện repo có đặc tả từ tài liệu và chưa có implementation. Chưa có phân tách nhân sự thực tế hoặc chứng nhận clean-room.

## Quyết định về nguồn

| Nguồn | Có thể dùng trong repo theo cách nào | Điều kiện |
| --- | --- | --- |
| Đặc tả/diagram viết mới | MIT | Chỉ mô tả original design và sự kiện có dẫn nguồn |
| Fixture tổng hợp tự tạo | MIT | Không lấy dữ liệu đất đai của cơ quan/người dùng làm fixture công khai |
| Thư viện MIT/BSD được lựa chọn | Theo license gốc kèm notices | Xác minh đúng phiên bản và dependency thực tế |
| Thư viện LGPL/GPL hoặc proprietary | Giữ license riêng và xem điều kiện tích hợp | Không gắn nhãn lại thành MIT |
| Binary, tài sản UI, mã dịch ngược của nhà cung cấp | Không phân phối trong trạng thái hiện tại | Cần quyền/giấy phép rõ trước khi chuyển bất kỳ thành phần nào |
| PDF và danh mục dữ liệu nguồn | Dẫn chiếu và diễn giải yêu cầu | Không giả định license phần mềm bao phủ dữ liệu/tài liệu |

## Công nghệ đang cân nhắc

| Năng lực | Ứng viên | Thông tin đã kiểm tra | Quyết định hiện tại |
| --- | --- | --- | --- |
| DGN trước v8 và format mở | GDAL/OGR | Source phần lớn MIT; một số tệp permissive khác; binary có thể có dependency khác license | Ứng viên adapter; phải kiểm tra capabilities của đúng bản build |
| DGN v8 | GDAL DGNv8 với ODA | Driver yêu cầu Open Design Alliance Teigha không phải mã nguồn mở | Tách adapter tùy chọn có license riêng; không hứa đọc v8 bằng lõi MIT thuần |
| CRS | PROJ | MIT; phép chiếu và dịch datum cần cấu hình đầy đủ | Ứng viên; pin dữ liệu CRS/grid và operations khi triển khai |
| Topology | GEOS | LGPL; có polygon operations, predicates, spatial index | Ứng viên có license riêng; chưa chọn cách đóng gói/link |
| Vector làm việc/trao đổi | GeoPackage theo OGC | Định dạng mở trên SQLite | Ứng viên định dạng; hợp đồng nghiệp vụ nằm ngoài phần chuẩn vector |
| Tile hiển thị | PMTiles v3 | Read-only, Z/X/Y, HTTP Range | Chỉ cache/trình bày; cập nhật tạo archive mới |

Nguồn chính: [GDAL license](https://gdal.org/en/stable/license.html), [DGN](https://gdal.org/en/stable/drivers/vector/dgn.html), [DGNv8](https://gdal.org/en/stable/drivers/vector/dgnv8.html), [PROJ](https://proj.org/en/stable/about.html), [GEOS](https://libgeos.org/), [GeoPackage](https://www.ogc.org/standards/geopackage/), [PMTiles](https://docs.protomaps.com/pmtiles/). Đây là shortlist kiến trúc, chưa phải dependency đã được thêm vào repo.

GDAL DGN v7 có hạn chế quan trọng ở việc giữ complex objects/cells và khi ghi polygon có nhiều ring. Vì thế chuyển đổi DGN -> định dạng mở -> DGN không được mặc định là lossless. Cần kiểm chứng nhãn, holes, unit/seed, style và loại phần tử trong round-trip; phần không bảo toàn phải báo cáo.

## Quyết định kiến trúc giữ dài hạn

| ID | Quyết định | Lý do |
| --- | --- | --- |
| ADR-01 | Lõi nghiệp vụ độc lập GUI và dịch vụ giao nộp | Có thể dùng cùng lõi cho desktop/web/plugin về sau |
| ADR-02 | Lưu nguồn, AST, ledger và profile | Giải thích được output và đọc lại dữ liệu cũ |
| ADR-03 | Không chọn một ngôn ngữ chỉ vì bộ cài có thể dùng ngôn ngữ đó | Chưa xác minh runtime; contract cần tồn tại qua nhiều implementation |
| ADR-04 | Không khóa M01-M09 vào một CAD SDK | Adapter giữ dependency và hạn chế bên ngoài lõi |
| ADR-05 | Không dùng tile làm nguồn diện tích | Tile hiển thị có thể được giản lược/cắt/lượng tử hóa |
| ADR-06 | Phiên bản hóa cả mã đất, ĐVHC và quy tắc | Đọc lại lịch sử với đúng ý nghĩa của thời điểm đó |
| ADR-07 | Không coi gói VLIS là gói TKKK | Giao thức chính thức còn chưa xác minh |

Không lựa chọn framework giao diện, không tạo project ứng dụng và không triển khai server trong giai đoạn hồ sơ này.
