// ==============================================
// 臻方供应链管理系统 - 原版样式匹配版
// 保留你原来的所有界面，修复添加/编辑/轨迹/应付子项
// ==============================================
let orderData = [];
let currentEditIndex = -1;
let tempPayItems = []; // 临时应付子项
let tempTrackingRecords = []; // 临时轨迹记录

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocal();
    renderTable();
    bindAllEvents();
});

// 读取本地存储
function loadFromLocal() {
    const data = localStorage.getItem('zhenfangSupplyChainData');
    if (data) {
        orderData = JSON.parse(data);
    } else {
        // 初始默认数据（和你原版一致）
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

// 保存到本地存储
function saveToLocal() {
    localStorage.setItem('zhenfangSupplyChainData', JSON.stringify(orderData));
}

// 表格渲染（完全匹配你原来的27列+样式）
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
            <td><span class="detail-link" data-type="receiver" data-index="${index}">${cutStr(item.receiver)}</span></td>
            <td>${item.declareValue}</td>
            <td>${item.transport}</td>
            <td>${item.supplyChain}</td>
            <td>${item.channel}</td>
            <td>${item.warehouseOut}</td>
            <td><span class="detail-link" data-type="pay" data-index="${index}">${cutStr(item.payable.toFixed(2))}</span></td>
            <td><span class="detail-link" data-type="cost" data-index="${index}">${cutStr(item.costRemark)}</span></td>
            <td>${item.customerPay.toFixed(2)}</td>
            <td><span class="detail-link" data-type="quote" data-index="${index}">${cutStr(item.quoteDetail)}</span></td>
            <td>${item.profit.toFixed(2)}</td>
            <td>${item.trackingNo}</td>
            <td><span class="detail-link" data-type="tracking" data-index="${index}">${cutStr(item.trackingStatus)}</span></td>
            <td>${item.customs}</td>
            <td><span class="detail-link" data-type="remark" data-index="${index}">${cutStr(item.remark)}</span></td>
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

// 绑定所有事件（修复添加/编辑/轨迹/应付子项）
function bindAllEvents() {
    // 1. 添加订单
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

    // 2. 关闭弹窗
    document.getElementById('modal-close').onclick =
    document.getElementById('modal-cancel').onclick = () => {
        document.getElementById('order-modal').style.display = 'none';
    };

    // 3. 保存订单（新增/编辑）
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
            payable: parseFloat(document.getElementById('form-payable').value) || 0,
            costRemark: document.getElementById('form-cost-remark').value,
            customerPay: parseFloat(document.getElementById('form-customer-pay').value) || 0,
            quoteDetail: document.getElementById('form-quote-detail').value,
            profit: (parseFloat(document.getElementById('form-customer-pay').value) || 0) - (parseFloat(document.getElementById('form-payable').value) || 0),
            trackingNo: document.getElementById('form-tracking-no').value,
            trackingStatus: document.getElementById('form-tracking-status').value,
            customs: document.getElementById('form-customs').value,
            remark: document.getElementById('form-remark').value,
            status: document.getElementById('form-status').value,
            payItems: [...tempPayItems],
            trackingRecords: [...tempTrackingRecords]
        };

        if (currentEditIndex === -1) {
            orderData.push({ id: Date.now(), ...formData });
        } else {
            orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...formData };
        }

        saveToLocal();
        document.getElementById('order-modal').style.display = 'none';
        renderTable();
        bindAllEvents();
    };

    // 4. 编辑订单
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            currentEditIndex = index;
            const item = orderData[index];
            tempPayItems = [...item.payItems];
            tempTrackingRecords = [...item.trackingRecords];

            // 填充表单（和你原版字段完全匹配）
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

            // 渲染应付子项和轨迹记录
            renderTempPayItems();
            renderTempTrackingRecords();

            document.getElementById('modal-title').textContent = '编辑订单';
            document.getElementById('order-modal').style.display = 'flex';
        };
    });

    // 5. 删除订单
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (!confirm('确定删除此订单？')) return;
            const index = parseInt(e.currentTarget.dataset.index);
            orderData.splice(index, 1);
            saveToLocal();
            renderTable();
            bindAllEvents();
        };
    });

    // 6. 查看完整详情弹窗
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const item = orderData[index];

            // 构建详情HTML（保持原版风格）
            let detailHtml = `
                <div style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                    <h3 style="margin: 0 0 20px 0; color: #165DFF;">订单详情 #${item.orderId}</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <p style="margin: 8px 0; color: #666;"><strong>客户名称：</strong>${item.customer}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>入仓日期：</strong>${item.warehouseIn}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>出仓日期：</strong>${item.warehouseOut || '未填写'}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>运输方式：</strong>${item.transport}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>供应链名称：</strong>${item.supplyChain}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>发货渠道：</strong>${item.channel}</p>
                        </div>
                        <div>
                            <p style="margin: 8px 0; color: #666;"><strong>货品件数：</strong>${item.quantity} 件</p>
                            <p style="margin: 8px 0; color: #666;"><strong>货品重量：</strong>${item.weight}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>目的地国家：</strong>${item.country}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>是否报关：</strong>${item.customs}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>订单状态：</strong>${item.status}</p>
                            <p style="margin: 8px 0; color: #666;"><strong>转单号：</strong>${item.trackingNo}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px 0; color: #333;">收货人信息</h4>
                        <p style="margin: 0; padding: 8px; background: #f5f7fa; border-radius: 4px;">${item.receiver}</p>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px 0; color: #333;">财务信息</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                            <div style="padding: 8px; background: #f5f7fa; border-radius: 4px; text-align: center;">
                                <p style="margin: 0; font-size: 14px; color: #666;">应付金额</p>
                                <p style="margin: 4px 0 0 0; font-size: 18px; color: #ff6b6b; font-weight: 600;">¥${item.payable.toFixed(2)}</p>
                            </div>
                            <div style="padding: 8px; background: #f5f7fa; border-radius: 4px; text-align: center;">
                                <p style="margin: 0; font-size: 14px; color: #666;">客户付款</p>
                                <p style="margin: 4px 0 0 0; font-size: 18px; color: #4ecdc4; font-weight: 600;">¥${item.customerPay.toFixed(2)}</p>
                            </div>
                            <div style="padding: 8px; background: #f5f7fa; border-radius: 4px; text-align: center;">
                                <p style="margin: 0; font-size: 14px; color: #666;">利润</p>
                                <p style="margin: 4px 0 0 0; font-size: 18px; color: #165DFF; font-weight: 600;">¥${item.profit.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px 0; color: #333;">应付子项</h4>
                        ${item.payItems.length > 0 ? `
                            <ul style="margin: 0; padding-left: 20px; background: #f5f7fa; padding: 12px; border-radius: 4px;">
                                ${item.payItems.map(item => `<li style="margin: 4px 0; color: #333;">${item.remark}：¥${item.amount.toFixed(2)}</li>`).join('')}
                            </ul>
                        ` : '<p style="margin: 0; color: #666;">无应付子项</p>'}
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 12px 0; color: #333;">物流轨迹记录</h4>
                        ${item.trackingRecords.length > 0 ? `
                            <div style="background: #f5f7fa; padding: 12px; border-radius: 4px;">
                                ${item.trackingRecords.map(record => `
                                    <div style="margin: 8px 0; padding-bottom: 8px; border-bottom: 1px solid #eee;">
                                        <p style="margin: 0; font-size: 14px; color: #999;">${record.time}</p>
                                        <p style="margin: 4px 0 0 0; color: #333;">${record.content}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p style="margin: 0; color: #666;">无轨迹记录</p>'}
                    </div>

                    <div>
                        <h4 style="margin: 0 0 12px 0; color: #333;">客服备注</h4>
                        <p style="margin: 0; padding: 12px; background: #f5f7fa; border-radius: 4px; color: #333; white-space: pre-line;">${item.remark || '无备注'}</p>
                    </div>
                </div>
            `;

            // 创建弹窗遮罩
            const mask = document.createElement('div');
            mask.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;
            `;
            mask.innerHTML = `
                <div style="background: white; width: 90%; max-width: 900px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    ${detailHtml}
                    <div style="text-align: center; padding: 16px; border-top: 1px solid #eee;">
                        <button id="close-detail-btn" style="padding: 8px 24px; background: #165DFF; color: white; border: none; border-radius: 6px; cursor: pointer;">关闭</button>
                    </div>
                </div>
            `;
            document.body.appendChild(mask);

            // 关闭详情弹窗
            document.getElementById('close-detail-btn').onclick = () => {
                mask.remove();
            };
            mask.onclick = (e) => {
                if (e.target === mask) mask.remove();
            };
        };
    });

    // 7. 表格字段点击弹窗（显示完整内容）
    document.querySelectorAll('.detail-link').forEach(el => {
        el.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const field = e.currentTarget.dataset.type;
            const item = orderData[index];
            const fieldLabels = {
                receiver: '收货人信息',
                payable: '应付金额',
                costRemark: '成本备注',
                quoteDetail: '报价明细',
                trackingStatus: '最新轨迹',
                remark: '客服备注'
            };

            // 弹窗内容
            const mask = document.createElement('div');
            mask.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;
            `;
            mask.innerHTML = `
                <div style="background: white; padding: 24px; border-radius: 12px; min-width: 300px; max-width: 500px;">
                    <h3 style="margin: 0 0 16px 0; color: #165DFF;">${fieldLabels[field]}</h3>
                    <p style="margin: 0 0 20px 0; color: #333; white-space: pre-line;">${item[field] || '无内容'}</p>
                    <button style="width: 100%; padding: 10px; background: #165DFF; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="this.closest('div').parentNode.remove()">关闭</button>
                </div>
            `;
            document.body.appendChild(mask);
        };
    });

    // 8. 自动计算利润
    const calcProfit = () => {
        const cost = parseFloat(document.getElementById('form-payable').value) || 0;
        const income = parseFloat(document.getElementById('form-customer-pay').value) || 0;
        document.getElementById('form-profit').value = (income - cost).toFixed(2);
    };
    document.getElementById('form-payable').oninput = calcProfit;
    document.getElementById('form-customer-pay').oninput = calcProfit;

    // 9. 应付子项 - 添加
    document.getElementById('add-pay-item').onclick = () => {
        tempPayItems.push({ 
            amount: parseFloat(document.getElementById('form-payable').value) || 0, 
            remark: document.getElementById('form-cost-remark').value.trim() || '未填写备注'
        });
        renderTempPayItems();
    };

    // 10. 轨迹记录 - 添加
    document.getElementById('add-tracking-record').onclick = () => {
        tempTrackingRecords.push({ 
            time: new Date().toLocaleString(), 
            content: document.getElementById('form-tracking-status').value.trim() || '未填写轨迹内容'
        });
        renderTempTrackingRecords();
    };

    // 11. 导出数据
    document.getElementById('export-btn').onclick = () => {
        const jsonStr = JSON.stringify(orderData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `臻方供应链订单_${new Date().toLocaleDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('导出成功！');
    };
}

// 渲染临时应付子项（弹窗内）
function renderTempPayItems() {
    const container = document.getElementById('pay-items-container');
    container.innerHTML = '';
    if (tempPayItems.length === 0) {
        container.innerHTML = '<p style="color: #999; margin: 8px 0; font-size: 14px;">暂无应付子项，点击"新增应付子项"添加</p>';
        return;
    }
    tempPayItems.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'pay-item-row';
        itemEl.innerHTML = `
            <input type="number" step="0.01" value="${item.amount}" onchange="tempPayItems[${index}].amount = parseFloat(this.value) || 0">
            <input type="text" value="${item.remark}" onchange="tempPayItems[${index}].remark = this.value.trim()">
            <button onclick="tempPayItems.splice(${index}, 1);renderTempPayItems()">删除</button>
        `;
        container.appendChild(itemEl);
    });
}

// 渲染临时轨迹记录（弹窗内）
function renderTempTrackingRecords() {
    const container = document.getElementById('tracking-records-container');
    container.innerHTML = '';
    if (tempTrackingRecords.length === 0) {
        container.innerHTML = '<p style="color: #999; margin: 8px 0; font-size: 14px;">暂无轨迹记录，点击"新增轨迹记录"添加</p>';
        return;
    }
    tempTrackingRecords.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'tracking-record-row';
        itemEl.innerHTML = `
            <input type="datetime-local" value="${formatDateTime(item.time)}" onchange="tempTrackingRecords[${index}].time = this.value.replace('T', ' ')">
            <input type="text" value="${item.content}" onchange="tempTrackingRecords[${index}].content = this.value.trim()">
            <button onclick="tempTrackingRecords.splice(${index}, 1);renderTempTrackingRecords()">删除</button>
        `;
        container.appendChild(itemEl);
    });
}

// 辅助函数：格式化日期时间为 datetime-local 格式
function formatDateTime(timeStr) {
    return timeStr.replace(' ', 'T').substring(0, 16);
}

// 辅助函数：截断字符串（前5字符+省略号）
function cutStr(str) {
    if (!str) return '';
    return str.length > 5 ? str.substring(0, 5) + '...' : str;
}