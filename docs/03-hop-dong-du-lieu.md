# Hợp đồng dữ liệu đề xuất

Các kiểu dữ liệu là DESIGN, chưa phải schema của bộ cài hoặc cấu trúc gói giao nộp chính thức. Chưa khóa phiên bản 1.0.

## Thực thể

| Thực thể | Trường cốt lõi | Bất biến |
| --- | --- | --- |
| Context | `periodId`, `periodKind`, `adminUnitVersionId`, `ruleProfileId`, `catalogVersionId` | Không thay danh mục của một snapshot đã tổng hợp |
| SourceDocument | `documentId`, `documentKind`, `originalName`, `sha256`, `formatVersion`, `encoding`, `crsProfileId` | Byte gốc và hash không bị ghi đè khi chuẩn hóa |
| RawElement | `elementId`, `documentId`, `model`, `level`, `rawText`, `geometry`, `style`, `sourceLocator` | Level/text trước chuẩn hóa luôn truy lại được |
| LabelAST | `labelId`, `dialectId`, `role`, `tokens`, `interpretation`, `issues` | Không sửa nhãn gốc để ép parser thành công |
| LandBlock | `blockId`, `snapshotId`, `displayNumber`, `geometry`, `sourceElementIds`, `labelRefs` | ID ổn định tách khỏi số khoanh và ID CAD |
| Allocation | `allocationId`, `blockId`, `landUseCode`, `subjectCode`, `areaM2`, `allocationKind` | Diện tích Decimal, không âm; ngữ nghĩa loại phân bổ rõ |
| CombinedUse | `baseAllocationId`, `secondaryLandUseCode`, `scope`, `areaM2` | Kết hợp toàn phần/một phần không mặc nhiên cộng vào diện tích vật lý |
| SubjectCount | `blockId`, `subjectCode`, `landUseCode`, `count` | `count` là số lượng, không phải m2 |
| AreaAdjustment | `adjustmentId`, `contextId`, `reason`, `deltaM2`, `methodVersion`, `allocationRefs` | Bảo toàn tổng theo phương pháp đã được xác nhận; có giải trình |
| Transition | `transitionId`, `fromSnapshot`, `toSnapshot`, `fromCode`, `toCode`, `areaM2`, `lineageRefs` | Mã kỳ trước/kỳ sau có phiên bản; không tự suy ra từ số khoanh |
| Snapshot | `snapshotId`, `parents`, `createdAt`, `inputHashes`, `profileVersions`, `outputs` | Bất biến sau khi gửi/nộp |
| SubmissionEvent | `eventId`, `snapshotId`, `eventKind`, `actorId`, `occurredAt`, `receiptRef` | Phản hồi và sự kiện không ghi đè lịch sử |

## CRS

Mỗi `CRSProfile` cần định nghĩa WKT2 hoặc định danh chính thức phù hợp, datum, phép chiếu, kinh tuyến trục, hệ số tỷ lệ, false easting/northing, đơn vị, trật tự trục và thao tác chuyển đổi. Với VN-2000, chỉ ghi chữ "VN2000" hoặc gán một EPSG chung chưa đủ để xác định mọi cấu hình địa phương.

GDAL mô tả driver DGN không cung cấp georeferencing qua OGR theo cách có thể mặc định tin cậy ở đây. Adapter phải yêu cầu bằng chứng CRS từ hồ sơ, seed hoặc cấu hình được xác nhận. Nếu chỉ biết tọa độ CAD, trạng thái là `CRS_UNRESOLVED`; chặn tính diện tích nghiệp vụ và phép chồng ghép giữa nguồn.

Quy ước tên X/Y kiểu trắc địa có thể khác easting/northing trong thư viện. Dùng tên trường rõ nghĩa cùng `axisOrder`. Kiểm chứng điểm khống chế và đơn vị; không đảo trục hoặc đổi CRS âm thầm để làm bản đồ nhìn có vẻ đúng. Khóa operation/grid và hash của grid nếu dùng dịch datum. Diện tích hiển thị và diện tích có giá trị báo cáo phải ghi phương pháp riêng.

