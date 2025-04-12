// Element References
const shopList = document.getElementById('shopList');
const shopPage = document.getElementById('shopPage');
const currentShopName = document.getElementById('currentShopName');
const billFormModal = document.getElementById('billFormModal');
const billForm = document.getElementById('billForm');

let editIndex = null; // used to track if we are modifying a bill


// Inputs
const grossWeight = document.getElementById('grossWeight');
const polyWeight = document.getElementById('polyWeight');
const polyPieces = document.getElementById('polyPieces');
const totalPolyWeight = document.getElementById('totalPolyWeight');
const netWeight = document.getElementById('netWeight');

const tunch = document.getElementById('tunch');
const wastage = document.getElementById('wastage');
const totalCharge = document.getElementById('totalCharge');
const labourCharge = document.getElementById('labourCharge');

const paymentMethod = document.getElementById('paymentMethod');
const silverSection = document.getElementById('silverSection');
const silverBarsContainer = document.getElementById('silverBarsContainer');
const addMoreBarsBtn = document.getElementById('addMoreBars');

const cashSection = document.getElementById('cashSection');
const cashEntriesContainer = document.getElementById('cashEntriesContainer');
const addCashEntryBtn = document.getElementById('addCashEntry');

const cancelBillFormBtn = document.getElementById('cancelBillForm');

// State
let currentShop = "";
let shopData = {};

// Add Shop
document.getElementById('addShopBtn').addEventListener('click', () => {
  const name = prompt("Enter new shop name:");
  if (name && !shopData[name]) {
    shopData[name] = [];
    saveDataToLocal();
    renderShops();
  }
});

// Render Shop Buttons
function renderShops() {
  shopList.innerHTML = '';
  Object.keys(shopData).forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'shop-btn';
    btn.textContent = name;
    btn.onclick = () => openShop(name);
    shopList.appendChild(btn);
  });
}

// Open Shop Page
function openShop(name) {
  currentShop = name;
  currentShopName.textContent = name;
  shopList.style.display = 'none';
  document.querySelector('header').style.display = 'none';
  shopPage.style.display = 'block';
  renderBills();
}

// Back Button
document.getElementById('backToHome').addEventListener('click', () => {
  currentShop = '';
  shopPage.style.display = 'none';
  document.querySelector('header').style.display = 'flex';
  shopList.style.display = 'flex';
});

// Add Bill
document.getElementById('addBillBtn').addEventListener('click', () => {
  billForm.reset();
  // Autofill previous silver left (from last bill)
const lastBill = shopData[currentShop]?.slice(-1)[0];
if (lastBill) {
  document.getElementById('previousPendingInput').value = lastBill.remainingFine.toFixed(2);
} else {
  document.getElementById('previousPendingInput').value = "0.00";
}

  billFormModal.style.display = 'flex';
  silverSection.style.display = 'none';
  cashSection.style.display = 'none';
  totalPolyWeight.textContent = '0.00';
  netWeight.textContent = '0.00';
  totalCharge.textContent = '0.00';
  silverBarsContainer.innerHTML = getSingleSilverBarRow();
  cashEntriesContainer.innerHTML = getSingleCashRow();
});

// Cancel Form
cancelBillFormBtn.addEventListener('click', () => {
  billFormModal.style.display = 'none';
});

// --- Auto Calculation Logic ---

function updateWeights() {
  const polyWt = parseFloat(polyWeight.value) || 0;
  const polyPcs = parseFloat(polyPieces.value) || 0;
  const totalPoly = polyWt * polyPcs;
  totalPolyWeight.textContent = totalPoly.toFixed(2);

  const gross = parseFloat(grossWeight.value) || 0;
  const net = gross - totalPoly;
  netWeight.textContent = net.toFixed(2);
}

[grossWeight, polyWeight, polyPieces].forEach(input => {
  input.addEventListener('input', updateWeights);
});

function updateCharge() {
  const t = parseFloat(tunch.value) || 0;
  const w = parseFloat(wastage.value) || 0;
  const total = t + w;
  totalCharge.textContent = total.toFixed(2);
}

[tunch, wastage].forEach(input => {
  input.addEventListener('input', updateCharge);
});

// --- Payment Method Display ---
paymentMethod.addEventListener('change', () => {
  const selected = Array.from(paymentMethod.selectedOptions).map(opt => opt.value);
  silverSection.style.display = selected.includes('silver') ? 'block' : 'none';
  cashSection.style.display = selected.includes('cash') ? 'block' : 'none';
});

