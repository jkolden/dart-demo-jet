/**
 * DART Demo — Oracle JET ViewModel (Knockout)
 * Port of the React dart-demo for County of San Diego
 */
define([
  'knockout',
  'ojs/ojarraydataprovider'
], function (ko, ArrayDataProvider) {
  'use strict';

  /* ─── Static data ─────────────────────────────────────────────── */
  var DEMO_PASS = 'dart2026';

  var batchCategories = ['Deposit', 'Transfer', 'Reallocation'];

  var batchTypesByCategory = {
    Deposit: ['Swept Cash ZBA', 'Deposit Correction (Same-HOFI)', 'Deposit Correction (Cross-HOFI)'],
    Transfer: ['Interfund Transfer', 'Intrafund Transfer', 'Cash Transfer'],
    Reallocation: ['IA Reallocation', 'Project Reallocation', 'Fund Reallocation']
  };

  var organizations = [
    { value: 'AUD', label: 'AUD \u2014 Auditor & Controller' },
    { value: 'TES', label: 'TES \u2014 Treasurer-Tax Collector' },
    { value: 'HHS', label: 'HHS \u2014 Health & Human Services' },
    { value: 'DPW', label: 'DPW \u2014 Public Works' },
    { value: 'SHR', label: 'SHR \u2014 Sheriff' },
    { value: 'LIB', label: 'LIB \u2014 Library' },
    { value: 'PLN', label: 'PLN \u2014 Planning & Development' }
  ];

  var preparersByOrg = {
    AUD: ['Moana Wavecrest', 'Kai Tidemark', 'Leilani Shore'],
    TES: ['Levi Stream', 'Coral Banks', 'Marina Depth'],
    HHS: ['Ava Harbor', 'Reef Castillo', 'Isla Sandoval'],
    DPW: ['Duncan Bridger', 'Sierra Granite', 'Clay Asphalt'],
    SHR: ['Morgan Shield', 'Barrett Ironwood', 'Quinn Patrol'],
    LIB: ['Paige Turner', 'Dewey Bookend', 'Margot Shelf'],
    PLN: ['Skyler Blueprint', 'Mason Parcel', 'Zara Overlay']
  };

  var bankAccounts = [
    { name: 'County of SD Pooled Cash \u2014 Wells Fargo',     account: '4021-7789-0001', hofi: 'AUD' },
    { name: 'County of SD Pooled Cash \u2014 Bank of America', account: '6833-4420-0055', hofi: 'TES' },
    { name: 'County of SD Treasury ZBA \u2014 Chase',          account: '9102-5567-0032', hofi: 'TES' },
    { name: 'HHS Grant Deposits \u2014 US Bank',               account: '7714-0098-2210', hofi: 'HHS' },
    { name: 'Public Works Capital \u2014 Citibank',            account: '3308-6621-4477', hofi: 'DPW' }
  ];

  var batchStatuses   = ['Incomplete', 'Pending Review', 'Ready for Approval', 'Complete'];
  var workflowStates  = ['Not Submitted', 'Submitted', 'Awaiting HOFI Approval', 'Awaiting A&C Approval', 'Approved', 'Rejected'];

  /* ─── Mock line data ──────────────────────────────────────────── */
  var glLines = [
    { id: 1, fund: '1010', budgetRef: '0000', dept: '15675', account: '47535', program: '0000', fundingSrc: '0000', project: '00000000', amount: 45000.00, description: 'State Public Health Reimbursement' },
    { id: 2, fund: '1010', budgetRef: '0000', dept: '14565', account: '47535', program: '1200', fundingSrc: '3100', project: '00000000', amount: 25000.00, description: 'Federal Housing Authority Grant' },
    { id: 3, fund: '6114', budgetRef: '0000', dept: '00000', account: '80100', program: '0000', fundingSrc: '2001', project: 'PRG10042', amount: 15000.00, description: 'Capital Improvement \u2014 Road Resurfacing' },
    { id: 4, fund: '1010', budgetRef: '2026', dept: '15675', account: '47200', program: '0000', fundingSrc: '0000', project: '00000000', amount: 22550.70, description: 'Permit Fee Collections \u2014 March' },
    { id: 5, fund: '2030', budgetRef: '2026', dept: '16890', account: '48100', program: '2100', fundingSrc: '3200', project: 'PRG20014', amount: 12000.00, description: 'Behavioral Health Services Revenue' }
  ];

  var pngLines = [
    { id: 1, project: 'PRG10042', task: '1.0', expenditureType: 'Contract Services', expenditureOrg: 'Public Works', contract: 'DPW-24-301', fundingSource: 'Dept of Public Works', amount: 8500.00, description: 'Road Resurfacing \u2014 Contract Labor Q4' },
    { id: 2, project: 'PRG20014', task: '2.0', expenditureType: 'Supplies', expenditureOrg: 'Behavioral Health', contract: 'HHS-20-101', fundingSource: 'Dept of Health & Human Services', amount: 3200.00, description: 'BHS Program Supplies' },
    { id: 3, project: 'PRG10042', task: '3.0', expenditureType: 'Equipment Rental', expenditureOrg: 'Public Works', contract: 'DPW-24-301', fundingSource: 'Dept of Public Works', amount: 6500.00, description: 'Road Resurfacing \u2014 Equipment Rental' }
  ];

  var arLines = [
    { id: 1, receiptNumber: 'AR-DART-000001-01', customer: 'State of California \u2014 DHCS',      amount: 45000.00, receiptDate: '2026-03-27', status: 'Applied',   dartBatch: 'DART-000001' },
    { id: 2, receiptNumber: 'AR-DART-000001-02', customer: 'US Dept of Housing & Urban Dev',        amount: 25000.00, receiptDate: '2026-03-27', status: 'Applied',   dartBatch: 'DART-000001' },
    { id: 3, receiptNumber: 'AR-DART-000001-03', customer: 'San Diego County Permits',              amount: 22550.70, receiptDate: '2026-03-27', status: 'Unapplied', dartBatch: 'DART-000001' }
  ];

  /* ─── Helpers ─────────────────────────────────────────────────── */
  function usd(n) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function toOpts(arr) {
    return arr.map(function (v) { return { value: v, label: v }; });
  }

  var glTotal  = glLines.reduce(function (s, l) { return s + l.amount; }, 0);
  var pngTotal = pngLines.reduce(function (s, l) { return s + l.amount; }, 0);
  var arTotal  = arLines.reduce(function (s, l) { return s + l.amount; }, 0);

  /* ═══ ViewModel ═══════════════════════════════════════════════════ */
  function DartViewModel() {
    var self = this;

    /* ── Header fields ── */
    self.batchNumber          = ko.observable('DART-000001');
    self.batchCategory        = ko.observable('Deposit');
    self.batchType            = ko.observable('Swept Cash ZBA');
    self.batchName            = ko.observable('AUDITMSCRT27MAR2026.DEMO');
    self.batchStatus          = ko.observable('Incomplete');
    self.workflowStatus       = ko.observable('Not Submitted');
    self.preparerOrganization = ko.observable('AUD');
    self.preparerName         = ko.observable('Moana Wavecrest');
    self.preparerHOFI         = ko.observable('AUD');
    self.createdDate          = ko.observable(new Date().toISOString().split('T')[0]);
    self.bankName             = ko.observable('County of SD Pooled Cash \u2014 Wells Fargo');
    self.bankAccount          = ko.observable('4021-7789-0001');
    self.bankDate             = ko.observable('2026-03-27');
    self.bankReference        = ko.observable('0005794549XF');
    self.bankAmount           = ko.observable('119550.70');

    self.locked        = ko.observable(false);
    self.showLockToast = ko.observable(false);
    self.selectedTab   = ko.observable('gl');

    /* ── Display number ── */
    self.displayBatchNum = ko.pureComputed(function () {
      return 'DART Deposit Batch #' + self.batchNumber().replace('DART-', '');
    });
    self.bankAmountFormatted = ko.pureComputed(function () {
      return usd(parseFloat(self.bankAmount()) || 0);
    });

    /* ── Data Providers for selects ── */
    self.batchCategoriesDP = new ArrayDataProvider(toOpts(batchCategories), { keyAttributes: 'value' });
    self.batchStatusesDP   = new ArrayDataProvider(toOpts(batchStatuses), { keyAttributes: 'value' });
    self.workflowStatesDP  = new ArrayDataProvider(toOpts(workflowStates), { keyAttributes: 'value' });
    self.organizationsDP   = new ArrayDataProvider(organizations, { keyAttributes: 'value' });

    /* Dynamic DPs backed by observableArrays */
    self.batchTypesData = ko.observableArray(toOpts(batchTypesByCategory['Deposit']));
    self.batchTypesDP   = new ArrayDataProvider(self.batchTypesData, { keyAttributes: 'value' });

    self.preparersData = ko.observableArray(toOpts(preparersByOrg['AUD']));
    self.preparersDP   = new ArrayDataProvider(self.preparersData, { keyAttributes: 'value' });

    var initialBanks = bankAccounts.filter(function (b) { return b.hofi === 'AUD'; });
    self.banksData = ko.observableArray(initialBanks.map(function (b) {
      return { value: b.name, label: b.name + ' (' + b.hofi + ')' };
    }));
    self.banksDP = new ArrayDataProvider(self.banksData, { keyAttributes: 'value' });

    /* ── Cascading subscriptions ── */
    self.batchCategory.subscribe(function (cat) {
      if (self.locked()) return;
      var types = batchTypesByCategory[cat] || [];
      self.batchTypesData(toOpts(types));
      self.batchType(types[0] || '');
    });

    self.preparerOrganization.subscribe(function (org) {
      if (self.locked()) return;
      self.preparerHOFI(org);
      var preps = preparersByOrg[org] || [];
      self.preparersData(toOpts(preps));
      self.preparerName(preps[0] || '');
    });

    self.bankName.subscribe(function (name) {
      var bank = bankAccounts.find(function (b) { return b.name === name; });
      if (bank) self.bankAccount(bank.account);
    });

    self.preparerHOFI.subscribe(function (hofi) {
      var matching = bankAccounts.filter(function (b) { return b.hofi === hofi; });
      var list = matching.length > 0 ? matching : bankAccounts;
      self.banksData(list.map(function (b) {
        return { value: b.name, label: b.name + ' (' + b.hofi + ')' };
      }));
    });

    /* ── HOFI mismatch ── */
    self.hofiMismatch = ko.pureComputed(function () {
      return self.preparerHOFI() !== self.preparerOrganization();
    });
    self.hofiMismatchText = ko.pureComputed(function () {
      return 'HOFI Mismatch \u2014 Preparer HOFI (' + self.preparerHOFI() +
             ') does not match Organization (' + self.preparerOrganization() +
             '). Cross-HOFI corrections require Owning HOFI authorization.';
    });
    self.showBankHint = ko.pureComputed(function () {
      var matching = bankAccounts.filter(function (b) { return b.hofi === self.preparerHOFI(); });
      return matching.length > 0 && !self.locked();
    });
    self.bankHintText = ko.pureComputed(function () {
      return 'Showing bank accounts where Owning HOFI matches preparer HOFI (' + self.preparerHOFI() + ').';
    });

    /* ── Banner metadata ── */
    self.bannerBadgeClass = ko.pureComputed(function () {
      return 'dart-banner-badge ' + (self.batchStatus() === 'Complete' ? 'complete' : 'incomplete');
    });
    self.lastUpdated = ko.pureComputed(function () {
      var now = new Date();
      return 'Last updated on ' +
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    });

    /* ── Actions ── */
    self.handleSave = function () {
      self.locked(true);
      self.batchStatus('Complete');
      self.workflowStatus('Submitted');
      self.showLockToast(true);
      setTimeout(function () { self.showLockToast(false); }, 4000);
    };
    self.handleUnlock = function () {
      self.locked(false);
      self.batchStatus('Incomplete');
      self.workflowStatus('Not Submitted');
    };
    self.handleCancel = function () {
      self.batchCategory('Deposit');
      self.batchType('Swept Cash ZBA');
      self.batchName('AUDITMSCRT27MAR2026.DEMO');
      self.batchStatus('Incomplete');
      self.workflowStatus('Not Submitted');
      self.preparerOrganization('AUD');
      self.preparerName('Moana Wavecrest');
      self.preparerHOFI('AUD');
      self.bankName('County of SD Pooled Cash \u2014 Wells Fargo');
      self.bankAccount('4021-7789-0001');
      self.bankDate('2026-03-27');
      self.bankReference('0005794549XF');
      self.bankAmount('119550.70');
      self.locked(false);
    };

    /* ── Donut chart data (static — same as React version) ── */
    var chartTotal = glTotal + pngTotal + arTotal;
    self.chartTotalFormatted = usd(chartTotal);

    self.chartSegments = [
      { label: 'GL Lines',    value: glTotal,  valueFormatted: usd(glTotal),  color: '#0572ce', pctFormatted: ((glTotal / chartTotal) * 100).toFixed(1) + '%' },
      { label: 'PNG Lines',   value: pngTotal, valueFormatted: usd(pngTotal), color: '#0d7c66', pctFormatted: ((pngTotal / chartTotal) * 100).toFixed(1) + '%' },
      { label: 'AR Receipts', value: arTotal,  valueFormatted: usd(arTotal),  color: '#c74634', pctFormatted: ((arTotal / chartTotal) * 100).toFixed(1) + '%' }
    ];

    /* SVG donut arcs */
    var radius = 40, circumference = 2 * Math.PI * radius, offset = 0;
    self.donutArcs = self.chartSegments.map(function (seg) {
      var pct  = (seg.value / chartTotal) * 100;
      var dash = (pct / 100) * circumference;
      var arc  = { color: seg.color, dashArray: dash + ' ' + (circumference - dash), dashOffset: -offset };
      offset += dash;
      return arc;
    });

    /* ── Tab data ── */
    self.tabsDP = new ArrayDataProvider([
      { id: 'gl',  label: 'GL Lines (' + glLines.length + ')' },
      { id: 'png', label: 'PNG Lines (' + pngLines.length + ')' },
      { id: 'ar',  label: 'AR Receipt Lines (' + arLines.length + ')' }
    ], { keyAttributes: 'id' });

    /* helper to check active tab */
    self.isTab = function (tab) {
      return self.selectedTab() === tab;
    };

    /* ── Table data (pre-formatted amounts) ── */
    self.glLines = glLines.map(function (l) {
      return Object.assign({}, l, { amountFmt: usd(l.amount) });
    });
    self.glTotalFmt = usd(glTotal);

    self.pngLines = pngLines.map(function (l) {
      return Object.assign({}, l, { amountFmt: usd(l.amount) });
    });
    self.pngTotalFmt = usd(pngTotal);

    self.arLines = arLines.map(function (l) {
      return Object.assign({}, l, { amountFmt: usd(l.amount) });
    });
    self.arTotalFmt = usd(arTotal);
  }

  return DartViewModel;
});
