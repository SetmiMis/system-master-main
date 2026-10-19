// Company-published facts, copied from the company's own reference site
// (system-master-mu.vercel.app, source: setmi-overview/src/lib/*.ts and components). Requested by the owner on 2026-10-19.

export const companyStats = [
  { label: "Orders fulfilled", value: 10000, suffix: "+" },
  { label: "Customers served", value: 600, suffix: "+" },
  { label: "Support staff", value: 50, suffix: "" },
  { label: "Years in business", value: 43, suffix: "+" },
];

export const certificate = {
  name: "ISO 9001:2015",
  title: "Quality Management · audited by ICV Assessments",
  scope: "Importers and trading of premium AV cables, connectors, audio-video converters & switchers, metal push switches, multimedia tweeters and PA horn speakers.",
  number: "IN/66820947/4632",
  issued: "15 Oct 2025",
  image: "/certificates/iso-9001-certificate.jpg",
  pdf: "/certificates/iso-9001-certificate.pdf",
};

// Government registrations, from the owner's certificates (GST REG-06, DGFT IEC, MSME Udyam) shared on 2026-10-19.
// Only the public registration numbers are shown; the PDFs contain bank, PAN and turnover details and are NOT published.
export const registrations = [
  { name: "GST registered", id: "07AIJPK2678P1ZI", note: "Regular taxpayer since 2017", verify: "https://services.gst.gov.in/services/searchtp" },
  { name: "Importer-Exporter Code", id: "0502065621", note: "DGFT, issued 2003", verify: "https://www.dgft.gov.in/CP/?opt=view-any-ice" },
  { name: "Udyam (MSME)", id: "UDYAM-DL-01-0016520", note: "Ministry of MSME, wholesale of electronic parts", verify: "https://udyamregistration.gov.in/Udyam_Verify.aspx" },
];

export const marketplaces = [
  { name: "Government e-Marketplace (GeM)", logo: "/logos/gem.png", href: "https://gem.gov.in", note: "Registered seller: government departments and PSUs can buy directly.", cta: "Find us on GeM" },
  { name: "Amazon.in", logo: "/logos/amazon.svg", href: "https://www.amazon.in/stores/SetmiIndia/page/0A46CD60-B6C5-4476-BD1D-01F0AC3DE15B", note: "Connectors, cables and audio hardware, delivered by Amazon.", cta: "Visit our store" },
  { name: "IndustryBuying", logo: "/logos/industrybuying.webp", href: "https://www.industrybuying.com/brands/setmi-india-26440/it-security-3369/networking-connecters-14410", note: "Industrial buyers can order our range with business invoicing.", cta: "Visit our store" },
];

// Systems the company shows to customers (internal ones such as OMS, ERP and attendance are left out on purpose).
export const publicSystems = [
  { name: "Sales FMS", description: "Sales orders and client billing.", url: "https://sales-fms.vercel.app", group: "Sales & Orders", icon: "records" },
  { name: "Purchase FMS", description: "Purchase orders and vendor management.", url: "https://setmi-purchase-fms.vercel.app", group: "Purchase & Production", icon: "truck" },
  { name: "Work Checklist", description: "Daily task and checklist tracking.", url: "https://work-checklist-xi.vercel.app", group: "People & Tasks", icon: "success" },
  { name: "Budget vs Actual", description: "Monthly budget tracking against actual spend.", url: "https://budget-vs-actual-three.vercel.app", group: "Finance & Reporting", icon: "quality" },
  { name: "MIS Control Center", description: "Cross-system reporting and MIS dashboards.", url: "https://mis-control-center.vercel.app", group: "Finance & Reporting", icon: "support" },
];
