import { http } from '@/services';

import type { BillingProfile, BillingProfileDto, BillingProfileWriteDto } from '../types';
import { compact } from './compact';

const PATH = '/api/v1/billing-profile';

export function toBillingProfile(dto: BillingProfileDto): BillingProfile {
  return {
    legalName: dto.legal_name,
    gstin: dto.gstin,
    stateCode: dto.state_code,
    address: dto.address,
    email: dto.email,
    phone: dto.phone,
    invoicePrefix: dto.invoice_prefix,
    defaultSac: dto.default_sac,
    defaultGstRateBp: dto.default_gst_rate_bp,
    pricesIncludeGst: dto.prices_include_gst,
    paymentTermsDays: dto.payment_terms_days,
    bankDetails: dto.bank_details,
    terms: dto.terms,
    updatedAt: dto.updated_at,
  };
}

/** GET /api/v1/billing-profile (anyone). */
export async function fetchBillingProfile(signal?: AbortSignal): Promise<BillingProfile> {
  const response = await http.get<{ billing_profile: BillingProfileDto }>(PATH, { signal });
  return toBillingProfile(response.billing_profile);
}

/** PUT /api/v1/billing-profile (owner, admin, manager). Sends only the given keys. */
export async function updateBillingProfile(body: BillingProfileWriteDto): Promise<BillingProfile> {
  const response = await http.put<{ billing_profile: BillingProfileDto }>(PATH, compact(body));
  return toBillingProfile(response.billing_profile);
}
