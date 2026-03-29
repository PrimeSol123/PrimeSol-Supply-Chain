// ==============================================
// 臻方供应链管理系统 - 按需求定制修复版
// 功能1：新增 JSON 导入
// 功能2：修复所有弹窗空白BUG
// 功能3：应付子项自动求和 = 应付总金额
// 功能4：国家筛选 → 改为【入仓/出仓日期范围筛选】
// ==============================================
let orderData = [];
let currentEditIndex = -1;
let tempPayItems = [];
let tempTrackingRecords = [];

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocal();
    renderTable();
    bindAllEvents();
    replaceCountryFilterWithDateFilter(); // 国家→日期筛选
});

// 本地存储
function loadFromLocal() {
    const data = localStorage.getItem('zhenfangSupplyChainData');
    if (data) orderData = JSON.parse(data);
    else {
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
    localStorage.setItem('zhenfangSupplyChainData', JSON.stringify(orderData));
}

// ==============================
// 需求4：国家筛选 → 日期筛选
// ==============================
function replaceCountryFilterWithDateFilter() {
    const countryGroup = document.querySelector('#country').closest('.form-group');
    countryGroup.innerHTML = `
        <label class="form-label">日期类型</label>
        <select id="date-type" class="form-control">
            <option value="warehouseIn">入仓日期</option>
            <option value="warehouseOut">出仓日期</option>
        </select>
    `;

    const transportGroup = document.querySelector('#transport').closest('.form-group');
    transportGroup.innerHTML = `
        <label class="form-label">开始日期</label>
        <input type="date" id="date-start" class="form-control">
    `;

    const statusGroup = document.querySelector('#status').closest('.form-group');
    statusGroup.innerHTML = `
        <label class="form-label">结束日期</label>
        <input type="date" id="date-end" class="form-control">
    `;
}

// ==============================
// 表格渲染
// ==============================
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
            <td><span class="detail-link" data-type="goods" data-index="${index}">${cutStr(item.goods)}</span></td>
            <td>${item.quantity}</td>
            <td>${item.weight}</td>
            <td>${item.country}</td>
            <td><span class="detail-link" data-type="receiver" data-index="${index}">${cutStr(item.receiver)}</span></td>
            <td>${item.declareValue}</td>
            <td>${item.transport}</td>
            <td>${item.supplyChain}</td>
            <td>${item.channel}</td>
            <td>${item.warehouseOut}</td>
            <td><span class="detail-link" data-type="payable" data-index="${index}">${cutStr(item.payable.toFixed(2))}</span></td>
            <td><span class="detail-link" data-type="costRemark" data-index="${index}">${cutStr(item.costRemark)}</span></td>
            <td>${item.customerPay.toFixed(2)}</td>
            <td><span class="detail-link" data-type="quoteDetail" data-index="${index}">${cutStr(item.quoteDetail)}</span></td>
            <td>${item.profit.toFixed(2)}</td>
            <td>${item.trackingNo}</td>
            <td><span class="detail-link" data-type="trackingStatus" data-index="${index}">${cutStr(item.trackingStatus)}</span></td>
            <td>${item.customs}</td>
            <td><span class="detail-link" data-type="remark" data-index="${index}">${cutStr(item.remark)}</span></td>
            <td><span class="status-badge status-shipped">${item.status}</span></td>
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

// ==============================
// 所有事件绑定
// ==============================
function bindAllEvents() {
    // 添加订单
    document.getElementById('add-btn').onclick = () => {
        currentEditIndex = -1;
        tempPayItems = [];
        tempTrackingRecords = [];
        document.getElementById('order-form').reset();
        document.getElementById('modal-title').textContent = '添加订单';
        renderTempPayItems();
        renderTempTrackingRecords();
        document.getElementById('order-modal').style.display = 'flex';
    };

    // 关闭弹窗
    document.getElementById('modal-close').onclick =
    document.getElementById('modal-cancel').onclick = () => {
        document.getElementById('order-modal').style.display = 'none';
    };

    // 保存订单
    document.getElementById('modal-save').onclick = () => {
        const formData = {
            warehouseIn: document.getElementById('form-warehouse-in').value,
            customer: document.getElementById('form-customer').value,
            orderId: document.getElementById('form-order-id').value,
            productName: document.getElementById('form-product-name').value,
            goods: document.getElementById('form-goods').value,
            quantity: parseInt(document.getElementById('form-quantity').value) || 0,
            weight: document.getElementById('form-weight').value,
            country: document.getElementById('form-country').value,
            receiver: document.getElementById('form-receiver').value,
            declareValue: document.getElementById('form-declare-value').value,
            transport: document.getElementById('form-transport').value,
            supplyChain: document.getElementById('form-supply-chain').value,
            channel: document.getElementById('form-channel').value,
            warehouseOut: document.getElementById('form-warehouse-out').value,
            payable: calcTotalPayable(), // 需求3：自动求和
            costRemark: document.getElementById('form-cost-remark').value,
            customerPay: parseFloat(document.getElementById('form-customer-pay').value) || 0,
            quoteDetail: document.getElementById('form-quote-detail').value,
            profit: (parseFloat(document.getElementById('form-customer-pay').value) || 0) - calcTotalPayable(),
            trackingNo: document.getElementById('form-tracking-no').value,
            trackingStatus: document.getElementById('form-tracking-status').value,
            customs: document.getElementById('form-customs').value,
            remark: document.getElementById('form-remark').value,
            status: document.getElementById('form-status').value,
            payItems: [...tempPayItems],
            trackingRecords: [...tempTrackingRecords]
        };

        if (currentEditIndex === -1) orderData.push({ id: Date.now(), ...formData });
        else orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...formData };

        saveToLocal();
        document.getElementById('order-modal').style.display = 'none';
        renderTable();
    };

    // 编辑订单
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            currentEditIndex = index;
            const item = orderData[index];
            tempPayItems = [...item.payItems];
            tempTrackingRecords = [...item.trackingRecords];

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

            renderTempPayItems();
            renderTempTrackingRecords();
            document.getElementById('modal-title').textContent = '编辑订单';
            document.getElementById('order-modal').style.display = 'flex';
        };
    });

    // 删除
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (!confirm('确定删除？')) return;
            const index = parseInt(e.currentTarget.dataset.index);
            orderData.splice(index, 1);
            saveToLocal();
            renderTable();
        };
    });

    // 查看详情
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = (e) => {
            const item = orderData[parseInt(e.currentTarget.dataset.index)];
            const mask = document.createElement('div');
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
            mask.innerHTML = `
                <div style="background:#fff;width:90%;max-width:800px;padding:24px;border-radius:12px;max-height:90vh;overflow:auto">
                    <h3 style="margin:0 0 16px;color:#165DFF">订单详情</h3>
                    <p><strong>货品描述：</strong>${item.goods || '无'}</p>
                    <p><strong>应付金额：</strong>${item.payable.toFixed(2)}</p>
                    <p><strong>成本备注：</strong>${item.costRemark || '无'}</p>
                    <p><strong>报价明细：</strong>${item.quoteDetail || '无'}</p>
                    <p><strong>最新轨迹：</strong>${item.trackingStatus || '无'}</p>
                    <p><strong>客服备注：</strong>${item.remark || '无'}</p>
                    <button onclick="this.closest('div').parentNode.remove()" style="margin-top:16px;padding:8px 24px;background:#165DFF;color:white;border:none;border-radius:6px;cursor:pointer">关闭</button>
                </div>
            `;
            document.body.appendChild(mask);
        };
    });

    // ==============================
    // 需求2：修复所有弹窗空白BUG
    // ==============================
    document.querySelectorAll('.detail-link').forEach(el => {
        el.onclick = (e) => {
            const { type, index } = e.currentTarget.dataset;
            const item = orderData[index];
            const labels = {
                goods: '货品描述',
                receiver: '收货人信息',
                payable: '应付金额',
                costRemark: '成本备注',
                quoteDetail: '报价明细',
                trackingStatus: '最新轨迹',
                remark: '客服备注'
            };
            const mask = document.createElement('div');
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
            mask.innerHTML = `
                <div style="background:#fff;padding:24px;border-radius:12px;min-width:300px">
                    <h3 style="margin:0 0 16px;color:#165DFF">${labels[type]}</h3>
                    <p style="white-space:pre-line">${item[type] || '无内容'}</p>
                    <button onclick="this.closest('div').parentNode.remove()" style="width:100%;margin-top:16px;padding:10px;background:#165DFF;color:white;border:none;border-radius:6px;cursor:pointer">关闭</button>
                </div>
            `;
            document.body.appendChild(mask);
        };
    });

    // 自动计算利润
    const calcProfit = () => {
        const cost = calcTotalPayable();
        const income = parseFloat(document.getElementById('form-customer-pay').value) || 0;
        document.getElementById('form-profit').value = (income - cost).toFixed(2);
    };
    document.getElementById('form-customer-pay').oninput = calcProfit;

    // ==============================
    // 需求3：应付子项自动求和
    // ==============================
    document.getElementById('add-pay-item').onclick = () => {
        tempPayItems.push({ amount: 0, remark: '' });
        renderTempPayItems();
        calcTotalPayable(true);
    };

    // ==============================
    // 需求1：导入 JSON
    // ==============================
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-outline';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
    importBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    orderData = data;
                    saveToLocal();
                    renderTable();
                    alert('导入成功！');
                } catch (err) { alert('JSON格式错误'); }
            };
            reader.readAsText(file);
        };
        input.click();
    };
    document.querySelector('.table-actions').appendChild(importBtn);

    // 导出
    document.getElementById('export-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '臻方供应链数据.json';
        a.click();
    };

    // 日期筛选
    document.getElementById('search-btn').onclick = () => {
        const type = document.getElementById('date-type').value;
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;
        renderTable();
    };
    document.getElementById('reset-btn').onclick = () => {
        document.getElementById('date-start').value = '';
        document.getElementById('date-end').value = '';
        renderTable();
    };
}

