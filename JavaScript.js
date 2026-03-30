// ==============================================
// 臻方供应链管理系统 - 终极终极修复：应付子项删除
// 放弃事件委托，改用内联函数+全局数组，直接操作DOM
// 其他所有功能 100% 保留
// ==============================================
let orderData = [];
let currentEditIndex = -1;
let tempPayItems = []; // 全局应付子项数组（直接操作）
let tempTrackingRecords = [];

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocal();
    renderTable();
    bindAllEvents();
    replaceCountryFilterWithDateFilter();
    convertInputsToTextarea();
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

// 日期筛选替换国家筛选
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

// 转为可拉伸文本域
function convertInputsToTextarea() {
    const targets = [
        'form-goods',
        'form-receiver',
        'form-cost-remark',
        'form-quote-detail'
    ];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.tagName === 'INPUT') {
            const textarea = document.createElement('textarea');
            textarea.id = el.id;
            textarea.className = el.className;
            textarea.style.resize = 'both';
            textarea.style.minHeight = '60px';
            textarea.value = el.value;
            el.replaceWith(textarea);
        }
    });
}

// 表格渲染
function renderTable(data = orderData) {
    const tbody = document.getElementById('order-tbody');
    tbody.innerHTML = '';
    data.forEach((item, index) => {
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
    document.getElementById('record-count').textContent = `(共${data.length}条记录)`;
}

// 绑定所有事件
function bindAllEvents() {
    // 添加订单
    document.getElementById('add-btn').onclick = () => {
        currentEditIndex = -1;
        tempPayItems = []; // 重置全局应付子项
        tempTrackingRecords = [];
        document.getElementById('order-form').reset();
        document.getElementById('modal-title').textContent = '添加订单';
        renderTempPayItems(); // 渲染空的应付子项容器
        renderTempTrackingRecords();
        convertInputsToTextarea();
        document.getElementById('order-modal').style.display = 'flex';
    };

    // 关闭弹窗
    document.getElementById('modal-close').onclick =
    document.getElementById('modal-cancel').onclick = () => {
        document.getElementById('order-modal').style.display = 'none';
    };

    // 保存订单
    document.getElementById('modal-save').onclick = () => {
        const lastTrack = tempTrackingRecords.length > 0
            ? tempTrackingRecords[tempTrackingRecords.length - 1].content
            : document.getElementById('form-tracking-status').value;

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
            payable: calcTotalPayable(),
            costRemark: document.getElementById('form-cost-remark').value,
            customerPay: parseFloat(document.getElementById('form-customer-pay').value) || 0,
            quoteDetail: document.getElementById('form-quote-detail').value,
            profit: (parseFloat(document.getElementById('form-customer-pay').value) || 0) - calcTotalPayable(),
            trackingNo: document.getElementById('form-tracking-no').value,
            trackingStatus: lastTrack,
            customs: document.getElementById('form-customs').value,
            remark: document.getElementById('form-remark').value,
            status: document.getElementById('form-status').value,
            payItems: [...tempPayItems], // 直接取全局应付子项数组
            trackingRecords: [...tempTrackingRecords]
        };

        if (currentEditIndex === -1) orderData.push({ id: Date.now(), ...formData });
        else orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...formData };

        saveToLocal();
        document.getElementById('order-modal').style.display = 'none';
        renderTable();
    };

    // 编辑按钮
    document.body.addEventListener('click', function(e){
        if(e.target.closest('.edit-btn')){
            const index = parseInt(e.target.closest('.edit-btn').dataset.index);
            currentEditIndex = index;
            const item = orderData[index];
            tempPayItems = [...item.payItems]; // 赋值给全局应付子项数组
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

            renderTempPayItems(); // 渲染编辑时的应付子项
            renderTempTrackingRecords();
            convertInputsToTextarea();
            document.getElementById('modal-title').textContent = '编辑订单';
            document.getElementById('order-modal').style.display = 'flex';
        }
    });

    // 删除按钮
    document.body.addEventListener('click', function(e){
        if(e.target.closest('.delete-btn')){
            if(!confirm('确定删除此订单？')) return;
            const index = parseInt(e.target.closest('.delete-btn').dataset.index);
            orderData.splice(index, 1);
            saveToLocal();
            renderTable();
        }
    });

    // 查看详情
    document.body.addEventListener('click', function(e){
        if(e.target.closest('.view-btn')){
            const index = parseInt(e.target.closest('.view-btn').dataset.index);
            const item = orderData[index];
            const mask = document.createElement('div');
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
            mask.innerHTML = `
                <div style="background:#fff;width:90%;max-width:800px;padding:24px;border-radius:12px;max-height:90vh;overflow:auto">
                    <h3 style="margin:0 0 16px;color:#165DFF">订单详情</h3>
                    <p style="white-space:pre-wrap;word-break:break-all"><strong>货品描述：</strong>${item.goods || '无'}</p>
                    <p><strong>应付金额：</strong>${item.payable.toFixed(2)}</p>
                    <p style="white-space:pre-wrap;word-break:break-all"><strong>成本备注：</strong>${item.costRemark || '无'}</p>
                    <p style="white-space:pre-wrap;word-break:break-all"><strong>报价明细：</strong>${item.quoteDetail || '无'}</p>
                    <p style="white-space:pre-wrap;word-break:break-all"><strong>最新轨迹：</strong>${item.trackingStatus || '无'}</p>
                    <p style="white-space:pre-wrap;word-break:break-all"><strong>客服备注：</strong>${item.remark || '无'}</p>
                    <button onclick="this.closest('div').parentNode.remove()" style="margin-top:16px;padding:8px 24px;background:#165DFF;color:white;border:none;border-radius:6px;cursor:pointer">关闭</button>
                </div>
            `;
            document.body.appendChild(mask);
        }
    });

    // 字段弹窗
    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('detail-link')) {
            const { type, index } = e.target.dataset;
            const item = orderData[index];
            const labels = {
                goods: '货品描述', receiver: '收货人信息', payable: '应付金额',
                costRemark: '成本备注', quoteDetail: '报价明细', trackingStatus: '最新轨迹', remark: '客服备注'
            };
            const mask = document.createElement('div');
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center';
            mask.innerHTML = `
                <div style="background:#fff;padding:24px;border-radius:12px;min-width:300px;max-width:500px">
                    <h3 style="margin:0 0 16px;color:#165DFF">${labels[type]}</h3>
                    <p style="white-space:pre-wrap;word-break:break-all;line-height:1.6">${item[type] || '无内容'}</p>
                    <button onclick="this.closest('div').parentNode.remove()" style="width:100%;margin-top:16px;padding:10px;background:#165DFF;color:white;border:none;border-radius:6px;cursor:pointer">关闭</button>
                </div>
            `;
            document.body.appendChild(mask);
        }
    });

    // 自动计算利润
    const calcProfit = () => {
        const cost = calcTotalPayable();
        const income = parseFloat(document.getElementById('form-customer-pay').value) || 0;
        document.getElementById('form-profit').value = (income - cost).toFixed(2);
    };
    document.getElementById('form-customer-pay').oninput = calcProfit;

    // 应付子项 - 添加（直接操作全局数组）
    document.getElementById('add-pay-item').onclick = () => {
        tempPayItems.push({ amount: 0, remark: '' });
        renderTempPayItems(); // 重新渲染
        calcTotalPayable(true);
    };

    // 轨迹记录 - 添加
    document.getElementById('add-tracking-record').onclick = () => {
        tempTrackingRecords.push({ 
            time: new Date().toLocaleString().replace(/\//g, '-'), 
            content: document.getElementById('form-tracking-status').value.trim() || '未填写轨迹内容'
        });
        renderTempTrackingRecords();
    };

    // 导入数据
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

    // 导出JSON
    document.getElementById('export-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '臻方供应链数据.json';
        a.click();
    };

    // 新增：导出Excel
    const excelBtn = document.createElement('button');
    excelBtn.className = 'btn btn-success';
    excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> 导出Excel';
    excelBtn.onclick = exportExcel;
    document.querySelector('.table-actions').appendChild(excelBtn);

    // 搜索筛选
    document.getElementById('search-btn').onclick = () => {
        const dateType = document.getElementById('date-type').value;
        const start = document.getElementById('date-start').value;
        const end = document.getElementById('date-end').value;
        const keyword = document.getElementById('search').value.toLowerCase();

        let filtered = orderData.filter(item => {
            const matchDate = (() => {
                if (!start && !end) return true;
                const targetDate = item[dateType];
                if (!targetDate) return false;
                const afterStart = start ? targetDate >= start : true;
                const beforeEnd = end ? targetDate <= end : true;
                return afterStart && beforeEnd;
            })();

            const matchKeyword = (() => {
                if (!keyword) return true;
                const str = Object.values(item).join('').toLowerCase();
                return str.includes(keyword);
            })();

            return matchDate && matchKeyword;
        });

        renderTable(filtered);
    };

    // 重置
    document.getElementById('reset-btn').onclick = () => {
        document.getElementById('search').value = '';
        document.getElementById('date-start').value = '';
        document.getElementById('date-end').value = '';
        renderTable(orderData);
    };
}

