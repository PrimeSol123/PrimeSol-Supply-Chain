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
                warehouseIn: "2026-03-16",
                customer: "Moshe",
                orderId: "IL2026030901",
                productName: "折叠椅",
                goods: "户外折叠椅",
                quantity: 10,
                weight: "25.5kg",
                country: "以色列",
                receiver: "Moshe Cohen +972501234567",
                declareValue: "500.00 USD",
                transport: "快递",
                supplyChain: "加时特",
                channel: "快递专线",
                warehouseOut: "2026-03-17",
                payable: 849.00,
                costRemark: "物流成本+包装费",
                customerPay: 1130.30,
                profit: 331.30,
                trackingNo: "3708875402",
                trackingStatus: "已到达目的国",
                customs: "是",
                remark: "客户要求加急发货",
                status: "已发货"
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
    const tbody = document.getElementById("order-tbody");
    tbody.innerHTML = "";
    orderData.forEach((item, index) => {
        const tr = document.createElement("tr");
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
            <td>${item.receiver}</td>
            <td>${item.declareValue}</td>
            <td>${item.transport}</td>
            <td>${item.supplyChain}</td>
            <td>${item.channel}</td>
            <td>${item.warehouseOut}</td>
            <td>${item.payable.toFixed(2)}</td>
            <td>${item.costRemark}</td>
            <td>${item.customerPay.toFixed(2)}</td>
            <td>${item.quoteDetail || '-'}</td>
            <td>${item.profit.toFixed(2)}</td>
            <td>${item.trackingNo}</td>
            <td>${item.trackingStatus}</td>
            <td>${item.customs}</td>
            <td>${item.remark ? item.remark.substring(0, 10) + '...' : ''}</td>
            <td><span class="status-badge status-shipped">${item.status}</span></td>
            <td class="action-buttons">
                <button class="action-btn edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById("record-count").textContent = `(共${orderData.length}条记录)`;
}

// 事件绑定
function bindEvents() {
    document.getElementById("add-btn").onclick = () => {
        currentEditIndex = -1;
        document.getElementById("order-form").reset();
        document.getElementById("order-modal").style.display = "flex";
    };

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            currentEditIndex = index;
            const item = orderData[index];
            for (let key in item) {
                const el = document.getElementById(`form-${key}`);
                if (el) el.value = item[key];
            }
            document.getElementById("order-modal").style.display = "flex";
        };
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = (e) => {
            if (!confirm("确定删除？")) return;
            const index = parseInt(e.currentTarget.dataset.index);
            orderData.splice(index, 1);
            saveToLocal();
            renderTable();
            bindEvents();
        };
    });

    document.getElementById("modal-save").onclick = () => {
        const data = {
            warehouseIn: document.getElementById("form-warehouse-in").value,
            customer: document.getElementById("form-customer").value,
            orderId: document.getElementById("form-order-id").value,
            productName: document.getElementById("form-product-name").value,
            goods: document.getElementById("form-goods").value,
            quantity: Number(document.getElementById("form-quantity").value),
            weight: document.getElementById("form-weight").value,
            country: document.getElementById("form-country").value,
            receiver: document.getElementById("form-receiver").value,
            declareValue: document.getElementById("form-declare-value").value,
            transport: document.getElementById("form-transport").value,
            supplyChain: document.getElementById("form-supply-chain").value,
            channel: document.getElementById("form-channel").value,
            warehouseOut: document.getElementById("form-warehouse-out").value,
            payable: Number(document.getElementById("form-payable").value),
            costRemark: document.getElementById("form-cost-remark").value,
            customerPay: Number(document.getElementById("form-customer-pay").value),
            quoteDetail: document.getElementById("form-quote-detail").value,
            profit: (Number(document.getElementById("form-customer-pay").value) - Number(document.getElementById("form-payable").value)).toFixed(2),
            trackingNo: document.getElementById("form-tracking-no").value,
            trackingStatus: document.getElementById("form-tracking-status").value,
            customs: document.getElementById("form-customs").value,
            remark: document.getElementById("form-remark").value,
            status: document.getElementById("form-status").value
        };

        if (currentEditIndex === -1) {
            orderData.push({ id: Date.now(), ...data });
        } else {
            orderData[currentEditIndex] = { ...orderData[currentEditIndex], ...data };
        }

        saveToLocal();
        document.getElementById("order-modal").style.display = "none";
        renderTable();
        bindEvents();
    };

    document.getElementById("modal-cancel").onclick =
    document.getElementById("modal-close").onclick = () => {
        document.getElementById("order-modal").style.display = "none";
    };

    function calc() {
        let cost = Number(document.getElementById("form-payable").value) || 0;
        let income = Number(document.getElementById("form-customer-pay").value) || 0;
        document.getElementById("form-profit").value = (income - cost).toFixed(2);
    }
    document.getElementById("form-payable").oninput = calc;
    document.getElementById("form-customer-pay").oninput = calc;
}

// ====================== 导出 + 导入 功能（已修复） ======================
function initImportExport() {
    // 导出
    const exportBtn = document.getElementById("export-btn");
    exportBtn.onclick = function () {
        const json = JSON.stringify(orderData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "供应链数据.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("导出成功！请保存好这个文件，换电脑时导入即可");
    };

    // 导入
    const importBtn = document.createElement("button");
    importBtn.className = "btn btn-outline";
    importBtn.innerHTML = '<i class="fas fa-upload"></i> 导入数据';
    const actions = document.querySelector(".table-actions");
    if (actions) {
        actions.appendChild(importBtn);
    }

    importBtn.onclick = function () {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";
        fileInput.onchange = function (e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const newData = JSON.parse(event.target.result);
                    if (Array.isArray(newData)) {
                        orderData = newData;
                        saveToLocal();
                        renderTable();
                        bindEvents();
                        alert("导入成功！数据已同步");
                    }
                } catch (err) {
                    alert("导入失败：文件格式不正确");
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    };
}