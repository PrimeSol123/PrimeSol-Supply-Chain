let orderData = [];
let currentEditIndex = -1;
let tempPayItems = []; // 应付子项临时数据
let tempTrackingRecords = []; // 轨迹记录临时数据

document.addEventListener('DOMContentLoaded', function () {
  loadFromLocal();
  renderTable();
  bindEvents();
  initImportExport();
});

// 本地存储
function loadFromLocal() {
  const local = localStorage.getItem('supplyChainData');
  if (local) {
    orderData = JSON.parse(local);
  } else {
    orderData = [{
      id: 1,
      warehouseIn: '2026-03-16',
      customer: 'Moshe',
      orderId: 'IL2026030901',
      productName: '折叠椅',
      goods: '户外折叠椅',
      quantity: 10,
      weight: '25.5kg',
      country: '以色列',
      receiver: 'Moshe Cohen +972501234567',
      declareValue: '500.00 USD',
      transport: '快递',
      supplyChain: '加时特',
      channel: '快递专线',
      warehouseOut: '2026-03-17',
      payable: 849.00,
      costRemark: '物流成本+包装费',
      customerPay: 1130.30,
      quoteDetail: '基础运费+燃油附加费',
      profit: 331.30,
      trackingNo: '3708875402',
      trackingStatus: '已到达目的国',
      customs: '是',
      remark: '客户要求加急发货，注意包装牢固',
      status: '已发货',
      payItems: [
        { amount: 799.00, remark: '主货款' },
        { amount: 50.00, remark: '运费' }
      ],
      trackingRecords: [
        { time: '2026-03-17 10:30:00', content: '已到达目的国' },
        { time: '2026-03-16 18:20:00', content: '已出库，运输中' }
      ]
    }];
    saveToLocal();
  }
}

function saveToLocal() {
  localStorage.setItem('supplyChainData', JSON.stringify(orderData));
}

// 截断显示前5个字符，超出加...
function truncateText(text) {
  if (!text) return '';
  return text.length > 5 ? text.substring(0, 5) + '...' : text;
}

// 渲染表格（所有弹窗字段只显示前5字符）
function renderTable() {
  const tbody = document.getElementById('order-tbody');
  tbody.innerHTML = '';
  orderData.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${index + 1}</td>
      <td>${item.warehouseIn}</td>
      <td>${item.customer}</td>
      <td>${item.orderId}</td>
      <td>${item.productName}</td>
      <td>${item.goods}</td>
      <td>${item.quantity}</td>
      <td>${item.weight}</td>
      <td>${item.country}</td>
      <!-- 收货人：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="receiver" data-index="${index}">${truncateText(item.receiver)}</span></td>
      <td>${item.declareValue}</td>
      <td>${item.transport}</td>
      <td>${item.supplyChain}</td>
      <td>${item.channel}</td>
      <td>${item.warehouseOut}</td>
      <!-- 应付金额：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="pay" data-index="${index}">${truncateText(item.payable.toFixed(2))}</span></td>
      <!-- 成本备注：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="cost" data-index="${index}">${truncateText(item.costRemark)}</span></td>
      <td>${item.customerPay.toFixed(2)}</td>
      <!-- 报价明细：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="quote" data-index="${index}">${truncateText(item.quoteDetail)}</span></td>
      <td>${item.profit.toFixed(2)}</td>
      <td>${item.trackingNo}</td>
      <!-- 物流状态：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="tracking" data-index="${index}">${truncateText(item.trackingStatus)}</span></td>
      <td>${item.customs}</td>
      <!-- 备注：只显示前5字符，点击弹窗 -->
      <td><span class="detail-link" data-type="remark" data-index="${index}">${truncateText(item.remark)}</span></td>
      <td><span class="status-badge status-${item.status === '已发货' ? 'shipped' : item.status}">${item.status}</span></td>
      <td class="action-buttons">
        <button class="action-btn view-btn" data-index="${index}"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('record-count').textContent = `(共${orderData.length}条记录)`;
}

