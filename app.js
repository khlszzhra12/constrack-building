/**
 * CONSTRACK – Construction Project Monitoring & Management System
 * js/app.js - Implementation v2.2.0 untuk Pembelajaran Mahasiswa Teknik Sipil
 * 
 * 1. Multi-User & Data Isolation: Proyek dimulai dalam keadaan KOSONG
 * 2. Integrasi Cloud Supabase & LocalStorage Sandbox Terenkripsi
 * 3. Engine EVM, AHSP, Kurva S, dan Arus Kas
 * 4. Contoh Pengisian Edukatif Terpisah (Read-only)
 * 5. Tampilan Empty State yang Menarik pada Seluruh Menu
 */

// ===================================================================
// KONSTANTA & STATE GLOBAL
// ===================================================================
let appState = {
  currentUser: null,
  activeProjectId: null,
  currentView: "dashboard",
  currentGuideTopic: "akun",
  currentExampleTopic: "proyek",
  projects: [],
  rabItems: [],
  expenses: [],
  cashFlows: [],
  members: []
};

// Instance Chart.js
let chartInstances = {
  dashboardSCurve: null,
  dashboardCost: null,
  costComparison: null,
  mainSCurve: null,
  cashFlow: null,
  evmTrend: null
};

// ===================================================================
// HELPER FORMATTER MATA UANG, TANGGAL & ANGKA
// ===================================================================
function formatRupiah(number) {
  if (isNaN(number) || number === null || number === undefined) return "Rp 0";
  const isNegative = number < 0;
  const absNum = Math.abs(Math.round(number));
  const formatted = new Intl.NumberFormat("id-ID").format(absNum);
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

function formatPercent(number, decimals = 2) {
  if (isNaN(number) || number === null || number === undefined) return "0.00%";
  return `${Number(number).toFixed(decimals)}%`;
}

function formatDateIndo(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function calculateDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// ===================================================================
// 1. STATE & STORAGE MANAGEMENT (MULTI-USER ISOLATED)
// ===================================================================
function initStorage() {
  let sessionUser = supabaseService.getCurrentSession();
  if (!sessionUser) {
    sessionUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: "mahasiswa@sipil.ac.id",
      name: "Mahasiswa Teknik Sipil",
      nim: "-",
      university: "Teknik Sipil",
      role: "Mahasiswa / Estimator"
    };
    supabaseService.setSession(sessionUser);
  }

  appState.currentUser = sessionUser;

  // Muat data pengguna - KOSONG SECARA DEFAULT
  const userData = supabaseService.loadUserData(sessionUser.id);
  appState.projects = userData.projects || [];
  appState.rabItems = userData.rabItems || [];
  appState.expenses = userData.expenses || [];
  appState.cashFlows = userData.cashFlows || [];
  appState.members = userData.members || [];

  if (appState.projects.length > 0) {
    if (!appState.activeProjectId || !appState.projects.find(p => p.id === appState.activeProjectId)) {
      appState.activeProjectId = appState.projects[0].id;
    }
  } else {
    appState.activeProjectId = null;
  }

  updateNavbarUserUI();
  updateSupabaseStatusBadge();
}

function saveState() {
  if (!appState.currentUser) return;
  supabaseService.saveUserData(appState.currentUser.id, {
    projects: appState.projects,
    rabItems: appState.rabItems,
    expenses: appState.expenses,
    cashFlows: appState.cashFlows,
    members: appState.members
  });
}

function updateSupabaseStatusBadge() {
  const status = supabaseService.getStatus();
  const badgeBtn = document.getElementById("btnOpenSupabaseModal");
  const badgeText = document.getElementById("dbBadgeText");
  const sideText = document.getElementById("statusDbText");

  if (badgeBtn) {
    badgeBtn.className = `db-pill ${status.cssClass}`;
  }
  if (badgeText) {
    badgeText.textContent = status.shortLabel;
  }
  if (sideText) {
    sideText.textContent = status.isCloud ? "Cloud Supabase" : "Penyimpanan Lokal";
  }
}

function resetToDemoData() {
  if (confirm("Muat data proyek simulasi lengkap (Gedung 3 Lantai) untuk keperluan belajar dan eksplorasi fitur?\n\nData ini dapat diedit atau dihapus kembali kapan saja.")) {
    const demoProj = JSON.parse(JSON.stringify(DEFAULT_PROJECTS[0]));
    const demoRAB = JSON.parse(JSON.stringify(DEFAULT_RAB_ITEMS));
    const demoExp = JSON.parse(JSON.stringify(DEFAULT_EXPENSES));
    const demoCF = JSON.parse(JSON.stringify(DEFAULT_CASH_FLOW));

    appState.projects = [demoProj];
    appState.rabItems = demoRAB;
    appState.expenses = demoExp;
    appState.cashFlows = demoCF;
    appState.activeProjectId = demoProj.id;

    saveState();
    renderAllViews();
    showToast("Data simulasi latihan berhasil dimuat ke akun Anda.", "success");
  }
}

// ===================================================================
// 2. ENGINE KALKULASI MANAJEMEN KONSTRUKSI
// ===================================================================
function getActiveProjectMetrics() {
  if (!appState.projects || appState.projects.length === 0) return null;
  const project = appState.projects.find(p => p.id === appState.activeProjectId) || appState.projects[0];
  if (!project) return null;

  const projectRAB = appState.rabItems.filter(item => item.projectId === project.id);
  const projectExpenses = appState.expenses.filter(exp => exp.projectId === project.id);
  const projectCashflows = appState.cashFlows.filter(cf => cf.projectId === project.id);
  const projectMembers = appState.members || [];

  // Jika item RAB belum ada
  if (projectRAB.length === 0) {
    let totalBiayaAktual = 0;
    projectExpenses.forEach(exp => {
      totalBiayaAktual += Number(exp.nominal) || 0;
    });

    const BAC = Number(project.nilaiRAB) || Number(project.nilaiKontrak) || 0;
    const sisaAnggaran = BAC - totalBiayaAktual;
    const persentasePenyerapan = BAC > 0 ? (totalBiayaAktual / BAC) * 100 : 0;

    return {
      project,
      isEmpty: true,
      projectRAB: [],
      expenses: projectExpenses,
      cashflows: projectCashflows,
      members: projectMembers,
      totalRAB: BAC,
      totalBobot: 0,
      totalBiayaAktual,
      sisaAnggaran,
      persentasePenyerapan,
      totalProgresRencana: 0,
      totalProgresAktual: 0,
      deviasiProgres: 0,
      durasiTerlewatiHari: 0,
      sisaHariKalender: project.durasiRencanaHari || 180,
      mingguBerjalan: 1,
      totalHariRencana: project.durasiRencanaHari || 180,
      divisiBreakdown: [],
      EVM: {
        BAC,
        PV: 0,
        EV: 0,
        AC: totalBiayaAktual,
        SV: 0,
        CV: 0 - totalBiayaAktual,
        SPI: "N/A",
        CPI: totalBiayaAktual > 0 ? 0 : "N/A",
        EAC: BAC,
        ETC: BAC - totalBiayaAktual,
        VAC: 0
      }
    };
  }

  // 1. Kalkulasi Total Nilai RAB
  let totalCalculatedRAB = 0;
  projectRAB.forEach(item => {
    item.jumlahHarga = Number(item.volume) * Number(item.hargaSatuan);
    totalCalculatedRAB += item.jumlahHarga;
  });

  const totalRAB = totalCalculatedRAB > 0 ? totalCalculatedRAB : (Number(project.nilaiRAB) || 0);

  // 2. Kalkulasi Bobot Pekerjaan & Kontribusi Progres
  let totalBobot = 0;
  let totalProgresRencana = 0;
  let totalProgresAktual = 0;

  projectRAB.forEach(item => {
    item.bobot = totalRAB > 0 ? (item.jumlahHarga / totalRAB) * 100 : 0;
    totalBobot += item.bobot;

    const rencana = Number(item.progresRencana) || 0;
    const aktual = Number(item.progresAktual) || 0;

    totalProgresRencana += (item.bobot * rencana) / 100;
    totalProgresAktual += (item.bobot * aktual) / 100;
  });

  const deviasiProgres = totalProgresAktual - totalProgresRencana;

  // 3. Biaya Aktual
  let totalBiayaAktual = 0;
  projectExpenses.forEach(exp => {
    totalBiayaAktual += Number(exp.nominal) || 0;
  });

  const sisaAnggaran = totalRAB - totalBiayaAktual;
  const persentasePenyerapan = totalRAB > 0 ? (totalBiayaAktual / totalRAB) * 100 : 0;

  // 4. Durasi & Hari
  const totalHariRencana = calculateDaysBetween(project.tanggalMulai, project.tanggalSelesaiRencana) || project.durasiRencanaHari || 180;
  const today = new Date();
  const startDate = new Date(project.tanggalMulai);
  const diffFromStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const durasiTerlewatiHari = Math.max(0, Math.min(totalHariRencana, diffFromStart));
  const sisaHariKalender = Math.max(0, totalHariRencana - durasiTerlewatiHari);
  const mingguBerjalan = Math.max(1, Math.min(project.durasiMinggu || 26, Math.ceil(durasiTerlewatiHari / 7)));

  // 5. Analisis Per Divisi
  const divisiMap = {};
  projectRAB.forEach(item => {
    const div = item.divisi || "Umum";
    if (!divisiMap[div]) {
      divisiMap[div] = {
        divisi: div,
        anggaranRencana: 0,
        biayaAktual: 0,
        itemCount: 0,
        progresTertimbang: 0,
        bobotTotal: 0
      };
    }
    divisiMap[div].anggaranRencana += item.jumlahHarga;
    divisiMap[div].itemCount += 1;
    divisiMap[div].bobotTotal += item.bobot;
    divisiMap[div].progresTertimbang += (item.bobot * (Number(item.progresAktual) || 0)) / 100;
  });

  projectExpenses.forEach(exp => {
    const div = exp.kategori || "Pekerjaan Struktur";
    if (divisiMap[div]) {
      divisiMap[div].biayaAktual += Number(exp.nominal) || 0;
    }
  });

  const divisiBreakdown = Object.values(divisiMap).map(d => {
    const selisih = d.anggaranRencana - d.biayaAktual;
    const penyerapan = d.anggaranRencana > 0 ? (d.biayaAktual / d.anggaranRencana) * 100 : 0;
    let statusBiaya = "Aman";
    let statusClass = "badge-success";
    if (d.biayaAktual > d.anggaranRencana) {
      statusBiaya = "Overbudget";
      statusClass = "badge-danger";
    } else if (penyerapan >= 85) {
      statusBiaya = "Perhatian";
      statusClass = "badge-warning";
    }
    return {
      ...d,
      selisih,
      penyerapan,
      statusBiaya,
      statusClass
    };
  });

  // 6. EVM
  const BAC = totalRAB;
  const PV = (totalProgresRencana / 100) * BAC;
  const EV = (totalProgresAktual / 100) * BAC;
  const AC = totalBiayaAktual;

  const SV = EV - PV;
  const CV = EV - AC;
  const SPI = PV > 0 ? Number((EV / PV).toFixed(4)) : "N/A";
  const CPI = AC > 0 ? Number((EV / AC).toFixed(4)) : "N/A";
  const EAC = typeof CPI === "number" && CPI > 0 ? BAC / CPI : BAC;
  const ETC = Math.max(0, EAC - AC);
  const VAC = BAC - EAC;

  return {
    project,
    isEmpty: false,
    projectRAB,
    expenses: projectExpenses,
    cashflows: projectCashflows,
    members: projectMembers,
    totalRAB,
    totalBobot,
    totalBiayaAktual,
    sisaAnggaran,
    persentasePenyerapan,
    totalProgresRencana,
    totalProgresAktual,
    deviasiProgres,
    totalHariRencana,
    durasiTerlewatiHari,
    sisaHariKalender,
    mingguBerjalan,
    divisiBreakdown,
    EVM: {
      BAC,
      PV,
      EV,
      AC,
      SV,
      CV,
      SPI,
      CPI,
      EAC,
      ETC,
      VAC
    }
  };
}

// ===================================================================
// 3. UI RENDERING DISPATCHER & NAVBAR
// ===================================================================
function updateNavbarUserUI() {
  const user = appState.currentUser || { name: "Mahasiswa", nim: "-", university: "Teknik Sipil", role: "Mahasiswa" };
  const initials = user.name ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "MS";

  const userDisplayName = document.getElementById("userDisplayName");
  const userDisplayRole = document.getElementById("userDisplayRole");
  const userAvatarCircle = document.getElementById("userAvatarCircle");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserMeta = document.getElementById("dropdownUserMeta");
  const badgeProjectCount = document.getElementById("badgeProjectCount");

  if (userDisplayName) userDisplayName.textContent = user.name;
  if (userDisplayRole) userDisplayRole.textContent = user.university || "Teknik Sipil";
  if (userAvatarCircle) userAvatarCircle.textContent = initials;
  if (dropdownUserName) dropdownUserName.textContent = user.name;
  if (dropdownUserMeta) dropdownUserMeta.textContent = user.email || "-";
  if (badgeProjectCount) badgeProjectCount.textContent = appState.projects.length;

  const welcomeMsg = document.getElementById("dashboardWelcomeMsg");
  if (welcomeMsg) {
    welcomeMsg.textContent = `Selamat Datang di CONSTRACK, ${user.name}!`;
  }
}

function renderAllViews() {
  updateNavbarUserUI();
  updateSupabaseStatusBadge();
  populateProjectSelector();
  renderDashboard();
  renderProjectView();
  renderRABView();
  renderMonitoringBiayaView();
  renderMonitoringWaktuView();
  renderProgressPekerjaanView();
  renderKurvaSView();
  renderCashFlowView();
  renderEVMView();
  renderLaporanView();
  renderGuideView();
}

function populateProjectSelector() {
  const selector = document.getElementById("projectSelector");
  if (!selector) return;

  selector.innerHTML = "";
  if (appState.projects.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(Belum Ada Proyek)";
    opt.disabled = true;
    opt.selected = true;
    selector.appendChild(opt);
    return;
  }

  appState.projects.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.id} - ${p.nama}`;
    if (p.id === appState.activeProjectId) {
      opt.selected = true;
    }
    selector.appendChild(opt);
  });
}

function switchActiveProject(id) {
  if (!id) return;
  appState.activeProjectId = id;
  saveState();
  renderAllViews();
  showToast(`Beralih ke proyek: ${id}`, "info");
}

// ===================================================================
// 4. RENDER DASHBOARD UTAMA
// ===================================================================
function renderDashboard() {
  const m = getActiveProjectMetrics();
  const banner = document.getElementById("dashboardBanner");

  if (!m) {
    if (banner) {
      banner.innerHTML = `
        <div class="empty-state-card" style="margin: 0; background: #FFFFFF;">
          <div class="empty-state-icon-wrap">
            <i class="fa-solid fa-folder-plus"></i>
          </div>
          <h3 class="empty-state-title">Selamat Datang di CONSTRACK!</h3>
          <p class="empty-state-desc">
            Belum ada proyek yang dibuat. Silakan tambahkan proyek pertama Anda untuk mulai menyusun Rencana Anggaran Biaya (RAB), jadwal pekerjaan, pemantauan progres, dan analisis kinerja Earned Value (EVM).
          </p>
          <div class="empty-state-actions">
            <button class="btn btn-primary" onclick="openAddProjectModal()">
              <i class="fa-solid fa-plus"></i> Tambah Proyek Pertama
            </button>
            <button class="btn btn-outline" onclick="openExampleModal('proyek')">
              <i class="fa-solid fa-circle-question"></i> Lihat Contoh Pengisian
            </button>
          </div>
        </div>
      `;
    }

    // Reset card statistik
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt("statNilaiKontrak", "Rp 0");
    setTxt("statTotalRAB", "Rp 0");
    setTxt("statBiayaAktual", "Rp 0");
    setTxt("statSisaAnggaran", "Rp 0");
    setTxt("statProgresRencana", "0.00%");
    setTxt("statProgresAktual", "0.00%");
    setTxt("statDeviasiProgres", "0.00%");
    setTxt("statSisaWaktu", "-");
    setTxt("dashSV", "Rp 0");
    setTxt("dashCV", "Rp 0");
    setTxt("dashSPI", "N/A");
    setTxt("dashCPI", "N/A");

    const renBar = document.getElementById("statRencanaBar");
    if (renBar) renBar.style.width = "0%";
    const aktBar = document.getElementById("statAktualBar");
    if (aktBar) aktBar.style.width = "0%";

    const devBadge = document.getElementById("statDeviasiBadge");
    if (devBadge) { devBadge.textContent = "Belum Ada Proyek"; devBadge.className = "stat-trend neutral"; }

    const evmText = document.getElementById("dashEVMText");
    if (evmText) evmText.innerHTML = "Tambahkan proyek dan item pekerjaan pada modul RAB untuk memulai evaluasi kinerja proyek.";

    const milestoneList = document.getElementById("dashboardMilestoneList");
    if (milestoneList) {
      milestoneList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--sage-dark); font-size: 0.82rem;">Belum ada tahapan pekerjaan.</div>`;
    }

    renderEmptyDashboardCharts();
    return;
  }

  // Jika ada proyek aktif
  if (banner) {
    banner.innerHTML = `
      <div class="banner-top">
        <div>
          <div class="banner-badge-group">
            <span class="badge-tag tag-sage">${m.project.jenis || 'Bangunan Gedung'}</span>
            <span class="badge-tag tag-student">${m.project.id}</span>
            <span class="badge-tag tag-student"><i class="fa-solid fa-user-check"></i> Proyek Aktif</span>
          </div>
          <h2 class="banner-project-title">${m.project.nama}</h2>
          <div class="banner-project-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${m.project.lokasi}</span>
          </div>
        </div>
        <div>
          <div class="banner-status-pill ${m.deviasiProgres >= 0 ? 'status-green' : (m.deviasiProgres >= -5 ? 'status-yellow' : 'status-red')}">
            <i class="fa-solid ${m.deviasiProgres >= 0 ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
            <span>${m.deviasiProgres >= 0 ? 'Terkendali (On Schedule)' : 'Deviasi: ' + formatPercent(m.deviasiProgres)}</span>
          </div>
        </div>
      </div>

      <div class="banner-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Kontraktor Pelaksana</span>
          <span class="meta-value">${m.project.kontraktor || 'Kelompok Mahasiswa'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Konsultan Pengawas (MK)</span>
          <span class="meta-value">${m.project.konsultan || 'Dosen Pembimbing'}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Tanggal Mulai Proyek</span>
          <span class="meta-value">${formatDateIndo(m.project.tanggalMulai)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Target Selesai Rencana</span>
          <span class="meta-value">${formatDateIndo(m.project.tanggalSelesaiRencana)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Durasi Pelaksanaan</span>
          <span class="meta-value">${m.totalHariRencana} Hari Kalender (${m.project.durasiMinggu || 26} Minggu)</span>
        </div>
      </div>
    `;
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("statNilaiKontrak", formatRupiah(m.project.nilaiKontrak));
  setTxt("statTotalRAB", formatRupiah(m.totalRAB));
  setTxt("statBiayaAktual", formatRupiah(m.totalBiayaAktual));
  setTxt("statSisaAnggaran", formatRupiah(m.sisaAnggaran));
  setTxt("statProgresRencana", formatPercent(m.totalProgresRencana));
  setTxt("statProgresAktual", formatPercent(m.totalProgresAktual));

  const renBar = document.getElementById("statRencanaBar");
  if (renBar) renBar.style.width = `${Math.min(100, m.totalProgresRencana)}%`;
  const aktBar = document.getElementById("statAktualBar");
  if (aktBar) aktBar.style.width = `${Math.min(100, m.totalProgresAktual)}%`;

  setTxt("statDeviasiProgres", (m.deviasiProgres >= 0 ? "+" : "") + formatPercent(m.deviasiProgres));

  const devBadge = document.getElementById("statDeviasiBadge");
  if (devBadge) {
    if (m.deviasiProgres >= 0) {
      devBadge.textContent = "Lebih Cepat / Sesuai";
      devBadge.className = "stat-trend positive";
    } else if (m.deviasiProgres >= -5) {
      devBadge.textContent = "Keterlambatan Ringan";
      devBadge.className = "stat-trend warning";
    } else {
      devBadge.textContent = "Keterlambatan Kritis";
      devBadge.className = "stat-trend negative";
    }
  }

  setTxt("statSisaWaktu", `${m.sisaHariKalender} Hari`);

  // Quick EVM
  const spiStr = typeof m.EVM.SPI === "number" ? m.EVM.SPI.toFixed(3) : m.EVM.SPI;
  const cpiStr = typeof m.EVM.CPI === "number" ? m.EVM.CPI.toFixed(3) : m.EVM.CPI;
  setTxt("dashSV", (m.EVM.SV >= 0 ? "+" : "") + formatRupiah(m.EVM.SV));
  setTxt("dashCV", (m.EVM.CV >= 0 ? "+" : "") + formatRupiah(m.EVM.CV));
  setTxt("dashSPI", spiStr);
  setTxt("dashCPI", cpiStr);

  const evmText = document.getElementById("dashEVMText");
  if (evmText) {
    if (m.isEmpty) {
      evmText.innerHTML = `
        Item pekerjaan RAB belum diisi. Tambahkan rincian pekerjaan pada menu <strong>RAB</strong> untuk mengaktifkan grafik Kurva S dan indikator EVM.
        <br><button class="btn btn-sm btn-primary" style="margin-top: 8px;" onclick="openAddRABModal()"><i class="fa-solid fa-plus"></i> Tambah Item RAB</button>
      `;
    } else {
      let evalText = "";
      if (m.deviasiProgres >= 0) {
        evalText = `Proyek berjalan <strong>sesuai atau lebih cepat dari jadwal (+${formatPercent(m.deviasiProgres)}, SPI: ${spiStr})</strong>. `;
      } else {
        evalText = `Proyek mengalami <strong>keterlambatan sebesar ${formatPercent(m.deviasiProgres)} (SPI: ${spiStr})</strong>. `;
      }
      if (typeof m.EVM.CPI === "number" && m.EVM.CPI >= 1.0) {
        evalText += `Penggunaan anggaran efisien dan terkendali <strong>(CPI: ${cpiStr})</strong> dengan sisa anggaran ${formatRupiah(m.sisaAnggaran)}.`;
      } else if (typeof m.EVM.CPI === "number") {
        evalText += `Terjadi pembengkakan biaya pengeluaran <strong>(CPI: ${cpiStr})</strong>. Disarankan evaluasi harga material dan tenaga kerja.`;
      }
      evmText.innerHTML = evalText;
    }
  }

  renderDashboardMilestones(m);
  renderDashboardCharts(m);
}

