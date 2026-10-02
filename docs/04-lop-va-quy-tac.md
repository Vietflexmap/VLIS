# Lớp DGN và quy tắc nghiệp vụ

Đây là ánh xạ từ tài liệu sang hợp đồng đề xuất. Chưa đọc level từ DGN thực tế và chưa kiểm chứng parser trên ứng dụng gốc.

## Bản đồ khoanh đất

| Level | Vai trò | Dữ liệu cần giữ | Chứng cứ | Điểm cần kiểm soát |
| ---: | --- | --- | --- | --- |
| 6 | Chuyên đề nông, lâm trường | Mã chỉ tiêu, STT công ty, loại đất, diện tích nếu có | DOC-B tr.3-5; DOC-C tr.22 | Không nhầm với mã xã trong file địa giới |
| 12 | Chuyên đề sạt lở/bồi đắp | Mã chuyên đề, loại đất, diện tích nếu có | DOC-B tr.4-5; DOC-C tr.22 | Hai tài liệu minh họa độ chi tiết khác nhau |
| 18 | Diện tích giao thông một nét | Nhãn TEXT diện tích, nguồn và ngữ cảnh bình sai | DOC-B tr.1 | Không coi đây là lớp line; chưa có công thức bình sai |
| 21 | Diện tích thủy lợi một nét | Nhãn TEXT diện tích, nguồn và ngữ cảnh bình sai | DOC-B tr.1 | Phương pháp phân bổ phải xác minh |
| 30 | Ranh khoanh đất | Line khép kín, ID và hình học gốc | DOC-B tr.1; DOC-C tr.21 | Không đồng nhất mọi line với polygon hợp lệ |
| 32 | Loại đất kỳ trước | Biến động có/không tiền tố hiện trạng | DOC-B tr.1-2,6; DOC-C tr.21 | Parser theo profile; không mặc định diện tích phần thiếu |
| 33 | Loại đất hiện tại | Mã đơn hoặc đất sử dụng kết hợp | DOC-B tr.2; DOC-C tr.21 | Cần quan hệ giữa diện tích nền và phần kết hợp |
| 35 | Số thứ tự khoanh | Nhãn số hiển thị | DOC-B tr.2; DOC-C tr.21-22 | Không dùng làm ID ổn định qua kỳ |
| 36 | Nhiều loại đất/đối tượng | Các thành phần và diện tích | DOC-B tr.2-4; DOC-C tr.21 | Dấu phân cách và phạm vi nhóm cần parser cấu trúc |
| 39 | Số lượng đối tượng | Mã đối tượng/loại đất và count | DOC-B tr.3; DOC-C tr.21 | Số trong ngoặc ở đây là số lượng, không phải diện tích |
| 54 | Diện tích khoanh | Số thập phân dùng dấu chấm | DOC-B tr.3; DOC-C tr.21-22 | Giữ đơn vị và đối chiếu với diện tích tính |
| 59 | Đối tượng kỳ trước | Danh sách mã đối tượng | DOC-B tr.3; DOC-C tr.22 | Lời hướng dẫn và ví dụ khác dấu phân cách |
| 60 | Đối tượng hiện tại | Mã đơn hoặc thành phần đối tượng có diện tích | DOC-B tr.3; DOC-C tr.22 | Không tự chia đều diện tích nếu thiếu thành phần |

Các mã đất/đối tượng phải tra danh mục phiên bản phù hợp. Không xây một danh mục đầy đủ chỉ bằng cách gom những mã xuất hiện trong ví dụ PDF.

## Bản đồ địa giới cấp tỉnh

DOC-C tr.23 quy định level 1 là biên giới quốc gia, level 2 là địa giới tỉnh, level 4 là địa giới xã, level 5 là tên xã và level 6 là mã xã. Cần `documentKind = administrative_boundary_map`, khác `land_inventory_map`. Cùng một số level không bảo đảm cùng ý nghĩa giữa hai loại bản đồ.

## Ngữ pháp nhãn

Parser nên có các bước tokenize -> parse cấu trúc -> xác định role theo level -> kiểm tra danh mục -> gắn đơn vị -> đối chiếu không gian. Không dùng một regex để đồng thời đọc level 32, 33, 36, 39 và 60.

| Dấu hoặc thành phần | Vai trò đề xuất | Hạn chế |
| --- | --- | --- |
| Mã chữ | Mã đất, đối tượng hoặc chuyên đề | Ý nghĩa phụ thuộc level và danh mục |
| `;` | Phân tách thành phần trong nhóm | Không tách khi đang ở ngoặc con |
| `+` | Phân tách nhóm được minh họa trong tài liệu | Phạm vi thừa hưởng mã phải theo dialect |
| `:` | Liên kết hiện trạng/kỳ trước hoặc đối tượng/loại đất hoặc chỉ tiêu/loại đất | Không có một nghĩa duy nhất |
| `(number)` | Diện tích hoặc số lượng theo role | Phải giữ kiểu dữ liệu và đơn vị |
| `(code:number)` | Phần sử dụng kết hợp với diện tích | Không tạo thêm diện tích nền |
| `(code)` | Sử dụng kết hợp toàn phần ở profile có quy định | Cần diện tích nền đã xác nhận |
| `(index)` trước chuyên đề | STT công ty NLT theo bảng nguồn | Không coi là số diện tích |

