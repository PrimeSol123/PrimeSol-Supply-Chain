// ========== 全局配置（GitHub Gist 持久化） ==========
const GIST_CONFIG = {
  gistId: '40b65722b0e1833c8e80d2a9fab69d2c', // 必改：你的Gist ID
  token: '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', // 必改：你的Token
  fileName: 'supply-chain-data.json' // Gist里的JSON文件名
};

// 全局变量
let payItemsData = [];
let trackingRecordsData = [];
let payItemsContainer = null;
let trackingRecordsContainer = null;
let formFields = {};
let tempFormData = null;
let orderList = []; // 核心：订单数据列表（替代原有硬编码/页面DOM数据）

// ========== Gist 数据操作核心函数 ==========
// 1. 从Gist加载数据
async function loadDataFromGist() {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
      headers: {
        'Authorization': `token ${GIST_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) throw new Error('Gist加载失败');
    
    const gist = await response.json();
    const fileContent = gist.files[GIST_CONFIG.fileName].content;
    orderList = JSON.parse(fileContent);
    // 同步到本地存储（兜底）
    localStorage.setItem('supplyChainOrders', JSON.stringify(orderList));
    renderOrderTable(); // 重新渲染表格
    filterData(); // 刷新筛选状态
  } catch (err) {
    console.error('Gist加载失败，使用本地存储:', err);
    // 本地存储兜底
    const localData = localStorage.getItem('supplyChainOrders');
    orderList = localData ? JSON.parse(localData) : [];
    renderOrderTable();
  }
}

// 2. 保存数据到Gist
async function saveDataToGist() {
  try {
    // 先同步到本地存储
    localStorage.setItem('supplyChainOrders', JSON.stringify(orderList));
    
    const response = await fetch(`https://api.github.com/gists/${GIST_CONFIG.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GIST_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [GIST_CONFIG.fileName]: {
            content: JSON.stringify(orderList, null, 2) // 格式化JSON，便于查看
          }
        }
      })
    });
    if (!response.ok) throw new Error('Gist保存失败');
    alert('数据保存成功！');
  } catch (err) {
    console.error('Gist保存失败，仅保存到本地:', err);
    alert('云端保存失败，数据已保存到本地（仅当前设备可见）');
  }
}

