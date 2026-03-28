// Gist 配置（已填入你的信息）
const GIST_CONFIG = {
    gistId: '40b65722b0e1833c8e80d2a9fab69d2c',
    token: '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',
    fileName: 'supply-chain-data.json'
};

// 全局订单数据存储
let orderDataList = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 从 Gist 加载数据
    await loadDataFromGist();
    
    // 初始化事件监听
    initEventListeners();
    
    // 初始化表格数据（如果Gist无数据，使用默认数据）
    if (orderDataList.length === 0) {
        initDefaultData();
    } else {
        renderOrderTable();
    }
});

// 从 Gist 加载数据
async function loadDataFromGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
            headers: {
                'Authorization': `token ${GIST_CONFIG.token}`
            }
        });

        if (response.ok) {
            const gist = await response.json();
            const fileContent = gist.files[GIST_CONFIG.fileName]?.content;
            
            if (fileContent) {
                orderDataList = JSON.parse(fileContent);
                console.log('数据从 Gist 加载成功');
            }
        } else {
            console.log('Gist 无数据，使用默认数据');
        }
    } catch (error) {
        console.error('加载 Gist 数据失败：', error);
        // 加载失败时使用 localStorage 兜底
        const localData = localStorage.getItem('supplyChainData');
        if (localData) {
            orderDataList = JSON.parse(localData);
        }
    }
}

// 保存数据到 Gist
async function saveDataToGist() {
    // 先保存到 localStorage 兜底
    localStorage.setItem('supplyChainData', JSON.stringify(orderDataList));

    try {
        // 更新 Gist
        const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GIST_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [GIST_CONFIG.fileName]: {
                        content: JSON.stringify(orderDataList, null, 2)
                    }
                }
            })
        });

        if (response.ok) {
            console.log('数据保存到 Gist 成功');
        } else {
            console.error('保存 Gist 失败：', await response.text());
        }
    } catch (error) {
        console.error('保存 Gist 出错：', error);
    }
}

// 初始化默认数据
function initDefaultData() {
    orderDataList = [
        {
            id: 1,
            warehouseInDate: '2026-03-16',
            customerName: 'Moshe',
            customerOrderId: 'IL2026030901',
            productName: '折叠椅',
            goodsDesc: '户外折叠椅',
            quantity: 10,
            weight: '25.5kg',
            country: '以色列',
            receiverInfo: 'Moshe Cohen +972501234567',
            declareValue: '500.00 USD',
            transport: '快递',
            supplyChain: '加时特',
            channel: '快递专线',
            warehouseOutDate: '2026-03-17',
            payable: 849.00,
            payItems: [
                { amount: 799.00, remark: '主货款' },
                { amount: 50.00, remark: '运费' }
            ],
            costRemark: '物流成本+包装费',
            customerPay: 1130.30,
            quoteDetail: '基础运费+燃油附加费',
            profit: 331.30,
            trackingNo: '3708875402',
            trackingStatus: '已到达目的国',
            trackingRecords: [
                { time: '2026-03-17 10:30:00', content: '已到达目的国' },
                { time: '2026-03-16 18:20:00', content: '已出库，运输中' }
            ],
            customs: '是',
            remark: '客户要求加急发货，注意货物包装要牢固，避免运输损坏',
            status: '已发货'
        },
        {
            id: 2,
            warehouseInDate: '2026-03-16',
            customerName: 'Pedro',
            customerOrderId: 'PT20260303246',
            productName: '日用品',
            goodsDesc: '杂项日用品',
            quantity: 5,
            weight: '18.2kg',
            country: '葡萄牙',
            receiverInfo: 'Pedro Silva +351912345678',
            declareValue: '200.00 USD',
            transport: '空派',
            supplyChain: 'EPS',
            channel: '空派专线',
            warehouseOutDate: '2026-03-17',
            payable: 26.00,
            payItems: [
                { amount: 26.00, remark: '服务费' }
            ],
            costRemark: '清关服务费',
            customerPay: 1482.00,
            quoteDetail: '空派特惠价',
            profit: 1456.00,
            trackingNo: '1Z0R6D926835462840',
            trackingStatus: '清关中',
            trackingRecords: [
                { time: '2026-03-17 14:15:00', content: '清关中' },
                { time: '2026-03-17 09:00:00', content: '已到达目的国机场' }
            ],
            customs: '否',
            remark: '无特殊要求，正常发货即可，客户希望能尽快送达',
            status: '已发货'
        },
        {
            id: 3,
            warehouseInDate: '2026-03-16',
            customerName: 'Pedro',
            customerOrderId: 'SZDW26030304642',
            productName: '易碎品',
            goodsDesc: '陶瓷制品',
            quantity: 8,
            weight: '30.0kg',
            country: '葡萄牙',
            receiverInfo: 'Pedro Santos +351987654321',
            declareValue: '300.00 USD',
            transport: '空派',
            supplyChain: '德威',
            channel: '空派专线',
            warehouseOutDate: '2026-03-17',
            payable: 37.00,
            payItems: [
                { amount: 27.00, remark: '仓储费' },
                { amount: 10.00, remark: '打包费' }
            ],
            costRemark: '仓储+打包费',
            customerPay: 1782.00,
            quoteDetail: '标准空派报价',
            profit: 1755.00,
            trackingNo: '889318897468',
            trackingStatus: '运输中',
            trackingRecords: [
                { time: '2026-03-17 16:40:00', content: '运输中' },
                { time: '2026-03-17 12:10:00', content: '已发货，离开仓库' }
            ],
            customs: '是',
            remark: '注意易碎品，包装时需要添加缓冲材料，避免破损',
            status: '已发货'
        }
    ];
    
    // 保存默认数据到 Gist
    saveDataToGist();
    renderOrderTable();
}