// 绑定所有事件
function bindEvents() {
  // 新增订单
  document.getElementById('add-btn').onclick = () => {
    currentEditIndex = -1;
    tempPayItems = [];
    tempTrackingRecords = [];
    document.getElementById('order-form').reset();
    document.getElementById('modal-title').innerText = '添加订单';
    renderTempPayItems();
    renderTempTrackingRecords();
    document.getElementById('order-modal').style.display = 'flex';
  };

  // 编辑订单
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = e => {
      const index = +e.currentTarget.dataset.index;
      currentEditIndex = index;
      const item = orderData[index];
      tempPayItems = [...item.payItems];
      tempTrackingRecords = [...item.trackingRecords];
      document.getElementById('modal-title').innerText = '编辑订单';
      // 填充表单
      document.getElementById('form-customer').value = item.customer;
      document.getElementById('form-order-id').value = item.orderId;
      document.getElementById('form-warehouse-in').value = item.warehouseIn;
      document.getElementById('form-product-name').value = item.productName;
      document.getElementById('form-goods').value = item.goods;
      document.getElementById('form-quantity').value = item.quantity;
      document.getElementById('form-weight').value = item.weight;
      document.getElementById('form-country').value = item.country;
      document.getElementById('form-receiver').value = item.receiver;
      document.getElementById('form-declare-value').value = item.declareValue;
      document.getElementById('form-transport').value = item.transport;
      document.getElementById('form-supply-chain').value = item.supplyChain;
      document.getElementById('form-channel').value = item.channel;
      document.getElementById('form-warehouse-out').value = item.warehouseOut;
      document.getElementById('form-payable').value = item.payable;
      document.getElementById('form-cost-remark').value = item.costRemark;
      document.getElementById('form-customer-pay').value = item.customerPay;
      document.getElementById('form-quote-detail').value = item.quoteDetail;
      document.getElementById('form-profit').value = item.profit;
      document.getElementById('form-tracking-no').value = item.trackingNo;
      document.getElementById('form-tracking-status').value = item.trackingStatus;
      document.getElementById('form-customs').value = item.customs;
      document.getElementById('form-remark').value = item.remark;
      document.getElementById('form-status').value = item.status;
      // 渲染临时子项
      renderTempPayItems();
      renderTempTrackingRecords();
      document.getElementById('order-modal').style.display = 'flex';
    };
  });

  // 删除订单
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = e => {
      if (!confirm('确定删除此订单？')) return;
      const index = +e.currentTarget.dataset.index;
      orderData.splice(index, 1);
      saveToLocal();
      renderTable();
      bindEvents();
    };
  });

  // 查看详情（完整弹窗）
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.onclick = e => {
      const index = +e.currentTarget.dataset.index;
      const item = orderData[index];
      let html = `
        <div style="padding:16px;line-height:1.8;">
          <h3>订单详情：${item.orderId}</h3>
          <p><strong>客户：</strong>${item.customer}</p>
          <p><strong>收货人：</strong>${item.receiver}</p>
          <p><strong>目的地：</strong>${item.country}</p>
          <p><strong>产品：</strong>${item.productName} (${item.goods}) × ${item.quantity}</p>
          <p><strong>重量：</strong>${item.weight}</p>
          <p><strong>申报价值：</strong>${item.declareValue}</p>
          <p><strong>运输：</strong>${item.transport} | ${item.supplyChain} | ${item.channel}</p>
          <p><strong>入库：</strong>${item.warehouseIn} | 出库：${item.warehouseOut}</p>
          <p><strong>应付：</strong>¥${item.payable.toFixed(2)} | 应收：¥${item.customerPay.toFixed(2)} | 利润：¥${item.profit.toFixed(2)}</p>
          <p><strong>物流号：</strong>${item.trackingNo} | 状态：${item.trackingStatus}</p>
          <p><strong>报关：</strong>${item.customs} | 状态：${item.status}</p>
          <p><strong>备注：</strong>${item.remark}</p>
          <h4>应付子项</h4>
          <ul>${item.payItems.map(p => `<li>¥${p.amount.toFixed(2)} - ${p.remark}</li>`).join('')}</ul>
          <h4>物流轨迹</h4>
          <ul>${item.trackingRecords.map(t => `<li>${t.time} - ${t.content}</li>`).join('')}</ul>
        </div>
      `;
      const mask = document.createElement('div');
      mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:grid;place-items:center;';
      mask.innerHTML = `
        <div style="background:#fff;max-width:600px;max-height:80vh;overflow-y:auto;border-radius:10px;">
          ${html}
          <button onclick="this.closest('div').remove()" style="margin:16px;padding:8px 16px;background:#165DFF;color:white;border:none;border-radius:6px;">关闭</button>
        </div>
      `;
      document.body.appendChild(mask);
      mask.onclick = ev => ev.target === mask && mask.remove();
    };
  });

  // 保存订单（含子项+轨迹）
  document.getElementById('modal-save').onclick = () => {
    const formData = {
      warehouseIn: document.getElementById('form-warehouse-in').value,
      customer: document.getElementById('form-customer').value,
      orderId: document.getElementById('form-order-id').value,
      productName: document.getElementById('form-product-name').value,
      goods: document.getElementById('form-goods').value,
      quantity: +document.getElementById('form-quantity').value,
      weight: document.getElementById('form-weight').value,
      country: document.getElementById('form-country').value,
      receiver: document.getElementById('form-receiver').value,
      declareValue: document.getElementById('form-declare-value').value,
      transport: document.getElementById('form-transport').value,
      supplyChain: document.getElementById('form-supply-chain').value,
      channel: document.getElementById('form-channel').value,
      warehouseOut: document.getElementById('form-warehouse-out').value,
      payable: +document.getElementById('form-payable').value,
      costRemark: document.getElementById('form-cost-remark').value,
      customerPay: +document.getElementById('form-customer-pay').value,
      quoteDetail: document.getElementById('form-quote-detail').value,
      profit: +document.getElementById('form-profit').value,
      trackingNo: document.getElementById('form-tracking-no').value,
      trackingStatus: document.getElementById('form-tracking-status').value,
      customs: document.getElementById('form-customs').value,
      remark: document.getElementById('form-remark').value,
      status: document.getElementById('form-status').value,
      payItems: tempPayItems,
      trackingRecords: tempTrackingRecords
    };
    if (currentEditIndex === -1) {
      orderData.push({ id: Date.now(), ...formData });
    } else {
      orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...formData };
    }
    saveToLocal();
    document.getElementById('order-modal').style.display = 'none';
    renderTable();
    bindEvents();
  };

  // 关闭弹窗
  document.getElementById('modal-cancel').onclick =
  document.getElementById('modal-close').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
  };

  // 自动计算利润
  document.getElementById('form-payable').oninput =
  document.getElementById('form-customer-pay').oninput = () => {
    const cost = +document.getElementById('form-payable').value || 0;
    const income = +document.getElementById('form-customer-pay').value || 0;
    document.getElementById('form-profit').value = (income - cost).toFixed(2);
  };

  // 应付子项：添加
  document.getElementById('add-pay-item').onclick = () => {
    const amount = +document.getElementById('pay-amount').value;
    const remark = document.getElementById('pay-remark').value;
    if (!amount || !remark) return alert('请填写金额和备注');
    tempPayItems.push({ amount, remark });
    document.getElementById('pay-amount').value = '';
    document.getElementById('pay-remark').value = '';
    renderTempPayItems();
  };

  // 应付子项：删除
  window.deletePayItem = (idx) => {
    tempPayItems.splice(idx, 1);
    renderTempPayItems();
  };

  // 轨迹记录：添加
  document.getElementById('add-tracking-record').onclick = () => {
    const time = document.getElementById('tracking-time').value;
    const content = document.getElementById('tracking-content').value;
    if (!time || !content) return alert('请填写时间和内容');
    tempTrackingRecords.push({ time, content });
    document.getElementById('tracking-time').value = '';
    document.getElementById('tracking-content').value = '';
    renderTempTrackingRecords();
  };

  // 轨迹记录：删除
  window.deleteTrackingRecord = (idx) => {
    tempTrackingRecords.splice(idx, 1);
    renderTempTrackingRecords();
  };

  // 详情弹窗（点击显示完整内容）
  document.querySelectorAll('.detail-link').forEach(el => {
    el.onclick = function () {
      const idx = +this.dataset.index;
      const type = this.dataset.type;
      const item = orderData[idx];
      let title, content;
      switch (type) {
        case 'receiver': title = '收货人'; content = item.receiver; break;
        case 'pay': title = '应付金额'; content = '¥' + item.payable.toFixed(2); break;
        case 'cost': title = '成本备注'; content = item.costRemark; break;
        case 'quote': title = '报价明细'; content = item.quoteDetail; break;
        case 'tracking': title = '物流轨迹'; content = item.trackingStatus; break;
        case 'remark': title = '客服备注'; content = item.remark; break;
        default: return;
      }
      const mask = document.createElement('div');
      mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:grid;place-items:center;';
      mask.innerHTML = `
        <div style="background:#fff;padding:24px;border-radius:10px;min-width:300px;">
          <h3>${title}</h3>
          <p>${content}</p>
          <button onclick="this.closest('div').remove()" style="margin-top:12px;padding:8px 16px;background:#165DFF;color:white;border:none;border-radius:6px;">关闭</button>
        </div>
      `;
      document.body.appendChild(mask);
      mask.onclick = ev => ev.target === mask && mask.remove();
    };
  });
}