// --- Add More Silver Bars ---
addMoreBarsBtn.addEventListener('click', () => {
  silverBarsContainer.insertAdjacentHTML('beforeend', getSingleSilverBarRow());
});

// --- Add More Cash Entries ---
addCashEntryBtn.addEventListener('click', () => {
  cashEntriesContainer.insertAdjacentHTML('beforeend', getSingleCashRow());
});

// --- Cash Exchange Section Toggle + Fine Auto Calculation ---
billForm.addEventListener('input', () => {
  const cashEntries = cashEntriesContainer.querySelectorAll('.cashEntry');

  cashEntries.forEach(entry => {
    const amount = parseFloat(entry.querySelector('.cashAmount')?.value) || 0;
    const rate = parseFloat(entry.querySelector('.silverRate')?.value) || 0;
    const fineSpan = entry.querySelector('.silverFine');
    const typeSelect = entry.querySelector('.cashType');
    const selected = Array.from(typeSelect.selectedOptions).map(opt => opt.value);
    const rateSection = entry.querySelector('.exchangeRateSection');

    if (selected.includes('exchange')) {
      rateSection.style.display = 'block';
      const fine = rate > 0 ? (amount / rate) * 1000 : 0;
      fineSpan.textContent = fine.toFixed(2);
    } else {
      rateSection.style.display = 'none';
      fineSpan.textContent = '0.00';
    }
  });
});

// --- Utility Functions ---

function getSingleSilverBarRow() {
  return `
    <div class="silverBar" style="margin-bottom: 10px;">
      <label>Bar No.: <input type="text" class="barNo"></label>
      <label>Tunch (%): <input type="number" step="0.01" class="barTunch"></label>
      <label>Weight (gm): <input type="number" step="0.01" class="barWeight"></label>
    </div>
  `;
}

function getSingleCashRow() {
  return `
    <div class="cashEntry" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc;">
      <label>Cash Amount (₹): <input type="number" step="0.01" class="cashAmount"></label>
      <label>Type:
        <select class="cashType" multiple>
          <option value="exchange">Exchange Silver</option>
          <option value="notedown">Note Down</option>
        </select>
      </label>
      <div class="exchangeRateSection" style="display: none;">
        <label>Silver Rate per kg (₹): <input type="number" step="0.01" class="silverRate"></label>
        <div>Silver Fine (gm): <span class="silverFine">0.00</span></div>
      </div>
    </div>
  `;
}

// Placeholder (will expand later)
function renderBills() {
  const container = document.getElementById('billCardsContainer');
  const bills = shopData[currentShop] || [];
  container.innerHTML = '';

  let cashSum = 0;
  let silverLeft = bills.length ? bills[bills.length - 1].remainingFine : 0;

  bills.forEach((bill, index) => {
    cashSum += bill.totalCashNotedown;

    const card = document.createElement('div');
    card.className = 'bill-card';

    const paymentLines = bill.payments.map(p => {
      if (p.type === 'silver') {
        return `<p>Silver Bar - Bar No: ${p.barNo}, Tunch: ${p.tunch}%, Wt: ${p.weight}gm → Fine: ${p.fine.toFixed(2)} gm</p>`;
      } else if (p.type === 'cash-exchange') {
        return `<p>Cash ₹${p.cash.toLocaleString()} (Exchanged), Rate ₹${p.rate}, Fine: ${p.fine.toFixed(2)} gm</p>`;
      } else if (p.type === 'cash-notedown') {
        return `<p>Cash ₹${p.cash.toLocaleString()} (Note Down)</p>`;
      }
    }).join('');

    card.innerHTML = `
      <h4>Bill #${index + 1}</h4>
      <p><strong>Gross W.T.</strong> = ${bill.gross} gm</p>
      <p><strong>Total Pack W.T.</strong> = ${bill.polyWt}gm × ${bill.polyPcs} = ${bill.totalPoly} gm</p>
      <p><strong>Net W.T.</strong> = ${bill.net.toFixed(2)} gm</p>
      <hr />
      <p><strong>Tunch:</strong> ${bill.tunchVal}%</p>
      <p><strong>Wastage:</strong> ${bill.wastageVal}%</p>
      <p><strong>Fine:</strong> ${bill.net.toFixed(2)} × ${bill.totalChargeVal.toFixed(2)}% = <strong>${bill.netFine.toFixed(2)} gm</strong></p>
      <p><strong>Previous Pending:</strong> ${bill.previousPending} gm</p>
      <p><strong>Total to Collect:</strong> ${bill.totalToCollect.toFixed(2)} gm</p>
      <p><strong>Total Deposited:</strong> ${bill.totalSilverFine.toFixed(2)} gm</p>
      <p><strong>Pending:</strong> ${bill.remainingFine.toFixed(2)} gm</p>
      ${bill.totalCashNotedown ? `<p><strong>₹${bill.totalCashNotedown.toLocaleString()}</strong> noted down</p>` : ''}
      <hr />
      <hr />
      ${paymentLines}
      <hr />

      <!-- ACTION BUTTONS -->
      <div class="bill-actions">
        <button onclick="modifyBill(${index})">Modify</button>
        <button onclick="saveBillPDF(${index})">Save PDF</button>
        <button onclick="shareOnWhatsApp(${index})">Share on WhatsApp</button>
        <button onclick="printBill(${index})">Print</button>
      </div>
    `;

    container.appendChild(card);
  });

  // Update footer
  document.getElementById('cashBalance').textContent = `Cash Balance (Note Down): ₹${cashSum.toFixed(2)}`;
  document.getElementById('silverPending').textContent = `Silver Left to Collect: ${silverLeft.toFixed(2)} gm`;
}

