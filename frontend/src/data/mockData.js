// Mock data for CoconutHub — prices, mills, and marketplace listings.
// Keys reference translations, so both EN and SI labels resolve at render time.

export const commodities = [
  {
    id: "coconut",
    nameKey: "c_coconut",
    unitKey: "price_unit_per_nut",
    price: 117.58,
    change: 1.18,
    currency: "Rs.",
  },
  {
    id: "coconut_oil",
    nameKey: "c_coconut_oil",
    unitKey: "price_unit_per_litre",
    price: 875.0,
    change: -1.69,
    currency: "Rs.",
  },
  {
    id: "coconut_husk",
    nameKey: "c_coconut_husk",
    unitKey: "price_unit_per_1000_husks",
    price: 13227.75,
    change: 1.64,
    currency: "Rs.",
  },
  {
    id: "coir_fiber",
    nameKey: "c_coir_fiber",
    unitKey: "price_unit_per_kg",
    price: 168.0,
    change: 0.9,
    currency: "Rs.",
  },
  {
    id: "coconut_shell",
    nameKey: "c_coconut_shell",
    unitKey: "price_unit_per_100kg",
    price: 4150.0,
    change: -0.48,
    currency: "Rs.",
  },
];

// 8-week trend for Coconut (per nut) from official CDA Colombo Auction records
export const coconutTrend = [
  { week: "W1", price: 95.9 },
  { week: "W2", price: 104.6 },
  { week: "W3", price: 112.5 },
  { week: "W4", price: 117.3 },
  { week: "W5", price: 114.4 },
  { week: "W6", price: 116.7 },
  { week: "W7", price: 116.2 },
  { week: "W8", price: 117.58 },
];

export const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kurunegala",
  "Puttalam",
  "Kandy",
  "Matale",
  "Galle",
  "Matara",
  "Hambantota",
  "Ratnapura",
  "Kegalle",
];

export const millCategories = [
  { id: "coconut_mill", labelKey: "cat_coconut_mill" },
  { id: "oil_mill", labelKey: "cat_oil_mill" },
  { id: "coir_mill", labelKey: "cat_coir_mill" },
];

export const mills = [
  { id: "m1", name: "Kurunegala Coconut Works", category: "coconut_mill", district: "Kurunegala", phone: "+94 37 222 3344", verified: true },
  { id: "m2", name: "Chilaw Oil Refinery", category: "oil_mill", district: "Puttalam", phone: "+94 32 226 7788", verified: true },
  { id: "m3", name: "Ambalangoda Coir Mill", category: "coir_mill", district: "Galle", phone: "+94 91 225 4411", verified: true },
  { id: "m4", name: "Matale Estate Mills", category: "coconut_mill", district: "Matale", phone: "+94 66 222 9911", verified: true },
  { id: "m5", name: "Gampaha Copra Traders", category: "coconut_mill", district: "Gampaha", phone: "+94 33 222 1122", verified: false },
  { id: "m6", name: "Southern Oil Pressers", category: "oil_mill", district: "Matara", phone: "+94 41 223 8877", verified: true },
  { id: "m7", name: "Ratnapura Fiber Co.", category: "coir_mill", district: "Ratnapura", phone: "+94 45 222 3311", verified: false },
  { id: "m8", name: "Katunayake Oil Mills", category: "oil_mill", district: "Gampaha", phone: "+94 11 225 5566", verified: true },
  { id: "m9", name: "Hambantota Coir Exports", category: "coir_mill", district: "Hambantota", phone: "+94 47 223 4455", verified: true },
  { id: "m10", name: "Kegalle Village Mill", category: "coconut_mill", district: "Kegalle", phone: "+94 35 222 7799", verified: false },
  { id: "m11", name: "Colombo Coir Wholesale", category: "coir_mill", district: "Colombo", phone: "+94 11 258 0011", verified: true },
  { id: "m12", name: "Kalutara Family Oil Mill", category: "oil_mill", district: "Kalutara", phone: "+94 34 222 6644", verified: false },
];

export const marketCategories = [
  { id: "coconut", labelKey: "tab_coconut" },
  { id: "oil", labelKey: "tab_oil" },
  { id: "coir", labelKey: "tab_coir" },
  { id: "husk", labelKey: "tab_husk" },
  { id: "shell", labelKey: "tab_shell" },
];

export const listings = [
  { id: "L1", category: "coconut", type: "buyer", name: "Wickrama Traders", district: "Colombo", quantity: "5,000 nuts / week", notes: "Grade A only, size ≥ 350g. Weekly pickup Fridays.", phone: "+94 77 456 1122", posted: "2h ago" },
  { id: "L2", category: "coconut", type: "supplier", name: "Silva Estate", district: "Kurunegala", quantity: "12,000 nuts / week", notes: "Own transport up to 200km. Contract options available.", phone: "+94 71 224 3311", posted: "5h ago" },
  { id: "L3", category: "oil", type: "buyer", name: "Colombo Foods PLC", district: "Colombo", quantity: "8,000 L / month", notes: "White coconut oil, edible grade. Ongoing contract.", phone: "+94 76 811 2200", posted: "1d ago" },
  { id: "L4", category: "oil", type: "supplier", name: "Chilaw Oil Refinery", district: "Puttalam", quantity: "20,000 L / month", notes: "Bulk drums or tankers. Export documentation supported.", phone: "+94 77 998 6611", posted: "3h ago" },
  { id: "L5", category: "coir", type: "buyer", name: "GreenGrow Substrates", district: "Gampaha", quantity: "40 tonnes / month", notes: "For hydroponic use, low EC required.", phone: "+94 70 322 7788", posted: "6h ago" },
  { id: "L6", category: "coir", type: "supplier", name: "Southern Fiber Co.", district: "Galle", quantity: "60 tonnes / month", notes: "Bristle & mattress fiber. FOB Colombo pricing.", phone: "+94 76 445 9922", posted: "9h ago" },
  { id: "L7", category: "husk", type: "buyer", name: "Peat Alternative Ltd", district: "Kalutara", quantity: "100,000 husks / month", notes: "Fresh, unaged husks for pith processing.", phone: "+94 71 100 2233", posted: "12h ago" },
  { id: "L8", category: "husk", type: "supplier", name: "Estate Growers Union", district: "Matale", quantity: "250,000 husks / month", notes: "Long-term supply contract preferred.", phone: "+94 77 553 4411", posted: "2d ago" },
  { id: "L9", category: "shell", type: "buyer", name: "Ceylon Activated Carbon", district: "Kandy", quantity: "15 tonnes / month", notes: "Clean, dry shell. Testing required before contract.", phone: "+94 70 812 4477", posted: "1d ago" },
  { id: "L10", category: "shell", type: "supplier", name: "Ambalangoda Suppliers", district: "Galle", quantity: "22 tonnes / month", notes: "Charcoal-grade shell available. Sample on request.", phone: "+94 71 224 8090", posted: "4h ago" },
];
