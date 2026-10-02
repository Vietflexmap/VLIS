# Phạm vi giấy phép và nguồn bên ngoài

Nội dung viết mới trong repo được cấp MIT theo [LICENSE](LICENSE). Những yêu cầu/ngữ nghĩa dẫn từ PDF được ghi nguồn trong [hồ sơ chứng cứ](docs/00-pham-vi-va-nguon.md); không có PDF gốc hoặc ảnh giao diện được phân phối tại đây.

## Không có dependency runtime được đóng gói

Giao diện mô phỏng dùng HTML, CSS, JavaScript và SVG viết mới, font hệ thống và dữ liệu tổng hợp. Không có thư viện runtime, font ngoài, bản đồ nền mạng hoặc tài sản Vietbando được đóng gói. Ảnh tham chiếu chỉ dùng để nhận biết bố cục ribbon/lớp/bảng; không phân phối lại trong repo.

Playwright 1.62.1 (Apache-2.0) chỉ được cài tạm trong môi trường QA của GitHub Actions, không nằm trong trang web. Các action do GitHub duy trì chỉ phục vụ kiểm tra/triển khai; không là dependency runtime. Giấy phép MIT của VLIS không thay thế license của các công cụ này.

Các công cụ/thư viện bên dưới là nguồn tham khảo hoặc ứng viên, chưa được vendoring hay phân phối dưới license của VLIS.

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