function modifyBill(index) {
  const bill = shopData[currentShop][index];
  editIndex = index; // mark we are editing

  // Open form
  billForm.reset();
  billFormModal.style.display = 'flex';

  // Fill basic fields
  grossWeight.value = bill.gross;
  polyWeight.value = bill.polyWt;
  polyPieces.value = bill.polyPcs;
  totalPolyWeight.textContent = bill.totalPoly.toFixed(2);
  netWeight.textContent = bill.net.toFixed(2);

  tunch.value = bill.tunchVal;
  wastage.value = bill.wastageVal;
  totalCharge.textContent = bill.totalChargeVal.toFixed(2);
  labourCharge.value = bill.labour;

  // Previous pending
  document.getElementById('previousPendingInput').value = bill.previousPending.toFixed(2);

  // Payment Method (select)
  const paymentTypes = bill.payments.map(p => p.type.includes('silver') ? 'silver' : 'cash');
  [...paymentMethod.options].forEach(opt => {
    opt.selected = paymentTypes.includes(opt.value);
  });
  silverSection.style.display = paymentTypes.includes('silver') ? 'block' : 'none';
  cashSection.style.display = paymentTypes.includes('cash') ? 'block' : 'none';

  // Silver Bars
  silverBarsContainer.innerHTML = '';
  bill.payments.filter(p => p.type === 'silver').forEach(p => {
    silverBarsContainer.insertAdjacentHTML('beforeend', `
      <div class="silverBar">
        <label>Bar No.: <input type="text" class="barNo" value="${p.barNo}"></label>
        <label>Tunch (%): <input type="number" step="0.01" class="barTunch" value="${p.tunch}"></label>
        <label>Weight (gm): <input type="number" step="0.01" class="barWeight" value="${p.weight}"></label>
      </div>
    `);
  });

  // Cash Entries
  cashEntriesContainer.innerHTML = '';
  bill.payments.filter(p => p.type.startsWith('cash')).forEach(p => {
    const isExchange = p.type === 'cash-exchange';
    const isNote = p.type === 'cash-notedown';
    const selected = [];
    if (isExchange) selected.push('exchange');
    if (isNote) selected.push('notedown');

    cashEntriesContainer.insertAdjacentHTML('beforeend', `
      <div class="cashEntry" style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc;">
        <label>Cash Amount (₹): <input type="number" step="0.01" class="cashAmount" value="${p.cash}"></label>
        <label>Type:
          <select class="cashType" multiple>
            <option value="exchange" ${selected.includes('exchange') ? 'selected' : ''}>Exchange Silver</option>
            <option value="notedown" ${selected.includes('notedown') ? 'selected' : ''}>Note Down</option>
          </select>
        </label>
        <div class="exchangeRateSection" style="display: ${isExchange ? 'block' : 'none'};">
          <label>Silver Rate per kg (₹): <input type="number" step="0.01" class="silverRate" value="${p.rate || ''}"></label>
          <div>Silver Fine (gm): <span class="silverFine">${p.fine ? p.fine.toFixed(2) : '0.00'}</span></div>
        </div>
      </div>
    `);
  });
}

