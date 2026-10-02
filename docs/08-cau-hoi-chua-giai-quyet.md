# Các vấn đề cần xác minh tiếp

Mỗi câu hỏi có artifact cần thiết và kết luận hiện tại. Không được thay phần chưa biết bằng giả định có vẻ hợp lý.

| ID | Câu hỏi | Cần bổ sung | Trạng thái |
| --- | --- | --- | --- |
| O01 | Byte bộ cài có đúng tệp đã chọn không? | Tệp đầy đủ hoặc các phần ghép lại; hash | Chặn phân tích nhị phân |
| O02 | VBDTK là bản nào và quan hệ gì với TKKK2024? | Resource version, publisher, license, payload và tài liệu đi kèm | Chưa xác nhận |
| O03 | Bộ cài dùng .NET, native hay hỗn hợp? | CLR metadata, PE imports của từng payload | Chưa xác nhận |
| O04 | DGN cần v7/v8, seed, unit, font/encoding nào? | Mẫu DGN có quyền sử dụng; capability matrix | Chưa có mẫu |
| O05 | CRS/kinh tuyến/trật tự trục của nguồn? | Hồ sơ CRS và điểm đối chiếu | Không được đo diện tích theo suy đoán |
| O06 | Profile level 32,59 và chuyên đề nào được chấp nhận? | Hướng dẫn được xác nhận; mẫu vào/ra thực | Hai PDF có xung đột |
| O07 | Công thức bình sai giao thông/thủy lợi một nét? | Mô tả phương pháp và ví dụ đối soát | Chỉ có yêu cầu cộng/trừ |
| O08 | Độ chính xác/tolerance hình học, diện tích và quy tắc làm tròn? | Quy định áp dụng và hành vi đã kiểm chứng | Không suy từ ngưỡng 30 m2 |
| O09 | Danh mục mã đất, đối tượng, ĐVHC theo từng kỳ? | Danh mục/version/date hiệu lực | Ví dụ trong PDF không đủ |
| O10 | Hợp đồng từng biểu và ô tổng hợp? | Mẫu Excel, chỉ tiêu, công thức, template version | Chưa khóa |
| O11 | Backup ZIP và gói giao nộp cấu trúc thế nào? | Gói mẫu có quyền sử dụng; mô tả schema | Gói VLIS chỉ là đề xuất |
| O12 | Máy chủ có API được hỗ trợ không? | Tài liệu giao thức và quyền thử | Chưa đoán endpoint hoặc gửi thử |
| O13 | Những rule nào áp dụng cho thống kê so với kiểm kê? | Profile được xác nhận và loại kỳ | Xung đột STT còn mở |
| O14 | License cho phép phân tích và tái sử dụng phần nào? | EULA của đúng mẫu và license của từng dependency | Chưa có quyền phân phối mã từ bộ cài |
| O15 | Ngữ nghĩa tổng hợp khi chia/gộp ĐVHC hoặc khoanh? | Lineage mẫu và quy tắc so phạm vi | Đã đề xuất dữ liệu, chưa kiểm chứng |

Ưu tiên đầu tiên là O01-O03 để có phân tích binary thật. Song song có thể lấy một bộ DGN + Excel + gói backup tổng hợp hoặc được cho phép dùng, kèm CRS và thông tin kỳ. Không cần dữ liệu đất đai thật hoặc tài khoản cơ quan để kiểm tra nguyên lý parser/topology.

Chỉ sau khi có byte và bằng chứng tương ứng mới bổ sung tên DLL, mã hàm, schema thực tế hoặc kết quả decompile. Giai đoạn hiện tại không chứa tuyên bố "đã khôi phục mã nguồn", "đã thay thế phần mềm chính thức" hoặc "conformance PASS".