// 渲染临时应付子项
function renderTempPayItems() {
  const container = document.getElementById('pay-items-container');
  container.innerHTML = tempPayItems.map((p, i) => `
    <div style="display:flex;gap:8px;margin:4px 0;">
      <span>¥${p.amount.toFixed(2)}</span>
      <span>${p.remark}</span>
      <button onclick="deletePayItem(${i})" style="color:red;border:none;background:none;">×</button>
    </div>
  `).join('');
}

// 渲染临时轨迹记录
function renderTempTrackingRecords() {
  const container = document.getElementById('tracking-records-container');
  container.innerHTML = tempTrackingRecords.map((t, i) => `
    <div style="display:flex;gap:8px;margin:4px 0;">
      <span>${t.time}</span>
      <span>${t.content}</span>
      <button onclick="deleteTrackingRecord(${i})" style="color:red;border:none;background:none;">×</button>
    </div>
  `).join('');
}

// 导入导出
function initImportExport() {
  // 导出
  document.getElementById('export-btn').onclick = () => {
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '供应链订单数据.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('导出成功！');
  };

  // 导入
  const importBtn = document.createElement('button');
  importBtn.className = 'btn btn-outline';
  importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
  document.querySelector('.table-actions').appendChild(importBtn);
  importBtn.onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (Array.isArray(data)) {
            orderData = data;
            saveToLocal();
            renderTable();
            bindEvents();
            alert('导入成功！');
          }
        } catch (e) {
          alert('导入失败：格式错误');
        }
      };
      reader.readAsText(file);
    };
    inp.click();
  };
}