function saveBillPDF(index) {
  const billCard = document.querySelectorAll('.bill-card')[index];

  import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').then(jsPDF => {
    const { jsPDF: JsPDF } = jsPDF;
    const pdf = new JsPDF();

    pdf.html(billCard, {
      callback: function (doc) {
        doc.save(`bill_${index + 1}.pdf`);
      },
      x: 10,
      y: 10,
      autoPaging: 'text',
      width: 180,
      windowWidth: 800
    });
  });
}


function shareOnWhatsApp(index) {
  const bill = shopData[currentShop][index];
  const text = `
Shop: ${currentShop}
Bill #${index + 1}
Gross: ${bill.gross} gm
Net: ${bill.net.toFixed(2)} gm
Pending: ${bill.remainingFine.toFixed(2)} gm
Cash Notedown: ₹${bill.totalCashNotedown.toLocaleString()}
  `;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function printBill(index) {
  const bill = document.querySelectorAll('.bill-card')[index].cloneNode(true);
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print Bill</title></head><body>');
  printWindow.document.body.appendChild(bill);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}


// Init
renderShops();
// === BILL FORM SUBMIT ===
billForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const gross = parseFloat(grossWeight.value) || 0;
  const polyWt = parseFloat(polyWeight.value) || 0;
  const polyPcs = parseFloat(polyPieces.value) || 0;
  const totalPoly = polyWt * polyPcs;
  const net = gross - totalPoly;

  const tunchVal = parseFloat(tunch.value) || 0;
  const wastageVal = parseFloat(wastage.value) || 0;
  const totalChargeVal = tunchVal + wastageVal;
  const labour = parseFloat(labourCharge.value) || 0;

  const payments = [];
  let totalCashNotedown = 0;
  let totalSilverFine = 0;

  // Silver Bar Entries
  const silverBars = silverBarsContainer.querySelectorAll('.silverBar');
  silverBars.forEach(bar => {
    const barNo = bar.querySelector('.barNo').value;
    const barTunch = parseFloat(bar.querySelector('.barTunch')?.value) || 0;
    const barWt = parseFloat(bar.querySelector('.barWeight')?.value) || 0;
    const barFine = (barWt * barTunch) / 100;
    payments.push({
      type: 'silver',
      barNo,
      tunch: barTunch,
      weight: barWt,
      fine: barFine
    });
    totalSilverFine += barFine;
  });

  // Cash Entries
  const cashEntries = cashEntriesContainer.querySelectorAll('.cashEntry');
  cashEntries.forEach(entry => {
    const amount = parseFloat(entry.querySelector('.cashAmount')?.value) || 0;
    const rate = parseFloat(entry.querySelector('.silverRate')?.value) || 0;
    const cashType = Array.from(entry.querySelector('.cashType').selectedOptions).map(opt => opt.value);

    if (cashType.includes("exchange") && rate > 0) {
      const fine = (amount / rate) * 1000;
      payments.push({ type: "cash-exchange", cash: amount, rate, fine });
      totalSilverFine += fine;
    }

    if (cashType.includes("notedown")) {
      payments.push({ type: "cash-notedown", cash: amount });
      totalCashNotedown += amount;
    }
  });

  const netFine = net * (totalChargeVal / 100);
  const previousPending = parseFloat(document.getElementById('previousPendingInput').value) || 0;

  const totalToCollect = netFine + previousPending;
  const remainingFine = totalToCollect - totalSilverFine;

  const bill = {
    gross, polyWt, polyPcs, totalPoly, net,
    tunchVal, wastageVal, totalChargeVal,
    labour, payments, netFine, previousPending,
    totalToCollect, totalSilverFine, remainingFine,
    totalCashNotedown
  };

  if (editIndex !== null) {
  shopData[currentShop][editIndex] = bill;
  editIndex = null;
} else {
  shopData[currentShop].push(bill);
}
saveDataToLocal();


  billFormModal.style.display = 'none';
  renderBills();
});


function saveDataToLocal() {
  localStorage.setItem('jewelleryShopData', JSON.stringify(shopData));
}

function loadDataFromLocal() {
  const data = localStorage.getItem('jewelleryShopData');
  if (data) {
    shopData = JSON.parse(data);
    renderShops();
  }
}

// Initial load
loadDataFromLocal();
