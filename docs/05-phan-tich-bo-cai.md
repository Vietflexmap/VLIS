# Phân tích bộ cài: trạng thái và kế hoạch

## Kết quả đã có

| Thuộc tính | Kết quả |
| --- | --- |
| Tên tệp trên Drive | VBDTKDesktopBasicSetup_x64.exe |
| Kích thước từ metadata | 730.488.652 byte / 696,65 MiB |
| Thời điểm sửa từ metadata | 2025-07-12T10:08:47.140Z |
| Tìm theo tên | Không thấy qua search; thấy qua danh sách thư mục gốc My Drive |
| Tải raw | HTTP 413 trước khi tải; giới hạn 268.435.456 byte |
| Byte cục bộ của bộ cài | Chưa có |
| SHA-256 bộ cài | Chưa biết |
| Authenticode, PE Machine, resource Version | Chưa biết |
| Loại installer, EXE/DLL payload và license đi kèm | Chưa biết |
| CLR/.NET hay native, database, GIS SDK | Chưa biết |
| Dịch ngược | Chưa thực hiện |

Chữ `x64` là một phần tên tệp, không thay cho đọc trường `Machine` của từng PE. Bộ cài có thể gồm payload khác kiến trúc; chưa được xác minh ở đây. Không kết luận dung lượng lớn là do dữ liệu bản đồ hay thư viện nào.

## Mục tiêu phân tích khi có byte

Kết quả cần thu được là inventory có hash; đồ thị phụ thuộc; giao diện dữ liệu; phân chia nghiệp vụ/hiển thị/hạ tầng; và đặc tả hành vi kiểm chứng được. Không coi EXE cài đặt là mã nguồn ban đầu, không coi decompiler sẽ khôi phục đầy đủ tên biến, comment, project build hoặc logic phía máy chủ.

## Thứ tự công việc

| Pha | Thao tác | Bằng chứng đầu ra | Điều kiện kết thúc |
| --- | --- | --- | --- |
| RE-01 | Đọc tệp và tính SHA-256 | Kích thước thực, hash, hash nguồn so sánh nếu có | Byte khớp mẫu người dùng; không suy từ metadata |
| RE-02 | Kiểm tra PE và chữ ký | Machine, sections, resources, manifest, import table, chữ ký và trạng thái xác minh | Ghi rõ kiểm tra cryptographic/offline hay cả trust/revocation |
| RE-03 | Nhận diện installer rồi trích payload | File tree với đường dẫn, kích thước và hash | Giải nén không chạy installer; báo phần không giải được |
| RE-04 | Phân loại payload | Native/managed/data/template/license/runtime | Mỗi kết luận có file/hash/metadata hỗ trợ |
| RE-05 | Xây đồ thị phụ thuộc | References .NET, imports native, cấu hình load plugin | Phân biệt dependency có trong gói và dependency ngoài |
| RE-06 | Đọc các module nghiệp vụ đã xác định | Giao diện vào/ra, luồng dữ liệu, quy tắc quan sát | Đánh dấu độ tin cậy và phần decompiler không khôi phục được |
| RE-07 | Xác minh file dữ liệu và biểu mẫu | Format, version, catalog, field/unit, công thức nếu có | Không suy schema từ extension; chưa gửi thử lên server thật |
| RE-08 | Viết đặc tả hành vi độc lập | Inputs, outputs, failure cases, source evidence | Đặc tả không chứa mã/resource sao chép từ nhà cung cấp |
| RE-09 | Đối chiếu bằng mẫu tổng hợp | Kết quả so sánh và trường hợp khác biệt | Chỉ đánh dấu đã kiểm chứng cho ca thực sự chạy |

Pha động chỉ cần thực hiện nếu phân tích tĩnh chưa đủ và có môi trường Windows cô lập phù hợp. Không cài phần mềm vào máy làm việc hoặc dùng tài khoản cơ quan để thử một giao thức chưa xác minh. Chỉ dùng fixture do dự án tự tạo cho các phép thử có thể làm thay đổi trạng thái.

