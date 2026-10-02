# Kiểm chứng và lộ trình

## Những gì đã kiểm tra trong lần lập hồ sơ

Đã trích xuất text của ba PDF, kiểm tra số trang và SHA-256. Đã đối chiếu trực quan DOC-B tr.1-3 và DOC-C tr.15,22-23 để kiểm tra bảng level, dấu phân cách, mức xử lý lỗi và trạng thái hồ sơ. Đã kiểm tra nguồn chính thức của TKKK và tài liệu gốc của các công nghệ trong shortlist.

Repo được kiểm tra JSON có thể parse, liên kết nội bộ có đích tồn tại, mã nguồn chứng cứ khớp giữa bảng và manifest, và không có installer/DLL/PDF nguồn/mã dịch ngược/dữ liệu riêng tư. Đây là kiểm tra chất lượng hồ sơ. Chưa chạy phần mềm gốc, chưa có implementation VLIS, chưa có ca conformance nghiệp vụ đạt PASS.

## Ca kiểm chứng dự kiến

Các fixture dưới đây là dữ liệu tổng hợp cho thiết kế, không trích từ bộ cài. [conformance-cases.json](../specs/conformance-cases.json) lưu input/expected/status. Tất cả đang ở trạng thái `not_run`.

| ID | Trường hợp | Kết quả kỳ vọng |
| --- | --- | --- |
| C01 | Khoanh tổng hợp 1.200 m2 có 250 m2 sử dụng kết hợp | Tổng vật lý vẫn 1.200 m2; phần kết hợp lưu riêng |
| C02 | Level 39 có số lượng 4 | `count=4`; không sinh allocation 4 m2 |
| C03 | Level 54 dùng dấu phẩy thập phân | Lỗi trong profile nghiêm ngặt; giữ nhãn gốc |
| C04 | Level 6 trong hai loại bản đồ | NLT ở bản đồ khoanh; mã xã ở bản đồ địa giới |
| C05 | Level 32 thiếu tiền tố hiện trạng | Chọn profile DOC-C hoặc báo xung đột; không tự nhận profile |
| C06 | Có một polygon tự cắt | Chặn; không sửa tự động và âm thầm tổng hợp |
| C07 | Hai nhãn loại đất xung đột trong một polygon | Báo mơ hồ, không chọn nhãn gần tâm |
| C08 | Hai khoanh chồng 5 m2 nhưng tổng diện tích lệch 0 m2 | Rule topology vẫn chặn; ngưỡng 30 m2 không miễn lỗi |
| C09 | Tổng diện tích lệch đúng 30 m2 trong profile DOC-C | Không vượt ngưỡng T06; vẫn phải kiểm tra những rule khác |
| C10 | Tổng diện tích lệch 30,01 m2 | Vi phạm T06 |
| C11 | CRS chưa xác định | Chặn đo diện tích/overlay nghiệp vụ; không gán WGS84 theo suy đoán |
| C12 | Số khoanh thay đổi giữa kỳ | `blockId`/lineage tách khỏi số hiển thị |
| C13 | Thiếu địa giới xã lân cận | T07 `not_evaluated`, không được gọi là đã đạt toàn bộ kiểm tra |
| C14 | Nộp snapshot rồi chỉnh dữ liệu | Snapshot đã nộp bất biến; sửa phải theo nhánh phiên bản hợp lệ |
| C15 | HTTP tải file thành công nhưng chưa nộp cấp trên | Không chuyển trạng thái sang được duyệt |
| C16 | Chuyển DGN polygon có hole qua adapter không bảo toàn | Báo tổn thất/chặn xuất tương thích; không coi round-trip đạt |

## Đối soát diện tích và chu chuyển

- So tổng phân bổ nền với diện tích vật lý từng khoanh bằng độ chính xác của profile đã xác nhận.
- So tổng các khoanh với diện tích ĐVHC; kiểm tra đồng thời chồng/hở và ngoài địa giới, tránh việc sai số triệt tiêu lẫn nhau.
- Ma trận chu chuyển có hàng kỳ trước, cột kỳ sau; giữ riêng tăng khác/giảm khác và thay đổi phạm vi.
- Khi có loại đất kết hợp, chỉ tiêu nào được phép tính chồng phải được mô tả rõ; không dùng cùng một tổng cho mọi biểu.
- Đối chiếu từng ô biểu với ledger và giữ nguồn cho phần dư/làm tròn. Chưa đủ template thì trạng thái là `report_profile_incomplete`.

## Cửa kiểm chứng cho từng giai đoạn

| Giai đoạn | Việc thực hiện | Điều kiện được tuyên bố hoàn tất |
| --- | --- | --- |
| G0 - hồ sơ | Đọc nguồn và thiết kế các thành phần | Chứng cứ phân loại; câu hỏi mở có owner và artifact cần bổ sung |
| G1 - phân tích binary | Nhận byte, hash, trích payload, đọc PE/assembly | Inventory thực; định danh sản phẩm và version; báo cáo license/giới hạn decompiler |
| G2 - khóa đặc tả thử nghiệm | Giải quyết dialect, danh mục, diện tích, biểu và gói | Profile có version; fixture tự tạo có expected được xác nhận |
| G3 - triển khai độc lập về sau | Chọn runtime, viết adapter và lõi theo contract | Kiểm thử thực, sai khác có giải thích, không phụ thuộc mã proprietary chưa được phép |
| G4 - tương thích và vận hành | Đối soát với nguồn, thử gói và quy trình được chấp nhận | Kết quả thực trên mẫu hợp lệ; hướng dẫn rollback/migration; audit đầy đủ |

Lần này chỉ tạo hồ sơ G0. G1 chưa hoàn thành vì giới hạn tải. G2-G4 là lộ trình, chưa được thực hiện và chưa có lịch hay ngân sách được cam kết.

## Duy trì dài hạn

Sau khi có implementation, mỗi bản phát hành cần snapshot fixture, version parser/profile/catalog, kết quả kiểm thử, dependency/license inventory và hướng dẫn đọc/migrate dữ liệu cũ. Không phát hành khi thiếu CRS, làm mất phần tử không báo, tổng diện tích thay đổi không giải thích được hoặc gói không thể phục hồi. Giữ rollback theo snapshot; không yêu cầu binary cũ tồn tại để giải thích số liệu mới.