## Các loại diện tích

| Đại lượng | Ý nghĩa | Dùng cho |
| --- | --- | --- |
| `geometryAreaM2` | Diện tích hình học trong CRS được xác nhận | Kiểm tra và tham chiếu không gian |
| `declaredAreaM2` | Giá trị nhãn diện tích được đọc | Đối chiếu nhãn với hình học |
| `baseAllocationAreaM2` | Phân chia diện tích vật lý theo đất/đối tượng | Tổng hợp không cộng trùng |
| `combinedUseAreaM2` | Diện tích sử dụng kết hợp gắn với diện tích nền | Chỉ tiêu kết hợp riêng theo profile |
| `adjustmentAreaM2` | Giá trị điều chỉnh/bình sai có nguồn | Tạo ledger điều chỉnh |
| `reportAreaHa` | Kết quả trình bày theo mẫu biểu | Chuyển m2 sang ha và làm tròn tại biên xuất |

Đất kết hợp một phần hoặc toàn phần là quan hệ sử dụng trên diện tích nền, chưa thể coi là hai polygon khác nhau. Ví dụ minh họa độc lập: khoanh 1.200 m2 với 250 m2 dùng kết hợp vẫn có diện tích vật lý 1.200 m2. Công thức thể hiện từng chỉ tiêu trong biểu phải được xác nhận riêng.

Giữ số Decimal khi phân tích nhãn và cộng sổ. Không làm tròn từng khoanh sớm. Phương pháp phân bổ phần dư khi xuất biểu phải có thứ tự ổn định, phiên bản và tổng đối soát; đây là đề xuất thiết kế, không phải thuật toán VBDTK đã xác minh.

## Gắn nhãn và dựng polygon

1. Đọc level 30 trong ngữ cảnh bản đồ khoanh đất, giữ ID các line.
2. Phát hiện line hở, trùng, tự cắt và các thành phần không thể dựng vùng.
3. Dựng candidate polygon theo tolerance đã được người quản lý profile xác nhận; không lấy 30 m2 làm tolerance snap.
4. Dùng chỉ mục không gian tìm nhãn nằm trong polygon.
5. Nhãn nằm trên biên, ngoài vùng, nhiều nhãn xung đột hoặc chưa có nhãn sinh Issue; không chọn nhãn gần nhất âm thầm.
6. Ghi mọi sửa hình học thành đề xuất riêng, gồm trước/sau, chênh diện tích và người chấp nhận; giữ hình học nguồn.

## Địa giới và biến động

`AdminUnitVersion` có ID nội bộ, mã/tên, khoảng hiệu lực và quan hệ tiền nhiệm/kế nhiệm. Sáp nhập không chỉ là thay một mã bằng mã mới. So sánh diện tích hai kỳ cần cùng phạm vi hoặc có phép chuyển phạm vi được giải trình. Một đối tượng tách thành nhiều khoanh hoặc gộp nhiều khoanh phải có lineage nhiều-nhiều; ID hiển thị 35 không đủ.

Mỗi dòng biểu cần đường truy vết: ô biểu -> ledger -> allocation/transition -> block -> source element -> file hash. Các sửa tay vào biểu phải lưu như adjustment có lý do, không ghi đè giá trị tổng hợp mà mất provenance.

## Gói trao đổi nội bộ

Manifest dự kiến gồm `packageVersion`, `context`, `crsProfiles`, `sourceHashes`, `catalogVersions`, `ruleProfiles`, `snapshotId`, `fileInventory`, `validationSummary` và `reportHashes`. Gói phải tự mô tả, phát hiện thiếu tệp/hash không khớp và có khả năng giải mã ở phiên bản cũ. Đây là gói VLIS; chưa thay thế backup ZIP hoặc gói gửi TKKK chính thức.

GeoPackage có thể giữ vector làm việc; PMTiles chỉ giữ tile trình bày. Adapter VFM về sau chỉ đưa vào khi có phiên bản đặc tả và conformance fixtures được khóa. Chưa có tuyên bố tương thích VFM, chưa lựa chọn VFM làm định dạng nghiệp vụ bắt buộc.