Ví dụ độc lập dành cho thiết kế parser:

- Level 33, `LUC(NTS:250)`: base `LUC`; secondary `NTS`; partial area 250 m2.
- Level 36, `CNV:ONT(350);CLN(650)+TCN:CLN(300)`: hai nhóm đối tượng; nhóm đầu có hai thành phần. Phải giải quyết danh mục đối tượng theo profile trước khi dùng.
- Level 39, `CNV:ONT(4)`: count 4; không cộng 4 m2.
- Level 32, `NTS:LUC(350);HNK(150)`: tiền tố `NTS` có thể được thừa hưởng trong nhóm theo dialect DOC-B; parser không lấy phần chưa ghi làm chuyển đổi.
- Level 54, `1200.50`: diện tích; `1200,50` sinh lỗi dấu thập phân trong profile nghiêm ngặt.

Giữ AST, nhãn gốc và dấu vết token. Nhãn có nhiều cách hiểu phải trả `AMBIGUOUS_LABEL` và yêu cầu lựa chọn profile hoặc sửa dữ liệu có lịch sử. Không silently fallback sang dialect khác rồi xuất biểu.

## Quy tắc kiểm tra từ DOC-C

| ID dự kiến | Điều kiện | Mức xử lý từ tài liệu | Nguồn | Chính sách VLIS |
| --- | --- | --- | --- | --- |
| T01 | Khoanh không thành polygon; chồng/hở vùng | Bắt buộc sửa | tr.22 mục 1 | Chặn tổng hợp; tolerance phải tách riêng |
| T02 | Diện tích nhãn khác diện tích tự động | Bắt buộc sửa | tr.22 mục 2 | Giữ hai đại lượng và báo sai lệch; độ chính xác theo profile |
| T03 | STT không nguyên/không duy nhất/không liên tục từ 1 | Bắt buộc kiểm tra | tr.22 mục 3 | Áp dụng theo loại kỳ và profile đã giải quyết xung đột |
| T04 | STT không đúng hướng zíc zắc | Thông báo và chấp nhận | tr.22 mục 3 | Cảnh báo, chưa có thuật toán kiểm tra hướng được khóa |
| T05 | Mã loại đất/đối tượng không đúng | Bắt buộc sửa | tr.22 mục 4 | Chặn; danh mục có phiên bản |
| T06 | Tổng diện tích khác diện tích ĐVHC | Không vượt 30 m2 | tr.23 mục 5 | Rule profile nguồn này: giá trị tuyệt đối >30 m2 là lỗi; bằng 30 m2 không vượt ngưỡng |
| T07 | Địa giới xã chồng/hở với xã lân cận | Bắt buộc sửa | tr.23 mục 6 | Thiếu địa giới lân cận thì chưa đủ điều kiện đánh giá |
| T08 | Địa giới khác kỳ kiểm kê 2019 | Thông báo và chấp nhận | tr.23 mục 7 | So sánh có ngữ cảnh thay đổi ĐVHC; cảnh báo có giải trình |
| T09 | Chu chuyển Biểu 05 sai lệch | Thông báo và chấp nhận | tr.23 mục 8 | Giữ đúng mức cảnh báo của nguồn; không tự biến thành lỗi bắt buộc |

Ngưỡng 30 m2 ở T06 là sai lệch tổng diện tích so với ĐVHC. Nó không cho phép bỏ polygon chồng/hở nhỏ hơn 30 m2 và không xác định tolerance snapping. DOC-C tr.7-8 còn yêu cầu đối chiếu tổng diện tích thành phần, mã và vị trí khoanh với địa giới trước khi tổng hợp; VLIS phải quản lý đồng thời các rule này, không chỉ kiểm tra tổng diện tích có khớp.

## Profile nghiên cứu

- `doc-b-layer-v2-observed`: mô tả lớp và ví dụ của DOC-B; lưu cả ngày trong tên và ngày trong tiêu đề.
- `doc-c-stat-2025-observed`: nội dung DOC-C cho thống kê 2025 và các phụ lục.
- `vlis-design-draft`: các lựa chọn riêng của VLIS, chưa công bố đáp ứng quy định.

Không profile nào hiện được gọi là "bản mới nhất chuẩn chính thức". Mọi kết quả phải ghi profile được dùng, danh mục đi kèm và những xung đột còn mở.
