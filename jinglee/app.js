/**
 * JINGLEE - Multi-Tenant, Set-Based & Device-Bound Payment Gateway Platform
 * Core Application Engine
 */

class JingleeApp {
  constructor() {
    this.currentStep = 'website';
    this.state = {
      user: null, // { name: 'Subash K', email: 'merchant@jinglee.com', orgId: 'org_89f3a', orgName: 'Jinglee Store' }
      purchase: null, // { plan: 'Multi-Lane Cluster', amount: 3999, slots: 5, rzpPaymentId: 'pay_N9Xk8s9...' }
      device: null, // { id: 'dev_c83a', name: 'Counter 1 - Main Terminal', setId: 'set_1', code: 'JGL-8492' }
      posAmount: '0',
      transactions: [
        { id: 'TXN-9041', time: '10:42 AM', method: 'UPI (GPay)', amount: 450, status: 'CAPTURED' },
        { id: 'TXN-9040', time: '10:35 AM', method: 'Card (Tap)', amount: 1200, status: 'CAPTURED' },
        { id: 'TXN-9039', time: '10:12 AM', method: 'UPI (PhonePe)', amount: 890, status: 'CAPTURED' },
        { id: 'TXN-9038', time: '09:48 AM', method: 'UPI (Paytm)', amount: 310, status: 'CAPTURED' }
      ],
      totalVolume: 2850
    };

    this.audioCtx = null;
    this.init();
  }

  init() {
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Render Initial UI
    this.renderPairingQR();
    this.renderTransactions();
  }