// 3. 初始化数据（页面加载时执行）
async function initData() {
  await loadDataFromGist();
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // ========== 元素获取 ==========
    // 表格相关
    const tbody = document.getElementById('order-tbody');
    const searchInput = document.getElementById('search');
    const countrySelect = document.getElementById('country');
    const transportSelect = document.getElementById('transport');
    const statusSelect = document.getElementById('status');
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    const recordCount = document.getElementById('record-count');
    const exportBtn = document.getElementById('export-btn');
    const addBtn = document.getElementById('add-btn');
    const selectAll = document.getElementById('select-all');
    
    // 模态框相关
    const modal = document.getElementById('order-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');
    const editRowIndex = document.getElementById('edit-row-index');
    
    // 应付详情弹窗
    const payDetailModal = document.getElementById('pay-detail-modal');
    const payDetailClose = document.getElementById('pay-detail-close');
    const payDetailCancel = document.getElementById('pay-detail-cancel');
    const payDetailContent = document.getElementById('pay-detail-content');
    
    // 轨迹详情弹窗
    const trackingDetailModal = document.getElementById('tracking-detail-modal');
    const trackingDetailClose = document.getElementById('tracking-detail-close');
    const trackingDetailCancel = document.getElementById('tracking-detail-cancel');
    const trackingDetailContent = document.getElementById('tracking-detail-content');
    
    // 应付子项相关
    const addPayItemBtn = document.getElementById('add-pay-item');
    payItemsContainer = document.getElementById('pay-items-container');
    
    // 轨迹记录相关
    const addTrackingRecordBtn = document.getElementById('add-tracking-record');
    trackingRecordsContainer = document.getElementById('tracking-records-container');
    
    // 详情弹窗相关
    const detailModal = document.getElementById('detail-modal');
    const detailClose = document.getElementById('detail-close');
    const detailTitle = document.getElementById('detail-title');
    const detailContent = document.getElementById('detail-content');
    
    // 表单字段（新增成本备注、报价明细）
    formFields = {
        customer: document.getElementById('form-customer'),
        orderId: document.getElementById('form-order-id'),
        warehouseIn: document.getElementById('form-warehouse-in'),
        productName: document.getElementById('form-product-name'),
        goods: document.getElementById('form-goods'),
        quantity: document.getElementById('form-quantity'),
        weight: document.getElementById('form-weight'),
        country: document.getElementById('form-country'),
        receiver: document.getElementById('form-receiver'),
        declareValue: document.getElementById('form-declare-value'),
        transport: document.getElementById('form-transport'),
        supplyChain: document.getElementById('form-supply-chain'),
        channel: document.getElementById('form-channel'),
        warehouseOut: document.getElementById('form-warehouse-out'),
        payable: document.getElementById('form-payable'),
        costRemark: document.getElementById('form-cost-remark'), // 新增成本备注
        customerPay: document.getElementById('form-customer-pay'),
        quoteDetail: document.getElementById('form-quote-detail'), // 新增报价明细
        profit: document.getElementById('form-profit'),
        trackingNo: document.getElementById('form-tracking-no'),
        trackingStatus: document.getElementById('form-tracking-status'),
        customs: document.getElementById('form-customs'),
        remark: document.getElementById('form-remark'),
        status: document.getElementById('form-status')
    };

    // 初始化数据（优先从Gist加载）
    initData();

    // 绑定客户付款输入事件，触发利润计算
    formFields.customerPay.addEventListener('input', calculateProfit);
    formFields.payable.addEventListener('input', calculateProfit);

    // ========== 新增：监听表单输入，实时保存到临时变量 ==========
    Object.values(formFields).forEach(field => {
        field.addEventListener('input', saveTempFormData);
        field.addEventListener('change', saveTempFormData);
    });

    // ========== 事件委托 ==========
    // 应付子项删除事件
    payItemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-pay-item')) {
            const index = parseInt(e.target.dataset.itemIndex);
            if (index >= 0 && index < payItemsData.length) {
                if (confirm('确定删除该子项吗？')) {
                    payItemsData.splice(index, 1);
                    renderPayItems();
                    calculateTotalPayable();
                    saveTempFormData(); // 保存应付子项修改
                }
            }
        }
    });
    
    // 轨迹记录删除事件
    trackingRecordsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('tracking-record-delete')) {
            const index = parseInt(e.target.dataset.index);
            if (confirm('确定删除该轨迹记录吗？')) {
                trackingRecordsData.splice(index, 1);
                renderTrackingRecords();
                updateLatestTrackingStatus();
                saveTempFormData(); // 保存轨迹记录修改
            }
        }
    });

    // ========== 事件绑定 ==========
    // 搜索按钮
    searchBtn.addEventListener('click', filterData);
    // 重置按钮
    resetBtn.addEventListener('click', function() {
        searchInput.value = '';
        countrySelect.value = '';
        transportSelect.value = '';
        statusSelect.value = '';
        filterData();
    });
    // 添加订单按钮
    addBtn.addEventListener('click', function() {
        tempFormData = null; // 清空临时数据
        openModal('add');
    });
    // 模态框关闭按钮
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
        // 保留临时数据，不重置
    });
    // 模态框取消按钮
    modalCancel.addEventListener('click', function() {
        modal.style.display = 'none';
        // 保留临时数据，不重置
    });
    // 模态框保存按钮
    modalSave.addEventListener('click', function() {
        saveOrder();
        tempFormData = null; // 保存成功后清空临时数据
    });
    // 应付详情弹窗关闭按钮
    payDetailClose.addEventListener('click', function() {
        payDetailModal.style.display = 'none';
    });
    payDetailCancel.addEventListener('click', function() {
        payDetailModal.style.display = 'none';
    });
    // 详情弹窗关闭按钮
    detailClose.addEventListener('click', function() {
        detailModal.style.display = 'none';
    });
    // 轨迹详情弹窗关闭
    trackingDetailClose.addEventListener('click', function() {
        trackingDetailModal.style.display = 'none';
    });
    trackingDetailCancel.addEventListener('click', function() {
        trackingDetailModal.style.display = 'none';
    });
    // 新增应付子项按钮
    addPayItemBtn.addEventListener('click', function() {
        payItemsData.push({ amount: 0, remark: '' });
        renderPayItems();
        calculateTotalPayable();
        saveTempFormData(); // 保存应付子项修改
    });
    // 新增轨迹记录按钮
    addTrackingRecordBtn.addEventListener('click', function() {
        const now = new Date();
        const timeStr = now.getFullYear() + '-' + 
                        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(now.getDate()).padStart(2, '0') + ' ' + 
                        String(now.getHours()).padStart(2, '0') + ':' + 
                        String(now.getMinutes()).padStart(2, '0') + ':00';
        trackingRecordsData.push({ time: timeStr, content: '' });
        renderTrackingRecords();
        updateLatestTrackingStatus();
        saveTempFormData(); // 保存轨迹记录修改
    });

    // ========== 核心函数 ==========
    // 0. 保存临时表单数据（防止模态框关闭丢失）
    function saveTempFormData() {
        if (!tempFormData) tempFormData = {};
        // 保存表单字段
        Object.entries(formFields).forEach(([key, field]) => {
            tempFormData[key] = field.value;
        });
        // 保存应付子项和轨迹记录
        tempFormData.payItems = [...payItemsData];
        tempFormData.trackingRecords = [...trackingRecordsData];
    }

    // 1. 筛选数据
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const country = countrySelect.value;
        const transport = transportSelect.value;
        const status = statusSelect.value;
        const rows = tbody.querySelectorAll('tr');
        let count = 0;
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let show = true;
            
            if (searchTerm) {
                show = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchTerm));
            }
            if (country && show) {
                show = cells[9].textContent === country; // 国家列索引
            }
            if (transport && show) {
                show = cells[11].textContent === transport; // 运输方式列索引（修正：列顺序调整后索引）
            }
            if (status && show) {
                const statusText = cells[24].textContent; // 状态列索引（修正：列顺序调整后）
                if (status === 'pending') show = statusText.includes('待发货');
                else if (status === 'shipped') show = statusText.includes('已发货');
                else if (status === 'waiting-pickup') show = statusText.includes('待提货');
                else if (status === 'signed') show = statusText.includes('已签收');
                else if (status === 'inquiry') show = statusText.includes('询价中');
            }
            
            row.style.display = show ? '' : 'none';
            if (show) count++;
        });
        
        recordCount.textContent = `(共${count}条记录)`;
    }
    
    // 2. 渲染应付子项
    function renderPayItems() {
        payItemsContainer.innerHTML = '';
        
        if (payItemsData.length === 0) {
            payItemsContainer.innerHTML = '<div style="color:#6b7280; font-size:0.9rem;">暂无应付子项，点击"新增应付子项"添加</div>';
            return;
        }
        
        payItemsData.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'pay-item';
            itemDiv.innerHTML = `
                <input type="number" step="0.01" class="form-control pay-item-amount" placeholder="金额" value="${item.amount || 0}">
                <input type="text" class="form-control pay-item-remark" placeholder="备注（如：运费/仓储费）" value="${item.remark || ''}">
                <button type="button" class="btn btn-danger remove-pay-item" data-item-index="${index}">删除</button>
            `;
            
            payItemsContainer.appendChild(itemDiv);
            
            const amountInput = itemDiv.querySelector('.pay-item-amount');
            amountInput.addEventListener('input', function() {
                payItemsData[index].amount = parseFloat(this.value) || 0;
                calculateTotalPayable();
                saveTempFormData(); // 保存应付子项修改
            });
            
            const remarkInput = itemDiv.querySelector('.pay-item-remark');
            remarkInput.addEventListener('input', function() {
                payItemsData[index].remark = this.value;
                saveTempFormData(); // 保存应付子项修改
            });
        });
    }
    
    // 3. 计算应付总金额
    function calculateTotalPayable() {
        const total = payItemsData.reduce((sum, item) => sum + (item.amount || 0), 0);
        formFields.payable.value = total.toFixed(2);
        calculateProfit();
    }
    
    // 4. 计算利润
    function calculateProfit() {
        const payable = parseFloat(formFields.payable.value) || 0;
        const customerPay = parseFloat(formFields.customerPay.value) || 0;
        const profit = customerPay - payable;
        formFields.profit.value = profit.toFixed(2);
    }
    
    // 5. 初始化应付子项
    function initPayItems(items = []) {
        payItemsData = JSON.parse(JSON.stringify(items));
        renderPayItems();
    }
    
    // 6. 渲染轨迹记录
    function renderTrackingRecords() {
        trackingRecordsContainer.innerHTML = '';
        
        if (trackingRecordsData.length === 0) {
            trackingRecordsContainer.innerHTML = '<div style="color:#6b7280; font-size:0.9rem; text-align:center;">暂无轨迹记录，点击"新增轨迹记录"添加</div>';
            return;
        }
        
        const sortedRecords = [...trackingRecordsData].sort((a, b) => new Date(b.time) - new Date(a.time));
        
        sortedRecords.forEach((record, index) => {
            const recordDiv = document.createElement('div');
            recordDiv.className = 'tracking-record-item';
            recordDiv.innerHTML = `
                <input type="datetime-local" class="form-control tracking-record-time" value="${record.time.replace(' ', 'T')}">
                <input type="text" class="form-control tracking-record-content" placeholder="轨迹内容" value="${record.content || ''}">
                <button type="button" class="tracking-record-delete" data-index="${trackingRecordsData.findIndex(r => r.time === record.time && r.content === record.content)}">删除</button>
            `;
            
            trackingRecordsContainer.appendChild(recordDiv);
            
            const timeInput = recordDiv.querySelector('.tracking-record-time');
            timeInput.addEventListener('input', function() {
                const originalIndex = trackingRecordsData.findIndex(r => r.time === record.time && r.content === record.content);
                trackingRecordsData[originalIndex].time = this.value.replace('T', ' ');
                renderTrackingRecords();
                updateLatestTrackingStatus();
                saveTempFormData(); // 保存轨迹记录修改
            });
            
            const contentInput = recordDiv.querySelector('.tracking-record-content');
            contentInput.addEventListener('input', function() {
                const originalIndex = trackingRecordsData.findIndex(r => r.time === record.time && r.content === record.content);
                trackingRecordsData[originalIndex].content = this.value;
                updateLatestTrackingStatus();
                saveTempFormData(); // 保存轨迹记录修改
            });
        });
    }
    
    // 7. 更新最新轨迹显示
    function updateLatestTrackingStatus() {
        if (trackingRecordsData.length === 0) {
            formFields.trackingStatus.value = '';
            return;
        }
        const latestRecord = [...trackingRecordsData].sort((a, b) => new Date(b.time) - new Date(a.time))[0];
        formFields.trackingStatus.value = latestRecord.content || '';
    }
    
    // 8. 初始化轨迹记录
    function initTrackingRecords(records = []) {
        trackingRecordsData = JSON.parse(JSON.stringify(records));
        renderTrackingRecords();
        updateLatestTrackingStatus();
    }
    
    // 9. 打开应付金额详情弹窗
    function openPayDetailModal(payable, items) {
        let html = `<p><strong>总应付金额：</strong>${payable} RMB</p>`;
        
        if (items && items.length > 0) {
            html += `
                <table>
                    <thead>
                        <tr>
                            <th>金额（RMB）</th>
                            <th>备注</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            items.forEach(item => {
                html += `
                    <tr>
                        <td>${item.amount.toFixed(2)}</td>
                        <td>${item.remark || '无备注'}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table>`;
        } else {
            html += `<p style="margin-top: 1rem; color:#6b7280;">暂无应付子项</p>`;
        }
        
        payDetailContent.innerHTML = html;
        payDetailModal.style.display = 'flex';
    }

    // 10. 打开轨迹详情弹窗
    function openTrackingDetailModal(row) {
        const trackingRecords = JSON.parse(row.dataset.trackingRecords || '[]');
        
        // 清空原有内容
        trackingDetailContent.innerHTML = '';
        
        if (trackingRecords.length === 0) {
            trackingDetailContent.innerHTML = '<div style="text-align:center; color:#6b7280; padding: 2rem 0;">暂无轨迹记录</div>';
        } else {
            // 按时间倒序排序
            const sortedRecords = [...trackingRecords].sort((a, b) => new Date(b.time) - new Date(a.time));
            
            // 构建轨迹列表
            let html = '<div style="max-height: 400px; overflow-y: auto;">';
            sortedRecords.forEach((record, index) => {
                html += `
                    <div style="padding: 0.75rem; border-bottom: 1px solid var(--gray-100);">
                        <div style="font-size: 0.85rem; color: var(--gray-600); margin-bottom: 0.25rem;">
                            <i class="fas fa-clock" style="margin-right: 0.5rem;"></i>${record.time}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--gray-800);">${record.content || '无轨迹内容'}</div>
                    </div>
                `;
            });
            html += '</div>';
            trackingDetailContent.innerHTML = html;
        }
        
        // 显示弹窗
        trackingDetailModal.style.display = 'flex';
    }
    
    // 11. 绑定行事件（包含文本截断、按钮事件）
    function bindRowEvents(row) {
        const cells = row.querySelectorAll('td');
        
        // 文本截断处理 - 货物描述（5字符）
        const goodsCell = cells[6];
        const goodsText = goodsCell.textContent.trim();
        if (goodsText.length > 5) {
            goodsCell.textContent = goodsText.substring(0, 5) + '...';
            goodsCell.classList.add('text-truncate');
            goodsCell.dataset.fullText = goodsText;
            goodsCell.addEventListener('click', function() {
                detailTitle.textContent = '货物描述';
                detailContent.textContent = this.dataset.fullText;
                detailModal.style.display = 'flex';
            });
        }
        
        // 文本截断处理 - 收货人信息
        const receiverCell = cells[10];
        const receiverText = receiverCell.textContent.trim();
        if (receiverText.length > 20) {
            receiverCell.textContent = receiverText.substring(0, 20) + '...';
            receiverCell.classList.add('text-truncate');
            receiverCell.dataset.fullText = receiverText;
            receiverCell.addEventListener('click', function() {
                detailTitle.textContent = '收货人信息';
                detailContent.textContent = this.dataset.fullText;
                detailModal.style.display = 'flex';
            });
        }

        // 绑定编辑按钮事件
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const index = parseInt(row.dataset.index);
                openModal('edit', index);
            });
        }

        // 绑定删除按钮事件
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const index = parseInt(row.dataset.index);
                deleteOrder(index);
            });
        }

        // 绑定详情按钮事件
        const detailBtn = row.querySelector('.detail-btn');
        if (detailBtn) {
            detailBtn.addEventListener('click', function() {
                const index = parseInt(row.dataset.index);
                const order = orderList[index];
                openPayDetailModal(order.payable, order.payItems);
            });
        }

        // 绑定轨迹详情按钮（如果有）
        const trackingBtn = row.querySelector('.tracking-btn');
        if (trackingBtn) {
            trackingBtn.addEventListener('click', function() {
                openTrackingDetailModal(row);
            });
        }
    }

    // 12. 渲染订单表格（核心：基于orderList生成DOM）
    function renderOrderTable() {
        const tbody = document.getElementById('order-tbody');
        tbody.innerHTML = ''; // 清空原有内容

        if (orderList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="25" style="text-align:center; color:#6b7280;">暂无订单数据</td></tr>';
            recordCount.textContent = '(共0条记录)';
            return;
        }

        // 遍历订单列表生成行
        orderList.forEach((order, index) => {
            const tr = document.createElement('tr');
            // 存储订单数据（用于编辑/详情）
            tr.dataset.index = index;
            tr.dataset.trackingRecords = JSON.stringify(order.trackingRecords || []);
            tr.dataset.payItems = JSON.stringify(order.payItems || []);

            // 构建单元格（按列顺序生成）
            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-index="${index}"></td>
                <td>${order.orderId || '-'}</td>
                <td>${order.customer || '-'}</td>
                <td>${order.warehouseIn || '-'}</td>
                <td>${order.productName || '-'}</td>
                <td>${order.goods || '-'}</td>
                <td>${order.quantity || '-'}</td>
                <td>${order.weight || '-'}</td>
                <td>${order.declareValue || '-'}</td>
                <td>${order.country || '-'}</td>
                <td>${order.receiver || '-'}</td>
                <td>${order.transport || '-'}</td>
                <td>${order.supplyChain || '-'}</td>
                <td>${order.channel || '-'}</td>
                <td>${order.warehouseOut || '-'}</td>
                <td>${order.payable || '0.00'}</td>
                <td>${order.costRemark || '-'}</td>
                <td>${order.customerPay || '0.00'}</td>
                <td>${order.quoteDetail || '-'}</td>
                <td>${order.profit || '0.00'}</td>
                <td>${order.trackingNo || '-'}</td>
                <td>${order.trackingStatus || '-'}</td>
                <td>${order.customs || '-'}</td>
                <td>${order.remark || '-'}</td>
                <td>${order.status || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn">编辑</button>
                    <button class="btn btn-sm btn-info detail-btn">应付详情</button>
                    <button class="btn btn-sm btn-warning tracking-btn">轨迹详情</button>
                    <button class="btn btn-sm btn-danger delete-btn">删除</button>
                </td>
            `;

            tbody.appendChild(tr);
            // 绑定行事件（文本截断、按钮事件）
            bindRowEvents(tr);
        });

        // 更新记录数
        recordCount.textContent = `(共${orderList.length}条记录)`;
    }

    // 13. 打开新增/编辑模态框
    function openModal(type, index = -1) {
        modalTitle.textContent = type === 'add' ? '新增订单' : '编辑订单';
        editRowIndex.value = index;

        // 清空表单 + 应付子项/轨迹记录
        if (type === 'add') {
            // 新增：清空所有表单字段
            Object.values(formFields).forEach(field => field.value = '');
            payItemsData = [];
            trackingRecordsData = [];
        } else {
            // 编辑：加载订单数据
            const order = orderList[index];
            // 填充表单字段
            Object.entries(formFields).forEach(([key, field]) => {
                field.value = order[key] || '';
            });
            // 初始化应付子项和轨迹记录
            initPayItems(order.payItems || []);
            initTrackingRecords(order.trackingRecords || []);
        }

        // 渲染应付子项和轨迹记录
        renderPayItems();
        renderTrackingRecords();
        // 显示模态框
        modal.style.display = 'flex';
    }

    // 14. 保存订单（新增/编辑）
    function saveOrder() {
        // 1. 收集表单数据
        const orderData = {
            customer: formFields.customer.value.trim(),
            orderId: formFields.orderId.value.trim(),
            warehouseIn: formFields.warehouseIn.value.trim(),
            productName: formFields.productName.value.trim(),
            goods: formFields.goods.value.trim(),
            quantity: formFields.quantity.value.trim(),
            weight: formFields.weight.value.trim(),
            country: formFields.country.value.trim(),
            receiver: formFields.receiver.value.trim(),
            declareValue: formFields.declareValue.value.trim(),
            transport: formFields.transport.value.trim(),
            supplyChain: formFields.supplyChain.value.trim(),
            channel: formFields.channel.value.trim(),
            warehouseOut: formFields.warehouseOut.value.trim(),
            payable: formFields.payable.value.trim(),
            costRemark: formFields.costRemark.value.trim(),
            customerPay: formFields.customerPay.value.trim(),
            quoteDetail: formFields.quoteDetail.value.trim(),
            profit: formFields.profit.value.trim(),
            trackingNo: formFields.trackingNo.value.trim(),
            trackingStatus: formFields.trackingStatus.value.trim(),
            customs: formFields.customs.value.trim(),
            remark: formFields.remark.value.trim(),
            status: formFields.status.value.trim(),
            payItems: [...payItemsData], // 应付子项
            trackingRecords: [...trackingRecordsData] // 轨迹记录
        };

        // 2. 验证必填项
        if (!orderData.orderId || !orderData.customer) {
            alert('订单编号和客户名称不能为空！');
            return;
        }

        // 3. 新增/编辑逻辑
        const editIndex = parseInt(editRowIndex.value);
        if (editIndex === -1) {
            // 新增订单
            orderList.push(orderData);
        } else {
            // 编辑订单
            orderList[editIndex] = orderData;
        }

        // 4. 保存到Gist + 本地
        saveDataToGist();

        // 5. 关闭模态框，刷新表格
        modal.style.display = 'none';
        renderOrderTable(); // 重新渲染表格
        filterData(); // 刷新筛选状态
    }

    // 15. 删除订单
    function deleteOrder(index) {
        if (confirm('确定删除该订单吗？此操作不可恢复！')) {
            orderList.splice(index, 1);
            saveDataToGist(); // 同步到Gist
            renderOrderTable(); // 刷新表格
            filterData();
        }
    }
});