# Phạm vi và nguồn chứng cứ

## Mục tiêu

Thiết kế nền tảng thành phần dùng chung cho thống kê, kiểm kê đất đai, có thể triển khai độc lập dưới MIT về sau. Phạm vi hiện tại là nghiên cứu và đặc tả: nghiệp vụ, dữ liệu, ranh giới mô-đun, kế hoạch phân tích nhị phân và tiêu chí kiểm chứng. Chưa lựa chọn hoặc xây dựng một sản phẩm desktop/web cụ thể.

## Quy ước bằng chứng

| Nhãn | Nghĩa | Cách sử dụng |
| --- | --- | --- |
| DOC | Quan sát trong PDF được cung cấp | Kèm mã tài liệu và số trang PDF |
| META | Metadata từ Drive | Chứng minh tên, kích thước, thời điểm metadata; không chứng minh nội dung nhị phân |
| PRIMARY | Tài liệu chính thức của hệ thống hoặc công nghệ | Ghi URL và ngày kiểm tra |
| DESIGN | Đề xuất thiết kế VLIS | Không mô tả như kết quả dịch ngược |
| OPEN | Chưa đủ bằng chứng | Giữ trạng thái mở đến khi có tệp hoặc phép thử xác nhận |

Số trang là vị trí trong PDF, không phải số trang hiển thị của một ảnh chụp bên trong PDF. Ngày kiểm tra nguồn web: 02/10/2026. Chưa có thẩm định đầy đủ về hiệu lực của mọi văn bản sửa đổi sau các tài liệu nguồn; các profile ở đây là profile nghiên cứu, không phải chứng nhận đáp ứng quy định hiện hành.

## Tài liệu người dùng cung cấp

| Mã | Tệp | Trang | Giá trị dùng trong phân tích |
| --- | --- | ---: | --- |
| DOC-A | HuongDanTKKK24-1.pdf | 8 | Quy trình nhận DGN, tổng hợp, đối chiếu Excel, đăng nhập và giao nộp DGN/Excel/ZIP |
| DOC-B | QuyDinhTrinhBayLop_TK2024_Public_06.04.2026.pdf | 19 | Level và ngữ nghĩa nhãn; đất kết hợp; chuyên đề; danh mục công ty nông, lâm nghiệp |
| DOC-C | 02.-Tai-Lieu-Huong-dan-TKKK_Version04_2026_bs.pdf | 23 | Quy trình thống kê 2025, dữ liệu kỳ trước, kiểm tra, trạng thái nộp/duyệt/trả lại và các phụ lục |

SHA-256 của từng PDF được lưu tại [source-register.json](../evidence/source-register.json). Tài liệu DOC-B có tên tệp chứa ngày 06.04.2026 nhưng tiêu đề trang 1 ghi phiên bản 2.0 cập nhật đến 16.04.2025. DOC-C trang 1 còn để trống số và ngày công văn đi kèm. Đây là dấu hiệu phải quản lý provenance, không phải cơ sở tự kết luận tài liệu vô hiệu hoặc một tài liệu tự động thay thế tài liệu kia.

## Bộ cài

Đã tìm thấy tệp người dùng chỉ định trên My Drive. Metadata xác nhận tên `VBDTKDesktopBasicSetup_x64.exe`, kích thước 730.488.652 byte và thời điểm sửa theo Drive là `2025-07-12T10:08:47.140Z`. Thời điểm metadata này không chứng minh ngày build hay phiên bản ứng dụng.

Tải raw bị HTTP 413 vì vượt giới hạn 268.435.456 byte. Chưa có hash của bộ cài, chữ ký số, nội dung PE, danh sách payload, assembly hoặc kết quả dịch ngược. Không công bố ID/URL riêng tư của Drive trong repo công khai. Metadata đủ để xác định ứng viên, chưa đủ để đồng nhất VBDTK với TKKK2024 trong PDF. Xem [installer-analysis.json](../evidence/installer-analysis.json).

## Nguồn chính thức đã kiểm tra

| Mã | Nguồn | Sử dụng |
| --- | --- | --- |
| WEB-01 | [Hướng dẫn giao nộp TKKK2024](https://tknews.gdla.gov.vn/huong-dan-su-dung-phan-mem-tkkk2024-de-giao-nop-du-lieu/) | Đối chiếu nguồn nghiệp vụ |
| WEB-02 | [Về phần mềm TKKK2024](https://tknews.gdla.gov.vn/ve-phan-mem-thong-ke-kiem-ke-dat-dai-tkkk2024/) | DGN và kết quả tổng hợp trên hệ thống của Bộ |
| WEB-03 | [Phần mềm kiểm kê hai cấp](https://tknews.gdla.gov.vn/phan-mem-thong-ke-kiem-ke-dat-dai-2-cap/) | Trang công bố mô hình hai cấp và một bản cập nhật ngày 21.08.2025 |
| WEB-04 | [MIT tại OSI](https://opensource.org/license/mit) | Nội dung giấy phép cho phần viết mới |
| WEB-05 | [GDAL DGN](https://gdal.org/en/stable/drivers/vector/dgn.html) | DGN trước v8, level/text và hạn chế chuyển đổi |
| WEB-06 | [GDAL DGNv8](https://gdal.org/en/stable/drivers/vector/dgnv8.html) | Dependency ODA không phải mã nguồn mở |
| WEB-07 | [Giấy phép GDAL](https://gdal.org/en/stable/license.html) | Phân biệt license source và dependency của bản build |
| WEB-08 | [PROJ](https://proj.org/en/stable/about.html) | CRS và license |
| WEB-09 | [GEOS](https://libgeos.org/) | Topology và license LGPL |
| WEB-10 | [GeoPackage tại OGC](https://www.ogc.org/standards/geopackage/) | Định dạng lưu trữ trao đổi |
| WEB-11 | [PMTiles](https://docs.protomaps.com/pmtiles/) | Kho tile đọc theo HTTP Range; tách khỏi dữ liệu gốc |
| WEB-12 | [ILSpy](https://github.com/icsharpcode/ILSpy) | Công cụ cho nhánh .NET nếu có bằng chứng CLR |
| WEB-13 | [Ghidra](https://github.com/NationalSecurityAgency/ghidra) | Công cụ phân tích nhánh native nếu được xác nhận |
| WEB-14 | [innoextract](https://constexpr.org/innoextract/) | Nhánh bộ cài Inno Setup nếu nhận diện đúng |
| WEB-15 | [7-Zip](https://www.7-zip.org/) | Nhận diện và trích payload của định dạng được hỗ trợ |

Các trang tải và tên phần mềm không được dùng để suy đoán cấu trúc bộ cài. Không thay thế tệp của người dùng bằng bộ cài khác tải từ Internet rồi coi đó là cùng một mẫu.
