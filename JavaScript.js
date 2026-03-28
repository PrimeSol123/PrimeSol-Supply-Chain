let orderData = [];
let currentEditIndex = -1;
let tempPayItems = [];
let tempTrackingRecords = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFromLocal();
  renderTable();
  bindAllEvents();
  initImportExport();
});

// 本地存储
function loadFromLocal() {
  const data = localStorage.getItem('supplyChainData');
  if (data) {
    orderData = JSON.parse(data);
  } else {
    orderData = [{
      id: Date.now(),
      warehouseIn: "2026-03-16",
      customer: "测试客户",
      orderId: "TEST001",
      productName: "产品名",
      goods: "货物描述",
      quantity: 1,
      weight: "1kg",
      country: "中国",
      receiver: "收货人 13800138000",
      declareValue: "100USD",
      transport: "快递",
      supplyChain: "供应链",
      channel: "渠道",
      warehouseOut: "2026-03-16",
      payable: 100,
      costRemark: "备注",
      customerPay: 200,
      quoteDetail: "报价明细",
      profit: 100,
      trackingNo: "运单号",
      trackingStatus: "运输中",
      customs: "是",
      remark: "客服备注",
      status: "已发货",
      payItems: [],
      trackingRecords: []
    }];
    saveToLocal();
  }
}

function saveToLocal() {
  localStorage.setItem('supplyChainData', JSON.stringify(orderData));
}

// 截断5个字符
function cutText(t) {
  if (!t) return "";
  return t.length > 5 ? t.slice(0,5)+"..." : t;
}