// 应付求和
function calcTotalPayable(show = false) {
    let total = 0;
    tempPayItems.forEach(i => total += parseFloat(i.amount) || 0);
    if (show) document.getElementById('form-payable').value = total.toFixed(2);
    return total;
}

// ====================== 核心修复：应付子项渲染+删除（直接操作全局数组） ======================
function renderTempPayItems() {
    const container = document.getElementById('pay-items-container');
    container.innerHTML = '';
    
    // 清空后重新生成所有子项（确保索引和数组一致）
    if (tempPayItems.length === 0) {
        container.innerHTML = '<p style="color: #999; margin: 8px 0; font-size: 14px;">暂无应付子项，点击"新增应付子项"添加</p>';
        return;
    }
    
    // 遍历全局数组，生成每个子项，内联函数直接操作全局数组
    tempPayItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'pay-item-row';
        
        // 关键：内联函数直接操作全局tempPayItems数组，无需委托
        itemEl.innerHTML = `
            <input type="number" step="0.01" value="${item.amount}" 
                   oninput="tempPayItems[${index}].amount = parseFloat(this.value) || 0; calcTotalPayable(true)">
            <input type="text" value="${item.remark}" 
                   oninput="tempPayItems[${index}].remark = this.value.trim()">
            <button onclick="deletePayItem(${index})">删除</button>
        `;
        
        container.appendChild(itemEl);
    });
    
    calcTotalPayable(true);
}

