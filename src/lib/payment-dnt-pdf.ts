import html2pdf from "html2pdf.js";
import type {
  IPaymentRequestApprovalInfo,
  IPaymentRequestFeeInfo,
} from "@/types/payment";
import type {
  IPurchaseOrderLineResponse,
  IPurchaseOrderResponse,
} from "@/types/purchase";
import { numberWithCommas, purchaseOrderLineExtendedAmount } from "@/lib/other";
import { PAYMENT_REQUEST_STATUS_APPROVED } from "@/lib/constants";

export const PAYMENT_DNT_PDF_COMPANY = {
  name: "INTERNATIONAL EDUCATIONAL SUPPLY CORPORATION",
  shortName: "IES CORP",
  address: "2/18, Đường 79, Phường Tân Hưng, Tp. HCM, Việt Nam",
  phone: "(84 - 28) 37753501/02/03 Fax: (84 - 28) 37753504",
  email: "iesservice@iesvietnam.com",
  website: "www.iesvietnam.com",
} as const;

const DNT_PDF_CONTENT_WIDTH_MM = 287;

const DNT_PDF_THEME = {
  font: "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
  ink: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  accent: "#1d4ed8",
  accentDeep: "#1e3a8a",
  surface: "#f8fafc",
  surfaceStrong: "#f1f5f9",
  tableHead: "#1e293b",
  danger: "#b91c1c",
  lineColor: "#d8dee6",
} as const;

const DNT_PDF_TABLE_COLGROUP = `<colgroup>
  <col style="width:3%" />
  <col style="width:6%" />
  <col style="width:9%" />
  <col style="width:7.5%" />
  <col style="width:28%" />
  <col style="width:5%" />
  <col style="width:5.5%" />
  <col style="width:8%" />
  <col style="width:9%" />
  <col style="width:19%" />
</colgroup>`;

type DocTypeKey =
  | "quote"
  | "invoice"
  | "receiptWarehouse"
  | "trackId"
  | "billOfLadding";

const DOC_TYPE_LABEL: Record<DocTypeKey, string> = {
  quote: "Báo giá",
  invoice: "Hóa đơn",
  receiptWarehouse: "Phiếu nhập kho",
  trackId: "Track ID",
  billOfLadding: "Vận đơn",
};

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paperCode(line: IPurchaseOrderLineResponse, type: DocTypeKey): string {
  switch (type) {
    case "invoice":
      return String(line.invoice ?? "").trim();
    case "quote":
      return String(line.quote ?? "").trim();
    case "receiptWarehouse":
      return String(line.receiptWarehouse ?? "").trim();
    case "trackId":
      return String(line.trackId ?? "").trim();
    case "billOfLadding":
      return String(line.billOfLadding ?? "").trim();
    default:
      return "";
  }
}

function poLabel(purchaseOrders: IPurchaseOrderResponse[]): string {
  if (purchaseOrders.length > 0) {
    return purchaseOrders[0].order?.contractNumber;
  }

  return "—";
}

function customerLabel(purchaseOrders: IPurchaseOrderResponse[]): string {
  if (purchaseOrders.length > 0) {
    return purchaseOrders[0].order?.customer?.code?.trim() || "—";
  }

  return "—";
}

function docCell(
  line: IPurchaseOrderLineResponse,
  selectedTypes: string[],
): { no: string; type: string } {
  for (const raw of selectedTypes) {
    const t = raw as DocTypeKey;
    if (DOC_TYPE_LABEL[t]) {
      const code = paperCode(line, t);
      if (code) return { no: code, type: DOC_TYPE_LABEL[t] };
    }
  }
  const fallbacks: DocTypeKey[] = [
    "invoice",
    "quote",
    "receiptWarehouse",
    "billOfLadding",
    "trackId",
  ];
  for (const t of fallbacks) {
    const code = paperCode(line, t);
    if (code) return { no: code, type: DOC_TYPE_LABEL[t] };
  }
  return { no: "—", type: "—" };
}