// 初始化事件监听
function initEventListeners() {
    // 搜索按钮
    document.getElementById('search-btn').addEventListener('click', filterOrders);
    // 重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetFilter);
    // 添加订单按钮
    document.getElementById('add-btn').addEventListener('click', openAddModal);
    // 关闭模态框
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    // 保存订单
    document.getElementById('modal-save').addEventListener('click', saveOrder);
    // 关闭详情模态框
    document.getElementById('detail-close').addEventListener('click', closeDetailModal);
    // 关闭应付详情模态框
    document.getElementById('pay-detail-close').addEventListener('click', closePayDetailModal);
    document.getElementById('pay-detail-cancel').addEventListener('click', closePayDetailModal);
    // 关闭轨迹详情模态框
    document.getElementById('tracking-detail-close').addEventListener('click', closeTrackingDetailModal);
    document.getElementById('tracking-detail-cancel').addEventListener('click', closeTrackingDetailModal);
    // 新增应付子项
    document.getElementById('add-pay-item').addEventListener('click', addPayItemRow);
    // 新增轨迹记录
    document.getElementById('add-tracking-record').addEventListener('click', addTrackingRecordRow);
    // 全选复选框
    document.getElementById('select-all').addEventListener('change', toggleSelectAll);
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    // 监听客户付款和应付金额变化，自动计算利润
    document.getElementById('form-customer-pay').addEventListener('input', calculateProfit);
    document.getElementById('form-payable').addEventListener('input', calculateProfit);
}