function renderEmptyDashboardCharts() {
  const ctxSCurve = document.getElementById("dashboardSCurveChart");
  if (chartInstances.dashboardSCurve) {
    chartInstances.dashboardSCurve.destroy();
    chartInstances.dashboardSCurve = null;
  }
  const ctxCost = document.getElementById("dashboardCostChart");
  if (chartInstances.dashboardCost) {
    chartInstances.dashboardCost.destroy();
    chartInstances.dashboardCost = null;
  }
}

function renderDashboardMilestones(m) {
  const container = document.getElementById("dashboardMilestoneList");
  if (!container) return;

  if (m.isEmpty || !m.projectRAB || m.projectRAB.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 12px; color: var(--sage-dark); font-size: 0.8rem;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size: 1.5rem; margin-bottom: 6px; opacity: 0.5;"></i><br>
        Tahapan milestone akan dihitung otomatis setelah Anda menambahkan item pekerjaan pada modul RAB.
      </div>
    `;
    return;
  }

  const divisiList = [...new Set(m.projectRAB.map(item => item.divisi || "Umum"))].slice(0, 5);
  container.innerHTML = divisiList.map(divName => {
    const items = m.projectRAB.filter(i => (i.divisi || "Umum") === divName);
    const avgProg = items.reduce((acc, cur) => acc + (Number(cur.progresAktual) || 0), 0) / (items.length || 1);
    let icon = "fa-clock";
    let color = "var(--sage-dark)";
    let badge = `${avgProg.toFixed(0)}%`;
    if (avgProg >= 100) {
      icon = "fa-circle-check";
      color = "var(--status-success)";
      badge = "Selesai 100%";
    } else if (avgProg > 0) {
      icon = "fa-person-digging";
      color = "var(--sage-deep)";
      badge = `Progres ${avgProg.toFixed(0)}%`;
    }

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; background: var(--sage-bg); border-radius: var(--border-radius-md); border: 1px solid var(--sage-border);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid ${icon}" style="color: ${color}; font-size: 0.95rem;"></i>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">${divName}</span>
        </div>
        <span style="font-size: 0.72rem; font-weight: 700; color: ${color};">${badge}</span>
      </div>
    `;
  }).join("");
}

function renderDashboardCharts(m) {
  if (typeof Chart === "undefined") return;

  const ctxSCurve = document.getElementById("dashboardSCurveChart");
  if (ctxSCurve) {
    if (chartInstances.dashboardSCurve) chartInstances.dashboardSCurve.destroy();

    if (m.isEmpty || !m.projectRAB || m.projectRAB.length === 0) {
      ctxSCurve.style.display = "none";
      let parent = ctxSCurve.parentElement;
      let existingNotice = parent.querySelector(".chart-empty-notice");
      if (!existingNotice) {
        let notice = document.createElement("div");
        notice.className = "chart-empty-notice";
        notice.style = "height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--sage-dark); font-size: 0.82rem; text-align: center; padding: 20px;";
        notice.innerHTML = `<i class="fa-solid fa-chart-line" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.4;"></i>Kurva S akan terbentuk setelah item RAB & jadwal ditambahkan.`;
        parent.appendChild(notice);
      }
    } else {
      ctxSCurve.style.display = "block";
      let notice = ctxSCurve.parentElement.querySelector(".chart-empty-notice");
      if (notice) notice.remove();

      const totalWeeks = Math.max(4, m.project.durasiMinggu || 26);
      const labels = Array.from({ length: totalWeeks }, (_, i) => `M-${i + 1}`);
      const stepRencana = 100 / totalWeeks;
      const dataRencana = labels.map((_, i) => Number(((i + 1) * stepRencana).toFixed(2)));

      const dataAktual = labels.map((_, i) => {
        if (i < m.mingguBerjalan - 1) {
          return Number(((i + 1) * (m.totalProgresAktual / m.mingguBerjalan)).toFixed(2));
        } else if (i === m.mingguBerjalan - 1) {
          return Number(m.totalProgresAktual.toFixed(2));
        }
        return null;
      });

      chartInstances.dashboardSCurve = new Chart(ctxSCurve, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Rencana (%)",
              data: dataRencana,
              borderColor: "#536B57",
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 2,
              fill: false
            },
            {
              label: "Aktual (%)",
              data: dataAktual,
              borderColor: "#A3BFA8",
              backgroundColor: "rgba(163, 191, 168, 0.18)",
              borderWidth: 2.5,
              pointRadius: 3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", labels: { boxWidth: 12, font: { size: 10 } } } },
          scales: {
            y: { min: 0, max: 100, ticks: { callback: v => `${v}%`, font: { size: 9 } } },
            x: { ticks: { font: { size: 9 } } }
          }
        }
      });
    }
  }

  const ctxCost = document.getElementById("dashboardCostChart");
  if (ctxCost) {
    if (chartInstances.dashboardCost) chartInstances.dashboardCost.destroy();

    if (m.isEmpty || !m.divisiBreakdown || m.divisiBreakdown.length === 0) {
      ctxCost.style.display = "none";
      let parent = ctxCost.parentElement;
      let existingNotice = parent.querySelector(".chart-empty-notice");
      if (!existingNotice) {
        let notice = document.createElement("div");
        notice.className = "chart-empty-notice";
        notice.style = "height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--sage-dark); font-size: 0.82rem; text-align: center; padding: 20px;";
        notice.innerHTML = `<i class="fa-solid fa-chart-column" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.4;"></i>Perbandingan divisi akan tampil setelah RAB diisi.`;
        parent.appendChild(notice);
      }
    } else {
      ctxCost.style.display = "block";
      let notice = ctxCost.parentElement.querySelector(".chart-empty-notice");
      if (notice) notice.remove();

      const labels = m.divisiBreakdown.map(d => d.divisi.length > 14 ? d.divisi.slice(0, 14) + "..." : d.divisi);
      const dataPlan = m.divisiBreakdown.map(d => d.anggaranRencana);
      const dataReal = m.divisiBreakdown.map(d => d.biayaAktual);

      chartInstances.dashboardCost = new Chart(ctxCost, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pagu RAB",
              data: dataPlan,
              backgroundColor: "#A3BFA8",
              borderRadius: 4
            },
            {
              label: "Biaya Riil",
              data: dataReal,
              backgroundColor: "#536B57",
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", labels: { boxWidth: 12, font: { size: 10 } } } },
          scales: {
            y: { ticks: { callback: v => `Rp ${(v / 1e6).toFixed(0)}Jt`, font: { size: 9 } } },
            x: { ticks: { font: { size: 9 } } }
          }
        }
      });
    }
  }
}