  /* Audio Synthesis for POS Sounds */
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playBeep(frequency = 800, duration = 0.08, type = 'sine') {
    try {
      this.initAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  playSuccessChime() {
    try {
      this.initAudio();
      const now = this.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + (index * 0.09));
        gain.gain.setValueAtTime(0.2, now + (index * 0.09));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.09) + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + (index * 0.09));
        osc.stop(now + (index * 0.09) + 0.35);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  /* Step Navigation */
  navigateToStep(stepId) {
    this.currentStep = stepId;
    this.playBeep(600, 0.05);

    // Update Panels
    document.querySelectorAll('.step-panel').forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(`step-${stepId}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Update Stepper Pills
    const steps = ['website', 'register', 'purchase', 'device', 'enjoy'];
    const currentIndex = steps.indexOf(stepId);

    steps.forEach((s, idx) => {
      const pill = document.getElementById(`pill-${s}`);
      if (pill) {
        pill.classList.remove('active', 'completed');
        if (idx === currentIndex) {
          pill.classList.add('active');
        } else if (idx < currentIndex) {
          pill.classList.add('completed');
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /* STEP 2: Google Auth & Supabase DB Initializer */
  loginWithGoogle() {
    this.playBeep(900, 0.1);
    
    // Simulate Supabase OAuth handshake
    setTimeout(() => {
      this.state.user = {
        name: 'Merchant Partner',
        email: 'merchant.partner@gmail.com',
        orgId: 'org_' + Math.random().toString(36).substring(2, 9),
        orgName: 'Jinglee Flagship Store'
      };

      this.updateAuthStateUI();
      this.playSuccessChime();
    }, 400);
  }

  registerMerchantManual() {
    const storeName = document.getElementById('reg-store-name').value || 'Jinglee Store';
    const storeEmail = document.getElementById('reg-store-email').value || 'merchant@jinglee.com';

    this.state.user = {
      name: storeName,
      email: storeEmail,
      orgId: 'org_' + Math.random().toString(36).substring(2, 9),
      orgName: storeName
    };

    this.updateAuthStateUI();
    this.playSuccessChime();
  }

  updateAuthStateUI() {
    if (!this.state.user) return;

    document.getElementById('auth-unauthenticated-state').style.display = 'none';
    document.getElementById('auth-authenticated-state').style.display = 'block';
    document.getElementById('auth-user-meta').textContent = `Logged in as ${this.state.user.email} (${this.state.user.orgName})`;
    document.getElementById('header-user-label').textContent = this.state.user.email.split('@')[0];

    document.getElementById('db-json-output').innerHTML = `
// Supabase Postgres (Tenant Provisioned):
{
  "organization": {
    "id": "${this.state.user.orgId}",
    "name": "${this.state.user.orgName}",
    "owner": "${this.state.user.email}",
    "rls_status": "ENFORCED"
  },
  "default_set": {
    "id": "set_1",
    "name": "Downtown Store - Main Lane",
    "settlement_currency": "INR"
  },
  "realtime_replication": "ACTIVE (Postgres CDC Stream)"
}
    `.trim();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /* STEP 3: Razorpay Payment Gateway */
  openRazorpayModal(planName, amount, slots) {
    this.selectedPlan = { name: planName, amount: amount, slots: slots };
    document.getElementById('modal-plan-name').textContent = planName;
    document.getElementById('modal-plan-amount').textContent = `₹${amount.toLocaleString('en-IN')}.00`;
    document.getElementById('razorpay-modal-overlay').classList.add('active');
    this.playBeep(700, 0.08);
  }

  closeRazorpayModal() {
    document.getElementById('razorpay-modal-overlay').classList.remove('active');
  }

  executePaymentMethod(methodName) {
    this.playBeep(880, 0.1);
    const plan = this.selectedPlan || { name: 'Multi-Lane Cluster', amount: 3999, slots: 5 };
    
    // Simulate Razorpay server HMAC verification
    const rzpPaymentId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
    const rzpOrderId = 'order_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    this.closeRazorpayModal();

    this.state.purchase = {
      plan: plan.name,
      amount: plan.amount,
      slots: plan.slots,
      orderId: rzpOrderId,
      paymentId: rzpPaymentId,
      method: methodName
    };

    // Update Step 4 labels
    document.getElementById('active-license-label').textContent = `Active License: ${plan.name} (${plan.slots} Device Allowance)`;

    this.playSuccessChime();
    alert(`🎉 Razorpay Payment Verified!\nOrder ID: ${rzpOrderId}\nPayment ID: ${rzpPaymentId}\nMethod: ${methodName}\n\nProceeding to Device Registration.`);
    this.navigateToStep('device');
  }

  /* STEP 4: Device Registration & Local Database Handshake */
  renderPairingQR() {
    const qrContainer = document.getElementById('pairing-qrcode');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    const payload = JSON.stringify({
      app: 'Jinglee',
      code: 'JGL-8492',
      beacon: 'https://jinglee.io/pair/JGL-8492'
    });

    try {
      new QRCode(qrContainer, {
        text: payload,
        width: 140,
        height: 140,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.log('QR Code rendering fallback:', e);
    }
  }

  completeDeviceRegistration() {
    const devName = document.getElementById('dev-name').value || 'Counter 1 - Main Terminal';
    const setId = document.getElementById('dev-set-select').value;
    const code = document.getElementById('dev-pairing-input').value;

    this.state.device = {
      id: 'dev_' + Math.random().toString(36).substring(2, 8),
      name: devName,
      setId: setId,
      code: code,
      publicKey: 'ed25519_pub_' + Math.random().toString(36).substring(2, 15)
    };

    document.getElementById('pos-device-name').textContent = devName;

    this.playSuccessChime();
    this.navigateToStep('enjoy');
  }

  /* STEP 5: Enjoy (Active POS & Terminal Control) */
  keypadPress(key) {
    this.playBeep(1200, 0.04);
    let current = this.state.posAmount;

    if (key === 'C') {
      this.state.posAmount = '0';
    } else if (key === '00') {
      if (current !== '0' && current.length < 6) {
        this.state.posAmount = current + '00';
      }
    } else {
      if (current === '0') {
        this.state.posAmount = key;
      } else if (current.length < 7) {
        this.state.posAmount = current + key;
      }
    }

    document.getElementById('pos-amount').textContent = this.state.posAmount;
    document.getElementById('pos-dynamic-qr-container').style.display = 'none';
    document.getElementById('pos-success-banner').style.display = 'none';
  }

  generateDynamicUPI() {
    const amount = parseInt(this.state.posAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter an amount greater than ₹0 on the keypad first.');
      return;
    }

    this.playBeep(900, 0.08);
    const qrContainer = document.getElementById('pos-upi-qrcode');
    qrContainer.innerHTML = '';

    // Standard NPCI UPI Intent String
    const upiIntent = `upi://pay?pa=jinglee.merchant@razorpay&pn=Jinglee+Store&am=${amount}&cu=INR&tn=POS-Bill-${Date.now().toString().slice(-4)}`;

    try {
      new QRCode(qrContainer, {
        text: upiIntent,
        width: 150,
        height: 150,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.log('UPI QR rendering fallback:', e);
    }

    document.getElementById('pos-dynamic-qr-container').style.display = 'block';
    document.getElementById('pos-success-banner').style.display = 'none';
  }

  triggerCardTap() {
    const amount = parseInt(this.state.posAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter an amount greater than ₹0 on the keypad first.');
      return;
    }
    this.playBeep(1400, 0.1, 'square');
    this.processPaymentSuccess('Card (Tap & Pay)', amount);
  }

  simulateIncomingPayment() {
    const amount = parseInt(this.state.posAmount, 10) > 0 ? parseInt(this.state.posAmount, 10) : 750;
    this.processPaymentSuccess('UPI (GPay / Webhook)', amount);
  }

  processPaymentSuccess(method, amount) {
    this.playSuccessChime();

    // Hide QR & Show Banner
    document.getElementById('pos-dynamic-qr-container').style.display = 'none';
    const banner = document.getElementById('pos-success-banner');
    const meta = document.getElementById('pos-success-meta');
    const txnId = 'RZP-' + Math.floor(10000 + Math.random() * 90000);
    
    meta.textContent = `${method} · ₹${amount.toLocaleString('en-IN')} · TXN #${txnId}`;
    banner.style.display = 'block';

    // Record in transaction stream
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.state.transactions.unshift({
      id: txnId,
      time: timeStr,
      method: method,
      amount: amount,
      status: 'CAPTURED'
    });

    this.state.totalVolume += amount;
    this.renderTransactions();

    // Reset amount
    this.state.posAmount = '0';
    document.getElementById('pos-amount').textContent = '0';

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  renderTransactions() {
    const feed = document.getElementById('transactions-feed');
    if (!feed) return;

    feed.innerHTML = this.state.transactions.map(tx => `
      <div class="tx-row">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center;">
            <i data-lucide="${tx.method.includes('Card') ? 'credit-card' : 'qr-code'}" style="color: #3b82f6; width: 18px; height: 18px;"></i>
          </div>
          <div>
            <div style="font-weight: 600; color: #fff; font-size: 0.95rem;">${tx.method}</div>
            <div style="font-size: 0.75rem; color: var(--text-subtle);">${tx.id} · ${tx.time}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="tx-amount">+₹${tx.amount.toLocaleString('en-IN')}</div>
          <div style="font-size: 0.7rem; color: #10b981; font-weight: 600;">● ${tx.status}</div>
        </div>
      </div>
    `).join('');

    // Update stats
    const totalVolEl = document.getElementById('stat-total-volume');
    const txCountEl = document.getElementById('stat-tx-count');
    if (totalVolEl) totalVolEl.textContent = `₹${this.state.totalVolume.toLocaleString('en-IN')}`;
    if (txCountEl) txCountEl.textContent = this.state.transactions.length;

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  toggleUserMenu() {
    if (!this.state.user) {
      this.navigateToStep('register');
    } else {
      alert(`👤 Logged in as: ${this.state.user.email}\nOrganization: ${this.state.user.orgName}\nDatabase ID: ${this.state.user.orgId}`);
    }
  }
}

// Global App Instance
const app = new JingleeApp();
window.app = app;