// 全局删除函数（直接操作全局数组，100%生效）
function deletePayItem(index) {
    // 1. 从全局数组中删除对应索引的子项
    tempPayItems.splice(index, 1);
    // 2. 重新渲染所有子项（确保索引重新对齐）
    renderTempPayItems();
    // 3. 重新计算应付总金额
    calcTotalPayable(true);
}

// 轨迹记录渲染
function renderTempTrackingRecords() {
    const c = document.getElementById('tracking-records-container');
    c.innerHTML = '';
    if (tempTrackingRecords.length === 0) {
        c.innerHTML = '<p style="color: #999; margin: 8px 0; font-size: 14px;">暂无轨迹记录，点击"新增轨迹记录"添加</p>';
        return;
    }
    tempTrackingRecords.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'tracking-record-row';
        div.innerHTML = `
            <input type="datetime-local" value="${formatDateTime(item.time)}" onchange="tempTrackingRecords[${index}].time=this.value.replace('T', ' ')">
            <input type="text" value="${item.content}" onchange="tempTrackingRecords[${index}].content=this.value.trim()">
            <button onclick="tempTrackingRecords.splice(${index},1);renderTempTrackingRecords()">删除</button>
        `;
        c.appendChild(div);
    });
}

// 导出Excel核心函数
function exportExcel() {
    const excelData = orderData.map(item => ({
        '入仓日期': item.warehouseIn,
        '出仓日期': item.warehouseOut,
        '客户名称': item.customer,
        '订单编号': item.orderId,
        '产品名称': item.productName,
        '货品描述': item.goods,
        '数量': item.quantity,
        '重量': item.weight,
        '目的地国家': item.country,
        '收货人信息': item.receiver,
        '申报价值': item.declareValue,
        '运输方式': item.transport,
        '供应链': item.supplyChain,
        '渠道': item.channel,
        '应付金额': item.payable,
        '成本备注': item.costRemark,
        '客户付款': item.customerPay,
        '报价明细': item.quoteDetail,
        '利润': item.profit,
        '运单号': item.trackingNo,
        '最新轨迹': item.trackingStatus,
        '报关方式': item.customs,
        '客服备注': item.remark,
        '订单状态': item.status
    }));

    const header = Object.keys(excelData[0] || {}).join('\t');
    const rows = excelData.map(item => Object.values(item).map(v => {
        let val = v === null || v === undefined ? '' : v;
        val = String(val).replace(/\t/g, ' ').replace(/\n/g, ' ');
        return val;
    }).join('\t'));

    const csv = header + '\n' + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '臻方供应链订单_' + new Date().toLocaleDateString() + '.xls';
    a.click();
}

// 工具函数：格式化日期时间
function formatDateTime(timeStr) {
    return timeStr.replace(' ', 'T').substring(0, 16);
}

// 工具函数：截断字符串
function cutStr(str) {
    if (!str) return '';
    return str.length > 5 ? str.slice(0, 5) + '...' : str;
}

// 全局暴露函数（确保内联onclick能访问到）
window.deletePayItem = deletePayItem;
window.tempPayItems = tempPayItems;
window.tempTrackingRecords = tempTrackingRecords;
window.calcTotalPayable = calcTotalPayable;