## Chọn công cụ theo bằng chứng

| Bằng chứng tìm thấy | Công cụ phù hợp | Giới hạn |
| --- | --- | --- |
| Archive/SFX được hỗ trợ | 7-Zip | Không nhận ra không có nghĩa không có payload |
| Inno Setup đã nhận diện | innoextract | Chỉ dùng khi phiên bản installer được hỗ trợ |
| MSI trong payload | Trình đọc MSI/lessmsi tương ứng | Đọc tables và cabinet; không chạy custom actions |
| CLR metadata/IL | ILSpy hoặc ILSpyCmd | Kết quả C# tái dựng để nghiên cứu; không tự có quyền phát hành MIT |
| PE native | Ghidra, objdump hoặc công cụ tương đương | Pseudocode không phải mã C/C++ gốc; symbol có thể đã bị loại |
| Data/template/schema | Trình đọc đúng format | Không thực thi macro, SQL hoặc script trong payload |

Nguồn công cụ: [ILSpy](https://github.com/icsharpcode/ILSpy), [Ghidra](https://github.com/NationalSecurityAgency/ghidra), [innoextract](https://constexpr.org/innoextract/), [7-Zip](https://www.7-zip.org/). Chưa cài hoặc chạy các công cụ này trên bộ cài. Phiên bản công cụ dùng trong một lần phân tích phải được ghi lại; không đưa ra kết quả dựa trên công cụ chỉ mới được đề xuất.

## Cách lựa chọn phần có giá trị

| Loại thành phần nếu tìm thấy | Điều cần học | Đưa vào VLIS theo cách nào |
| --- | --- | --- |
| Đọc DGN và metadata | Dữ liệu đầu vào thực sự cần; giới hạn CAD | Hợp đồng adapter; dùng implementation có license phù hợp |
| Parser nhãn | Role, grammar, trường hợp lỗi | Đặc tả ngữ nghĩa và fixture độc lập |
| Kiểm tra và tổng hợp | Bất biến, mức lỗi, nhóm chỉ tiêu | Rule profile và kiểm chứng từ dữ liệu tự tạo |
| Thuật toán phân bổ/biến động | Ràng buộc bảo toàn và cách xử lý phần dư | Viết lại phương pháp có dẫn chứng; kiểm tra quyền trước khi chuyển bất kỳ mã nào |
| UI/control/resource | Chức năng và thông tin cần cho người dùng | Đặc tả UX mới; không cần tài sản giao diện của nhà cung cấp |
| SDK/GIS engine bên thứ ba | ABI/API và dependency | Adapter riêng, giữ nguyên license của dependency |
| Giao nộp/cập nhật/đăng nhập | Tách biệt trách nhiệm hệ thống ngoài | Connector có hợp đồng riêng; trạng thái chưa biết giữ nguyên |

## Tách dữ liệu nghiên cứu khỏi repo công khai

Byte bộ cài, output giải nén, resource, log chứa token và mã dịch ngược giữ trong khu vực nghiên cứu riêng. Repo chỉ nhận các ghi nhận không có thông tin riêng tư, hợp đồng tự viết và fixture tự tạo. Phát hiện API hay key trong binary không tạo quyền sử dụng key đó; key/token không được đưa vào hồ sơ công khai.

## Mở lại phần đang bị chặn

Cần một trong các đường nhận byte: bản tải qua trình duyệt sau khi được cho phép dùng phương án này; tệp gốc được cung cấp tại workspace; hoặc các phần archive nhỏ hơn giới hạn tải và có thể ghép lại chính xác. Một thư mục DLL được cung cấp riêng có thể giúp phân tích module, nhưng không thay bằng chứng về toàn bộ bộ cài. Sau khi có byte, cập nhật báo cáo này và [installer-analysis.json](../evidence/installer-analysis.json) bằng kết quả thực, không giữ trạng thái "đã phân tích" nếu mới hoàn tất một pha.