// 渲染订单表格
function renderOrderTable(filteredData = null) {
    const tbody = document.getElementById('order-tbody');
    const recordCount = document.getElementById('record-count');
    const data = filteredData || orderDataList;
    
    // 更新记录数
    recordCount.textContent = `(共${data.length}条记录)`;
    
    // 清空表格
    tbody.innerHTML = '';
    
    // 渲染数据
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // 设置行数据属性
        tr.dataset.payItems = JSON.stringify(item.payItems || []);
        tr.dataset.trackingRecords = JSON.stringify(item.trackingRecords || []);
        tr.dataset.costRemark = item.costRemark || '';
        tr.dataset.quoteDetail = item.quoteDetail || '';
        
        tr.innerHTML = `
            <td><input type="checkbox" data-id="${item.id}"></td>
            <td>${index + 1}</td>
            <td>${item.warehouseInDate || ''}</td>
            <td>${item.customerName || ''}</td>
            <td>${item.customerOrderId || ''}</td>
            <td>${item.productName || ''}</td>
            <td>${item.goodsDesc || ''}</td>
            <td>${item.quantity || ''}</td>
            <td>${item.weight || ''}</td>
            <td>${item.country || ''}</td>
            <td class="receiver-info" data-id="${item.id}">${item.receiverInfo || ''}</td>
            <td>${item.declareValue || ''}</td>
            <td>${item.transport || ''}</td>
            <td>${item.supplyChain || ''}</td>
            <td>${item.channel || ''}</td>
            <td>${item.warehouseOutDate || ''}</td>
            <td class="payable-amount" data-id="${item.id}">${item.payable?.toFixed(2) || '0.00'}</td>
            <td class="cost-remark" data-id="${item.id}">${item.costRemark || ''}</td>
            <td>${item.customerPay?.toFixed(2) || '0.00'}</td>
            <td class="quote-detail" data-id="${item.id}">${item.quoteDetail || ''}</td>
            <td>${item.profit?.toFixed(2) || '0.00'}</td>
            <td>${item.trackingNo || ''}</td>
            <td>${item.trackingStatus || ''}</td>
            <td>${item.customs || ''}</td>
            <td class="remark-info" data-id="${item.id}">${item.remark || ''}</td>
            <td><span class="status-badge status-${item.status === '已发货' ? 'shipped' : item.status === '待发货' ? 'pending' : item.status === '已签收' ? 'signed' : 'inquiry'}">${item.status || ''}</span></td>
            <td class="action-buttons">
                <button class="action-btn view-btn" data-id="${item.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // 绑定行内按钮事件
    bindRowEvents();
}

// 绑定行内按钮事件
function bindRowEvents() {
    // 查看按钮
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            viewOrderDetail(id);
        });
    });
    
    // 编辑按钮
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            openEditModal(id);
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteOrder(id);
        });
    });
    
    // 收货人信息点击查看详情
    document.querySelectorAll('.receiver-info').forEach(cell => {
        cell.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            showDetailModal('收货人信息', this.textContent);
        });
    });
    
    // 客服备注点击查看详情
    document.querySelectorAll('.remark-info').forEach(cell => {
        cell.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            showDetailModal('客服备注', this.textContent);
        });
    });
    
    // 成本备注点击查看详情
    document.querySelectorAll('.cost-remark').forEach(cell => {
        cell.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            showDetailModal('成本备注', this.textContent);
        });
    });
    
    // 报价明细点击查看详情
    document.querySelectorAll('.quote-detail').forEach(cell => {
        cell.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            showDetailModal('报价明细', this.textContent);
        });
    });
    
    // 应付金额点击查看详情
    document.querySelectorAll('.payable-amount').forEach(cell => {
        cell.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            showPayDetailModal(id);
        });
    });
}

// 筛选订单
function filterOrders() {
    const searchText = document.getElementById('search').value.toLowerCase();
    const country = document.getElementById('country').value;
    const transport = document.getElementById('transport').value;
    const status = document.getElementById('status').value;
    
    const filtered = orderDataList.filter(item => {
        // 全局搜索
        const matchesSearch = searchText === '' || 
            (item.customerOrderId && item.customerOrderId.toLowerCase().includes(searchText)) ||
            (item.customerName && item.customerName.toLowerCase().includes(searchText)) ||
            (item.country && item.country.toLowerCase().includes(searchText)) ||
            (item.productName && item.productName.toLowerCase().includes(searchText));
        
        // 国家筛选
        const matchesCountry = country === '' || item.country === country;
        
        // 运输方式筛选
        const matchesTransport = transport === '' || item.transport === transport;
        
        // 状态筛选
        const matchesStatus = status === '' || item.status === status;
        
        return matchesSearch && matchesCountry && matchesTransport && matchesStatus;
    });
    
    renderOrderTable(filtered);
}

// 重置筛选
function resetFilter() {
    document.getElementById('search').value = '';
    document.getElementById('country').value = '';
    document.getElementById('transport').value = '';
    document.getElementById('status').value = '';
    renderOrderTable();
}

// 打开添加订单模态框
function openAddModal() {
    document.getElementById('modal-title').textContent = '添加订单';
    document.getElementById('edit-row-index').value = '-1';
    document.getElementById('order-form').reset();
    
    // 清空应付子项和轨迹记录
    document.getElementById('pay-items-container').innerHTML = '';
    document.getElementById('tracking-records-container').innerHTML = '';
    
    // 打开模态框
    document.getElementById('order-modal').style.display = 'flex';
}

// 打开编辑订单模态框
function openEditModal(id) {
    const item = orderDataList.find(item => item.id === id);
    if (!item) return;
    
    document.getElementById('modal-title').textContent = '编辑订单';
    document.getElementById('edit-row-index').value = id;
    
    // 填充表单数据
    document.getElementById('form-customer').value = item.customerName || '';
    document.getElementById('form-order-id').value = item.customerOrderId || '';
    document.getElementById('form-warehouse-in').value = item.warehouseInDate || '';
    document.getElementById('form-product-name').value = item.productName || '';
    document.getElementById('form-goods').value = item.goodsDesc || '';
    document.getElementById('form-quantity').value = item.quantity || '';
    document.getElementById('form-weight').value = item.weight || '';
    document.getElementById('form-country').value = item.country || '';
    document.getElementById('form-receiver').value = item.receiverInfo || '';
    document.getElementById('form-declare-value').value = item.declareValue || '';
    document.getElementById('form-transport').value = item.transport || '快递';
    document.getElementById('form-supply-chain').value = item.supplyChain || '';
    document.getElementById('form-channel').value = item.channel || '';
    document.getElementById('form-warehouse-out').value = item.warehouseOutDate || '';
    document.getElementById('form-payable').value = item.payable || '';
    document.getElementById('form-cost-remark').value = item.costRemark || '';
    document.getElementById('form-customer-pay').value = item.customerPay || '';
    document.getElementById('form-quote-detail').value = item.quoteDetail || '';
    document.getElementById('form-profit').value = item.profit || '';
    document.getElementById('form-tracking-no').value = item.trackingNo || '';
    document.getElementById('form-tracking-status').value = item.trackingStatus || '';
    document.getElementById('form-customs').value = item.customs || '是';
    document.getElementById('form-remark').value = item.remark || '';
    document.getElementById('form-status').value = item.status || '待发货';
    
    // 填充应付子项
    const payItemsContainer = document.getElementById('pay-items-container');
    payItemsContainer.innerHTML = '';
    if (item.payItems && item.payItems.length > 0) {
        item.payItems.forEach((payItem, index) => {
            addPayItemRow(payItem.amount, payItem.remark);
        });
    } else {
        addPayItemRow();
    }
    
    // 填充轨迹记录
    const trackingContainer = document.getElementById('tracking-records-container');
    trackingContainer.innerHTML = '';
    if (item.trackingRecords && item.trackingRecords.length > 0) {
        item.trackingRecords.forEach((record, index) => {
            addTrackingRecordRow(record.time, record.content);
        });
    } else {
        addTrackingRecordRow();
    }
    
    // 打开模态框
    document.getElementById('order-modal').style.display = 'flex';
}

// 关闭模态框
function closeModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// 保存订单
function saveOrder() {
    const id = parseInt(document.getElementById('edit-row-index').value);
    const payable = parseFloat(document.getElementById('form-payable').value) || 0;
    const customerPay = parseFloat(document.getElementById('form-customer-pay').value) || 0;
    
    // 收集应付子项
    const payItems = [];
    document.querySelectorAll('.pay-item-row').forEach(row => {
        const amount = parseFloat(row.querySelector('.pay-item-amount').value) || 0;
        const remark = row.querySelector('.pay-item-remark').value || '';
        if (amount > 0 || remark) {
            payItems.push({ amount, remark });
        }
    });
    
    // 收集轨迹记录
    const trackingRecords = [];
    document.querySelectorAll('.tracking-record-row').forEach(row => {
        const time = row.querySelector('.tracking-record-time').value || '';
        const content = row.querySelector('.tracking-record-content').value || '';
        if (time && content) {
            trackingRecords.push({ time, content });
        }
    });
    
    // 构建订单数据
    const orderData = {
        id: id === -1 ? Date.now() : id,
        warehouseInDate: document.getElementById('form-warehouse-in').value,
        customerName: document.getElementById('form-customer').value,
        customerOrderId: document.getElementById('form-order-id').value,
        productName: document.getElementById('form-product-name').value,
        goodsDesc: document.getElementById('form-goods').value,
        quantity: parseInt(document.getElementById('form-quantity').value) || 0,
        weight: document.getElementById('form-weight').value,
        country: document.getElementById('form-country').value,
        receiverInfo: document.getElementById('form-receiver').value,
        declareValue: document.getElementById('form-declare-value').value,
        transport: document.getElementById('form-transport').value,
        supplyChain: document.getElementById('form-supply-chain').value,
        channel: document.getElementById('form-channel').value,
        warehouseOutDate: document.getElementById('form-warehouse-out').value,
        payable: payable,
        payItems: payItems,
        costRemark: document.getElementById('form-cost-remark').value,
        customerPay: customerPay,
        quoteDetail: document.getElementById('form-quote-detail').value,
        profit: customerPay - payable,
        trackingNo: document.getElementById('form-tracking-no').value,
        trackingStatus: document.getElementById('form-tracking-status').value,
        trackingRecords: trackingRecords,
        customs: document.getElementById('form-customs').value,
        remark: document.getElementById('form-remark').value,
        status: document.getElementById('form-status').value
    };
    
    // 添加或更新订单
    if (id === -1) {
        orderDataList.push(orderData);
    } else {
        const index = orderDataList.findIndex(item => item.id === id);
        if (index !== -1) {
            orderDataList[index] = orderData;
        }
    }
    
    // 保存数据并刷新表格
    saveDataToGist();
    renderOrderTable();
    closeModal();
    
    alert(id === -1 ? '订单添加成功！' : '订单编辑成功！');
}

// 删除订单
function deleteOrder(id) {
    if (confirm('确定要删除该订单吗？此操作不可撤销！')) {
        orderDataList = orderDataList.filter(item => item.id !== id);
        saveDataToGist();
        renderOrderTable();
        alert('订单删除成功！');
    }
}

// 查看订单详情
function viewOrderDetail(id) {
    const item = orderDataList.find(item => item.id === id);
    if (!item) return;
    
    let detailHtml = `
        <div style="line-height: 2;">
            <p><strong>客户名称：</strong>${item.customerName || '-'}</p>
            <p><strong>客户单号：</strong>${item.customerOrderId || '-'}</p>
            <p><strong>入仓日期：</strong>${item.warehouseInDate || '-'}</p>
            <p><strong>商品名称：</strong>${item.productName || '-'}</p>
            <p><strong>货物描述：</strong>${item.goodsDesc || '-'}</p>
            <p><strong>货品件数：</strong>${item.quantity || '-'}</p>
            <p><strong>货品重量：</strong>${item.weight || '-'}</p>
            <p><strong>国家：</strong>${item.country || '-'}</p>
            <p><strong>收货人信息：</strong>${item.receiverInfo || '-'}</p>
            <p><strong>申报价值：</strong>${item.declareValue || '-'}</p>
            <p><strong>运输方式：</strong>${item.transport || '-'}</p>
            <p><strong>供应链名称：</strong>${item.supplyChain || '-'}</p>
            <p><strong>发货渠道：</strong>${item.channel || '-'}</p>
            <p><strong>出仓日期：</strong>${item.warehouseOutDate || '-'}</p>
            <p><strong>应付金额：</strong>¥${item.payable?.toFixed(2) || '0.00'}</p>
            <p><strong>成本备注：</strong>${item.costRemark || '-'}</p>
            <p><strong>客户付款：</strong>¥${item.customerPay?.toFixed(2) || '0.00'}</p>
            <p><strong>报价明细：</strong>${item.quoteDetail || '-'}</p>
            <p><strong>利润：</strong>¥${item.profit?.toFixed(2) || '0.00'}</p>
            <p><strong>转单号：</strong>${item.trackingNo || '-'}</p>
            <p><strong>最新轨迹：</strong>${item.trackingStatus || '-'}</p>
            <p><strong>是否报关：</strong>${item.customs || '-'}</p>
            <p><strong>客服备注：</strong>${item.remark || '-'}</p>
            <p><strong>订单状态：</strong>${item.status || '-'}</p>
        </div>
    `;
    
    showDetailModal('订单详情', detailHtml);
}

// 显示详情模态框
function showDetailModal(title, content) {
    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-content').innerHTML = content;
    document.getElementById('detail-modal').style.display = 'flex';
}

// 关闭详情模态框
function closeDetailModal() {
    document.getElementById('detail-modal').style.display = 'none';
}

// 显示应付金额详情
function showPayDetailModal(id) {
    const item = orderDataList.find(item => item.id === id);
    if (!item) return;
    
    let payDetailHtml = '<div style="line-height: 2;">';
    if (item.payItems && item.payItems.length > 0) {
        item.payItems.forEach((payItem, index) => {
            payDetailHtml += `
                <div style="padding: 8px; border-bottom: 1px solid #eee;">
                    <p><strong>子项 ${index + 1}：</strong></p>
                    <p>金额：¥${payItem.amount.toFixed(2)}</p>
                    <p>备注：${payItem.remark || '-'}</p>
                </div>
            `;
        });
        payDetailHtml += `<div style="padding: 8px; font-weight: bold; margin-top: 10px;">
            合计：¥${item.payable.toFixed(2)}
        </div>`;
    } else {
        payDetailHtml += '<p>暂无应付子项数据</p>';
    }
    payDetailHtml += '</div>';
    
    document.getElementById('pay-detail-content').innerHTML = payDetailHtml;
    document.getElementById('pay-detail-modal').style.display = 'flex';
}

// 关闭应付详情模态框
function closePayDetailModal() {
    document.getElementById('pay-detail-modal').style.display = 'none';
}

// 显示轨迹详情
function showTrackingDetailModal(id) {
    const item = orderDataList.find(item => item.id === id);
    if (!item) return;
    
    let trackingHtml = '<div style="line-height: 2;">';
    if (item.trackingRecords && item.trackingRecords.length > 0) {
        // 按时间倒序排列
        const sortedRecords = [...item.trackingRecords].sort((a, b) => new Date(b.time) - new Date(a.time));
        
        sortedRecords.forEach((record, index) => {
            trackingHtml += `
                <div style="padding: 8px; border-bottom: 1px solid #eee;">
                    <p><strong>轨迹 ${index + 1}：</strong></p>
                    <p>时间：${record.time}</p>
                    <p>内容：${record.content}</p>
                </div>
            `;
        });
    } else {
        trackingHtml += '<p>暂无轨迹记录数据</p>';
    }
    trackingHtml += '</div>';
    
    document.getElementById('tracking-detail-content').innerHTML = trackingHtml;
    document.getElementById('tracking-detail-modal').style.display = 'flex';
}

// 关闭轨迹详情模态框
function closeTrackingDetailModal() {
    document.getElementById('tracking-detail-modal').style.display = 'none';
}

// 添加应付子项行
function addPayItemRow(amount = '', remark = '') {
    const container = document.getElementById('pay-items-container');
    const row = document.createElement('div');
    row.className = 'pay-item-row';
    row.innerHTML = `
        <input type="number" step="0.01" class="pay-item-amount" placeholder="金额(RMB)" value="${amount}">
        <input type="text" class="pay-item-remark" placeholder="备注（如：主货款、运费）" value="${remark}">
        <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
    `;
    
    // 删除按钮事件
    row.querySelector('.remove-item-btn').addEventListener('click', function() {
        container.removeChild(row);
    });
    
    container.appendChild(row);
}

// 添加轨迹记录行
function addTrackingRecordRow(time = '', content = '') {
    const container = document.getElementById('tracking-records-container');
    const row = document.createElement('div');
    row.className = 'tracking-record-row';
    row.innerHTML = `
        <input type="datetime-local" class="tracking-record-time" value="${time}">
        <input type="text" class="tracking-record-content" placeholder="轨迹内容" value="${content}">
        <button type="button" class="remove-tracking-btn"><i class="fas fa-times"></i></button>
    `;
    
    // 删除按钮事件
    row.querySelector('.remove-tracking-btn').addEventListener('click', function() {
        container.removeChild(row);
    });
    
    container.appendChild(row);
}

// 计算利润
function calculateProfit() {
    const payable = parseFloat(document.getElementById('form-payable').value) || 0;
    const customerPay = parseFloat(document.getElementById('form-customer-pay').value) || 0;
    document.getElementById('form-profit').value = (customerPay - payable).toFixed(2);
}

// 全选/取消全选
function toggleSelectAll() {
    const isChecked = document.getElementById('select-all').checked;
    document.querySelectorAll('#order-tbody input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// 导出数据
function exportData() {
    // 简单导出为CSV格式
    const headers = [
        '序号', '入仓日期', '客户名称', '客户单号', '商品名称', '货物描述',
        '货品件数', '货品重量', '国家', '收货人信息', '申报价值', '运输方式',
        '供应链名称', '发货渠道', '出仓日期', '应付(RMB)', '成本备注',
        '客户付款(RMB)', '报价明细', '利润(RMB)', '转单号', '最新轨迹',
        '是否报关', '客服备注', '状态'
    ];
    
    const rows = [headers.join(',')];
    
    orderDataList.forEach((item, index) => {
        const row = [
            index + 1,
            `"${item.warehouseInDate || ''}"`,
            `"${item.customerName || ''}"`,
            `"${item.customerOrderId || ''}"`,
            `"${item.productName || ''}"`,
            `"${item.goodsDesc || ''}"`,
            item.quantity || '',
            `"${item.weight || ''}"`,
            `"${item.country || ''}"`,
            `"${item.receiverInfo || ''}"`,
            `"${item.declareValue || ''}"`,
            `"${item.transport || ''}"`,
            `"${item.supplyChain || ''}"`,
            `"${item.channel || ''}"`,
            `"${item.warehouseOutDate || ''}"`,
            item.payable?.toFixed(2) || '0.00',
            `"${item.costRemark || ''}"`,
            item.customerPay?.toFixed(2) || '0.00',
            `"${item.quoteDetail || ''}"`,
            item.profit?.toFixed(2) || '0.00',
            `"${item.trackingNo || ''}"`,
            `"${item.trackingStatus || ''}"`,
            `"${item.customs || ''}"`,
            `"${item.remark || ''}"`,
            `"${item.status || ''}"`
        ];
        rows.push(row.join(','));
    });
    
    // 创建下载链接
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `臻方供应链订单数据_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}