// ===================================================================
// 5. RENDER DATA PROYEK (MULTI-PROYEK)
// ===================================================================
function renderProjectView() {
  const tbody = document.getElementById("tableBodyProyek");
  if (!tbody) return;

  const searchTerm = (document.getElementById("searchProyek")?.value || "").toLowerCase();
  const filterJenis = document.getElementById("filterJenisProyek")?.value || "all";
  const filterStatus = document.getElementById("filterStatusProyek")?.value || "all";

  if (appState.projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-diagram-project"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Proyek yang Dibuat</h4>
            <p class="empty-state-desc">
              Mulai simulasi manajemen konstruksi dengan menambahkan proyek pertama Anda. Formulir disiapkan dalam keadaan kosong agar Anda dapat mengisi data proyek sendiri.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddProjectModal()">
                <i class="fa-solid fa-plus"></i> Tambah Proyek Baru
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('proyek')">
                <i class="fa-solid fa-circle-question"></i> Contoh Pengisian Proyek
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const filtered = appState.projects.filter(p => {
    const matchSearch = (p.nama || "").toLowerCase().includes(searchTerm) ||
                        (p.lokasi || "").toLowerCase().includes(searchTerm) ||
                        (p.kontraktor || "").toLowerCase().includes(searchTerm) ||
                        (p.id || "").toLowerCase().includes(searchTerm);
    const matchJenis = filterJenis === "all" || p.jenis === filterJenis;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchJenis && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: var(--sage-dark);">
          Tidak ditemukan proyek yang cocok dengan kata kunci pencarian.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const isActive = p.id === appState.activeProjectId;
    return `
      <tr style="${isActive ? 'background: rgba(163, 191, 168, 0.12);' : ''}">
        <td><strong>${p.id}</strong></td>
        <td>
          <div style="font-weight: 800; color: var(--text-main);">${p.nama}</div>
          <div style="font-size: 0.72rem; color: var(--sage-dark);">${p.nomorKontrak || 'SPK Mahasiswa'}</div>
        </td>
        <td>
          <div><span class="badge badge-secondary">${p.jenis || 'Bangunan Gedung'}</span></div>
          <div style="font-size: 0.75rem; color: var(--sage-dark); margin-top: 2px;">${p.lokasi}</div>
        </td>
        <td>
          <div style="font-size: 0.78rem;"><strong>Pelaksana:</strong> ${p.kontraktor || '-'}</div>
          <div style="font-size: 0.72rem; color: var(--sage-dark);"><strong>Pengawas:</strong> ${p.konsultan || '-'}</div>
        </td>
        <td>
          <div><strong>Kontrak:</strong> ${formatRupiah(p.nilaiKontrak)}</div>
          <div style="font-size: 0.76rem; color: var(--sage-dark);"><strong>RAB:</strong> ${formatRupiah(p.nilaiRAB)}</div>
        </td>
        <td>
          <div style="font-size: 0.78rem;">${formatShortDate(p.tanggalMulai)} s/d ${formatShortDate(p.tanggalSelesaiRencana)}</div>
          <div style="font-size: 0.72rem; color: var(--sage-dark);">${p.durasiRencanaHari || 180} Hari (${p.durasiMinggu || 26} Minggu)</div>
        </td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            ${isActive 
              ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Aktif</span>`
              : `<button class="btn btn-outline btn-sm" onclick="switchActiveProject('${p.id}')" title="Buka Proyek Ini">Pilih</button>`
            }
            <button class="btn btn-outline btn-sm" onclick="editProject('${p.id}')" title="Edit Identitas Proyek">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-sm text-danger" onclick="deleteProject('${p.id}')" title="Hapus Proyek">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function openAddProjectModal() {
  document.getElementById("modalProyekTitle").innerHTML = `<i class="fa-solid fa-folder-plus"></i> Tambah Proyek Baru`;
  document.getElementById("formProyekId").value = "";
  document.getElementById("formProyek").reset();
  document.getElementById("formProyekJenis").value = "";
  openModal("modalProyek");
}

function editProject(id) {
  const p = appState.projects.find(proj => proj.id === id);
  if (!p) return;

  document.getElementById("modalProyekTitle").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Data Proyek`;
  document.getElementById("formProyekId").value = p.id;
  document.getElementById("formProyekNama").value = p.nama || "";
  document.getElementById("formProyekLokasi").value = p.lokasi || "";
  document.getElementById("formProyekJenis").value = p.jenis || "";
  document.getElementById("formProyekOwner").value = p.owner || "";
  document.getElementById("formProyekKontraktor").value = p.kontraktor || "";
  document.getElementById("formProyekKonsultan").value = p.konsultan || "";
  document.getElementById("formProyekNilaiKontrak").value = p.nilaiKontrak || "";
  document.getElementById("formProyekNilaiRAB").value = p.nilaiRAB || "";
  document.getElementById("formProyekTglMulai").value = p.tanggalMulai || "";
  document.getElementById("formProyekTglSelesai").value = p.tanggalSelesaiRencana || "";
  document.getElementById("formProyekDeskripsi").value = p.deskripsi || "";

  openModal("modalProyek");
}

function deleteProject(id) {
  if (confirm(`Apakah Anda yakin ingin menghapus proyek ${id}? Seluruh data RAB, jadwal, dan transaksi proyek ini akan dihapus permanen.`)) {
    appState.projects = appState.projects.filter(p => p.id !== id);
    appState.rabItems = appState.rabItems.filter(item => item.projectId !== id);
    appState.expenses = appState.expenses.filter(exp => exp.projectId !== id);
    appState.cashFlows = appState.cashFlows.filter(cf => cf.projectId !== id);

    if (appState.activeProjectId === id) {
      appState.activeProjectId = appState.projects.length > 0 ? appState.projects[0].id : null;
    }

    saveState();
    renderAllViews();
    showToast("Proyek berhasil dihapus.", "success");
  }
}

function handleSaveProject(e) {
  e.preventDefault();
  const id = document.getElementById("formProyekId").value || `PRJ-00${appState.projects.length + 1}`;
  const nama = document.getElementById("formProyekNama").value.trim();
  const lokasi = document.getElementById("formProyekLokasi").value.trim();
  const jenis = document.getElementById("formProyekJenis").value;
  const owner = document.getElementById("formProyekOwner").value.trim() || "Pemberi Tugas";
  const kontraktor = document.getElementById("formProyekKontraktor").value.trim() || "Kontraktor Pelaksana";
  const konsultan = document.getElementById("formProyekKonsultan").value.trim() || "Konsultan Pengawas";
  const nilaiKontrak = parseFloat(document.getElementById("formProyekNilaiKontrak").value) || 0;
  const nilaiRAB = parseFloat(document.getElementById("formProyekNilaiRAB").value) || nilaiKontrak;
  const tanggalMulai = document.getElementById("formProyekTglMulai").value;
  const tanggalSelesaiRencana = document.getElementById("formProyekTglSelesai").value;
  const deskripsi = document.getElementById("formProyekDeskripsi").value.trim();

  if (!nama || !lokasi || !jenis || !tanggalMulai || !tanggalSelesaiRencana) {
    showToast("Harap lengkapi semua kolom yang bertanda bintang (*)", "error");
    return;
  }

  const existingIdx = appState.projects.findIndex(p => p.id === id);
  const durasiHari = calculateDaysBetween(tanggalMulai, tanggalSelesaiRencana);

  const projectObj = {
    id,
    nama,
    lokasi,
    jenis,
    owner,
    kontraktor,
    konsultan,
    nomorKontrak: `SPK-${id}/2026`,
    nilaiKontrak,
    nilaiRAB,
    tanggalMulai,
    tanggalSelesaiRencana,
    tanggalSelesaiAktual: tanggalSelesaiRencana,
    durasiRencanaHari: durasiHari,
    durasiMinggu: Math.max(1, Math.ceil(durasiHari / 7)),
    mingguBerjalan: 1,
    status: "Sedang Berlangsung",
    deskripsi,
    isDemo: false
  };

  if (existingIdx >= 0) {
    appState.projects[existingIdx] = { ...appState.projects[existingIdx], ...projectObj };
    showToast("Data proyek berhasil diperbarui.", "success");
  } else {
    appState.projects.push(projectObj);
    appState.activeProjectId = id;
    showToast("Proyek baru berhasil ditambahkan.", "success");
  }

  saveState();
  closeModal("modalProyek");
  renderAllViews();
}

// ===================================================================
// 6. RENDER RENCANA ANGGARAN BIAYA (RAB)
// ===================================================================
function renderRABView() {
  const m = getActiveProjectMetrics();
  const tbody = document.getElementById("tableBodyRAB");
  const filterDivisi = document.getElementById("filterDivisiRAB");
  if (!tbody) return;

  const rabTotalFooter = document.getElementById("rabFooterTotalHarga");
  const rabBobotFooter = document.getElementById("rabFooterTotalBobot");

  if (!m) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state-table-cell">
          <div class="empty-state-box">
            <h4 class="empty-state-title">Pilih atau Buat Proyek Terlebih Dahulu</h4>
            <p class="empty-state-desc">Rencana Anggaran Biaya (RAB) disusun berdasarkan proyek konstruksi aktif.</p>
            <button class="btn btn-primary" onclick="openAddProjectModal()"><i class="fa-solid fa-plus"></i> Tambah Proyek</button>
          </div>
        </td>
      </tr>
    `;
    if (rabTotalFooter) rabTotalFooter.textContent = "Rp 0";
    if (rabBobotFooter) rabBobotFooter.textContent = "0.00%";
    return;
  }

  if (filterDivisi) {
    const currentVal = filterDivisi.value;
    const allDivisions = [...new Set(m.projectRAB.map(i => i.divisi || "Umum"))];
    filterDivisi.innerHTML = `<option value="all">Semua Divisi Pekerjaan</option>` +
      allDivisions.map(d => `<option value="${d}" ${d === currentVal ? 'selected' : ''}>${d}</option>`).join("");
  }

  if (m.projectRAB.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-calculator"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Item Pekerjaan RAB</h4>
            <p class="empty-state-desc">
              Tambahkan item pekerjaan untuk mulai menyusun Rencana Anggaran Biaya proyek ini. Nilai dihitung otomatis menggunakan rumus: <strong>Jumlah Harga = Volume × Harga Satuan</strong>.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddRABModal()">
                <i class="fa-solid fa-plus"></i> Tambah Item Pekerjaan
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('rab')">
                <i class="fa-solid fa-circle-question"></i> Lihat Contoh RAB
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
    if (rabTotalFooter) rabTotalFooter.textContent = "Rp 0";
    if (rabBobotFooter) rabBobotFooter.textContent = "0.00%";
    return;
  }

  const searchTerm = (document.getElementById("searchRAB")?.value || "").toLowerCase();
  const filterVal = filterDivisi?.value || "all";

  const filtered = m.projectRAB.filter(item => {
    const matchSearch = (item.uraian || "").toLowerCase().includes(searchTerm) ||
                        (item.divisi || "").toLowerCase().includes(searchTerm) ||
                        (item.kodePekerjaan || "").toLowerCase().includes(searchTerm);
    const matchDivisi = filterVal === "all" || item.divisi === filterVal;
    return matchSearch && matchDivisi;
  });

  tbody.innerHTML = filtered.map((item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td><span class="badge badge-secondary">${item.divisi || 'Umum'}</span></td>
      <td><code>${item.kodePekerjaan || '-'}</code></td>
      <td><strong>${item.uraian}</strong></td>
      <td style="text-align: right;">${Number(item.volume).toLocaleString("id-ID")}</td>
      <td style="text-align: center;"><span class="badge badge-light">${item.satuan}</span></td>
      <td style="text-align: right;">${formatRupiah(item.hargaSatuan)}</td>
      <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${formatRupiah(item.jumlahHarga)}</td>
      <td style="text-align: right; font-weight: 800; color: var(--text-main);">${formatPercent(item.bobot)}</td>
      <td style="text-align: center;">
        <div style="display: flex; gap: 4px; justify-content: center;">
          <button class="btn btn-outline btn-sm" onclick="editRABItem('${item.id}')" title="Edit Item">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-outline btn-sm text-danger" onclick="deleteRABItem('${item.id}')" title="Hapus Item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  if (rabTotalFooter) rabTotalFooter.textContent = formatRupiah(m.totalRAB);
  if (rabBobotFooter) rabBobotFooter.textContent = formatPercent(m.totalBobot);
}

function openAddRABModal() {
  document.getElementById("modalRABTitle").innerHTML = `<i class="fa-solid fa-file-circle-plus"></i> Tambah Item Pekerjaan RAB`;
  document.getElementById("formRABId").value = "";
  document.getElementById("formRAB").reset();
  calculateModalRABTotal();
  openModal("modalRAB");
}

function calculateModalRABTotal() {
  const vol = parseFloat(document.getElementById("formRABVolume")?.value) || 0;
  const harga = parseFloat(document.getElementById("formRABHargaSatuan")?.value) || 0;
  const total = vol * harga;
  const label = document.getElementById("formRABCalculatedTotal");
  if (label) {
    label.textContent = formatRupiah(total);
  }
}

function editRABItem(id) {
  const item = appState.rabItems.find(i => i.id === id);
  if (!item) return;

  document.getElementById("modalRABTitle").innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Item Pekerjaan RAB`;
  document.getElementById("formRABId").value = item.id;
  document.getElementById("formRABDivisi").value = item.divisi || "";
  document.getElementById("formRABKode").value = item.kodePekerjaan || "";
  document.getElementById("formRABUraian").value = item.uraian || "";
  document.getElementById("formRABVolume").value = item.volume || "";
  document.getElementById("formRABSatuan").value = item.satuan || "m³";
  document.getElementById("formRABHargaSatuan").value = item.hargaSatuan || "";
  document.getElementById("formRABTglMulai").value = item.tglMulaiRencana || "";
  document.getElementById("formRABTglSelesai").value = item.tglSelesaiRencana || "";

  calculateModalRABTotal();
  openModal("modalRAB");
}

function deleteRABItem(id) {
  if (confirm("Apakah Anda yakin ingin menghapus item pekerjaan ini dari RAB?")) {
    appState.rabItems = appState.rabItems.filter(i => i.id !== id);
    saveState();
    renderAllViews();
    showToast("Item pekerjaan berhasil dihapus dari RAB.", "success");
  }
}

function handleSaveRABItem(e) {
  e.preventDefault();
  if (!appState.activeProjectId) {
    showToast("Pilih atau buat proyek terlebih dahulu.", "error");
    return;
  }

  const id = document.getElementById("formRABId").value || `RAB-${Date.now().toString().slice(-4)}`;
  const divisi = document.getElementById("formRABDivisi").value.trim() || "Pekerjaan Persiapan";
  const kodePekerjaan = document.getElementById("formRABKode").value.trim() || "1.01";
  const uraian = document.getElementById("formRABUraian").value.trim();
  const volume = parseFloat(document.getElementById("formRABVolume").value) || 0;
  const satuan = document.getElementById("formRABSatuan").value;
  const hargaSatuan = parseFloat(document.getElementById("formRABHargaSatuan").value) || 0;
  const tglMulai = document.getElementById("formRABTglMulai").value;
  const tglSelesai = document.getElementById("formRABTglSelesai").value;

  if (!uraian || volume <= 0 || hargaSatuan <= 0) {
    showToast("Uraian, volume, dan harga satuan harus diisi dengan benar.", "error");
    return;
  }

  const existingIdx = appState.rabItems.findIndex(i => i.id === id);
  const proj = appState.projects.find(p => p.id === appState.activeProjectId);
  const newItem = {
    id,
    projectId: appState.activeProjectId,
    divisi,
    kodePekerjaan,
    uraian,
    volume,
    satuan,
    hargaSatuan,
    jumlahHarga: volume * hargaSatuan,
    tglMulaiRencana: tglMulai || proj?.tanggalMulai || "2026-01-05",
    tglSelesaiRencana: tglSelesai || proj?.tanggalSelesaiRencana || "2026-06-30",
    tglMulaiAktual: tglMulai || proj?.tanggalMulai || "2026-01-05",
    tglSelesaiAktual: tglSelesai || proj?.tanggalSelesaiRencana || "2026-06-30",
    progresRencana: existingIdx >= 0 ? appState.rabItems[existingIdx].progresRencana : 0,
    progresAktual: existingIdx >= 0 ? appState.rabItems[existingIdx].progresAktual : 0,
    status: "Belum Dimulai"
  };

  if (existingIdx >= 0) {
    appState.rabItems[existingIdx] = { ...appState.rabItems[existingIdx], ...newItem };
    showToast("Item RAB berhasil diperbarui.", "success");
  } else {
    appState.rabItems.push(newItem);
    showToast("Item pekerjaan baru berhasil ditambahkan ke RAB.", "success");
  }

  saveState();
  closeModal("modalRAB");
  renderAllViews();
}

// ===================================================================
// 7. RENDER MONITORING BIAYA VIEW
// ===================================================================
function renderMonitoringBiayaView() {
  const m = getActiveProjectMetrics();
  const tbodyExpenses = document.getElementById("tableBodyExpenses");
  const tbodyCostDivision = document.getElementById("tableBodyCostDivision");
  if (!tbodyExpenses) return;

  if (!m) {
    tbodyExpenses.innerHTML = `<tr><td colspan="8" class="empty-state-table-cell">Pilih atau buat proyek terlebih dahulu.</td></tr>`;
    return;
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("costStatRAB", formatRupiah(m.totalRAB));
  setTxt("costStatAktual", formatRupiah(m.totalBiayaAktual));
  setTxt("costStatSisa", formatRupiah(m.sisaAnggaran));
  setTxt("costStatPenyerapan", formatPercent(m.persentasePenyerapan));

  if (tbodyCostDivision) {
    if (m.divisiBreakdown.length === 0) {
      tbodyCostDivision.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--sage-dark);">Belum ada data divisi pekerjaan.</td></tr>`;
    } else {
      tbodyCostDivision.innerHTML = m.divisiBreakdown.map(d => `
        <tr>
          <td><strong>${d.divisi}</strong></td>
          <td style="text-align: right;">${formatRupiah(d.anggaranRencana)}</td>
          <td style="text-align: right;">${formatRupiah(d.biayaAktual)}</td>
          <td style="text-align: right; color: ${d.selisih >= 0 ? 'var(--status-success)' : 'var(--status-danger)'}; font-weight: 700;">
            ${formatRupiah(d.selisih)}
          </td>
          <td style="text-align: right;">${formatPercent(d.penyerapan)}</td>
          <td style="text-align: center;"><span class="badge ${d.statusClass}">${d.statusBiaya}</span></td>
        </tr>
      `).join("");
    }
  }

  if (m.expenses.length === 0) {
    tbodyExpenses.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Catatan Biaya Aktual</h4>
            <p class="empty-state-desc">
              Catat pengeluaran riil material, upah tenaga kerja, dan sewa alat untuk membandingkan pagu RAB dengan realisasi riil di lapangan.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddExpenseModal()">
                <i class="fa-solid fa-plus"></i> Catat Biaya Aktual
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('biaya')">
                <i class="fa-solid fa-circle-question"></i> Contoh Pencatatan Biaya
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
    setTxt("costFooterTotalAktual", "Rp 0");
    return;
  }

  const searchTerm = (document.getElementById("searchExpense")?.value || "").toLowerCase();
  const filterCat = document.getElementById("filterExpenseCategory")?.value || "all";

  const filtered = m.expenses.filter(e => {
    const matchSearch = (e.uraian || "").toLowerCase().includes(searchTerm) ||
                        (e.vendor || "").toLowerCase().includes(searchTerm) ||
                        (e.noBukti || "").toLowerCase().includes(searchTerm);
    const matchCat = filterCat === "all" || e.kategori === filterCat;
    return matchSearch && matchCat;
  });

  tbodyExpenses.innerHTML = filtered.map((e, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td>${formatShortDate(e.tanggal)}</td>
      <td><code>${e.noBukti || '-'}</code></td>
      <td><span class="badge badge-secondary">${e.kategori || 'Umum'}</span></td>
      <td><strong>${e.uraian}</strong></td>
      <td>${e.vendor || '-'}</td>
      <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${formatRupiah(e.nominal)}</td>
      <td style="text-align: center;">
        <button class="btn btn-outline btn-sm text-danger" onclick="deleteExpense('${e.id}')" title="Hapus Transaksi">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join("");

  setTxt("costFooterTotalAktual", formatRupiah(m.totalBiayaAktual));
  renderCostComparisonChart(m);
}

function openAddExpenseModal() {
  document.getElementById("formExpense").reset();
  document.getElementById("formExpTanggal").value = new Date().toISOString().split("T")[0];
  openModal("modalExpense");
}

function deleteExpense(id) {
  if (confirm("Hapus catatan transaksi pengeluaran ini?")) {
    appState.expenses = appState.expenses.filter(e => e.id !== id);
    saveState();
    renderAllViews();
    showToast("Transaksi pengeluaran berhasil dihapus.", "success");
  }
}

function handleSaveExpense(e) {
  e.preventDefault();
  if (!appState.activeProjectId) {
    showToast("Pilih atau buat proyek terlebih dahulu.", "error");
    return;
  }

  const tanggal = document.getElementById("formExpTanggal").value;
  const noBukti = document.getElementById("formExpNoBukti").value.trim() || `BKK-${Date.now().toString().slice(-4)}`;
  const kategori = document.getElementById("formExpKategori").value;
  const nominal = parseFloat(document.getElementById("formExpNominal").value) || 0;
  const uraian = document.getElementById("formExpUraian").value.trim();
  const vendor = document.getElementById("formExpVendor").value.trim();
  const metodeBayar = document.getElementById("formExpMetode").value;

  if (!uraian || nominal <= 0) {
    showToast("Uraian dan nominal biaya harus diisi dengan benar.", "error");
    return;
  }

  const newExp = {
    id: `EXP-${Date.now().toString().slice(-4)}`,
    projectId: appState.activeProjectId,
    tanggal,
    noBukti,
    kategori,
    nominal,
    uraian,
    vendor,
    metodeBayar
  };

  appState.expenses.unshift(newExp);
  saveState();
  closeModal("modalExpense");
  renderAllViews();
  showToast("Pengeluaran biaya aktual berhasil dicatat.", "success");
}

function renderCostComparisonChart(m) {
  const ctx = document.getElementById("costComparisonChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (chartInstances.costComparison) {
    chartInstances.costComparison.destroy();
  }

  if (!m || m.divisiBreakdown.length === 0) return;

  const labels = m.divisiBreakdown.map(d => d.divisi);
  const dataPlan = m.divisiBreakdown.map(d => d.anggaranRencana);
  const dataReal = m.divisiBreakdown.map(d => d.biayaAktual);

  chartInstances.costComparison = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Anggaran Rencana (RAB)",
          data: dataPlan,
          backgroundColor: "#A3BFA8",
          borderRadius: 4
        },
        {
          label: "Realisasi Aktual",
          data: dataReal,
          backgroundColor: "#536B57",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "top" } },
      scales: {
        y: { ticks: { callback: v => `Rp ${(v / 1e6).toFixed(0)}Jt` } }
      }
    }
  });
}