function lineVatAmount(line: IPurchaseOrderLineResponse): number {
  const tp = Number(line.totalPrice ?? 0);
  const tbt = Number(line.totalBeforeTax ?? 0);
  if (Number.isFinite(tp) && Number.isFinite(tbt) && tp >= tbt && tp > 0) {
    return Math.max(0, tp - tbt);
  }
  const base = purchaseOrderLineExtendedAmount(line);
  const taxPct = Number(line.tax ?? 0);
  if (!line.isTaxIncluded && taxPct > 0 && base > 0) {
    return Math.round((base * taxPct) / 100);
  }
  return 0;
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatVnDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatVnDateTime(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function vatPercentLabel(lines: IPurchaseOrderLineResponse[]): string {
  const rates = new Set<number>();
  for (const line of lines) {
    const tp = Number(line.totalPrice ?? 0);
    const tbt = Number(line.totalBeforeTax ?? 0);
    if (tp > 0 && tbt > 0 && tbt > 0) {
      const implied = Math.round(((tp - tbt) / tbt) * 100);
      if (implied > 0 && implied < 50) rates.add(implied);
    } else {
      const t = Number(line.tax ?? 0);
      if (t > 0) rates.add(Math.round(t));
    }
  }
  if (rates.size === 1) return `VAT ${[...rates][0]}%`;
  return "VAT";
}

function buildSignatureCells(
  approvals: IPaymentRequestApprovalInfo[] | undefined,
): {
  headDept: string;
  accountant: string;
  chief: string;
  gd: string;
} {
  const sorted = [...(approvals ?? [])].sort(
    (a, b) => Number(a.level) - Number(b.level),
  );
  const l1 = sorted.find(
    (a) =>
      Number(a.level) === 1 && a.status === PAYMENT_REQUEST_STATUS_APPROVED,
  );
  const l2 = sorted.find(
    (a) =>
      Number(a.level) === 2 && a.status === PAYMENT_REQUEST_STATUS_APPROVED,
  );
  const fmt = (a: IPaymentRequestApprovalInfo | undefined) => {
    if (!a) return "";
    const who = escapeHtml(a.updatedBy?.trim() || "—");
    const when = formatVnDateTime(a.approvedAt);
    return when
      ? `${who}<br/><span style="font-size:7.5px;color:${DNT_PDF_THEME.muted}">${when}</span>`
      : who;
  };
  return {
    headDept: "",
    accountant: fmt(l1),
    chief: fmt(l2),
    gd: "",
  };
}

export type PaymentDntPdfRow = {
  line: IPurchaseOrderLineResponse;
  selectedDocumentTypes: string[];
  purchaseOrders?: IPurchaseOrderResponse[];
};

export type PaymentDntPdfBuildParams = {
  requestNumber: string;
  requestDateIso: string;
  requestorLabel: string;
  departmentLabel: string;
  purpose: string;
  currency: string;
  paymentPercentage: number;
  amountGoods: number;
  requestedAmount: number;
  feeAmount: number;
  fees: IPaymentRequestFeeInfo[];
  totalAmountVnd: number;
  exchangeRate?: number;
  items: PaymentDntPdfRow[];
  approvals?: IPaymentRequestApprovalInfo[];
  createdBy: string;
};

export function buildPaymentDeNghiThanhToanHtml(
  p: PaymentDntPdfBuildParams,
): string {
  const t = DNT_PDF_THEME;
  const pct = Math.min(100, Math.max(0, Number(p.paymentPercentage ?? 100)));
  const scale = pct / 100;
  const hair = `0.5px solid ${t.lineColor}`;
  const cell = `border:${hair};vertical-align:middle`;
  const cellPad = "padding:6px 5px";
  const cellSm = `font-size:8px;color:${t.ink};line-height:1.35`;
  const cellWrap = `${cellSm};word-break:break-word;overflow-wrap:break-word;white-space:normal;vertical-align:top`;
  /** Long SKU / ISBN-style codes have no spaces — need break-all + anywhere so they stay in column. */
  const cellWrapCode = `${cellSm};word-break:break-all;overflow-wrap:anywhere;white-space:normal;vertical-align:top`;

  const rowsHtml = p.items
    .map((it, idx) => {
      const line = it.line;
      const lineRecord = line as unknown as Record<string, unknown>;
      const code = String(line.product?.code ?? lineRecord.productCode ?? "—");
      const name = String(
        line.productName || line.product?.name || lineRecord.name || "—",
      );
      const qty = Number(line.quantity ?? 0);
      const unit = String(line.uom1 ?? "").trim() || "—";
      const unitPrice = Number(line.unitPrice ?? 0);
      const amount =
        purchaseOrderLineExtendedAmount(line) || Number(line.totalPrice ?? 0);
      const doc = docCell(line, it.selectedDocumentTypes ?? []);
      const rowBg = idx % 2 === 0 ? "#ffffff" : t.surface;
      return `<tr style="background:${rowBg}">
        <td style="text-align:center;${cellPad};${cell};font-size:8.5px;font-variant-numeric:tabular-nums">${idx + 1}</td>
        <td style="${cellPad};${cell};${cellSm}">${escapeHtml(poLabel(it.purchaseOrders ?? []) || "—")}</td>
        <td style="${cellPad};${cell};${cellWrap}">${escapeHtml(customerLabel(it.purchaseOrders ?? []))}</td>
        <td style="${cellPad};${cell};${cellWrapCode}">${escapeHtml(code)}</td>
        <td style="${cellPad};${cell};${cellWrap}">${escapeHtml(name)}</td>
        <td style="text-align:right;${cellPad};${cell};font-size:8.5px;font-variant-numeric:tabular-nums">${formatNum(qty)}</td>
        <td style="text-align:center;${cellPad};${cell};${cellSm}">${escapeHtml(unit)}</td>
        <td style="text-align:right;${cellPad};${cell};font-size:8.5px;font-variant-numeric:tabular-nums">${formatNum(unitPrice)}</td>
        <td style="text-align:right;${cellPad};${cell};font-size:8.5px;font-weight:600;font-variant-numeric:tabular-nums;color:${t.accentDeep}">${formatNum(amount)}</td>
        <td style="${cellPad};${cell};${cellWrap}">${escapeHtml(doc.no)}</td>
      </tr>`;
    })
    .join("");

  const sumQty = p.items.reduce(
    (a, it) => a + Number(it.line.quantity ?? 0),
    0,
  );
  const vatFull = p.items.reduce((a, it) => a + lineVatAmount(it.line), 0);
  const vatScaled = Math.round(vatFull * scale);
  const pctLabel = pct >= 100 ? "100%" : `${pct}%`;
  const totalInTxnCurrency = p.requestedAmount + vatScaled + p.feeAmount;

  const issued = new Date();
  const thang = issued.getMonth() + 1;
  const headerDate = `TP. HCM, ngày ${issued.getDate()} tháng ${thang} năm ${issued.getFullYear()}`;

  const totalPayStr = `${formatNum(p.totalAmountVnd)} VND`;

  const curNorm = String(p.currency ?? "")
    .trim()
    .toUpperCase();
  const fx = Number(p.exchangeRate ?? 0);
  const showExchangeRate =
    curNorm !== "" && curNorm !== "VND" && Number.isFinite(fx) && fx > 0;
  const exchangeRateLine = showExchangeRate
    ? `1 ${escapeHtml(curNorm)} ≈ ${escapeHtml(numberWithCommas(fx))} VND`
    : "";

  const sig = buildSignatureCells(p.approvals);
  const requesterWhen = formatVnDate(p.requestDateIso);
  const requesterBlock = `${escapeHtml(p.requestorLabel)}<br/><span style="font-size:7.5px;color:${t.muted}">${escapeHtml(requesterWhen)}</span>`;

  const thLine = `0.5px solid #475569`;
  const thBase = `border:${thLine};padding:7px 5px;font-weight:700;font-size:7.5px;letter-spacing:0.06em;text-transform:uppercase;color:#f8fafc;background:${t.tableHead};vertical-align:middle`;
  const sumBorder = `border:${hair}`;
  const sumPad = "padding:6px 5px";
  const sumTopSep = `border-top:1.25px solid #94a3b8`;
  const sumLabelStrong = `${sumBorder};${sumPad};text-align:right;font-weight:700;background:${t.surfaceStrong};color:${t.ink}`;
  const sumLabelStrongSep = `${sumLabelStrong};${sumTopSep}`;
  const sumLabelSoft = `${sumBorder};${sumPad};text-align:right;background:#ffffff;color:${t.ink}`;
  const sumNum = `${sumBorder};${sumPad};text-align:right;font-variant-numeric:tabular-nums`;
  const sumCellStrongEmpty = `${sumBorder};background:${t.surfaceStrong}`;
  const sumCellStrongEmptySep = `${sumCellStrongEmpty};${sumTopSep}`;
  const sumCellSoftEmpty = `${sumBorder};background:${t.surface}`;

  const sigLbl = `padding:5px 4px 4px;font-size:6.5px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${t.muted};text-align:center`;
  const sigCell = `padding:8px 5px 10px;vertical-align:top;text-align:center;line-height:1.4;font-size:8px;color:${t.ink};border-right:${hair}`;
  const sigCellLast = sigCell.replace(
    `border-right:${hair}`,
    "border-right:none",
  );

  return `<div class="dnt-pdf-root" style="font-family:${t.font};font-size:10px;color:${t.ink};width:${DNT_PDF_CONTENT_WIDTH_MM}mm;max-width:${DNT_PDF_CONTENT_WIDTH_MM}mm;box-sizing:border-box;padding:4mm 5mm;background:#fff;-webkit-font-smoothing:antialiased">
  <div style="height:3px;background:linear-gradient(90deg,${t.accentDeep},${t.accent});border-radius:2px;margin-bottom:14px"></div>

  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
    <div style="flex:1;min-width:0;border-left:4px solid ${t.accent};padding-left:12px">
      <div style="font-weight:800;font-size:10px;letter-spacing:0.12em;color:${t.accentDeep}">${escapeHtml(PAYMENT_DNT_PDF_COMPANY.shortName)}</div>
      <div style="font-weight:700;font-size:9.5px;margin-top:4px;line-height:1.35;color:${t.ink}">${escapeHtml(PAYMENT_DNT_PDF_COMPANY.name)}</div>
      <div style="margin-top:8px;line-height:1.5;font-size:8px;color:${t.muted}">
        <div><span style="color:${t.ink};font-weight:600">Địa chỉ</span> · ${escapeHtml(PAYMENT_DNT_PDF_COMPANY.address)}</div>
        <div><span style="color:${t.ink};font-weight:600">Liên hệ</span> · ${escapeHtml(PAYMENT_DNT_PDF_COMPANY.phone)}</div>
        <div><span style="color:${t.ink};font-weight:600">Email</span> · <span style="color:${t.accent}">${escapeHtml(PAYMENT_DNT_PDF_COMPANY.email)}</span></div>
        <div><span style="color:${t.ink};font-weight:600">Website</span> · ${escapeHtml(PAYMENT_DNT_PDF_COMPANY.website)}</div>
      </div>
    </div>
    <div style="text-align:right;font-size:9px;white-space:nowrap;padding-top:4px;color:${t.muted};line-height:1.45">
      <div style="font-size:8px;letter-spacing:0.02em;text-transform:uppercase;color:${t.accentDeep};font-weight:700">Ngày lập</div>
      <div style="margin-top:4px;color:${t.ink};font-weight:500">${escapeHtml(headerDate)}</div>
    </div>
  </div>

  <div style="margin:18px 0 14px;text-align:center">
    <h1 style="margin:0;font-size:16px;font-weight:800;letter-spacing:0.12em;color:${t.ink}">ĐỀ NGHỊ THANH TOÁN</h1>
    <div style="height:3px;width:56mm;margin:10px auto 0;background:linear-gradient(90deg,transparent,${t.accent},transparent);border-radius:2px"></div>
  </div>

  <div style="border:${hair};border-radius:8px;background:${t.surface};padding:12px 14px;margin-bottom:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px 16px;font-size:9px;line-height:1.45">
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Người đề nghị</span><span style="font-weight:700;color:${t.ink}">${escapeHtml(p.requestorLabel)}</span></div>
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Bộ phận</span><span style="font-weight:700;color:${t.ink}">${escapeHtml(p.departmentLabel || "—")}</span></div>
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Thanh toán cho</span><span style="font-weight:700;color:${t.ink}">${escapeHtml(p.purpose || "—")}</span></div>
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Số chứng từ thanh toán</span><span style="font-weight:700;color:${t.accentDeep}">${escapeHtml(p.requestNumber)}</span></div>
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Tổng tiền thanh toán</span><span style="font-weight:800;color:${t.accentDeep};font-size:10px">${escapeHtml(totalPayStr)}</span></div>
      <div><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Hạn thanh toán</span><span style="font-weight:700;color:${t.ink}">${escapeHtml(formatVnDate(p.requestDateIso))}</span></div>
      ${
        showExchangeRate
          ? `<div style="grid-column:1/-1;margin-top:8px;padding-top:8px;border-top:${hair}"><span style="display:block;font-size:7.5px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${t.muted};margin-bottom:3px">Tỷ giá áp dụng</span><span style="font-weight:700;color:${t.ink}">${exchangeRateLine}</span></div>`
          : ""
      }
    </div>
  </div>

  <div style="border:${hair};border-radius:8px;overflow:hidden">
  <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:8.5px">
    ${DNT_PDF_TABLE_COLGROUP}
    <thead>
      <tr>
        <th style="${thBase}">STT</th>
        <th style="${thBase}">PO</th>
        <th style="${thBase};white-space:normal;word-break:break-word">KHÁCH HÀNG</th>
        <th style="${thBase};white-space:normal;word-break:break-all;overflow-wrap:anywhere">MÃ HÀNG</th>
        <th style="${thBase};white-space:normal;word-break:break-word">TÊN HÀNG</th>
        <th style="${thBase}">SỐ LƯỢNG</th>
        <th style="${thBase}">ĐƠN VỊ</th>
        <th style="${thBase}">ĐƠN GIÁ</th>
        <th style="${thBase}">THÀNH TIỀN</th>
        <th style="${thBase}">SỐ CHỨNG TỪ</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    <tr style="font-size:9px">
      <td colspan="5" style="${sumLabelStrongSep}">TỔNG TIỀN HÀNG</td>
      <td style="${sumLabelStrongSep};${sumNum};font-weight:700">${formatNum(sumQty)}</td>
      <td style="${sumCellStrongEmptySep}"></td>
      <td style="${sumCellStrongEmptySep}"></td>
      <td style="${sumLabelStrongSep};${sumNum};font-weight:700">${formatNum(p.amountGoods)}</td>
      <td style="${sumLabelStrongSep};${sumNum};font-weight:700">${escapeHtml(p.currency)}</td>
    </tr>
    ${
      pct < 100
        ? `<tr style="font-size:9px">
      <td colspan="5" style="${sumLabelSoft}">Phần đề nghị thanh toán (${escapeHtml(pctLabel)} trên tổng tiền hàng)</td>
      <td style="${sumLabelSoft};${sumNum}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumLabelSoft};${sumNum}">${p.requestedAmount}</td>
      <td style="${sumLabelSoft};${sumNum}">${escapeHtml(p.currency)}</td>
    </tr>`
        : ""
    }
    ${
      vatScaled > 0
        ? `<tr style="font-size:9px">
      <td colspan="5" style="${sumLabelSoft}">${escapeHtml(vatPercentLabel(p.items.map((i) => i.line)))}</td>
      <td style="${sumLabelSoft};${sumNum}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumLabelSoft};${sumNum}">${formatNum(vatScaled)}</td>
      <td style="${sumLabelSoft};${sumNum}">${escapeHtml(p.currency)}</td>
    </tr>`
        : ""
    }
    ${
      p.fees.length > 0
        ? p.fees
            .map(
              (fee) => `<tr style="font-size:9px">
      <td colspan="5" style="${sumLabelSoft}">${escapeHtml(fee.feeName)}</td>
      <td style="${sumLabelSoft};${sumNum}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumLabelSoft};${sumNum}">${fee.amount}</td>
      <td style="${sumLabelSoft};${sumNum}">${escapeHtml(p.currency)}</td>
    </tr>`,
            )
            .join("")
        : ""
    }

    ${
      p.feeAmount > 0
        ? `<tr style="font-size:9px">
      <td colspan="5" style="${sumLabelSoft}">Phí / chi phí</td>
      <td style="${sumLabelSoft};${sumNum}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumCellSoftEmpty}"></td>
      <td style="${sumLabelSoft};${sumNum}">${p.feeAmount}</td>
      <td style="${sumLabelSoft};${sumNum}">${escapeHtml(p.currency)}</td>
    </tr>`
        : ""
    }
    <tr style="font-size:9px">
      <td colspan="5" style="${sumBorder};${sumPad};text-align:right;font-weight:800;background:${t.surfaceStrong};color:${t.ink}">TỔNG TIỀN</td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;background:${t.surfaceStrong};font-variant-numeric:tabular-nums">${sumQty}</td>
      <td style="${sumBorder};background:${t.surfaceStrong}"></td>
      <td style="${sumBorder};background:${t.surfaceStrong}"></td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;background:${t.surfaceStrong};font-variant-numeric:tabular-nums">${totalInTxnCurrency}</td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;background:${t.surfaceStrong};font-variant-numeric:tabular-nums">${escapeHtml(p.currency)}</td>
    </tr>
    <tr style="font-size:9px">
      <td colspan="5" style="${sumBorder};${sumPad};text-align:right;font-weight:800;color:${t.danger};background:#fffbeb">SỐ TIỀN THANH TOÁN (${escapeHtml(pctLabel)})</td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;color:${t.danger};background:#fffbeb;font-variant-numeric:tabular-nums">${formatNum(sumQty)}</td>
      <td style="${sumBorder};background:#fffbeb"></td>
      <td style="${sumBorder};background:#fffbeb"></td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;color:${t.danger};background:#fffbeb;font-size:10px;font-variant-numeric:tabular-nums">${formatNum(p.totalAmountVnd)}</td>
      <td style="${sumBorder};${sumPad};text-align:right;font-weight:800;color:${t.danger};background:#fffbeb;font-size:10px">VND</td>
    </tr>
    </tbody>
  </table>
  </div>

  <div style="margin-top:16px;padding-top:10px;">

    <table style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:8px;border:${hair}">
      <tr>
        <td style="${sigLbl};border-right:${hair}">Người đề nghị</td>
        <td style="${sigLbl};border-right:${hair}">Trưởng bộ phận</td>
        <td style="${sigLbl};border-right:${hair}">Phụ trách kế toán</td>
        <td style="${sigLbl};border-right:${hair}">Kế toán trưởng</td>
        <td style="${sigLbl}">Tổng giám đốc</td>
      </tr>
      <tr>
        <td style="${sigCell}">${requesterBlock}</td>
        <td style="${sigCell}">${sig.headDept || "&nbsp;"}</td>
        <td style="${sigCell}">${sig.accountant || "&nbsp;"}</td>
        <td style="${sigCell}">${sig.chief || "&nbsp;"}</td>
        <td style="${sigCellLast}">${sig.gd || "&nbsp;"}</td>
      </tr>
    </table>
  </div>
  <p style="font-size:7px;color:${t.muted};margin-top:12px;text-align:center;letter-spacing:0.02em">Người lập · ${escapeHtml(p.createdBy || "—")} &nbsp;|&nbsp; Mã · ${escapeHtml(p.requestNumber)}</p>
</div>`;
}

export async function downloadPaymentDeNghiThanhToanPdf(
  params: PaymentDntPdfBuildParams,
  fileBaseName: string,
): Promise<void> {
  const html = buildPaymentDeNghiThanhToanHtml(params);
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-12000px";
  host.style.top = "0";
  host.innerHTML = html;
  document.body.appendChild(host);
  const el = host.querySelector(".dnt-pdf-root") as HTMLElement | null;
  if (!el) {
    document.body.removeChild(host);
    throw new Error("PDF template missing");
  }

  const safeName = fileBaseName.replace(/[^\w.-]+/g, "_");
  const opt = {
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename: `${safeName}.pdf`,
    image: { type: "jpeg" as const, quality: 0.92 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
  };

  try {
    await html2pdf().set(opt).from(el).save();
  } finally {
    document.body.removeChild(host);
  }
}
