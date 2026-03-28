let orderData = [];
let currentEditIndex = -1;
let tempPayItems = [];
let tempTrackingRecords = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocal();
    renderTable();
    bindAllEvents();
});

function loadFromLocal() {
    const d = localStorage.getItem('zhenfang_order');
    orderData = d ? JSON.parse(d) : [];
}

function saveToLocal() {
    localStorage.setItem('zhenfang_order', JSON.stringify(orderData));
}

function renderTable() {
    const tb = document.getElementById('order-tbody');
    tb.innerHTML = '';
    orderData.forEach((it, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx+1}</td>
            <td>${it.customer}</td>
            <td>${it.orderId}</td>
            <td>${it.country}</td>
            <td><span class="detail-btn" data-i="${idx}" data f="receiver">${cut(it.receiver)}</span></td>
            <td>${it.payable}</td>
            <td>${it.profit}</td>
            <td><span class="detail-btn" data-i="${idx}" data f="trackingStatus">${cut(it.trackingStatus)}</span></td>
            <td>${it.status}</td>
            <td class="action-buttons">
                <button class="action-btn view-btn" data-i="${idx}">查看</button>
                <button class="action-btn edit-btn" data-i="${idx}">编辑</button>
                <button class="action-btn del-btn" data-i="${idx}">删除</button>
            </td>
        `;
        tb.appendChild(tr);
    });
    document.getElementById('record-count').textContent = `共${orderData.length}条`;
}

function bindAllEvents() {
    document.getElementById('add-btn').onclick = () => {
        currentEditIndex = -1;
        tempPayItems = [];
        tempTrackingRecords = [];
        document.getElementById('order-form').reset();
        document.getElementById('order-modal').style.display = 'flex';
    };

    document.getElementById('modal-close').onclick =
    document.getElementById('modal-cancel').onclick = () => {
        document.getElementById('order-modal').style.display = 'none';
    };

    document.getElementById('modal-save').onclick = () => {
        const d = {
            customer: document.getElementById('form-customer').value,
            orderId: document.getElementById('form-order-id').value,
            warehouseIn: document.getElementById('form-warehouse-in').value,
            productName: document.getElementById('form-product-name').value,
            quantity: document.getElementById('form-quantity').value,
            weight: document.getElementById('form-weight').value,
            country: document.getElementById('form-country').value,
            receiver: document.getElementById('form-receiver').value,
            transport: document.getElementById('form-transport').value,
            payable: Number(document.getElementById('form-payable').value) || 0,
            customerPay: Number(document.getElementById('form-customer-pay').value) || 0,
            profit: (Number(document.getElementById('form-customer-pay').value) || 0) - (Number(document.getElementById('form-payable').value) || 0),
            trackingNo: document.getElementById('form-tracking-no').value,
            status: document.getElementById('form-status').value,
            payItems: [...tempPayItems],
            trackingRecords: [...tempTrackingRecords]
        };
        if (currentEditIndex === -1) orderData.push(d);
        else orderData[currentEditIndex] = d;
        saveToLocal();
        document.getElementById('order-modal').style.display = 'none';
        renderTable();
        bindAllEvents();
    };

    document.querySelectorAll('.edit-btn').forEach(b => {
        b.onclick = () => {
            const i = b.dataset.i;
            currentEditIndex = i;
            const it = orderData[i];
            tempPayItems = [...it.payItems];
            tempTrackingRecords = [...it.trackingRecords];
            document.getElementById('form-customer').value = it.customer;
            document.getElementById('form-order-id').value = it.orderId;
            document.getElementById('form-warehouse-in').value = it.warehouseIn;
            document.getElementById('form-product-name').value = it.productName;
            document.getElementById('form-quantity').value = it.quantity;
            document.getElementById('form-weight').value = it.weight;
            document.getElementById('form-country').value = it.country;
            document.getElementById('form-receiver').value = it.receiver;
            document.getElementById('form-transport').value = it.transport;
            document.getElementById('form-payable').value = it.payable;
            document.getElementById('form-customer-pay').value = it.customerPay;
            document.getElementById('form-profit').value = it.profit;
            document.getElementById('form-tracking-no').value = it.trackingNo;
            document.getElementById('form-status').value = it.status;
            renderPay();
            renderTrack();
            document.getElementById('order-modal').style.display = 'flex';
        };
    });

    document.querySelectorAll('.del-btn').forEach(b => {
        b.onclick = () => {
            if (!confirm('确认删除？')) return;
            orderData.splice(b.dataset.i, 1);
            saveToLocal();
            renderTable();
            bindAllEvents();
        };
    });

    document.querySelectorAll('.view-btn').forEach(b => {
        b.onclick = () => {
            const it = orderData[b.dataset.i];
            alert(`
订单：${it.orderId}
客户：${it.customer}
应付：${it.payable}
利润：${it.profit}
状态：${it.status}
            `);
        };
    });

    document.getElementById('add-pay-item').onclick = () => {
        const amt = Number(document.getElementById('form-payable').value) || 0;
        tempPayItems.push({ amount: amt, remark: '成本' });
        renderPay();
    };

    document.getElementById('add-tracking-record').onclick = () => {
        tempTrackingRecords.push({ time: new Date().toLocaleString(), content: '已出库' });
        renderTrack();
    };

    document.getElementById('form-payable').oninput = calc;
    document.getElementById('form-customer-pay').oninput = calc;
    function calc() {
        const c = Number(document.getElementById('form-payable').value) || 0;
        const i = Number(document.getElementById('form-customer-pay').value) || 0;
        document.getElementById('form-profit').value = (i - c).toFixed(2);
    }

    document.getElementById('export-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(orderData)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'order.json';
        a.click();
    };
}

function renderPay() {
    const el = document.getElementById('pay-items-container');
    el.innerHTML = tempPayItems.map((it, i) => `
        <div class="item-row">
            <span>¥${it.amount}</span>
            <span>${it.remark}</span>
            <button onclick="tempPayItems.splice(${i},1);renderPay()">×</button>
        </div>
    `).join('');
}

function renderTrack() {
    const el = document.getElementById('tracking-records-container');
    el.innerHTML = tempTrackingRecords.map((it, i) => `
        <div class="item-row">
            <span>${it.time}</span>
            <span>${it.content}</span>
            <button onclick="tempTrackingRecords.splice(${i},1);renderTrack()">×</button>
        </div>
    `).join('');
}

function cut(s) {
    if (!s) return '';
    return s.length > 5 ? s.slice(0, 5) + '...' : s;
}