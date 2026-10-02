# Phạm vi giấy phép và nguồn bên ngoài

Nội dung viết mới trong repo được cấp MIT theo [LICENSE](LICENSE). Những yêu cầu/ngữ nghĩa dẫn từ PDF được ghi nguồn trong [hồ sơ chứng cứ](docs/00-pham-vi-va-nguon.md); không có PDF gốc hoặc ảnh giao diện được phân phối tại đây.

## Không có dependency runtime được đóng gói

Repo hiện chỉ có Markdown, JSON và chính sách Git. Các công cụ/thư viện bên dưới là nguồn tham khảo hoặc ứng viên, chưa được vendoring, cài đặt làm dependency hay phân phối dưới license của VLIS.

| Nguồn/ứng viên | License/thông tin liên quan | Cách xử lý khi triển khai |
| --- | --- | --- |
| GDAL/OGR | Phần lớn MIT; một số tệp permissive khác; dependency binary khác nhau | Kiểm tra đúng bản build và giữ notice nguồn |
| PROJ | MIT | Giữ copyright/license; kiểm tra quyền dữ liệu grid cụ thể |
| GEOS | LGPL | Giữ nguyên license; chọn và kiểm tra cách liên kết/phân phối |
| ODA Teigha cho DGNv8 | Không phải mã nguồn mở theo tài liệu GDAL | Adapter tùy chọn; xác minh giấy phép riêng |
| ILSpy | MIT, có third-party notices riêng | Chỉ công cụ nghiên cứu; license tool không bao phủ input/output proprietary |
| Ghidra, 7-Zip, innoextract | Công cụ phân tích được dẫn nguồn | Kiểm tra license và phiên bản cụ thể nếu đóng gói chúng |
| Bộ cài VBDTK và payload | Chưa đọc license vì chưa tải được byte | Không phân phối trong repo |
| Tài liệu TKKK và dữ liệu danh mục | Nguồn nghiệp vụ bên ngoài | Không gắn lại license dữ liệu bằng MIT của repo |

Nguồn chính thức và ngày kiểm tra được lưu trong [source-register.json](evidence/source-register.json). Bảng này chưa phải SBOM của bộ cài; SBOM cần inventory payload thực tế, phiên bản và bằng chứng license riêng.
