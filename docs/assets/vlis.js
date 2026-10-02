/* SPDX-License-Identifier: MIT
 * UI prototype only. No DGN parsing, official validation or network submission.
 */
(() => {
  'use strict';
  const fixture = window.VLIS_DEMO;
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const number = (value, digits = 1) => Number(value).toLocaleString('vi-VN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const areaOf = points => Math.abs(points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0)) / 2;
  const centroid = points => {
    let twiceArea = 0, x = 0, y = 0;
    points.forEach((p, i) => {
      const q = points[(i + 1) % points.length], cross = p[0] * q[1] - q[0] * p[1];
      twiceArea += cross; x += (p[0] + q[0]) * cross; y += (p[1] + q[1]) * cross;
    });
    return [x / (3 * twiceArea), y / (3 * twiceArea)];
  };
  const totalArea = blocks => blocks.reduce((sum, b) => sum + areaOf(b.geometry), 0);
  const pointsString = points => points.map(p => `${p[0]},${620 - p[1]}`).join(' ');
  const polygonY = y => 620 - y;
  const subjectNames = { CNV: 'Cá nhân', TCQ: 'Tổ chức quản lý (mẫu)' };
  const stateNames = { draft: 'Bản nháp', checked: 'Đã kiểm tra mẫu', ready: 'Sẵn sàng gửi mẫu', uploaded: 'Đã gửi mẫu', pending: 'Chờ duyệt mẫu', approved: 'Đã duyệt mẫu', returned: 'Đã trả lại mẫu' };
  const lockedStates = new Set(['uploaded', 'pending', 'approved']);
  const state = {
    blocks: clone(fixture.blocks), selected: 'K009', view: 'map', table: 'attributes', search: '', sort: 'number',
    theme: 'landuse', checked: false, busy: false, workflow: 'draft', report: null, snapshot: null,
    layers: { blocks: true, labels: true, errors: true, boundary: true, context: true },
    measure: false, measurePoints: [], viewBox: { x: 0, y: 0, w: 980, h: 620 }, logs: []
  };
  const map = $('#land-map');
  const helpBody = $('#info-dialog .dialog-body').innerHTML;
  let toastTimer, dragged = false, pan = null;
  const isLocked = () => lockedStates.has(state.workflow);
  const getBlock = id => state.blocks.find(b => b.id === id);
  const selected = () => getBlock(state.selected);

  /** Evaluate only three explicit fixture checks; never infer full conformance. */
  function issues() {
    const result = [];
    state.blocks.forEach(b => {
      if (!b.subject) result.push({ id: `subject:${b.id}`, block: b.id, severity: 'error', code: 'SUBJECT_REQUIRED', title: 'Thiếu đối tượng sử dụng đất', detail: 'Nhãn đối tượng của khoanh mẫu đang trống.' });
      const delta = b.declaredArea - areaOf(b.geometry);
      if (Math.abs(delta) > 0.1) result.push({ id: `area:${b.id}`, block: b.id, severity: 'error', code: 'AREA_MISMATCH', title: 'Diện tích nhãn chưa khớp hình học', detail: `Chênh ${number(delta)} m². Ngưỡng đối chiếu của tập mẫu: 0,1 m².` });
      if (b.missingHistory) result.push({ id: `history:${b.id}`, block: b.id, severity: 'warning', code: 'HISTORY_MISSING', title: 'Chưa có nguồn số liệu kỳ trước', detail: 'Cần tài liệu đối chiếu khi lập số liệu biến động.' });
    });
    return result;
  }
  function log(message) {
    state.logs.unshift({ at: new Date().toISOString(), message });
    state.logs = state.logs.slice(0, 100);
  }
  function toast(message) {
    $('#toast').textContent = message; $('#toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3700);
    $('#status-message').textContent = message;
  }
  function button(action, label, type = '', disabled = false, extra = '') {
    return `<button class="button ${type}" data-action="${action}" ${disabled ? 'disabled' : ''} ${extra}>${label}</button>`;
  }
  function quality(b) {
    const list = issues().filter(i => i.block === b.id);
    if (list.some(i => i.severity === 'error')) return { css: 'error', text: 'Cần sửa mẫu', fill: '#e6ae91' };
    if (list.length) return { css: 'warning', text: 'Cảnh báo mẫu', fill: '#e6d195' };
    return { css: '', text: state.checked ? 'Đạt kiểm tra mẫu' : 'Chưa chạy kiểm tra', fill: state.checked ? '#a8c9e6' : '#ccdce6' };
  }

  function renderMap() {
    renderLegend();
    $('#blocks-layer').innerHTML = state.blocks.map(b => {
      const color = state.theme === 'quality' ? quality(b).fill : fixture.catalog[b.landUse].color;
      return `<polygon class="land-block ${b.id === state.selected ? 'selected' : ''}" data-block="${b.id}" points="${pointsString(b.geometry)}" fill="${color}" tabindex="0" role="button" aria-label="Khoanh ${b.id}, ${fixture.catalog[b.landUse].label}, ${number(areaOf(b.geometry))} mét vuông" aria-pressed="${b.id === state.selected}"><title>${b.id} · ${b.landUse} · ${number(areaOf(b.geometry))} m²</title></polygon>`;
    }).join('');
    $('#labels-layer').innerHTML = state.blocks.map(b => {
      const [x, y] = centroid(b.geometry), road = b.landUse === 'DGT';
      return `<text x="${x}" y="${polygonY(y) - 2}" class="block-label ${road ? 'road-label' : ''}"><tspan x="${x}">${String(b.number).padStart(2, '0')}</tspan><tspan x="${x}" dy="15">${b.landUse}</tspan></text>`;
    }).join('');
    $('#boundary-layer').innerHTML = `<polygon points="${pointsString(fixture.outline)}" class="boundary-path"/>`;
    $('#errors-layer').innerHTML = issues().map(i => {
      const b = getBlock(i.block), [x, y] = centroid(b.geometry);
      return `<circle cx="${x + 28}" cy="${polygonY(y) - 23}" r="10" class="issue-marker"/><text x="${x + 28}" y="${polygonY(y) - 18}" class="issue-marker-text">!</text>`;
    }).join('');
    Object.entries(state.layers).forEach(([key, value]) => { $(`#${key}-layer`).style.display = value ? '' : 'none'; });
    const errors = issues().filter(i => i.severity === 'error').length;
    $('#map-quality-badge').textContent = errors ? `${errors} vị trí cần sửa` : 'Không còn lỗi mẫu';
    $('#summary-area').textContent = `${number(totalArea(state.blocks) / 10000, 2)} ha`;
    $('#project-area').textContent = `${number(totalArea(state.blocks) / 10000, 2)} ha`;
    $('#selection-summary').textContent = `Đang chọn khoanh ${state.selected}`;
    $('#overview-map').innerHTML = `<rect width="980" height="620" fill="#eff4f2"/>${state.blocks.map(b => `<polygon points="${pointsString(b.geometry)}" fill="${fixture.catalog[b.landUse].color}" stroke="white" stroke-width="5"/>`).join('')}<rect id="overview-extent" fill="#ffffff15" stroke="#075ba8" stroke-width="4"/>`;
    renderMeasure(); updateViewBox();
  }
  function renderLegend() {
    $('.layer-legend .section-label').textContent = state.theme === 'quality' ? 'CHÚ GIẢI KIỂM TRA MẪU' : 'CHÚ GIẢI LOẠI ĐẤT';
    const items = state.theme === 'quality'
      ? [['Lỗi', 'Cần sửa mẫu', '#e6ae91'], ['Lưu ý', 'Cảnh báo nguồn kỳ trước', '#e6d195'], ['Khác', state.checked ? 'Đạt các kiểm tra mẫu' : 'Chưa chạy kiểm tra', state.checked ? '#a8c9e6' : '#ccdce6']]
      : Object.entries(fixture.catalog).map(([code, item]) => [code, item.label.replace(/^Đất /, ''), item.color]);
    $('#landuse-legend').innerHTML = items.map(([code, label, color]) => `<div class="legend-item"><span class="legend-color" style="background:${color}"></span><b>${code}</b><span>${label}</span></div>`).join('');
  }
  function renderInspector() {
    const b = selected(), q = quality(b), area = areaOf(b.geometry);
    $('#inspector-content').innerHTML = `<div class="inspector-heading"><div class="block-index"><div><span class="eyebrow">KHOANH ĐANG CHỌN</span><h1>${b.id}</h1></div><span class="selected-code" style="background:${fixture.catalog[b.landUse].color}">${b.landUse}</span></div><div class="selection-meta">Số khoanh ${String(b.number).padStart(2, '0')} · Kỳ thống kê mẫu 2025</div></div>
      <div class="inspection-status ${q.css}">${icon(q.css ? 'alert' : 'check')}${q.text}</div>
      <section class="property-section"><div class="section-label">THUỘC TÍNH NGHIỆP VỤ</div><dl class="property-list"><div><dt>Loại đất</dt><dd>${fixture.catalog[b.landUse].label}</dd></div><div><dt>Mã loại đất</dt><dd>${b.landUse}</dd></div><div><dt>Đối tượng</dt><dd>${b.subject ? subjectNames[b.subject] : '<span style="color:#b06444">Chưa xác định</span>'}</dd></div><div><dt>Diện tích vật lý</dt><dd class="area-value" id="selected-area">${number(area)}<span class="unit">m²</span></dd></div><div><dt>Diện tích nhãn</dt><dd>${number(b.declaredArea)} <span class="unit">m²</span></dd></div><div><dt>Chênh lệch</dt><dd>${number(b.declaredArea - area)} <span class="unit">m²</span></dd></div><div><dt>Loại đất kỳ trước</dt><dd>${b.previousLandUse}${b.missingHistory ? ' · Thiếu nguồn' : ''}</dd></div></dl></section>
      ${b.combinedUse ? `<div class="combined-card"><strong>Sử dụng kết hợp · ${b.combinedUse.code}</strong>${number(b.combinedUse.area)} m² được lưu riêng. Diện tích vật lý của khoanh vẫn là ${number(area)} m².</div>` : ''}
      <div class="source-card"><strong>Dấu vết dữ liệu mẫu</strong>Phần tử: ${b.source.element}<br>Lớp hình học tương ứng: 30<br>Lưới cục bộ mô phỏng · Mét<br>Chưa đọc từ DGN thực tế</div>
      ${issues().some(i => i.block === b.id && i.severity === 'error') ? button('fix-selected', 'Sửa lỗi trong khoanh mẫu', 'fix-selected', isLocked()) : ''}`;
  }
  function renderTable() {
    const list = issues();
    $('#table-issues').textContent = list.length;
    document.querySelectorAll('[data-table]').forEach(el => {
      const active = el.dataset.table === state.table;
      el.classList.toggle('active', active); el.setAttribute('aria-selected', String(active));
    });
    $('#block-search').disabled = state.table !== 'attributes';
    if (state.table === 'history') {
      $('#attribute-content').innerHTML = state.logs.map(l => `<div class="history-row"><time>${new Date(l.at).toLocaleTimeString('vi-VN')}</time><strong>${escape(l.message)}</strong></div>`).join('') || '<div class="table-empty">Chưa có thao tác nào.</div>';
      $('#table-record-count').textContent = `${state.logs.length} sự kiện trong phiên`; return;
    }
    if (state.table === 'issues') {
      $('#attribute-content').innerHTML = list.length ? `<table class="data-table"><thead><tr><th>Khoanh</th><th>Mức</th><th>Nội dung</th><th>Thao tác</th></tr></thead><tbody>${list.map(i => `<tr data-block="${i.block}" tabindex="0"><td>${i.block}</td><td><span class="quality-tag ${i.severity}">${i.severity === 'error' ? 'Lỗi mẫu' : 'Cảnh báo'}</span></td><td>${i.title}</td><td>${i.severity === 'error' ? `<button class="inline-action" data-action="fix-one" data-id="${i.block}" ${isLocked() ? 'disabled' : ''}>Sửa mẫu</button>` : 'Cần nguồn kỳ trước'}</td></tr>`).join('')}</tbody></table>` : '<div class="table-empty">Không còn lỗi hoặc cảnh báo của tập mẫu.</div>';
      $('#table-record-count').textContent = `${list.length} kết quả mẫu`; return;
    }
    const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const query = normalize(state.search);
    const blocks = state.blocks.filter(b => normalize(`${b.id} ${b.number} ${b.landUse} ${fixture.catalog[b.landUse].label} ${b.subject}`).includes(query)).sort((a, b) => state.sort === 'area' ? areaOf(b.geometry) - areaOf(a.geometry) : a.number - b.number);
    $('#attribute-content').innerHTML = `<table class="data-table"><thead><tr><th><button data-action="sort-number">Khoanh</button></th><th>Mã đất</th><th>Đối tượng</th><th class="number"><button data-action="sort-area">Diện tích (m²)</button></th><th class="number">Nhãn (m²)</th><th>Trạng thái mẫu</th></tr></thead><tbody>${blocks.map(b => `<tr data-block="${b.id}" tabindex="0" class="${b.id === state.selected ? 'selected' : ''}" aria-selected="${b.id === state.selected}"><td><strong>${b.id}</strong></td><td><span class="table-land-use"><span class="table-dot" style="background:${fixture.catalog[b.landUse].color}"></span>${b.landUse}</span></td><td>${b.subject || '—'}</td><td class="number">${number(areaOf(b.geometry))}</td><td class="number">${number(b.declaredArea)}</td><td><span class="quality-tag ${quality(b).css}">${quality(b).text}</span></td></tr>`).join('')}</tbody></table>${!blocks.length ? '<div class="table-empty">Không có khoanh khớp từ khóa.</div>' : ''}`;
    $('#table-record-count').textContent = `${blocks.length} / ${state.blocks.length} bản ghi`;
  }
  function renderChecks() {
    const list = issues(), errors = list.filter(i => i.severity === 'error').length, warnings = list.length - errors;
    $('#checks-view').innerHTML = `<div class="view-heading"><div><span class="eyebrow">CHẤT LƯỢNG DỮ LIỆU</span><h1>Kiểm tra khoanh đất mẫu</h1><p>Đối chiếu diện tích nhãn, đối tượng sử dụng và nguồn kỳ trước trên tập dữ liệu mô phỏng.</p></div>${button('validate', icon('inspect') + (state.busy ? 'Đang kiểm tra…' : 'Chạy kiểm tra'), 'primary', state.busy)}</div>
      <div class="metric-grid"><div class="metric-card"><span>Khoanh trong tập mẫu</span><strong>${state.blocks.length}</strong><small>${state.checked ? 'Đã chạy kiểm tra mẫu' : 'Chưa chạy kiểm tra'}</small></div><div class="metric-card alert"><span>Lỗi cần sửa</span><strong>${errors}</strong><small>Chặn tổng hợp mẫu</small></div><div class="metric-card warn"><span>Cảnh báo</span><strong>${warnings}</strong><small>Thiếu dữ liệu đối chiếu</small></div></div>
      ${list.map(i => `<article class="check-item"><div class="check-symbol ${i.severity}">${icon('alert')}</div><div><strong>${i.block} · ${i.title}</strong><p>${i.detail}</p></div>${button('locate', 'Xem vị trí', '', false, `data-id="${i.block}"`)}${i.severity === 'error' ? button('fix-one', 'Sửa mẫu', '', isLocked(), `data-id="${i.block}"`) : ''}</article>`).join('') || `<div class="view-note">Đã xử lý các kiểm tra của tập mẫu.</div>`}
      <div class="button-row" style="margin-top:18px">${button('fix-all', 'Sửa các lỗi mẫu', '', !errors || isLocked())}${button('aggregate', 'Tổng hợp biểu mẫu', 'primary', state.busy || !state.checked || errors > 0)}</div>
      <div class="view-note">Ngưỡng đối chiếu diện tích của ví dụ này là 0,1 m². Chưa kiểm tra đầy đủ topology, CRS, danh mục hoặc quy tắc TKKK; kết quả không phải chứng nhận đạt quy định.</div>`;
    $('#nav-issues').textContent = list.length;
    $('#layer-issue-count').textContent = `${errors} lỗi · ${warnings} cảnh báo`;
  }
  function statistics() {
    const totals = {};
    Object.keys(fixture.catalog).forEach(code => { totals[code] = { count: 0, area: 0 }; });
    state.blocks.forEach(b => { totals[b.landUse].count++; totals[b.landUse].area += areaOf(b.geometry); });
    return totals;
  }
  function renderStats() {
    const totals = statistics(), total = totalArea(state.blocks), largest = Math.max(...Object.values(totals).map(v => v.area));
    const combined = state.blocks.reduce((sum, b) => sum + (b.combinedUse?.area || 0), 0);
    $('#stats-view').innerHTML = `<div class="view-heading"><div><span class="eyebrow">TỔNG HỢP DIỆN TÍCH</span><h1>Thống kê trên dữ liệu mẫu</h1><p>${state.report ? 'Đã tạo bảng tổng hợp minh hoạ trong phiên làm việc.' : 'Xem trước số liệu hình học. Cần chạy kiểm tra và sửa lỗi mẫu trước khi tổng hợp.'}</p></div>${button('aggregate', icon('chart') + 'Tổng hợp mẫu', 'primary', state.busy || isLocked())}</div>
      <div class="metric-grid"><div class="metric-card"><span>Diện tích vật lý</span><strong>${number(total / 10000, 2)}</strong><small>ha · Không cộng trùng đất kết hợp</small></div><div class="metric-card"><span>Khoanh đất</span><strong>${state.blocks.length}</strong><small>${Object.keys(totals).length} nhóm loại đất mẫu</small></div><div class="metric-card"><span>Sử dụng kết hợp</span><strong>${number(combined / 10000, 3)}</strong><small>ha · Theo dõi riêng</small></div></div>
      <div class="report-kicker"><strong>Diện tích theo loại đất · ha</strong><span>${state.report ? 'Đã tổng hợp mẫu' : 'Số liệu xem trước'}</span></div><div class="bar-chart" role="img" aria-label="Biểu đồ diện tích theo loại đất, dữ liệu mẫu">${Object.entries(totals).map(([code, value]) => `<div class="bar-row"><span>${code}</span><div class="bar-track"><div class="bar-fill" style="width:${value.area / largest * 100}%;background:${fixture.catalog[code].color}"></div></div><b class="bar-value">${number(value.area / 10000, 2)}</b></div>`).join('')}</div>
      <h2 class="report-title">Bảng tổng hợp minh hoạ</h2><table class="data-table report-table"><thead><tr><th>Loại đất</th><th class="number">Khoanh</th><th class="number">Diện tích (ha)</th><th class="number">Tỷ lệ (%)</th></tr></thead><tbody>${Object.entries(totals).map(([code, v]) => `<tr><td><span class="table-land-use"><span class="legend-color" style="background:${fixture.catalog[code].color}"></span>${code} · ${fixture.catalog[code].label}</span></td><td class="number">${v.count}</td><td class="number">${number(v.area / 10000, 2)}</td><td class="number">${number(v.area / total * 100, 1)}</td></tr>`).join('')}</tbody><tfoot><tr><td>Tổng diện tích vật lý</td><td class="number">${state.blocks.length}</td><td class="number">${number(total / 10000, 2)}</td><td class="number">100,0</td></tr></tfoot></table>
      <div class="button-row" style="margin-top:18px">${button('csv', icon('download') + 'Xuất CSV mẫu')}${button('go-dossier', 'Xem hồ sơ', 'primary')}</div><div class="view-note">Bảng minh hoạ được tính từ hình học tổng hợp trong lưới mét. Chưa phải mẫu biểu chính thức hoặc số liệu kiểm kê thực tế.</div>`;
  }
  function renderDossier() {
    const steps = ['draft', 'ready', 'uploaded', 'pending', 'approved'];
    const index = steps.indexOf(state.workflow === 'checked' || state.workflow === 'returned' ? 'draft' : state.workflow);
    const snapshot = state.snapshot;
    $('#dossier-view').innerHTML = `<div class="view-heading"><div><span class="eyebrow">QUY TRÌNH HỒ SƠ</span><h1>Hồ sơ thống kê mẫu 2025</h1><p>Các bước gửi, nộp, duyệt và trả lại chỉ thay đổi trạng thái mô phỏng trong trình duyệt.</p></div><span class="quality-tag ${state.workflow === 'returned' ? 'warning' : ''}">${stateNames[state.workflow]}</span></div>
      <ol class="state-timeline">${steps.map((key, i) => `<li class="${i === index ? 'current' : i < index ? 'done' : ''}"><span class="step-circle">${i + 1}</span>${['Bản nháp', 'Sẵn sàng', 'Đã gửi', 'Chờ duyệt', 'Đã duyệt'][i]}</li>`).join('')}</ol>
      <div class="dossier-card">${icon('folder')}<div><h2>Đơn vị hành chính mẫu</h2><p>${state.blocks.length} khoanh · ${number(totalArea(state.blocks) / 10000, 2)} ha · Lưới cục bộ mô phỏng</p><p>${state.report ? 'Có bảng tổng hợp mẫu trong phiên.' : 'Chưa tổng hợp biểu mẫu.'}</p><p>${snapshot ? `Snapshot ${escape(snapshot.id)} · Được tạo lúc ${new Date(snapshot.createdAt).toLocaleTimeString('vi-VN')}` : 'Snapshot sẽ được tạo khi gửi hồ sơ mẫu.'}</p></div></div>
      <div class="button-row">${button('submit', 'Mô phỏng gửi hồ sơ', 'primary', state.workflow !== 'ready')}${button('request-review', 'Mô phỏng nộp duyệt', 'primary', state.workflow !== 'uploaded')}${button('approve', 'Mô phỏng duyệt', 'primary', state.workflow !== 'pending')}${button('return', 'Mô phỏng trả lại', 'danger', !['uploaded', 'pending', 'approved'].includes(state.workflow))}${button('export', icon('download') + 'Xuất JSON mẫu')}</div>
      <div class="view-note">${isLocked() ? 'Phiên bản đã gửi được khóa sửa dữ liệu. Dùng “Mô phỏng trả lại” để tạo lượt chỉnh sửa; snapshot đã gửi được giữ nguyên trong phiên.' : state.workflow === 'returned' ? 'Hồ sơ được trả lại trong mô phỏng. Kiểm tra và tổng hợp lại trước lần gửi tiếp theo.' : 'Chạy kiểm tra, xử lý lỗi mẫu và tổng hợp biểu để mở bước gửi hồ sơ.'} Chưa có kết nối máy chủ hoặc xác nhận giao nộp thực tế.</div>
      <h2 class="report-title">Nhật ký phiên làm việc</h2>${state.logs.slice(0, 8).map(l => `<div class="history-row"><time>${new Date(l.at).toLocaleTimeString('vi-VN')}</time><strong>${escape(l.message)}</strong></div>`).join('')}`;
  }
  function renderArchitecture() {
    $('#architecture-view').innerHTML = `<div class="view-heading"><div><span class="eyebrow">THIẾT KẾ MỞ · MIT</span><h1>Mười hai thành phần độc lập</h1><p>Giao diện này minh hoạ các ranh giới từ hồ sơ thiết kế VLIS. Chưa phải các module đã dịch ngược từ bộ cài.</p></div><a class="button" href="https://github.com/Vietflexmap/VLIS/blob/main/docs/02-ban-do-thanh-phan.md" target="_blank" rel="noopener noreferrer">Đọc đặc tả</a></div><div class="module-grid">${fixture.modules.map(([id, name, detail]) => `<article class="module-card"><span>${id}</span><h2>${name}</h2><p>${detail}</p></article>`).join('')}</div>`;
  }
  function renderAll() {
    renderMap(); renderInspector(); renderTable(); renderChecks(); renderStats(); renderDossier(); renderArchitecture();
    $('#document-state').textContent = stateNames[state.workflow];
    $('#ribbon-check').disabled = state.busy;
    $('#ribbon-aggregate').disabled = state.busy || isLocked();
  }
  function setView(view) {
    state.view = view;
    ['map', 'checks', 'stats', 'dossier', 'architecture'].forEach(key => { $(`#${key}-view`).hidden = key !== view; });
    document.querySelectorAll('[data-view]').forEach(el => {
      const active = el.dataset.view === view;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    if (view === 'map') requestAnimationFrame(updateScale);
  }
  function selectBlock(id) {
    if (!getBlock(id)) return;
    state.selected = id;
    renderMap(); renderInspector(); renderTable();
    $('#status-message').textContent = `Đang chọn khoanh ${id} · ${fixture.catalog[selected().landUse].label}`;
  }
  function updateScale() {
    const ctm = map.getScreenCTM();
    if (!ctm || !ctm.a) return;
    const target = 95 / ctm.a;
    const candidates = [10, 20, 50, 100, 200, 500];
    const distance = candidates.reduce((best, value) => Math.abs(value - target) < Math.abs(best - target) ? value : best, 100);
    $('#scale-label').textContent = `${distance} m`;
    $('#scale-line').style.width = `${distance * ctm.a}px`;
  }
  function updateViewBox() {
    const v = state.viewBox;
    map.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    $('#zoom-status').textContent = `Thu phóng ${number(980 / v.w * 100, 0)}%`;
    const rect = $('#overview-extent');
    if (rect) { rect.setAttribute('x', v.x); rect.setAttribute('y', v.y); rect.setAttribute('width', v.w); rect.setAttribute('height', v.h); }
    updateScale();
  }
  function zoom(factor, anchor) {
    const v = state.viewBox, width = Math.min(1960, Math.max(180, v.w * factor));
    const f = width / v.w, a = anchor || [v.x + v.w / 2, v.y + v.h / 2];
    v.x = a[0] - (a[0] - v.x) * f; v.y = a[1] - (a[1] - v.y) * f; v.w = width; v.h *= f;
    updateViewBox();
  }
  function mapPoint(event) {
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(map.getScreenCTM().inverse());
    return [p.x, p.y];
  }
  function renderMeasure() {
    const points = state.measurePoints;
    $('#measure-layer').innerHTML = points.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#075ba8" stroke="white" stroke-width="2"/>`).join('') + (points.length === 2 ? `<path d="M${points[0].join(' ')}L${points[1].join(' ')}" stroke="#075ba8" stroke-width="2" fill="none" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>` : '');
    $('#measure-hint').hidden = !state.measure;
    if (points.length === 2) $('#measure-hint').textContent = `Khoảng cách lưới mẫu: ${number(Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]))} m. Chọn điểm mới để đo lại.`;
    else $('#measure-hint').textContent = points.length ? 'Chọn điểm thứ hai để hoàn tất phép đo.' : 'Chọn hai điểm để đo khoảng cách trên lưới mẫu.';
  }
  async function validate() {
    if (state.busy) return;
    state.busy = true; setView('checks'); renderAll(); toast('Đang đối chiếu dữ liệu trong tập mẫu…');
    await new Promise(resolve => setTimeout(resolve, 550));
    state.busy = false; state.checked = true;
    if (!isLocked()) state.workflow = 'checked';
    const count = issues().filter(i => i.severity === 'error').length;
    log(`Kiểm tra tập mẫu: ${count} lỗi, ${issues().length - count} cảnh báo.`);
    renderAll(); toast(count ? `Có ${count} lỗi mẫu cần sửa trước khi tổng hợp.` : 'Đã kiểm tra mẫu: không còn lỗi chặn, còn cảnh báo nguồn kỳ trước.');
  }
  async function fix(ids) {
    if (isLocked()) { toast('Phiên bản mẫu đã gửi đang khóa sửa.'); return; }
    if (state.busy) return;
    ids.forEach(id => { const b = getBlock(id); if (b) { if (!b.subject) b.subject = 'CNV'; b.declaredArea = areaOf(b.geometry); } });
    state.checked = false; state.report = null; state.workflow = 'draft';
    log(`Sửa thuộc tính mẫu: ${ids.join(', ')}; giữ nguyên hình học và cảnh báo kỳ trước.`);
    renderAll(); await validate();
  }
  function aggregate() {
    if (isLocked()) { toast('Hồ sơ mẫu đã gửi đang khóa.'); return; }
    if (!state.checked || issues().some(i => i.severity === 'error')) { setView('checks'); toast('Cần chạy kiểm tra và sửa lỗi mẫu trước khi tổng hợp.'); return; }
    state.report = { generatedAt: new Date().toISOString(), totals: statistics(), totalAreaM2: totalArea(state.blocks), status: 'synthetic_demo_only' };
    state.workflow = 'ready'; log('Đã tổng hợp bảng diện tích minh hoạ; không cộng trùng đất kết hợp.');
    renderAll(); setView('stats'); toast('Đã tổng hợp biểu mẫu. Có thể thử quy trình hồ sơ.');
  }
  function download(name, type, content) {
    const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement('a');
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function exportJson() {
    const useSnapshot = isLocked() && state.snapshot;
    const payload = useSnapshot ? state.snapshot : { id: 'VLIS-DEMO-DRAFT', createdAt: new Date().toISOString(), coordinateSystem: fixture.coordinateSystem, blocks: clone(state.blocks), report: clone(state.report), syntheticData: true };
    download('VLIS-ho-so-mo-phong.json', 'application/json;charset=utf-8', JSON.stringify({ ...payload, previousSubmittedSnapshot: useSnapshot ? null : clone(state.snapshot), currentDemoState: state.workflow, note: 'Synthetic local metric data. Not an official TKKK exchange package.' }, null, 2));
    log('Xuất JSON mẫu; không gửi dữ liệu tới máy chủ.'); renderTable(); toast('Đã xuất hồ sơ JSON mô phỏng.');
  }
  function exportCsv() {
    const quote = value => `"${String(value).replace(/"/g, '""')}"`;
    const totals = statistics();
    const rows = [['Ma_loai_dat', 'Ten_loai_dat', 'So_khoanh', 'Dien_tich_m2', 'Dien_tich_ha', 'Loai_du_lieu']];
    Object.entries(totals).forEach(([code, v]) => rows.push([code, fixture.catalog[code].label, v.count, v.area.toFixed(1), (v.area / 10000).toFixed(4), 'SYNTHETIC_DEMO']));
    download('VLIS-thong-ke-mo-phong.csv', 'text/csv;charset=utf-8', '\uFEFF' + rows.map(row => row.map(quote).join(',')).join('\r\n'));
    log('Xuất CSV diện tích từ hình học mẫu.'); renderTable(); toast('Đã xuất CSV thống kê mẫu.');
  }
  function showDialog(title, html) {
    $('#dialog-title').textContent = title; $('#info-dialog .dialog-body').innerHTML = html;
    if (!$('#info-dialog').open) $('#info-dialog').showModal();
  }
  async function action(name, target) {
    switch (name) {
      case 'sample':
        if (state.busy) return;
        state.blocks = clone(fixture.blocks); state.selected = 'K009'; state.checked = false; state.report = null; state.snapshot = null; state.workflow = 'draft'; state.search = ''; $('#block-search').value = ''; state.logs = []; log('Nạp hồ sơ mới với 20 khoanh đất tổng hợp.'); renderAll(); setView('map'); toast('Đã mở lại dữ liệu mẫu; trạng thái chỉ lưu trong phiên.'); break;
      case 'select': case 'measure':
        state.measure = name === 'measure' && !state.measure; state.measurePoints = [];
        $('#map-stage').classList.toggle('measuring', state.measure); $('#select-tool').classList.toggle('active', !state.measure); $('#select-tool').setAttribute('aria-pressed', String(!state.measure)); $('#measure-tool').classList.toggle('active', state.measure); $('#measure-tool').setAttribute('aria-pressed', String(state.measure)); renderMeasure(); setView('map'); break;
      case 'fit': state.viewBox = { x: 0, y: 0, w: 980, h: 620 }; updateViewBox(); setView('map'); break;
      case 'zoom-in': zoom(.8); break;
      case 'zoom-out': zoom(1.25); break;
      case 'validate': await validate(); break;
      case 'aggregate': aggregate(); break;
      case 'fix-selected': await fix([state.selected]); break;
      case 'fix-one': await fix([target.dataset.id]); break;
      case 'fix-all': await fix([...new Set(issues().filter(i => i.severity === 'error').map(i => i.block))]); break;
      case 'locate': selectBlock(target.dataset.id); setView('map'); break;
      case 'sort-number': state.sort = 'number'; renderTable(); break;
      case 'sort-area': state.sort = 'area'; renderTable(); break;
      case 'go-dossier': setView('dossier'); break;
      case 'export': exportJson(); break;
      case 'csv': exportCsv(); break;
      case 'submit':
        if (state.workflow !== 'ready') return;
        state.snapshot = { id: `VLIS-DEMO-${Date.now()}`, createdAt: new Date().toISOString(), blocks: clone(state.blocks), report: clone(state.report), coordinateSystem: clone(fixture.coordinateSystem), syntheticData: true };
        state.workflow = 'uploaded'; log('Mô phỏng gửi: tạo snapshot và khóa sửa phiên bản mẫu.'); renderAll(); toast('Đã gửi trong mô phỏng; chưa nộp duyệt và chưa có dữ liệu gửi ra ngoài.'); break;
      case 'request-review': if (state.workflow !== 'uploaded') return; state.workflow = 'pending'; log('Mô phỏng nộp: chuyển hồ sơ sang chờ duyệt.'); renderAll(); toast('Hồ sơ mẫu đang chờ duyệt.'); break;
      case 'approve': if (state.workflow !== 'pending') return; state.workflow = 'approved'; log('Mô phỏng duyệt hồ sơ; không có xác nhận từ cơ quan.'); renderAll(); toast('Đã duyệt hồ sơ trong mô phỏng.'); break;
      case 'return': if (!isLocked()) return; state.workflow = 'returned'; state.report = null; state.checked = false; log('Mô phỏng trả lại hồ sơ: mở lượt chỉnh sửa, giữ snapshot trước đó.'); renderAll(); toast('Đã mở lượt sửa của hồ sơ mẫu.'); break;
      case 'help': showDialog('Về bản mô phỏng VLIS', helpBody); break;
      case 'open-inspector': showDialog(`Thông tin khoanh ${state.selected}`, $('#inspector-content').innerHTML); break;
      case 'open-layers': showDialog('Các lớp dữ liệu mẫu', $('.layer-list').innerHTML); break;
      case 'close-dialog': $('#info-dialog').close(); break;
      case 'print': window.print(); break;
    }
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (target && !target.disabled) { event.preventDefault(); action(target.dataset.action, target); return; }
    const view = event.target.closest('[data-view]'); if (view) { setView(view.dataset.view); return; }
    const table = event.target.closest('[data-table]'); if (table) { state.table = table.dataset.table; renderTable(); return; }
    const block = event.target.closest('[data-block]');
    if (block && !state.measure && !(block.closest('svg') && dragged)) selectBlock(block.dataset.block);
  });
  document.addEventListener('keydown', event => {
    const block = event.target.closest('[data-block]');
    if (block && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); selectBlock(block.dataset.block); }
    if (event.key === 'Escape' && state.measure) action('select');
  });
  document.addEventListener('change', event => {
    if (event.target.matches('[data-layer]')) {
      state.layers[event.target.dataset.layer] = event.target.checked;
      document.querySelectorAll(`[data-layer="${event.target.dataset.layer}"]`).forEach(el => { el.checked = event.target.checked; });
      renderMap();
    }
    if (event.target.id === 'map-theme') { state.theme = event.target.value; renderMap(); }
  });
  $('#block-search').addEventListener('input', event => { state.search = event.target.value; renderTable(); });
  map.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? 1.12 : .89, mapPoint(event)); }, { passive: false });
  map.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragged = false;
    const point = mapPoint(event);
    if (state.measure) { if (state.measurePoints.length === 2) state.measurePoints = []; state.measurePoints.push(point); renderMeasure(); return; }
    pan = { pointer: event.pointerId, x: event.clientX, y: event.clientY, scale: map.getScreenCTM().a, viewBox: { ...state.viewBox } };
  });
  map.addEventListener('pointermove', event => {
    const point = mapPoint(event);
    $('#coordinate-status').textContent = `E: ${number(point[0])} · N: ${number(620 - point[1])} m`;
    if (!pan || state.measure) return;
    const dx = event.clientX - pan.x, dy = event.clientY - pan.y;
    if (Math.hypot(dx, dy) > 4) {
      dragged = true;
      if (!map.hasPointerCapture(event.pointerId)) map.setPointerCapture(event.pointerId);
      state.viewBox.x = pan.viewBox.x - dx / pan.scale; state.viewBox.y = pan.viewBox.y - dy / pan.scale; updateViewBox();
    }
  });
  map.addEventListener('pointerup', event => { pan = null; if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId); setTimeout(() => { dragged = false; }, 20); });
  map.addEventListener('pointercancel', () => { pan = null; dragged = false; });
  window.addEventListener('resize', updateScale);
  $('.map-topline').insertAdjacentHTML('beforeend', `<div class="mobile-map-actions"><button class="icon-button mobile-layer-button" data-action="open-layers" aria-label="Mở danh sách lớp">${icon('layers')}</button><button class="icon-button" data-action="open-inspector" aria-label="Mở thông tin khoanh">${icon('info')}</button></div>`);
  log('Nạp 20 khoanh mẫu trên lưới cục bộ mét; chưa đọc DGN.');
  renderAll(); requestAnimationFrame(updateScale);
  window.VLISDemo = Object.freeze({ getState: () => clone({ blocks: state.blocks, selected: state.selected, view: state.view, checked: state.checked, workflow: state.workflow, report: state.report, snapshot: state.snapshot, issues: issues(), totalAreaM2: totalArea(state.blocks) }) });
})();