// ===================================================================
// 8. RENDER MONITORING WAKTU & GANTT CHART
// ===================================================================
function renderMonitoringWaktuView() {
  const m = getActiveProjectMetrics();
  const tbody = document.getElementById("tableBodySchedule");
  const ganttWrapper = document.getElementById("ganttChartWrapper");
  if (!tbody) return;

  if (!m) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state-table-cell">Pilih atau buat proyek terlebih dahulu.</td></tr>`;
    return;
  }

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt("schedTglMulai", formatShortDate(m.project.tanggalMulai));
  setTxt("schedTglSelesai", formatShortDate(m.project.tanggalSelesaiRencana));
  setTxt("schedTglAktual", formatShortDate(m.project.tanggalSelesaiAktual || m.project.tanggalSelesaiRencana));
  setTxt("schedDeviasiHari", `${m.durasiTerlewatiHari} Hari Terlewati`);

  if (m.projectRAB.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-calendar-xmark"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Jadwal Pekerjaan</h4>
            <p class="empty-state-desc">
              Jadwal pelaksanaan dan visualisasi Gantt Chart akan muncul secara otomatis setelah Anda menambahkan item pekerjaan beserta tanggal mulai dan selesai pada modul RAB.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddRABModal()">
                <i class="fa-solid fa-plus"></i> Tambah Item RAB
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('jadwal')">
                <i class="fa-solid fa-circle-question"></i> Contoh Penjadwalan
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;

    if (ganttWrapper) {
      ganttWrapper.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--sage-dark);">
          <i class="fa-solid fa-calendar-days" style="font-size: 2.2rem; opacity: 0.4; margin-bottom: 8px;"></i><br>
          Visualisasi Gantt Chart akan aktif setelah item pekerjaan memiliki tanggal rencana pelaksanaan pada RAB.
        </div>
      `;
    }
    return;
  }

  const searchTerm = (document.getElementById("searchSchedule")?.value || "").toLowerCase();
  const filterStatus = document.getElementById("filterStatusJadwal")?.value || "all";

  const filtered = m.projectRAB.filter(item => {
    const matchSearch = (item.uraian || "").toLowerCase().includes(searchTerm) ||
                        (item.divisi || "").toLowerCase().includes(searchTerm);
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  tbody.innerHTML = filtered.map((item, idx) => {
    const durasi = calculateDaysBetween(item.tglMulaiRencana, item.tglSelesaiRencana);
    let statusClass = "badge-secondary";
    if (item.progresAktual >= 100) statusClass = "badge-success";
    else if (item.progresAktual > 0) statusClass = "badge-primary";

    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${item.uraian}</strong></td>
        <td>${formatShortDate(item.tglMulaiRencana)}</td>
        <td>${formatShortDate(item.tglSelesaiRencana)}</td>
        <td style="text-align: center;">${durasi} Hari</td>
        <td style="text-align: right;">${formatPercent(item.progresAktual)}</td>
        <td style="text-align: center;"><span class="badge ${statusClass}">${item.progresAktual >= 100 ? 'Selesai' : (item.progresAktual > 0 ? 'Sedang Berlangsung' : 'Belum Dimulai')}</span></td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm" onclick="openQuickProgressModal('${item.id}')">
            Update %
          </button>
        </td>
      </tr>
    `;
  }).join("");

  renderGanttChart(m);
}

function renderGanttChart(m) {
  const container = document.getElementById("ganttChartWrapper");
  if (!container || !m || m.projectRAB.length === 0) return;

  const totalWeeks = Math.max(8, m.project.durasiMinggu || 26);
  const projStart = new Date(m.project.tanggalMulai);

  let headerWeeks = "";
  for (let w = 1; w <= totalWeeks; w++) {
    headerWeeks += `<th style="text-align: center; min-width: 32px; font-size: 0.72rem; padding: 6px 2px;">M${w}</th>`;
  }

  let rows = m.projectRAB.slice(0, 15).map(item => {
    const iStart = new Date(item.tglMulaiRencana);
    const iEnd = new Date(item.tglSelesaiRencana);

    const startWeek = Math.max(1, Math.min(totalWeeks, Math.ceil(((iStart - projStart) / (1000 * 60 * 60 * 24 * 7)) + 1)));
    const endWeek = Math.max(startWeek, Math.min(totalWeeks, Math.ceil(((iEnd - projStart) / (1000 * 60 * 60 * 24 * 7)) + 1)));

    let weekCells = "";
    for (let w = 1; w <= totalWeeks; w++) {
      if (w >= startWeek && w <= endWeek) {
        weekCells += `
          <td style="padding: 2px; text-align: center; background: rgba(163, 191, 168, 0.15);">
            <div style="height: 18px; border-radius: 3px; background: ${item.progresAktual >= 100 ? 'var(--status-success)' : 'var(--sage-dark)'}; color: #fff; font-size: 0.65rem; display: flex; align-items: center; justify-content: center;">
              ${w === startWeek ? `${item.progresAktual.toFixed(0)}%` : ''}
            </div>
          </td>
        `;
      } else {
        weekCells += `<td></td>`;
      }
    }

    return `
      <tr>
        <td style="font-weight: 700; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${item.uraian}</td>
        ${weekCells}
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div style="overflow-x: auto;">
      <table class="data-table" style="font-size: 0.78rem;">
        <thead>
          <tr>
            <th style="min-width: 180px;">Uraian Pekerjaan</th>
            ${headerWeeks}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// ===================================================================
// 9. RENDER PROGRESS PEKERJAAN
// ===================================================================
function renderProgressPekerjaanView() {
  const m = getActiveProjectMetrics();
  const tbody = document.getElementById("tableBodyProgress");
  if (!tbody) return;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (!m || m.projectRAB.length === 0) {
    setTxt("progTotalAktual", "0.00%");
    setTxt("progTotalRencana", "0.00%");
    const fill = document.getElementById("progBarActualFill");
    if (fill) fill.style.width = "0%";

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-list-check"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Data Progres Pekerjaan</h4>
            <p class="empty-state-desc">
              Tambahkan item pada modul RAB terlebih dahulu untuk mencatat capaian fisik aktual dan menghitung bobot tertimbang.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddRABModal()">
                <i class="fa-solid fa-plus"></i> Tambah Item RAB
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('progres')">
                <i class="fa-solid fa-circle-question"></i> Contoh Input Progres
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;

    setTxt("progFooterBobot", "0.00%");
    setTxt("progFooterRencana", "0.00%");
    setTxt("progFooterAktual", "0.00%");
    setTxt("progFooterKontribusi", "0.00%");
    setTxt("progFooterDeviasi", "0.00%");
    return;
  }

  setTxt("progTotalAktual", formatPercent(m.totalProgresAktual));
  setTxt("progTotalRencana", formatPercent(m.totalProgresRencana));

  const devBadge = document.getElementById("progTotalDeviasiBadge");
  if (devBadge) {
    devBadge.textContent = (m.deviasiProgres >= 0 ? "+" : "") + formatPercent(m.deviasiProgres);
    devBadge.className = `badge ${m.deviasiProgres >= 0 ? 'badge-success' : 'badge-danger'}`;
  }

  const fill = document.getElementById("progBarActualFill");
  if (fill) fill.style.width = `${Math.min(100, m.totalProgresAktual)}%`;

  const searchTerm = (document.getElementById("searchProgress")?.value || "").toLowerCase();
  const filterDivisi = document.getElementById("filterDivisiProgress")?.value || "all";

  const filtered = m.projectRAB.filter(item => {
    const matchSearch = (item.uraian || "").toLowerCase().includes(searchTerm);
    const matchDivisi = filterDivisi === "all" || item.divisi === filterDivisi;
    return matchSearch && matchDivisi;
  });

  tbody.innerHTML = filtered.map((item, idx) => {
    const kontribusi = (item.bobot * (Number(item.progresAktual) || 0)) / 100;
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${item.uraian}</strong></td>
        <td><span class="badge badge-secondary">${item.divisi || 'Umum'}</span></td>
        <td style="text-align: right; font-weight: 700;">${formatPercent(item.bobot)}</td>
        <td style="text-align: right;">${formatPercent(item.progresRencana)}</td>
        <td style="text-align: right; font-weight: 800; color: var(--sage-deep);">${formatPercent(item.progresAktual)}</td>
        <td style="text-align: right; font-weight: 700; color: var(--text-main);">${formatPercent(kontribusi)}</td>
        <td style="text-align: center;">
          <button class="btn btn-primary btn-sm" onclick="openQuickProgressModal('${item.id}')">
            <i class="fa-solid fa-sliders"></i> Update %
          </button>
        </td>
      </tr>
    `;
  }).join("");

  setTxt("progFooterBobot", formatPercent(m.totalBobot));
  setTxt("progFooterRencana", formatPercent(m.totalProgresRencana));
  setTxt("progFooterAktual", formatPercent(m.totalProgresAktual));
  setTxt("progFooterKontribusi", formatPercent(m.totalProgresAktual));
  setTxt("progFooterDeviasi", (m.deviasiProgres >= 0 ? "+" : "") + formatPercent(m.deviasiProgres));
}

function openQuickProgressModal(itemId) {
  const item = appState.rabItems.find(i => i.id === itemId);
  if (!item) return;

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setVal("quickProgressItemId", item.id);
  setTxt("quickProgressUraian", item.uraian);
  setTxt("quickProgressMeta", `Divisi: ${item.divisi || '-'} | Bobot RAB: ${formatPercent(item.bobot)}`);
  setVal("quickProgressRange", item.progresAktual || 0);
  setVal("quickProgressNumber", item.progresAktual || 0);

  updateQuickProgressStatusBadge(item.progresAktual || 0);
  openModal("modalQuickProgress");
}

function updateQuickProgressStatusBadge(val) {
  const badge = document.getElementById("quickProgressStatus");
  if (!badge) return;
  if (val >= 100) {
    badge.textContent = "Selesai (100%)";
    badge.className = "badge badge-success";
  } else if (val > 0) {
    badge.textContent = "Sedang Berlangsung";
    badge.className = "badge badge-primary";
  } else {
    badge.textContent = "Belum Dimulai";
    badge.className = "badge badge-secondary";
  }
}

function syncQuickProgressRange(val) {
  const num = document.getElementById("quickProgressNumber");
  if (num) num.value = val;
  updateQuickProgressStatusBadge(Number(val));
}

function syncQuickProgressInput(val) {
  const range = document.getElementById("quickProgressRange");
  if (range) range.value = val;
  updateQuickProgressStatusBadge(Number(val));
}

