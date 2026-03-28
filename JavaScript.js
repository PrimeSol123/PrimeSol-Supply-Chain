// ====================== 配置（已帮你填好） ======================
const GIST_ID = "e37a918b6b3e83e039b873249c9562f8";
const GIST_TOKEN = "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";
const GIST_FILENAME = "data.json";
// ==============================================================

let orderData = [];
let currentEditIndex = -1;

document.addEventListener('DOMContentLoaded', async function () {
  await loadOrdersFromGist();
  renderTable();
  bindEvents();
  autoCalculateProfit();
});

async function loadOrdersFromGist() {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const gist = await res.json();
    const content = gist.files[GIST_FILENAME].content;
    orderData = JSON.parse(content);
  } catch (err) {
    console.error('加载 Gist 数据失败', err);
    orderData = [
      {
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
      }
    ];
  }
}

async function saveOrdersToGist() {
  try {
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(orderData, null, 2)
          }
        }
      })
    });
  } catch (err) {
    console.error('保存失败', err);
    alert('保存失败，请检查 GIST_ID 和 TOKEN');
  }
}

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
      <td><span class="detail-link" data-type="receiver" data-index="${index}">${item.receiver}</span></td>
      <td>${item.declareValue}</td>
      <td>${item.transport}</td>
      <td>${item.supplyChain}</td>
      <td>${item.channel}</td>
      <td>${item.warehouseOut}</td>
      <td><span class="detail-link" data-type="pay" data-index="${index}">${item.payable.toFixed(2)}</span></td>
      <td><span class="detail-link" data-type="cost" data-index="${index}">${item.costRemark}</span></td>
      <td>${item.customerPay.toFixed(2)}</td>
      <td><span class="detail-link" data-type="quote" data-index="${index}">${item.quoteDetail}</span></td>
      <td>${item.profit.toFixed(2)}</td>
      <td>${item.trackingNo}</td>
      <td><span class="detail-link" data-type="tracking" data-index="${index}">${item.trackingStatus}</span></td>
      <td>${item.customs}</td>
      <td><span class="detail-link" data-type="remark" data-index="${index}">${item.remark?.substring(0, 12)}...</span></td>
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

function bindEvents() {
  document.getElementById('add-btn').onclick = () => {
    currentEditIndex = -1;
    document.getElementById('order-form').reset();
    document.getElementById('modal-title').innerText = '添加订单';
    document.getElementById('order-modal').style.display = 'flex';
  };

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = e => {
      const index = +e.currentTarget.dataset.index;
      currentEditIndex = index;
      const item = orderData[index];
      document.getElementById('modal-title').innerText = '编辑订单';

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

      document.getElementById('order-modal').style.display = 'flex';
    };
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async e => {
      if (!confirm('确定删除此订单？')) return;
      const index = +e.currentTarget.dataset.index;
      orderData.splice(index, 1);
      await saveOrdersToGist();
      renderTable();
      bindEvents();
    };
  });

  document.getElementById('modal-save').onclick = async () => {
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
      payItems: [],
      trackingRecords: []
    };

    if (currentEditIndex === -1) {
      orderData.push({ id: Date.now(), ...formData });
    } else {
      orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...formData };
    }

    await saveOrdersToGist();
    document.getElementById('order-modal').style.display = 'none';
    renderTable();
    bindEvents();
  };

  document.getElementById('modal-cancel').onclick =
  document.getElementById('modal-close').onclick = () => {
    document.getElementById('order-modal').style.display = 'none';
  };

  document.getElementById('form-customer-pay').oninput =
  document.getElementById('form-payable').oninput = autoCalculateProfit;
}

function autoCalculateProfit() {
  const cost = +document.getElementById('form-payable').value || 0;
  const income = +document.getElementById('form-customer-pay').value || 0;
  document.getElementById('form-profit').value = (income - cost).toFixed(2);
}