// 渲染表格
function renderTable() {
  const tbody = document.getElementById('order-tbody');
  tbody.innerHTML = '';
  orderData.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${idx+1}</td>
      <td>${item.warehouseIn}</td>
      <td>${item.customer}</td>
      <td>${item.orderId}</td>
      <td>${item.productName}</td>
      <td>${item.goods}</td>
      <td>${item.quantity}</td>
      <td>${item.weight}</td>
      <td>${item.country}</td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="receiver">${cutText(item.receiver)}</span></td>
      <td>${item.declareValue}</td>
      <td>${item.transport}</td>
      <td>${item.supplyChain}</td>
      <td>${item.channel}</td>
      <td>${item.warehouseOut}</td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="payable">${cutText(item.payable+'')}</span></td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="costRemark">${cutText(item.costRemark)}</span></td>
      <td>${item.customerPay}</td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="quoteDetail">${cutText(item.quoteDetail)}</span></td>
      <td>${item.profit}</td>
      <td>${item.trackingNo}</td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="trackingStatus">${cutText(item.trackingStatus)}</span></td>
      <td>${item.customs}</td>
      <td><span class="detail-popup" data-idx="${idx}" data-key="remark">${cutText(item.remark)}</span></td>
      <td><span class="status">${item.status}</span></td>
      <td>
        <button class="btn-view" data-idx="${idx}">查看</button>
        <button class="btn-edit" data-idx="${idx}">编辑</button>
        <button class="btn-del" data-idx="${idx}">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 全部事件绑定
function bindAllEvents() {
  // 添加订单
  document.getElementById('add-btn').onclick = () => {
    currentEditIndex = -1;
    tempPayItems = [];
    tempTrackingRecords = [];
    document.getElementById('order-form').reset();
    document.getElementById('order-modal').style.display = 'flex';
  };

  // 编辑
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.onclick = () => {
      const idx = btn.dataset.idx;
      currentEditIndex = idx;
      const d = orderData[idx];
      tempPayItems = [...d.payItems];
      tempTrackingRecords = [...d.trackingRecords];

      document.getElementById('form-warehouseIn').value = d.warehouseIn;
      document.getElementById('form-customer').value = d.customer;
      document.getElementById('form-orderId').value = d.orderId;
      document.getElementById('form-productName').value = d.productName;
      document.getElementById('form-goods').value = d.goods;
      document.getElementById('form-quantity').value = d.quantity;
      document.getElementById('form-weight').value = d.weight;
      document.getElementById('form-country').value = d.country;
      document.getElementById('form-receiver').value = d.receiver;
      document.getElementById('form-declareValue').value = d.declareValue;
      document.getElementById('form-transport').value = d.transport;
      document.getElementById('form-supplyChain').value = d.supplyChain;
      document.getElementById('form-channel').value = d.channel;
      document.getElementById('form-warehouseOut').value = d.warehouseOut;
      document.getElementById('form-payable').value = d.payable;
      document.getElementById('form-costRemark').value = d.costRemark;
      document.getElementById('form-customerPay').value = d.customerPay;
      document.getElementById('form-quoteDetail').value = d.quoteDetail;
      document.getElementById('form-profit').value = d.profit;
      document.getElementById('form-trackingNo').value = d.trackingNo;
      document.getElementById('form-trackingStatus').value = d.trackingStatus;
      document.getElementById('form-customs').value = d.customs;
      document.getElementById('form-remark').value = d.remark;
      document.getElementById('form-status').value = d.status;

      renderPayItems();
      renderTrackingRecords();
      document.getElementById('order-modal').style.display = 'flex';
    };
  });

  // 删除
  document.querySelectorAll('.btn-del').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('确认删除？')) return;
      orderData.splice(btn.dataset.idx,1);
      saveToLocal();
      renderTable();
      bindAllEvents();
    };
  });

  // 查看
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.onclick = () => {
      const d = orderData[btn.dataset.idx];
      alert(`
订单：${d.orderId}
客户：${d.customer}
收货人：${d.receiver}
状态：${d.status}
      `);
    };
  });

  // 单元格弹窗
  document.querySelectorAll('.detail-popup').forEach(el => {
    el.onclick = () => {
      const idx = el.dataset.idx;
      const key = el.dataset.key;
      const labels = {
        receiver:'收货人',
        payable:'应付金额',
        costRemark:'成本备注',
        quoteDetail:'报价明细',
        trackingStatus:'物流状态',
        remark:'客服备注'
      };
      alert(labels[key]+"：\n"+ orderData[idx][key]);
    };
  });

  // 关闭弹窗
  document.getElementById('modal-close').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
  };

  // 保存
  document.getElementById('save-btn').onclick = () => {
    const formData = {
      warehouseIn: document.getElementById('form-warehouseIn').value,
      customer: document.getElementById('form-customer').value,
      orderId: document.getElementById('form-orderId').value,
      productName: document.getElementById('form-productName').value,
      goods: document.getElementById('form-goods').value,
      quantity: document.getElementById('form-quantity').value,
      weight: document.getElementById('form-weight').value,
      country: document.getElementById('form-country').value,
      receiver: document.getElementById('form-receiver').value,
      declareValue: document.getElementById('form-declareValue').value,
      transport: document.getElementById('form-transport').value,
      supplyChain: document.getElementById('form-supplyChain').value,
      channel: document.getElementById('form-channel').value,
      warehouseOut: document.getElementById('form-warehouseOut').value,
      payable: document.getElementById('form-payable').value,
      costRemark: document.getElementById('form-costRemark').value,
      customerPay: document.getElementById('form-customerPay').value,
      quoteDetail: document.getElementById('form-quoteDetail').value,
      profit: document.getElementById('form-profit').value,
      trackingNo: document.getElementById('form-trackingNo').value,
      trackingStatus: document.getElementById('form-trackingStatus').value,
      customs: document.getElementById('form-customs').value,
      remark: document.getElementById('form-remark').value,
      status: document.getElementById('form-status').value,
      payItems: tempPayItems,
      trackingRecords: tempTrackingRecords
    };

    if (currentEditIndex === -1) {
      orderData.push({id:Date.now(), ...formData});
    } else {
      orderData[currentEditIndex] = formData;
    }

    saveToLocal();
    document.getElementById('order-modal').style.display = 'none';
    renderTable();
    bindAllEvents();
  };

  // 应付子项
  document.getElementById('add-pay').onclick = () => {
    const amt = document.getElementById('pay-amt').value;
    const rem = document.getElementById('pay-rem').value;
    if (!amt || !rem) return;
    tempPayItems.push({amount:+amt, remark:rem});
    document.getElementById('pay-amt').value = '';
    document.getElementById('pay-rem').value = '';
    renderPayItems();
  };

  // 轨迹
  document.getElementById('add-track').onclick = () => {
    const t = document.getElementById('track-time').value;
    const c = document.getElementById('track-content').value;
    if (!t || !c) return;
    tempTrackingRecords.push({time:t, content:c});
    document.getElementById('track-time').value = '';
    document.getElementById('track-content').value = '';
    renderTrackingRecords();
  };
}

// 渲染子项
function renderPayItems() {
  const box = document.getElementById('pay-list');
  box.innerHTML = tempPayItems.map((i,n)=>`<div>${i.amount} - ${i.remark} <button onclick="tempPayItems.splice(${n},1);renderPayItems()">×</button></div>`).join('');
}
function renderTrackingRecords() {
  const box = document.getElementById('track-list');
  box.innerHTML = tempTrackingRecords.map((i,n)=>`<div>${i.time} ${i.content} <button onclick="tempTrackingRecords.splice(${n},1);renderTrackingRecords()">×</button></div>`).join('');
}

// 导入导出
function initImportExport() {
  document.getElementById('export-btn').onclick = () => {
    const blob = new Blob([JSON.stringify(orderData)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
  };
  document.getElementById('import-btn').onclick = () => {
    const inp = document.createElement('input');
    inp.type='file';
    inp.accept='.json';
    inp.onchange=e=>{
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload=e=>{
        orderData = JSON.parse(e.target.result);
        saveToLocal();
        renderTable();
        bindAllEvents();
        alert('导入成功');
      };
      r.readAsText(f);
    };
    inp.click();
  };
}