function handleSaveQuickProgress(e) {
  e.preventDefault();
  const id = document.getElementById("quickProgressItemId").value;
  const val = parseFloat(document.getElementById("quickProgressNumber").value) || 0;

  const item = appState.rabItems.find(i => i.id === id);
  if (item) {
    item.progresAktual = Math.max(0, Math.min(100, val));
    if (item.progresAktual >= 100) item.status = "Selesai";
    else if (item.progresAktual > 0) item.status = "Sedang Berlangsung";
    else item.status = "Belum Dimulai";

    saveState();
    closeModal("modalQuickProgress");
    renderAllViews();
    showToast(`Progres "${item.uraian}" diperbarui ke ${formatPercent(item.progresAktual)}.`, "success");
  }
}

// ===================================================================
// 10. RENDER KURVA S (S-CURVE)
// ===================================================================
function renderKurvaSView() {
  const m = getActiveProjectMetrics();
  const tbody = document.getElementById("tableBodySCurve");
  const ctx = document.getElementById("mainSCurveChart");
  if (!tbody) return;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (!m || m.projectRAB.length === 0) {
    setTxt("scurveStatRencana", "0.00%");
    setTxt("scurveStatAktual", "0.00%");
    setTxt("scurveStatDeviasi", "0.00%");
    setTxt("scurveStatKondisi", "Belum Ada Data");

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-chart-line"></i>
            </div>
            <h4 class="empty-state-title">Kurva S Belum Dapat Ditampilkan</h4>
            <p class="empty-state-desc">
              Kurva S memerlukan data jadwal pelaksanaan, bobot RAB, dan pembaruan progres mingguan aktual. Tambahkan item pekerjaan terlebih dahulu.
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddRABModal()">
                <i class="fa-solid fa-plus"></i> Tambah Item RAB
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('kurvas')">
                <i class="fa-solid fa-circle-question"></i> Lihat Contoh Kurva S
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;

    if (ctx && chartInstances.mainSCurve) {
      chartInstances.mainSCurve.destroy();
      chartInstances.mainSCurve = null;
    }
    return;
  }

  setTxt("scurveStatRencana", formatPercent(m.totalProgresRencana));
  setTxt("scurveStatAktual", formatPercent(m.totalProgresAktual));
  setTxt("scurveStatDeviasi", (m.deviasiProgres >= 0 ? "+" : "") + formatPercent(m.deviasiProgres));

  const kondisiEl = document.getElementById("scurveStatKondisi");
  if (kondisiEl) {
    if (m.deviasiProgres >= 0) {
      kondisiEl.textContent = "Hijau (Aman & Lebih Cepat)";
      kondisiEl.style.color = "var(--status-success)";
    } else if (m.deviasiProgres >= -5) {
      kondisiEl.textContent = "Kuning (Keterlambatan Ringan)";
      kondisiEl.style.color = "var(--status-warning)";
    } else {
      kondisiEl.textContent = "Merah (Kritis - Perlu Tindakan)";
      kondisiEl.style.color = "var(--status-danger)";
    }
  }

  const totalWeeks = Math.max(6, m.project.durasiMinggu || 26);
  const labels = Array.from({ length: totalWeeks }, (_, i) => `Minggu ${i + 1}`);
  const stepRencana = 100 / totalWeeks;
  const rencanaKum = labels.map((_, i) => Number(((i + 1) * stepRencana).toFixed(2)));

  const aktualKum = labels.map((_, i) => {
    if (i < m.mingguBerjalan - 1) {
      return Number(((i + 1) * (m.totalProgresAktual / m.mingguBerjalan)).toFixed(2));
    } else if (i === m.mingguBerjalan - 1) {
      return Number(m.totalProgresAktual.toFixed(2));
    }
    return null;
  });

  tbody.innerHTML = labels.map((wName, idx) => {
    const renKum = rencanaKum[idx];
    const renMing = idx === 0 ? renKum : Number((renKum - rencanaKum[idx - 1]).toFixed(2));
    const aktKum = aktualKum[idx];
    const aktMing = aktKum !== null ? (idx === 0 ? aktKum : Number((aktKum - (aktualKum[idx - 1] || 0)).toFixed(2))) : null;
    const dev = aktKum !== null ? Number((aktKum - renKum).toFixed(2)) : null;

    return `
      <tr>
        <td><strong>${wName}</strong></td>
        <td style="text-align: right;">${renMing.toFixed(2)}%</td>
        <td style="text-align: right; font-weight: 700;">${renKum.toFixed(2)}%</td>
        <td style="text-align: right;">${aktMing !== null ? aktMing.toFixed(2) + '%' : '-'}</td>
        <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${aktKum !== null ? aktKum.toFixed(2) + '%' : '-'}</td>
        <td style="text-align: right; font-weight: 700; color: ${dev === null ? 'inherit' : (dev >= 0 ? 'var(--status-success)' : 'var(--status-danger)')};">
          ${dev !== null ? (dev >= 0 ? '+' : '') + dev.toFixed(2) + '%' : '-'}
        </td>
        <td style="text-align: center;">
          ${dev === null ? '<span class="badge badge-light">Mendatang</span>' : (dev >= 0 ? '<span class="badge badge-success">Aman</span>' : '<span class="badge badge-danger">Terlambat</span>')}
        </td>
      </tr>
    `;
  }).join("");

  if (ctx && typeof Chart !== "undefined") {
    if (chartInstances.mainSCurve) {
      chartInstances.mainSCurve.destroy();
    }

    chartInstances.mainSCurve = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Kurva S Rencana (%)",
            data: rencanaKum,
            borderColor: "#536B57",
            backgroundColor: "rgba(83, 107, 87, 0.08)",
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: true,
            tension: 0.35
          },
          {
            label: "Kurva S Realisasi Aktual (%)",
            data: aktualKum,
            borderColor: "#A3BFA8",
            backgroundColor: "rgba(163, 191, 168, 0.22)",
            borderWidth: 3,
            pointBackgroundColor: "#536B57",
            pointRadius: 4,
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: {
          y: { min: 0, max: 100, ticks: { callback: v => `${v}%` } }
        }
      }
    });
  }
}