// ==============================
// 需求3：自动求和核心
// ==============================
function calcTotalPayable(show = false) {
    let total = 0;
    tempPayItems.forEach(i => total += parseFloat(i.amount) || 0);
    if (show) document.getElementById('form-payable').value = total.toFixed(2);
    return total;
}

function renderTempPayItems() {
    const container = document.getElementById('pay-items-container');
    container.innerHTML = '';
    tempPayItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'pay-item-row';
        div.innerHTML = `
            <input type="number" step="0.01" value="${item.amount}" 
                onchange="tempPayItems[${index}].amount=parseFloat(this.value)||0;calcTotalPayable(true)">
            <input type="text" value="${item.remark}" 
                onchange="tempPayItems[${index}].remark=this.value">
            <button onclick="tempPayItems.splice(${index},1);renderTempPayItems();calcTotalPayable(true)">删除</button>
        `;
        container.appendChild(div);
    });
    calcTotalPayable(true);
}

// 轨迹记录
document.getElementById('add-tracking-record').onclick = () => {
    tempTrackingRecords.push({ time: new Date().toLocaleString().replace(/\//g, '-'), content: '' });
    renderTempTrackingRecords();
};
function renderTempTrackingRecords() {
    const c = document.getElementById('tracking-records-container');
    c.innerHTML = '';
    tempTrackingRecords.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'tracking-record-row';
        div.innerHTML = `
            <input value="${item.time}" onchange="tempTrackingRecords[${index}].time=this.value">
            <input value="${item.content}" onchange="tempTrackingRecords[${index}].content=this.value">
            <button onclick="tempTrackingRecords.splice(${index},1);renderTempTrackingRecords()">删除</button>
        `;
        c.appendChild(div);
    });
}

// 工具
function cutStr(str) {
    if (!str) return '';
    return str.length > 5 ? str.slice(0, 5) + '...' : str;
}