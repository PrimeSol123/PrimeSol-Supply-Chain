// ====================== 完整功能版 + 本地存储 + 导入导出 ======================
let orderData = [];
let currentEditIndex = -1;

document.addEventListener('DOMContentLoaded', function () {
    loadFromLocal();
    renderTable();
    bindEvents();
    initImportExport();
});

// 本地存储
function loadFromLocal() {
    let data = localStorage.getItem('supplyChainData');
    if (data) {
        orderData = JSON.parse(data);
    } else {
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
        saveToLocal();
    }
}

function saveToLocal() {
    localStorage.setItem('supplyChainData', JSON.stringify(orderData));
}

// 渲染表格
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

// 绑定所有事件（完整原版）
function bindEvents() {
    // 添加订单
    document.getElementById('add-btn').onclick = () => {
        currentEditIndex = -1;
        document.getElementById('order-form').reset();
        document.getElementById('modal-title').innerText = '添加订单';
        document.getElementById('order-modal').style.display = 'flex';
    };

    // 编辑订单
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = e => {
            const index = parseInt(e.currentTarget.dataset.index);
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

    // 删除订单
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async e => {
            if (!confirm('确定删除此订单？')) return;
            const index = parseInt(e.currentTarget.dataset.index);
            orderData.splice(index, 1);
            saveToLocal();
            renderTable();
            bindEvents();
        };
    });

    // 保存
    document.getElementById('modal-save').onclick = () => {
        const data = {
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
            orderData.push({ id: Date.now(), ...data });
        } else {
            orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...data };
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

    // 自动算利润
    function calcProfit() {
        const cost = +document.getElementById('form-payable').value || 0;
        const income = +document.getElementById('form-customer-pay').value || 0;
        document.getElementById('form-profit').value = (income - cost).toFixed(2);
    }

    document.getElementById('form-payable').oninput = calcProfit;
    document.getElementById('form-customer-pay').oninput = calcProfit;

    // 详情点击（收货人、备注、轨迹等）
    document.querySelectorAll('.detail-link').forEach(link => {
        link.onclick = (e) => {
            const type = e.currentTarget.dataset.type;
            const index = +e.currentTarget.dataset.index;
            const item = orderData[index];
            let title, html;

            switch (type) {
                case 'receiver': title = '收货人信息'; html = `<p>${item.receiver}</p>`; break;
                case 'remark': title = '客服备注'; html = `<p>${item.remark}</p>`; break;
                case 'cost': title = '成本备注'; html = `<p>${item.costRemark}</p>`; break;
                case 'quote': title = '报价明细'; html = `<p>${item.quoteDetail}</p>`; break;
                case 'pay': title = '应付金额'; html = `<p>¥${item.payable.toFixed(2)}</p>`; break;
                case 'tracking': title = '物流轨迹'; html = `<p>${item.trackingStatus}</p>`; break;
                default: return;
            }

            const d = document.createElement('div');
            d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;display:grid;place-items:center;';
            d.innerHTML = `
                <div style="background:#fff;padding:24px;border-radius:10px;min-width:300px;">
                    <h3 style="margin:0 0 12px;">${title}</h3>
                    ${html}
                    <button onclick="this.closest('div').remove()" style="margin-top:12px;padding:6px 12px;background:#165DFF;color:white;border:none;border-radius:6px;">关闭</button>
                </div>
            `;
            document.body.appendChild(d);
            d.onclick = (ev) => ev.target === d && d.remove();
        };
    });
}

// ====================== 导入 / 导出功能（保留） ======================
function initImportExport() {
    // 导出
    const exportBtn = document.getElementById('export-btn');
    exportBtn.onclick = function () {
        const json = JSON.stringify(orderData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '供应链数据.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('导出成功！');
    };

    // 导入
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-outline';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
    const box = document.querySelector('.table-actions');
    if (box) box.appendChild(importBtn);

    importBtn.onclick = function () {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = '.json';
        inp.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                try {
                    const arr = JSON.parse(ev.target.result);
                    if (Array.isArray(arr)) {
                        orderData = arr;
                        saveToLocal();
                        renderTable();
                        bindEvents();
                        alert('导入成功！');
                    }
                } catch {
                    alert('导入失败');
                }
            };
            reader.readAsText(file);
        };
        inp.click();
    };
}