// ===================================================================
// 11. RENDER CASH FLOW (ARUS KAS)
// ===================================================================
function renderCashFlowView() {
  const m = getActiveProjectMetrics();
  const tbody = document.getElementById("tableBodyCashFlow");
  const ctx = document.getElementById("cashFlowChart");
  if (!tbody) return;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (!m) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state-table-cell">Pilih atau buat proyek terlebih dahulu.</td></tr>`;
    return;
  }

  let totalMasuk = 0;
  let totalKeluar = 0;
  m.cashflows.forEach(c => {
    totalMasuk += Number(c.pemasukanAktual) || 0;
    totalKeluar += Number(c.pengeluaranAktual) || 0;
  });
  const saldoAkhir = totalMasuk - totalKeluar;

  setTxt("cfStatPemasukan", formatRupiah(totalMasuk));
  setTxt("cfStatPengeluaran", formatRupiah(totalKeluar));
  setTxt("cfStatSaldo", formatRupiah(saldoAkhir));
  setTxt("cfStatTerminSisa", formatRupiah(Math.max(0, m.project.nilaiKontrak - totalMasuk)));

  if (m.cashflows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-table-cell">
          <div class="empty-state-box">
            <div class="empty-state-icon-wrap">
              <i class="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <h4 class="empty-state-title">Belum Ada Transaksi Arus Kas</h4>
            <p class="empty-state-desc">
              Catat penerimaan termin pembayaran dari pemilik proyek dan pengeluaran modal kerja untuk memantau likuiditas kas operasional (Net Cash Flow).
            </p>
            <div class="empty-state-actions">
              <button class="btn btn-primary" onclick="openAddCashFlowModal()">
                <i class="fa-solid fa-plus"></i> Tambah Transaksi Kas
              </button>
              <button class="btn btn-outline" onclick="openExampleModal('cashflow')">
                <i class="fa-solid fa-circle-question"></i> Contoh Arus Kas
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;

    if (ctx && chartInstances.cashFlow) {
      chartInstances.cashFlow.destroy();
      chartInstances.cashFlow = null;
    }
    return;
  }

  let runningSaldo = 0;
  tbody.innerHTML = m.cashflows.map(c => {
    const masuk = Number(c.pemasukanAktual) || 0;
    const keluar = Number(c.pengeluaranAktual) || 0;
    const netFlow = masuk - keluar;
    runningSaldo += netFlow;

    return `
      <tr>
        <td><strong>${c.bulan}</strong></td>
        <td style="text-align: right; color: var(--status-success); font-weight: 700;">+${formatRupiah(masuk)}</td>
        <td style="text-align: right; color: var(--status-danger); font-weight: 700;">-${formatRupiah(keluar)}</td>
        <td style="text-align: right; font-weight: 800; color: ${netFlow >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">
          ${formatRupiah(netFlow)}
        </td>
        <td style="text-align: right; font-weight: 800; color: var(--sage-deep);">${formatRupiah(runningSaldo)}</td>
        <td>${c.keterangan || '-'}</td>
        <td style="text-align: center;">
          <button class="btn btn-outline btn-sm text-danger" onclick="deleteCashFlow('${c.id}')" title="Hapus Transaksi">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  if (ctx && typeof Chart !== "undefined") {
    if (chartInstances.cashFlow) chartInstances.cashFlow.destroy();

    const labels = m.cashflows.map(c => c.bulan);
    const dataMasuk = m.cashflows.map(c => Number(c.pemasukanAktual) || 0);
    const dataKeluar = m.cashflows.map(c => Number(c.pengeluaranAktual) || 0);

    chartInstances.cashFlow = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pemasukan (Termin)",
            data: dataMasuk,
            backgroundColor: "#A3BFA8",
            borderRadius: 4
          },
          {
            label: "Pengeluaran (Operasional)",
            data: dataKeluar,
            backgroundColor: "#536B57",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { ticks: { callback: v => `Rp ${(v / 1e6).toFixed(0)}Jt` } }
        }
      }
    });
  }
}

function openAddCashFlowModal() {
  document.getElementById("formCashFlow").reset();
  openModal("modalCashFlow");
}

function deleteCashFlow(id) {
  if (confirm("Hapus transaksi arus kas ini?")) {
    appState.cashFlows = appState.cashFlows.filter(c => c.id !== id);
    saveState();
    renderAllViews();
    showToast("Transaksi cash flow berhasil dihapus.", "success");
  }
}

function handleSaveCashFlow(e) {
  e.preventDefault();
  if (!appState.activeProjectId) {
    showToast("Pilih atau buat proyek terlebih dahulu.", "error");
    return;
  }

  const bulan = document.getElementById("formCFBulan").value.trim() || `Bulan ${appState.cashFlows.length + 1}`;
  const pemasukan = parseFloat(document.getElementById("formCFPemasukan").value) || 0;
  const uraianMasuk = document.getElementById("formCFUraianMasuk").value.trim() || "Termin";
  const pengeluaran = parseFloat(document.getElementById("formCFPengeluaran").value) || 0;
  const rincianKeluar = document.getElementById("formCFRincianKeluar").value.trim() || "Operasional";
  const keterangan = document.getElementById("formCFKeterangan").value.trim() || "-";

  const newCF = {
    id: `CF-${Date.now().toString().slice(-4)}`,
    projectId: appState.activeProjectId,
    bulan,
    pemasukanRencana: pemasukan,
    pemasukanAktual: pemasukan,
    uraianPemasukan: uraianMasuk,
    pengeluaranRencana: pengeluaran,
    pengeluaranAktual: pengeluaran,
    rincianPengeluaran: rincianKeluar,
    keterangan
  };

  appState.cashFlows.push(newCF);
  saveState();
  closeModal("modalCashFlow");
  renderAllViews();
  showToast("Transaksi arus kas berhasil disimpan.", "success");
}

// ===================================================================
// 12. RENDER EARNED VALUE MANAGEMENT (EVM)
// ===================================================================
function renderEVMView() {
  const m = getActiveProjectMetrics();
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (!m || m.isEmpty || m.projectRAB.length === 0) {
    setTxt("evmBannerTitle", "Analisis EVM Belum Tersedia");
    setTxt("evmBannerDesc", "Analisis Earned Value Management (EVM) memerlukan data item RAB, jadwal pelaksanaan, dan realisasi biaya aktual untuk menghitung parameter PV, EV, AC, SPI, dan CPI.");
    setTxt("evmPV", "Rp 0");
    setTxt("evmEV", "Rp 0");
    setTxt("evmAC", "Rp 0");
    setTxt("evmSV", "Rp 0");
    setTxt("evmSVText", "Baseline 0");
    setTxt("evmCV", "Rp 0");
    setTxt("evmCVText", "Baseline 0");
    setTxt("evmSPI", "N/A");
    setTxt("evmSPIText", "Belum ada progres");
    setTxt("evmCPI", "N/A");
    setTxt("evmCPIText", "Belum ada biaya");
    setTxt("evmBAC", "Rp 0");
    setTxt("evmEAC", "Rp 0");
    setTxt("evmETC", "Rp 0");
    setTxt("evmVAC", "Rp 0");
    setTxt("evmVACText", "Potensi 0");
    setTxt("evmTableSPIStatus", "-");
    setTxt("evmTableCPIStatus", "-");
    return;
  }

  const { EVM } = m;
  setTxt("evmBAC", formatRupiah(EVM.BAC));
  setTxt("evmPV", formatRupiah(EVM.PV));
  setTxt("evmEV", formatRupiah(EVM.EV));
  setTxt("evmAC", formatRupiah(EVM.AC));
  setTxt("evmSV", (EVM.SV >= 0 ? "+" : "") + formatRupiah(EVM.SV));
  setTxt("evmSVText", EVM.SV >= 0 ? "Ahead of Schedule (Maju)" : "Behind Schedule (Terlambat)");
  setTxt("evmCV", (EVM.CV >= 0 ? "+" : "") + formatRupiah(EVM.CV));
  setTxt("evmCVText", EVM.CV >= 0 ? "Cost Underrun (Hemat)" : "Cost Overrun (Boros)");

  const spiStr = typeof EVM.SPI === "number" ? EVM.SPI.toFixed(3) : EVM.SPI;
  const cpiStr = typeof EVM.CPI === "number" ? EVM.CPI.toFixed(3) : EVM.CPI;
  setTxt("evmSPI", spiStr);
  setTxt("evmSPIText", typeof EVM.SPI === "number" && EVM.SPI >= 1.0 ? "Efisiensi Jadwal Baik" : (EVM.SPI === "N/A" ? "N/A" : "Perlu Percepatan"));
  setTxt("evmCPI", cpiStr);
  setTxt("evmCPIText", typeof EVM.CPI === "number" && EVM.CPI >= 1.0 ? "Efisiensi Biaya Baik" : (EVM.CPI === "N/A" ? "N/A" : "Pembengkakan Biaya"));

  setTxt("evmEAC", formatRupiah(EVM.EAC));
  setTxt("evmETC", formatRupiah(EVM.ETC));
  setTxt("evmVAC", (EVM.VAC >= 0 ? "+" : "") + formatRupiah(EVM.VAC));
  setTxt("evmVACText", EVM.VAC >= 0 ? "Potensi Sisa Laba" : "Potensi Defisit Akhir");

  if (typeof EVM.SPI === "number") {
    setTxt("evmTableSPIStatus", EVM.SPI >= 1.0 ? `SPI = ${spiStr} (Pekerjaan lebih cepat)` : `SPI = ${spiStr} (Keterlambatan fisik)`);
  }
  if (typeof EVM.CPI === "number") {
    setTxt("evmTableCPIStatus", EVM.CPI >= 1.0 ? `CPI = ${cpiStr} (Pengeluaran hemat/efisien)` : `CPI = ${cpiStr} (Pengeluaran overbudget)`);
  }

  // Update banner deskripsi
  let title = "Status Kinerja Proyek Normal";
  let desc = "";
  if (typeof EVM.SPI === "number" && typeof EVM.CPI === "number") {
    if (EVM.SPI >= 1.0 && EVM.CPI >= 1.0) {
      title = "Kinerja Sangat Baik (Ahead of Schedule & Under Budget)";
      desc = `Proyek melaju di depan jadwal rencana (SPI = ${spiStr}) dengan pemakaian biaya lebih hemat dari anggaran (CPI = ${cpiStr}). Proyeksi selesai dengan estimasi sisa efisiensi ${formatRupiah(EVM.VAC)}.`;
    } else if (EVM.SPI < 1.0 && EVM.CPI >= 1.0) {
      title = "Terlambat Namun Hemat Biaya (Behind Schedule & Under Budget)";
      desc = `Terjadi keterlambatan fisik sebesar ${formatPercent(Math.abs(m.deviasiProgres))} (SPI = ${spiStr}), namun efisiensi anggaran tetap terkendali (CPI = ${cpiStr}). Disarankan menambah jam lembur atau alat berat.`;
    } else if (EVM.SPI >= 1.0 && EVM.CPI < 1.0) {
      title = "Cepat Namun Boros Biaya (Ahead of Schedule & Over Budget)";
      desc = `Progres fisik lebih cepat dari target (SPI = ${spiStr}), tetapi pengeluaran biaya aktual melampaui rencana (CPI = ${cpiStr}). Lakukan kontrol pemborosan material.`;
    } else {
      title = "Kondisi Kritis (Behind Schedule & Over Budget)";
      desc = `Proyek mengalami keterlambatan fisik (SPI = ${spiStr}) dan pembengkakan biaya (CPI = ${cpiStr}). Diperlukan tindakan percepatan (fast-tracking) dan evaluasi menyeluruh.`;
    }
  } else {
    title = "Tahap Awal Pelaksanaan";
    desc = "Parameter EVM akan terus diperbarui secara otomatis setiap minggu.";
  }

  setTxt("evmBannerTitle", title);
  setTxt("evmBannerDesc", desc);
}

// ===================================================================
// 13. RENDER LAPORAN PROYEK (TUGAS KULIAH)
// ===================================================================
function renderLaporanView() {
  const m = getActiveProjectMetrics();
  const content = document.getElementById("reportDynamicContent");
  if (!content) return;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  if (!m || m.isEmpty || m.projectRAB.length === 0) {
    setTxt("rptHeaderProjectName", "Belum Ada Proyek Aktif");
    setTxt("rptHeaderSub", "Silakan tambahkan proyek dan item RAB terlebih dahulu");
    content.innerHTML = `
      <div class="empty-state-card" style="margin: 20px 0;">
        <div class="empty-state-icon-wrap"><i class="fa-solid fa-file-circle-exclamation"></i></div>
        <h4 class="empty-state-title">Belum Ada Data Proyek untuk Dicetak</h4>
        <p class="empty-state-desc">
          Dokumen laporan resmi siap cetak akan terisi setelah proyek dan item pekerjaan RAB ditambahkan.
        </p>
        <button class="btn btn-primary" onclick="openAddProjectModal()"><i class="fa-solid fa-plus"></i> Tambah Proyek</button>
      </div>
    `;
    return;
  }

  setTxt("rptHeaderProjectName", m.project.nama);
  setTxt("rptHeaderSub", `${m.project.jenis} — ${m.project.lokasi} | Kontrak: ${formatRupiah(m.project.nilaiKontrak)}`);
  setTxt("rptPrintDate", formatDateIndo(new Date().toISOString()));
  setTxt("rptSigAuthor", m.project.kontraktor || "Mahasiswa Pelaksana");
  setTxt("rptSigRole", "Project Manager / Mahasiswa");

  const spiStr = typeof m.EVM.SPI === "number" ? m.EVM.SPI.toFixed(3) : m.EVM.SPI;
  const cpiStr = typeof m.EVM.CPI === "number" ? m.EVM.CPI.toFixed(3) : m.EVM.CPI;

  content.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep); margin-bottom: 10px;">I. RINGKASAN STATUS KONTRAK & BIAYA</h3>
      <table class="data-table" style="font-size: 0.8rem;">
        <tr><td style="width: 220px; font-weight: 700;">Nomor SPK / Kontrak</td><td>${m.project.nomorKontrak || 'SPK Mahasiswa'}</td></tr>
        <tr><td style="font-weight: 700;">Pemilik (Owner / PPK)</td><td>${m.project.owner || 'Dinas PUPR / Institusi'}</td></tr>
        <tr><td style="font-weight: 700;">Konsultan Supervisi (MK)</td><td>${m.project.konsultan || '-'}</td></tr>
        <tr><td style="font-weight: 700;">Total Pagu Anggaran (RAB)</td><td style="font-weight: 800; color: var(--sage-deep);">${formatRupiah(m.totalRAB)}</td></tr>
        <tr><td style="font-weight: 700;">Realisasi Biaya Aktual</td><td>${formatRupiah(m.totalBiayaAktual)} (${formatPercent(m.persentasePenyerapan)})</td></tr>
        <tr><td style="font-weight: 700;">Sisa Anggaran Tersedia</td><td>${formatRupiah(m.sisaAnggaran)}</td></tr>
      </table>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep); margin-bottom: 10px;">II. STATUS KINERJA FISIK & EVM</h3>
      <table class="data-table" style="font-size: 0.8rem;">
        <tr><td style="width: 220px; font-weight: 700;">Progres Rencana Kumulatif</td><td>${formatPercent(m.totalProgresRencana)}</td></tr>
        <tr><td style="font-weight: 700;">Progres Aktual Kumulatif</td><td style="font-weight: 800; color: var(--sage-deep);">${formatPercent(m.totalProgresAktual)}</td></tr>
        <tr><td style="font-weight: 700;">Deviasi Fisik Lapangan</td><td style="font-weight: 800; color: ${m.deviasiProgres >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">${(m.deviasiProgres >= 0 ? '+' : '') + formatPercent(m.deviasiProgres)}</td></tr>
        <tr><td style="font-weight: 700;">Planned Value (PV)</td><td>${formatRupiah(m.EVM.PV)}</td></tr>
        <tr><td style="font-weight: 700;">Earned Value (EV)</td><td>${formatRupiah(m.EVM.EV)}</td></tr>
        <tr><td style="font-weight: 700;">Schedule Performance Index (SPI)</td><td><strong>${spiStr}</strong></td></tr>
        <tr><td style="font-weight: 700;">Cost Performance Index (CPI)</td><td><strong>${cpiStr}</strong></td></tr>
        <tr><td style="font-weight: 700;">Perkiraan Biaya Akhir (EAC)</td><td style="font-weight: 800;">${formatRupiah(m.EVM.EAC)}</td></tr>
      </table>
    </div>

    <div>
      <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep); margin-bottom: 10px;">III. RINCIAN DIVISI PEKERJAAN</h3>
      <table class="data-table" style="font-size: 0.78rem;">
        <thead>
          <tr>
            <th>Divisi Pekerjaan</th>
            <th style="text-align: right;">Pagu Anggaran</th>
            <th style="text-align: right;">Biaya Riil</th>
            <th style="text-align: right;">Selisih</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${m.divisiBreakdown.map(d => `
            <tr>
              <td><strong>${d.divisi}</strong></td>
              <td style="text-align: right;">${formatRupiah(d.anggaranRencana)}</td>
              <td style="text-align: right;">${formatRupiah(d.biayaAktual)}</td>
              <td style="text-align: right; font-weight: 700; color: ${d.selisih >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">${formatRupiah(d.selisih)}</td>
              <td style="text-align: center;"><span class="badge ${d.statusClass}">${d.statusBiaya}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// ===================================================================
// 14. PUSAT BELAJAR & PANDUAN PENGGUNAAN
// ===================================================================
function renderGuideView() {
  const container = document.getElementById("guideTopicContent");
  if (!container) return;

  const topic = appState.currentGuideTopic || "akun";
  document.querySelectorAll(".guide-pill").forEach(p => {
    if (p.getAttribute("onclick")?.includes(topic)) p.classList.add("active");
    else p.classList.remove("active");
  });

  const topics = {
    akun: {
      title: "1. Panduan Akun Multi-User & Kolaborasi",
      desc: "Setiap mahasiswa memiliki akun dan profil terisolasi. Data proyek Anda tersimpan aman dan tidak akan bercampur dengan mahasiswa lain.",
      steps: [
        "Klik tombol 'Masuk / Akun' pada pojok kanan atas navbar.",
        "Pilih tab 'Daftar Akun Baru' dan masukkan Nama, NIM, Asal Kampus, Email, serta Password.",
        "Untuk tugas kelompok, buka menu 'Kerja Kelompok (Tim)' dan undang email rekan mahasiswa.",
        "Setiap anggota tim dapat diberi peran: Ketua Proyek, Estimator Biaya, atau Pengawas Lapangan."
      ]
    },
    proyek: {
      title: "2. Cara Membuat & Mengelola Proyek",
      desc: "Mulai simulasi dengan membuat proyek konstruksi baru. Formulir dimulai dalam keadaan kosong.",
      steps: [
        "Buka menu 'Data Proyek' pada sidebar kiri, lalu klik '+ Tambah Proyek Baru'.",
        "Pilih jenis konstruksi: Gedung, Jalan, Jembatan, Drainase, Irigasi, atau Lainnya.",
        "Isi nama proyek, lokasi, nama kontraktor, pemilik, tanggal mulai, dan target selesai.",
        "Setelah disimpan, proyek akan langsung terpilih sebagai proyek aktif di dashboard."
      ]
    },
    rab: {
      title: "3. Cara Menyusun Rencana Anggaran Biaya (RAB)",
      desc: "RAB merupakan baseline pembiayaan konstruksi yang dihitung dari volume dan analisa harga satuan (AHSP).",
      steps: [
        "Buka menu 'Rencana Anggaran (RAB)' lalu klik '+ Tambah Item Pekerjaan'.",
        "Tentukan divisi (misal: Pekerjaan Tanah, Pekerjaan Struktur, Pekerjaan Finishing).",
        "Masukkan uraian pekerjaan, volume, satuan (m³, m², kg, dll.), dan harga satuan.",
        "Sistem otomatis menghitung Jumlah Harga = Volume × Harga Satuan dan pembobotan item (%)."
      ]
    },
    jadwal: {
      title: "4. Mengatur Jadwal Pekerjaan & Gantt Chart",
      desc: "Jadwal dan durasi ditentukan berdasarkan urutan pekerjaan (WBS) dan produktivitas harian.",
      steps: [
        "Jadwal otomatis terbuat dari tanggal mulai dan selesai pada setiap item RAB.",
        "Buka menu 'Jadwal & Gantt Chart' untuk melihat jadwal dalam bentuk tabel dan timeline horizontal.",
        "Warna hijau menandakan pekerjaan selesai, sedangkan warna sage gelap menandakan pekerjaan aktif."
      ]
    },
    progres: {
      title: "5. Mengisi & Memantau Capaian Progres Fisik",
      desc: "Capaian fisik diukur mingguan melalui opname lapangan.",
      steps: [
        "Buka menu 'Progress Pekerjaan' untuk melihat daftar item beserta bobot tertimbang.",
        "Klik tombol 'Update %' pada item yang sedang dikerjakan.",
        "Geser slider atau ketik persentase capaian aktual lapangan, lalu klik 'Simpan Progres'.",
        "Total progres kumulatif proyek otomatis terhitung dari akumulasi bobot × progres."
      ]
    },
    kurvas: {
      title: "6. Memahami & Membaca Kurva S (S-Curve)",
      desc: "Kurva S membandingkan garis akumulasi rencana baseline terhadap realisasi fisik mingguan.",
      steps: [
        "Garis putus-putus menunjukkan kurva rencana baseline dari minggu 1 sampai selesai.",
        "Garis solid tebal menunjukkan capaian riil aktual sampai minggu berjalan.",
        "Jika garis aktual berada di atas garis rencana, proyek berjalan lebih cepat.",
        "Jika garis aktual berada di bawah garis rencana, proyek mengalami keterlambatan (deviasi negatif)."
      ]
    },
    cashflow: {
      title: "7. Pengelolaan Arus Kas (Cash Flow Proyek)",
      desc: "Menjaga keseimbangan antara penerimaan uang termin dengan pengeluaran belanja di lapangan.",
      steps: [
        "Buka menu 'Arus Kas' dan klik '+ Tambah Transaksi Kas'.",
        "Catat penerimaan termin (DP, Termin 1, dll.) pada kolom Pemasukan.",
        "Catat belanja material atau upah pada kolom Pengeluaran.",
        "Pantau grafik arus kas bersih (Net Cash Flow) agar saldo kumulatif tidak mengalami defisit."
      ]
    },
    evm: {
      title: "8. Analisis Kinerja Earned Value Management (EVM)",
      desc: "EVM mengevaluasi efisiensi biaya (CPI) dan efisiensi waktu (SPI) secara terpadu.",
      steps: [
        "Planned Value (PV): Anggaran pekerjaan yang seharusnya selesai.",
        "Earned Value (EV): Nilai riil hasil pekerjaan fisik yang terselesaikan.",
        "Actual Cost (AC): Uang kas riil yang telah dibayarkan.",
        "SPI = EV / PV. Jika SPI > 1.0 (Lebih cepat), SPI < 1.0 (Terlambat).",
        "CPI = EV / AC. Jika CPI > 1.0 (Hemat), CPI < 1.0 (Boros/Overbudget)."
      ]
    },
    laporan: {
      title: "9. Mencetak Dokumen Laporan Resmi Proyek",
      desc: "Format laporan siap cetak untuk diserahkan sebagai tugas kuliah atau bahan presentasi.",
      steps: [
        "Buka menu 'Laporan Proyek' pada sidebar.",
        "Periksa ringkasan identitas proyek, tabel EVM, dan lembar pengesahan tanda tangan.",
        "Klik tombol 'Cetak / Simpan PDF' untuk mencetak langsung atau menyimpan sebagai berkas PDF.",
        "Klik 'Export CSV' jika ingin membuka data ke Microsoft Excel."
      ]
    },
    glosarium: {
      title: "10. Kamus Istilah Manajemen Konstruksi",
      desc: "Daftar istilah teknis penting untuk mahasiswa Teknik Sipil.",
      steps: [
        "AHSP: Analisa Harga Satuan Pekerjaan (Standar Permen PUPR / SNI).",
        "BAC: Budget at Completion, total anggaran baseline proyek.",
        "BKK: Buku Kas Keluar untuk mencatat transaksi riil lapangan.",
        "WBS: Work Breakdown Structure, dekomposisi hierarki lingkup proyek.",
        "PHO: Provisional Hand Over, serah terima pertama hasil pekerjaan fisik."
      ]
    }
  };

  const curr = topics[topic] || topics.akun;
  container.innerHTML = `
    <div style="background: var(--card-bg); border: 1px solid var(--sage-border); padding: 24px; border-radius: var(--border-radius-lg);">
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--sage-deep); margin-bottom: 8px;">
        ${curr.title}
      </h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 18px; line-height: 1.5;">
        ${curr.desc}
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${curr.steps.map((st, i) => `
          <div style="display: flex; gap: 12px; align-items: flex-start; padding: 10px 14px; background: var(--sage-bg); border-radius: var(--border-radius-md); border: 1px solid var(--sage-border);">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--sage-dark); color: #fff; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${i + 1}</div>
            <div style="font-size: 0.82rem; color: var(--text-main); line-height: 1.45; padding-top: 2px;">${st}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function switchGuideTopic(topic) {
  appState.currentGuideTopic = topic;
  renderGuideView();
}

// ===================================================================
// 15. MODAL CONTOH PENGISIAN EDUKATIF (TERPISAH DARI DATA PENGGUNA)
// ===================================================================
function openExampleModal(topicKey = "proyek") {
  appState.currentExampleTopic = topicKey;
  switchExampleTab(topicKey);
  openModal("modalContohPengisian");
}

function switchExampleTab(topicKey) {
  appState.currentExampleTopic = topicKey;

  document.querySelectorAll(".example-nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.getElementById(`btnExTab-${topicKey}`);
  if (activeBtn) activeBtn.classList.add("active");

  renderExampleContent(topicKey);
}

function renderExampleContent(topicKey) {
  const container = document.getElementById("exampleTabContent");
  if (!container || typeof EXAMPLE_GUIDES === "undefined") return;

  const data = EXAMPLE_GUIDES[topicKey] || EXAMPLE_GUIDES.proyek;
  let bodyHTML = "";

  if (topicKey === "proyek") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-folder-open"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th style="width: 200px;">Kolom Formulir</th>
            <th>Contoh Isian Standar Mahasiswa</th>
            <th>Panduan Pengisian</th>
          </tr>
        </thead>
        <tbody>
          ${data.fields.map(f => `
            <tr>
              <td><strong>${f.label}</strong></td>
              <td style="color: var(--sage-deep); font-weight: 700;">${f.contoh}</td>
              <td style="font-size: 0.76rem; color: var(--text-muted);">${f.tips}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (topicKey === "rab") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-calculator"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <div class="example-formula-box">
        <div class="example-formula-title"><i class="fa-solid fa-calculator"></i> Rumus Perhitungan RAB:</div>
        <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--sage-deep);">${data.formula}</pre>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Uraian Pekerjaan</th>
            <th style="text-align: right;">Volume</th>
            <th style="text-align: center;">Satuan</th>
            <th style="text-align: right;">Harga Satuan</th>
            <th style="text-align: right;">Jumlah Harga</th>
            <th style="text-align: right;">Bobot (%)</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(it => `
            <tr>
              <td><strong>${it.uraian}</strong></td>
              <td style="text-align: right;">${it.volume}</td>
              <td style="text-align: center;"><span class="badge badge-light">${it.satuan}</span></td>
              <td style="text-align: right;">${it.hargaSatuan}</td>
              <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${it.jumlah}</td>
              <td style="text-align: right; font-weight: 800;">${it.bobot}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-top: 10px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-circle-info"></i> ${data.penjelasan}
      </div>
    `;
  } else if (topicKey === "jadwal") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-calendar-days"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <div class="example-formula-box">
        <div class="example-formula-title"><i class="fa-solid fa-clock"></i> Rumus Penentuan Durasi:</div>
        <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--sage-deep);">${data.formula}</pre>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Pekerjaan</th>
            <th>Tanggal Mulai</th>
            <th>Tanggal Selesai</th>
            <th style="text-align: center;">Durasi</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(it => `
            <tr>
              <td><strong>${it.pekerjaan}</strong></td>
              <td>${it.mulai}</td>
              <td>${it.selesai}</td>
              <td style="text-align: center;">${it.durasi}</td>
              <td style="text-align: center;"><span class="badge badge-secondary">${it.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-top: 10px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-circle-info"></i> ${data.penjelasan}
      </div>
    `;
  } else if (topicKey === "progres") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-list-check"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <div class="example-formula-box">
        <div class="example-formula-title"><i class="fa-solid fa-percent"></i> Rumus Progres Tertimbang:</div>
        <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--sage-deep);">${data.formula}</pre>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Indikator Parameter</th>
            <th>Nilai Contoh</th>
          </tr>
        </thead>
        <tbody>
          ${data.contohKasus.map(c => `
            <tr>
              <td><strong>${c.parameter}</strong></td>
              <td style="font-weight: 700; color: var(--sage-deep);">${c.nilai}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-top: 10px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-circle-info"></i> ${data.penjelasan}
      </div>
    `;
  } else if (topicKey === "kurvas") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-chart-line"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-bottom: 14px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-lightbulb"></i> ${data.penjelasan}
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Minggu</th>
            <th style="text-align: right;">Rencana Mingguan</th>
            <th style="text-align: right;">Rencana Kumulatif</th>
            <th style="text-align: right;">Aktual Mingguan</th>
            <th style="text-align: right;">Aktual Kumulatif</th>
            <th style="text-align: right;">Deviasi</th>
          </tr>
        </thead>
        <tbody>
          ${data.contohTabel.map(t => `
            <tr>
              <td><strong>${t.minggu}</strong></td>
              <td style="text-align: right;">${t.rencanaMinggu}</td>
              <td style="text-align: right; font-weight: 700;">${t.rencanaKum}</td>
              <td style="text-align: right;">${t.aktualMinggu}</td>
              <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${t.aktualKum}</td>
              <td style="text-align: right; color: ${t.deviasi.startsWith('-') ? 'var(--status-danger)' : 'var(--status-success)'}; font-weight: 800;">${t.deviasi}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (topicKey === "cashflow" || topicKey === "biaya") {
    const cf = EXAMPLE_GUIDES.cashflow;
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-money-bill-trend-up"></i> ${cf.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${cf.description}</p>
      </div>
      <div class="example-formula-box">
        <div class="example-formula-title"><i class="fa-solid fa-money-check-dollar"></i> Rumus Arus Kas:</div>
        <pre style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--sage-deep);">${cf.formula}</pre>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Jenis Transaksi</th>
            <th>Keterangan Transaksi</th>
            <th style="text-align: right;">Nominal</th>
          </tr>
        </thead>
        <tbody>
          ${cf.transaksi.map(tr => `
            <tr>
              <td><span class="badge ${tr.jenis === 'Pemasukan' ? 'badge-success' : 'badge-danger'}">${tr.jenis}</span></td>
              <td>${tr.keterangan}</td>
              <td style="text-align: right; font-weight: 700; color: var(--sage-deep);">${tr.nominal}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-top: 10px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-circle-info"></i> ${cf.penjelasan}
      </div>
    `;
  } else if (topicKey === "evm") {
    bodyHTML = `
      <div style="margin-bottom: 14px;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--sage-deep);"><i class="fa-solid fa-chart-pie"></i> ${data.title}</h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">${data.description}</p>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 14px; background: var(--sage-light); padding: 10px 14px; border-radius: var(--border-radius-sm); font-size: 0.78rem;">
        <div><strong>BAC:</strong> ${data.dataSimulasi.bac}</div>
        <div><strong>Rencana:</strong> ${data.dataSimulasi.rencana}</div>
        <div><strong>Aktual:</strong> ${data.dataSimulasi.aktual}</div>
        <div><strong>Biaya (AC):</strong> ${data.dataSimulasi.ac}</div>
      </div>
      <table class="example-table">
        <thead>
          <tr>
            <th>Parameter Notasi</th>
            <th>Rumus Perhitungan</th>
            <th>Hasil Hitung</th>
            <th>Arti & Interpretasi Praktis</th>
          </tr>
        </thead>
        <tbody>
          ${data.parameter.map(p => `
            <tr>
              <td><strong>${p.notasi}</strong></td>
              <td><code>${p.rumus}</code></td>
              <td style="font-weight: 800; color: var(--sage-deep);">${p.hasil}</td>
              <td style="font-size: 0.76rem;">${p.arti}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="font-size: 0.8rem; color: var(--sage-dark); margin-top: 10px; background: var(--sage-bg); padding: 10px 14px; border-radius: var(--border-radius-sm);">
        <i class="fa-solid fa-circle-info"></i> ${data.penjelasan}
      </div>
    `;
  }

  container.innerHTML = bodyHTML;
}

// ===================================================================
// 16. KERJA KELOMPOK (TIM PROYEK MAHASISWA)
// ===================================================================
function openTeamModal() {
  renderTeamMembersList();
  openModal("modalTeam");
}

function renderTeamMembersList() {
  const container = document.getElementById("teamMembersList");
  if (!container) return;

  if (appState.members.length === 0) {
    const user = appState.currentUser || { name: "Mahasiswa", email: "dimas@kampus.ac.id", nim: "-" };
    appState.members = [
      { id: "mem_1", memberName: user.name, memberEmail: user.email, memberNIM: user.nim, role: "Ketua Proyek" }
    ];
  }

  container.innerHTML = appState.members.map((m, idx) => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--sage-bg); border-radius: var(--border-radius-md); border: 1px solid var(--sage-border);">
      <div>
        <div style="font-weight: 800; font-size: 0.85rem; color: var(--text-main);">${m.memberName}</div>
        <div style="font-size: 0.72rem; color: var(--sage-dark);">${m.memberEmail} ${m.memberNIM ? '• NIM ' + m.memberNIM : ''}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="badge ${m.role === 'Ketua Proyek' ? 'badge-primary' : 'badge-secondary'}">${m.role}</span>
        ${idx > 0 ? `<button class="btn btn-outline btn-sm text-danger" onclick="removeTeamMember('${m.id}')" title="Hapus Anggota"><i class="fa-solid fa-xmark"></i></button>` : ''}
      </div>
    </div>
  `).join("");
}

function handleInviteMember(e) {
  e.preventDefault();
  const name = document.getElementById("inviteName")?.value.trim();
  const email = document.getElementById("inviteEmail")?.value.trim();
  const nim = document.getElementById("inviteNIM")?.value.trim();
  const role = document.getElementById("inviteRole")?.value;

  if (!name || !email) {
    showToast("Nama dan email anggota harus diisi.", "error");
    return;
  }

  const newMem = {
    id: `mem_${Date.now().toString().slice(-4)}`,
    memberName: name,
    memberEmail: email,
    memberNIM: nim || "-",
    role: role || "Anggota Tim"
  };

  appState.members.push(newMem);
  saveState();
  document.getElementById("formInviteMember")?.reset();
  renderTeamMembersList();
  showToast(`Anggota ${name} berhasil ditambahkan ke tim proyek.`, "success");
}

function removeTeamMember(id) {
  appState.members = appState.members.filter(m => m.id !== id);
  saveState();
  renderTeamMembersList();
  showToast("Anggota tim berhasil dihapus.", "info");
}

// ===================================================================
// 17. MODAL KONFIGURASI SUPABASE (DATABASE CLOUD)
// ===================================================================
function openSupabaseModal() {
  const cfg = supabaseService.config;
  const urlEl = document.getElementById("inputSupabaseUrl");
  const keyEl = document.getElementById("inputSupabaseKey");
  if (urlEl) urlEl.value = cfg.url || "";
  if (keyEl) keyEl.value = cfg.anonKey || "";
  openModal("modalSupabase");
}

function handleSaveSupabaseConfig(e) {
  e.preventDefault();
  const url = document.getElementById("inputSupabaseUrl")?.value.trim() || "";
  const anonKey = document.getElementById("inputSupabaseKey")?.value.trim() || "";

  const isConnected = supabaseService.saveConfig(url, anonKey);
  closeModal("modalSupabase");
  updateSupabaseStatusBadge();

  if (isConnected) {
    showToast("Berhasil terhubung ke Supabase Cloud Database!", "success");
  } else if (!url && !anonKey) {
    showToast("Konfigurasi cloud dikosongkan. Menggunakan mode penyimpanan lokal.", "info");
  } else {
    showToast("Kredensial disimpan, namun Supabase belum merespons. Menggunakan mode lokal fallback.", "warning");
  }
}

function handleClearSupabaseConfig() {
  if (confirm("Hapus konfigurasi Supabase? Aplikasi akan beralih ke penyimpanan lokal browser.")) {
    supabaseService.clearConfig();
    const urlEl = document.getElementById("inputSupabaseUrl");
    const keyEl = document.getElementById("inputSupabaseKey");
    if (urlEl) urlEl.value = "";
    if (keyEl) keyEl.value = "";
    closeModal("modalSupabase");
    updateSupabaseStatusBadge();
    showToast("Konfigurasi Supabase telah dihapus. Menggunakan penyimpanan lokal.", "info");
  }
}

// ===================================================================
// 18. AUTHENTICATION & PROFILE CONTROLS
// ===================================================================
function openAuthModal() {
  openModal("modalAuth");
}

function switchAuthTab(tab) {
  const formLogin = document.getElementById("formLogin");
  const formReg = document.getElementById("formRegister");
  const btnLogin = document.getElementById("btnTabLogin");
  const btnReg = document.getElementById("btnTabRegister");

  if (tab === "login") {
    if (formLogin) formLogin.style.display = "block";
    if (formReg) formReg.style.display = "none";
    if (btnLogin) btnLogin.classList.add("active");
    if (btnReg) btnReg.classList.remove("active");
  } else {
    if (formLogin) formLogin.style.display = "none";
    if (formReg) formReg.style.display = "block";
    if (btnLogin) btnLogin.classList.remove("active");
    if (btnReg) btnReg.classList.add("active");
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await supabaseService.signIn({ email, password });
    if (res.success) {
      appState.currentUser = res.user;
      closeModal("modalAuth");
      initStorage();
      renderAllViews();
      showToast(`Selamat datang kembali, ${res.user.name}!`, "success");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById("regFullName").value.trim();
  const nim = document.getElementById("regNIM").value.trim();
  const university = document.getElementById("regUniversity").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  try {
    const res = await supabaseService.signUp({ email, password, fullName, nim, university });
    if (res.success) {
      appState.currentUser = res.user;
      closeModal("modalAuth");
      initStorage();
      renderAllViews();
      showToast(`Akun berhasil dibuat! Selamat datang di CONSTRACK, ${res.user.name}.`, "success");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

function quickLoginDemo(email, password) {
  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");
  if (emailEl) emailEl.value = email;
  if (passEl) passEl.value = password;
}

async function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
    await supabaseService.signOut();
    initStorage();
    renderAllViews();
    showToast("Anda telah keluar dari akun.", "info");
  }
}

function openProfileModal() {
  const user = appState.currentUser || {};
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setVal("formProfName", user.name || "");
  setVal("formProfNIM", user.nim || "");
  setVal("formProfUniversity", user.university || "");
  setVal("formProfRole", user.role || "Mahasiswa / Estimator");

  setTxt("profileModalName", user.name || "Mahasiswa");
  setTxt("profileModalEmail", user.email || "-");

  const initials = user.name ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "MS";
  setTxt("profileModalAvatar", initials);

  openModal("modalProfile");
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById("formProfName")?.value.trim();
  const nim = document.getElementById("formProfNIM")?.value.trim();
  const university = document.getElementById("formProfUniversity")?.value.trim();
  const role = document.getElementById("formProfRole")?.value.trim();

  try {
    const updated = await supabaseService.updateProfile({ name, nim, university, role });
    appState.currentUser = updated;
    closeModal("modalProfile");
    updateNavbarUserUI();
    showToast("Profil berhasil diperbarui.", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===================================================================
// 19. EXPORT DATA KE CSV
// ===================================================================
function downloadCSV(filename, csvContent) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportRABToCSV() {
  const m = getActiveProjectMetrics();
  if (!m || m.projectRAB.length === 0) {
    showToast("Belum ada data RAB untuk diekspor.", "warning");
    return;
  }
  let csv = "No;Divisi;Kode;Uraian Pekerjaan;Volume;Satuan;Harga Satuan;Jumlah Harga;Bobot (%)\n";
  m.projectRAB.forEach((it, idx) => {
    csv += `${idx + 1};"${it.divisi}";"${it.kodePekerjaan}";"${it.uraian}";${it.volume};"${it.satuan}";${it.hargaSatuan};${it.jumlahHarga};${it.bobot.toFixed(2)}\n`;
  });
  downloadCSV(`CONSTRACK_RAB_${m.project.id}.csv`, csv);
  showToast("File CSV RAB berhasil diunduh.", "success");
}

function exportExpensesToCSV() {
  const m = getActiveProjectMetrics();
  if (!m || m.expenses.length === 0) {
    showToast("Belum ada catatan pengeluaran untuk diekspor.", "warning");
    return;
  }
  let csv = "No;Tanggal;No Bukti;Kategori;Uraian;Vendor;Nominal\n";
  m.expenses.forEach((e, idx) => {
    csv += `${idx + 1};"${e.tanggal}";"${e.noBukti}";"${e.kategori}";"${e.uraian}";"${e.vendor}";${e.nominal}\n`;
  });
  downloadCSV(`CONSTRACK_BIAYA_${m.project.id}.csv`, csv);
  showToast("File CSV Biaya Aktual berhasil diunduh.", "success");
}

function exportScheduleToCSV() {
  const m = getActiveProjectMetrics();
  if (!m || m.projectRAB.length === 0) {
    showToast("Belum ada data jadwal untuk diekspor.", "warning");
    return;
  }
  let csv = "Uraian;Mulai Rencana;Selesai Rencana;Durasi Hari;Progres Aktual;Status\n";
  m.projectRAB.forEach(it => {
    const durasi = calculateDaysBetween(it.tglMulaiRencana, it.tglSelesaiRencana);
    csv += `"${it.uraian}";"${it.tglMulaiRencana}";"${it.tglSelesaiRencana}";${durasi};${it.progresAktual}%;"${it.status}"\n`;
  });
  downloadCSV(`CONSTRACK_JADWAL_${m.project.id}.csv`, csv);
  showToast("File CSV Jadwal berhasil diunduh.", "success");
}

function exportProgressToCSV() {
  const m = getActiveProjectMetrics();
  if (!m || m.projectRAB.length === 0) {
    showToast("Belum ada data progres untuk diekspor.", "warning");
    return;
  }
  let csv = "Uraian Pekerjaan;Divisi;Bobot (%);Progres Rencana (%);Progres Aktual (%)\n";
  m.projectRAB.forEach(it => {
    csv += `"${it.uraian}";"${it.divisi}";${it.bobot.toFixed(2)};${it.progresRencana};${it.progresAktual}\n`;
  });
  downloadCSV(`CONSTRACK_PROGRES_${m.project.id}.csv`, csv);
  showToast("File CSV Progres berhasil diunduh.", "success");
}

function exportSCurveToCSV() {
  const m = getActiveProjectMetrics();
  if (!m || m.projectRAB.length === 0) {
    showToast("Belum ada data Kurva S untuk diekspor.", "warning");
    return;
  }
  let csv = "Minggu;Rencana Kumulatif (%);Aktual Kumulatif (%)\n";
  const totalWeeks = Math.max(6, m.project.durasiMinggu || 26);
  const step = 100 / totalWeeks;
  for (let i = 1; i <= totalWeeks; i++) {
    const ren = (i * step).toFixed(2);
    const akt = i <= m.mingguBerjalan ? (i * (m.totalProgresAktual / m.mingguBerjalan)).toFixed(2) : "";
    csv += `Minggu ${i};${ren};${akt}\n`;
  }
  downloadCSV(`CONSTRACK_KURVA_S_${m.project.id}.csv`, csv);
  showToast("File CSV Kurva S berhasil diunduh.", "success");
}

function exportEVMToCSV() {
  const m = getActiveProjectMetrics();
  if (!m) return;
  const spiStr = typeof m.EVM.SPI === "number" ? m.EVM.SPI.toFixed(4) : m.EVM.SPI;
  const cpiStr = typeof m.EVM.CPI === "number" ? m.EVM.CPI.toFixed(4) : m.EVM.CPI;
  let csv = "Parameter;Nilai\n";
  csv += `Planned Value (PV);${m.EVM.PV}\n`;
  csv += `Earned Value (EV);${m.EVM.EV}\n`;
  csv += `Actual Cost (AC);${m.EVM.AC}\n`;
  csv += `Schedule Variance (SV);${m.EVM.SV}\n`;
  csv += `Cost Variance (CV);${m.EVM.CV}\n`;
  csv += `Schedule Performance Index (SPI);${spiStr}\n`;
  csv += `Cost Performance Index (CPI);${cpiStr}\n`;
  csv += `Estimate at Completion (EAC);${m.EVM.EAC}\n`;
  csv += `Estimate to Complete (ETC);${m.EVM.ETC}\n`;
  csv += `Variance at Completion (VAC);${m.EVM.VAC}\n`;
  downloadCSV(`CONSTRACK_EVM_${m.project.id}.csv`, csv);
  showToast("File CSV Analisis EVM berhasil diunduh.", "success");
}

function exportExecutiveReportToCSV() {
  exportEVMToCSV();
}

// ===================================================================
// 20. TOAST NOTIFICATION UTILITY
// ===================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  else if (type === "error") icon = "fa-circle-exclamation";
  else if (type === "warning") icon = "fa-triangle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===================================================================
// 21. MODAL CONTROLS & NAVIGASI
// ===================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function navigateTo(viewName) {
  appState.currentView = viewName;

  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    if (item.getAttribute("data-view") === viewName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.remove("active");
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add("active");
  }

  // Refresh target view
  const m = getActiveProjectMetrics();
  if (viewName === "dashboard") {
    renderDashboard();
  } else if (viewName === "proyek") {
    renderProjectView();
  } else if (viewName === "rab") {
    renderRABView();
  } else if (viewName === "monitoring-biaya") {
    renderMonitoringBiayaView();
  } else if (viewName === "monitoring-waktu") {
    renderMonitoringWaktuView();
  } else if (viewName === "progress-pekerjaan") {
    renderProgressPekerjaanView();
  } else if (viewName === "kurva-s") {
    renderKurvaSView();
  } else if (viewName === "cash-flow") {
    renderCashFlowView();
  } else if (viewName === "evm") {
    renderEVMView();
  } else if (viewName === "laporan") {
    renderLaporanView();
  } else if (viewName === "panduan") {
    renderGuideView();
  }

  if (window.innerWidth <= 992) {
    document.getElementById("appSidebar")?.classList.remove("show");
  }
}

// Latihan Mandiri Mahasiswa
function openExerciseModal() {
  const container = document.getElementById("exerciseCardsContainer");
  if (container && typeof STUDENT_EXERCISES !== "undefined") {
    container.innerHTML = STUDENT_EXERCISES.map(ex => `
      <div style="background: var(--sage-bg); border: 1px solid var(--sage-border); padding: 14px; border-radius: var(--border-radius-md);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--sage-deep); margin: 0;">${ex.judul}</h4>
          <span class="badge badge-primary">${ex.tipe}</span>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px;">${ex.deskripsi}</p>
        <button class="btn btn-sm btn-outline" onclick="loadStudentExercise('${ex.id}')">
          <i class="fa-solid fa-play"></i> Terapkan Studi Kasus Ini
        </button>
      </div>
    `).join("");
  }
  openModal("modalExercises");
}

function loadStudentExercise(exerciseId) {
  if (confirm("Terapkan skenario studi kasus ini ke akun Anda? Data proyek aktif saat ini akan diperbarui dengan data latihan.")) {
    const ex = STUDENT_EXERCISES.find(e => e.id === exerciseId);
    if (!ex) return;

    const tmpl = CONSTRUCTION_TYPE_TEMPLATES[ex.dataTemplateKey];
    if (tmpl) {
      const pId = `PRJ-${ex.id}`;
      const newProj = {
        id: pId,
        nama: tmpl.namaDefault,
        lokasi: tmpl.lokasiDefault,
        jenis: ex.tipe,
        owner: "Dinas PUPR / Institusi",
        kontraktor: "PT Mahasiswa Rekayasa Konstruksi",
        konsultan: "PT Konsultan Pengawas Edu",
        nomorKontrak: `SPK-${pId}/2026`,
        nilaiKontrak: tmpl.nilaiKontrakDefault,
        nilaiRAB: tmpl.nilaiRABDefault,
        tanggalMulai: "2026-01-05",
        tanggalSelesaiRencana: "2026-06-30",
        tanggalSelesaiAktual: "2026-06-30",
        durasiRencanaHari: tmpl.durasiHariDefault || 180,
        durasiMinggu: 26,
        mingguBerjalan: 10,
        status: "Sedang Berlangsung",
        deskripsi: ex.deskripsi,
        isDemo: true
      };

      const newRAB = tmpl.items.map((it, idx) => ({
        id: `RAB-${pId}-${idx + 1}`,
        projectId: pId,
        divisi: it.divisi,
        kodePekerjaan: `${idx + 1}.01`,
        uraian: it.uraian,
        volume: it.volume,
        satuan: it.satuan,
        hargaSatuan: it.hargaSatuan,
        jumlahHarga: it.volume * it.hargaSatuan,
        tglMulaiRencana: "2026-01-05",
        tglSelesaiRencana: "2026-06-30",
        tglMulaiAktual: "2026-01-05",
        tglSelesaiAktual: "2026-06-30",
        progresRencana: Math.min(100, (idx + 1) * 20),
        progresAktual: Math.min(100, (idx + 1) * 15),
        status: "Sedang Berlangsung"
      }));

      appState.projects.unshift(newProj);
      appState.activeProjectId = pId;
      appState.rabItems = [...newRAB, ...appState.rabItems];

      saveState();
      closeModal("modalExercises");
      renderAllViews();
      showToast(`Studi kasus ${ex.judul} berhasil dimuat.`, "success");
    }
  }
}

// ===================================================================
// 22. GLOBAL ATTACHMENT KE WINDOW (PENCEGAH REFERENCE ERROR)
// ===================================================================
window.openModal = openModal;
window.closeModal = closeModal;
window.navigateTo = navigateTo;
window.openAddProjectModal = openAddProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.handleSaveProject = handleSaveProject;
window.openAddRABModal = openAddRABModal;
window.editRABItem = editRABItem;
window.deleteRABItem = deleteRABItem;
window.handleSaveRABItem = handleSaveRABItem;
window.calculateModalRABTotal = calculateModalRABTotal;
window.openAddExpenseModal = openAddExpenseModal;
window.deleteExpense = deleteExpense;
window.handleSaveExpense = handleSaveExpense;
window.openAddCashFlowModal = openAddCashFlowModal;
window.deleteCashFlow = deleteCashFlow;
window.handleSaveCashFlow = handleSaveCashFlow;
window.openQuickProgressModal = openQuickProgressModal;
window.syncQuickProgressRange = syncQuickProgressRange;
window.syncQuickProgressInput = syncQuickProgressInput;
window.handleSaveQuickProgress = handleSaveQuickProgress;
window.openProfileModal = openProfileModal;
window.handleSaveProfile = handleSaveProfile;
window.openTeamModal = openTeamModal;
window.handleInviteMember = handleInviteMember;
window.removeTeamMember = removeTeamMember;
window.openSupabaseModal = openSupabaseModal;
window.handleSaveSupabaseConfig = handleSaveSupabaseConfig;
window.handleClearSupabaseConfig = handleClearSupabaseConfig;
window.openAuthModal = openAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleLoginSubmit = handleLoginSubmit;
window.handleRegisterSubmit = handleRegisterSubmit;
window.quickLoginDemo = quickLoginDemo;
window.handleLogout = handleLogout;
window.openExampleModal = openExampleModal;
window.switchExampleTab = switchExampleTab;
window.openExerciseModal = openExerciseModal;
window.loadStudentExercise = loadStudentExercise;
window.switchGuideTopic = switchGuideTopic;
window.switchActiveProject = switchActiveProject;
window.resetToDemoData = resetToDemoData;
window.exportRABToCSV = exportRABToCSV;
window.exportExpensesToCSV = exportExpensesToCSV;
window.exportScheduleToCSV = exportScheduleToCSV;
window.exportProgressToCSV = exportProgressToCSV;
window.exportSCurveToCSV = exportSCurveToCSV;
window.exportEVMToCSV = exportEVMToCSV;
window.exportExecutiveReportToCSV = exportExecutiveReportToCSV;

// ===================================================================
// 23. INISIALISASI SAAT DOM READY
// ===================================================================
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  renderAllViews();

  // Sidebar item click listener
  document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
    item.addEventListener("click", () => {
      const view = item.getAttribute("data-view");
      if (view) navigateTo(view);
    });
  });

  // Mobile sidebar toggle
  document.getElementById("toggleSidebarBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.add("show");
  });
  document.getElementById("sidebarCloseBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar")?.classList.remove("show");
  });

  // Profile dropdown
  const profileBtn = document.getElementById("userProfileBtn");
  const profileMenu = document.getElementById("profileDropdownMenu");
  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu?.classList.toggle("active");
  });

  document.addEventListener("click", () => {
    profileMenu?.classList.remove("active");
  });

  // Project selector
  document.getElementById("projectSelector")?.addEventListener("change", (e) => {
    switchActiveProject(e.target.value);
  });

  // Demo reset
  document.getElementById("btnResetDemoData")?.addEventListener("click", resetToDemoData);

  // Supabase modal
  document.getElementById("btnOpenSupabaseModal")?.addEventListener("click", openSupabaseModal);

  // Form listeners
  document.getElementById("btnTambahProyek")?.addEventListener("click", openAddProjectModal);
  document.getElementById("searchProyek")?.addEventListener("input", renderProjectView);
  document.getElementById("filterJenisProyek")?.addEventListener("change", renderProjectView);
  document.getElementById("filterStatusProyek")?.addEventListener("change", renderProjectView);

  document.getElementById("btnTambahRABItem")?.addEventListener("click", openAddRABModal);
  document.getElementById("searchRAB")?.addEventListener("input", renderRABView);
  document.getElementById("filterDivisiRAB")?.addEventListener("change", renderRABView);

  document.getElementById("btnTambahPengeluaran")?.addEventListener("click", openAddExpenseModal);
  document.getElementById("searchExpense")?.addEventListener("input", renderMonitoringBiayaView);
  document.getElementById("filterExpenseCategory")?.addEventListener("change", renderMonitoringBiayaView);

  document.getElementById("btnTambahCashFlow")?.addEventListener("click", openAddCashFlowModal);

  document.getElementById("searchSchedule")?.addEventListener("input", renderMonitoringWaktuView);
  document.getElementById("filterStatusJadwal")?.addEventListener("change", renderMonitoringWaktuView);
  document.getElementById("searchProgress")?.addEventListener("input", renderProgressPekerjaanView);
  document.getElementById("filterDivisiProgress")?.addEventListener("change", renderProgressPekerjaanView);

  // Export CSV
  document.getElementById("btnExportRABCSV")?.addEventListener("click", exportRABToCSV);
  document.getElementById("btnExportCostCSV")?.addEventListener("click", exportExpensesToCSV);
  document.getElementById("btnExportScheduleCSV")?.addEventListener("click", exportScheduleToCSV);
  document.getElementById("btnExportProgressCSV")?.addEventListener("click", exportProgressToCSV);
  document.getElementById("btnExportSCurveCSV")?.addEventListener("click", exportSCurveToCSV);
  document.getElementById("btnExportCashFlowCSV")?.addEventListener("click", () => {
    const m = getActiveProjectMetrics();
    if (!m || m.cashflows.length === 0) {
      showToast("Belum ada data cash flow.", "warning");
      return;
    }
    let csv = "Bulan;Pemasukan;Pengeluaran;Net Flow;Keterangan\n";
    m.cashflows.forEach(c => {
      csv += `"${c.bulan}";${c.pemasukanAktual};${c.pengeluaranAktual};${c.pemasukanAktual - c.pengeluaranAktual};"${c.keterangan}"\n`;
    });
    downloadCSV(`CONSTRACK_CASHFLOW_${m.project.id}.csv`, csv);
    showToast("File CSV Arus Kas berhasil diunduh.", "success");
  });
  document.getElementById("btnExportEVMCSV")?.addEventListener("click", exportEVMToCSV);
  document.getElementById("btnExportExecutiveCSV")?.addEventListener("click", exportExecutiveReportToCSV);

  // Print button
  document.getElementById("btnPrintReport")?.addEventListener("click", () => {
    window.print();
  });
});
