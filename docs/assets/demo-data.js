/* SPDX-License-Identifier: MIT
 * Original synthetic fixture. Coordinates are local metric, never geographic.
 */
(() => {
  const catalog = {
    ONT: { label: 'Đất ở nông thôn', color: '#eed180' },
    CLN: { label: 'Đất trồng cây lâu năm', color: '#82b7a0' },
    LUC: { label: 'Đất chuyên trồng lúa', color: '#c4d5a1' },
    NTS: { label: 'Đất nuôi trồng thuỷ sản', color: '#91c2dd' },
    DGT: { label: 'Đất giao thông', color: '#c7cbd1' },
    DTL: { label: 'Đất thuỷ lợi', color: '#b0b7d6' }
  };
  const codes = [
    ['CLN', 'LUC', 'DGT', 'ONT', 'CLN'],
    ['CLN', 'LUC', 'DGT', 'NTS', 'NTS'],
    ['ONT', 'CLN', 'DGT', 'LUC', 'NTS'],
    ['CLN', 'LUC', 'DGT', 'DTL', 'CLN']
  ];
  const columns = [65, 245, 430, 456, 650, 840];
  const rows = [70, 170, 280, 390, 510];
  const shift = [0, 7, 14, 5, -6];
  const offset = [0, -5, 9, 4, -9, 0];
  const vertices = rows.map((y, r) => columns.map((x, c) => [x + shift[r], y + offset[c]]));
  const area = points => Math.abs(points.reduce((s, p, i) => {
    const q = points[(i + 1) % points.length];
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 2;
  const blocks = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    const number = r * 5 + c + 1;
    const geometry = [vertices[r][c], vertices[r][c + 1], vertices[r + 1][c + 1], vertices[r + 1][c]];
    const geometryArea = area(geometry);
    blocks.push({
      id: `K${String(number).padStart(3, '0')}`, number,
      landUse: codes[r][c], subject: c === 2 || codes[r][c] === 'DTL' ? 'TCQ' : 'CNV',
      geometry, declaredArea: geometryArea,
      previousLandUse: codes[r][c], missingHistory: number === 12,
      combinedUse: number === 7 ? { code: 'NTS', area: 1250 } : null,
      source: { name: 'khoanh_dat_minh_hoa', element: `sample:${number}`, level: 30 }
    });
  }
  blocks[5].subject = '';
  blocks[16].declaredArea += 150;
  const outline = [
    ...vertices[0], ...vertices.slice(1).map(row => row[5]),
    ...vertices[4].slice(0, 5).reverse(), ...vertices.slice(1, 4).reverse().map(row => row[0])
  ];
  window.VLIS_DEMO = {
    version: '0.2', title: 'Đơn vị hành chính mẫu', period: 2025,
    coordinateSystem: { kind: 'synthetic_local_metric', unit: 'm', axes: ['easting', 'northing'], geographicDatum: null },
    catalog, outline, blocks,
    modules: [
      ['M01', 'Ngữ cảnh & danh mục', 'Đơn vị hành chính, kỳ thực hiện và danh mục có phiên bản.'],
      ['M02', 'Adapter dữ liệu', 'Tách các định dạng nguồn khỏi dữ liệu nghiệp vụ.'],
      ['M03', 'CRS & đơn vị', 'Xác nhận hệ tọa độ, trật tự trục và đơn vị đo.'],
      ['M04', 'Phân tích nhãn', 'Giữ nhãn gốc và diễn giải theo profile.'],
      ['M05', 'Dựng vùng & gắn nhãn', 'Quan hệ giữa hình học khoanh và các nhãn thuộc tính.'],
      ['M06', 'Kiểm tra dữ liệu', 'Phân biệt lỗi chặn, cảnh báo và chưa được kiểm tra.'],
      ['M07', 'Phân bổ diện tích', 'Tách diện tích vật lý và diện tích sử dụng kết hợp.'],
      ['M08', 'Biến động giữa kỳ', 'Truy vết thay đổi đất, đối tượng và phạm vi.'],
      ['M09', 'Tổng hợp & biểu', 'Đối chiếu từng nhóm chỉ tiêu với dữ liệu nguồn.'],
      ['M10', 'Lưu trữ & đóng gói', 'Snapshot và gói trao đổi tự mô tả.'],
      ['M11', 'Giao nộp & duyệt', 'Tách truyền tệp, nộp, duyệt và trả lại.'],
      ['M12', 'Trình bày & tích hợp', 'Cùng một hợp đồng cho web, desktop hoặc plugin.']
    ]
  };
})();
