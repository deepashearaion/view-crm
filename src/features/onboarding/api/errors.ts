import { errorMessage, hasProblemCode, isHttpError } from '@/services';

import { INVOICE_PROBLEM_CODES } from '../constants';

/** True for problems that mean our cached copy of the invoice is out of date. */
export function isStaleInvoiceError(error: unknown): boolean {
  return (
    hasProblemCode(error, INVOICE_PROBLEM_CODES.notDraft) ||
    hasProblemCode(error, INVOICE_PROBLEM_CODES.notIssued) ||
    (isHttpError(error) && error.status === 404)
  );
}

/** A clear sentence for the invoice endpoints' 409/422 answers; falls back to `detail`. */
export function invoiceErrorMessage(error: unknown, fallback: string): string {
  if (hasProblemCode(error, INVOICE_PROBLEM_CODES.notDraft))
    return 'This invoice is no longer a draft (it was issued or cancelled), so it can’t be changed.';
  if (hasProblemCode(error, INVOICE_PROBLEM_CODES.notIssued))
    return 'Only issued invoices can be sent or cancelled.';
  if (hasProblemCode(error, INVOICE_PROBLEM_CODES.dealInvoiced))
    return 'This deal already has an invoice. Open it from the invoice list instead.';
  if (isHttpError(error) && error.status === 422 && error.problem?.errors?.bill_to_email)
    return 'This invoice has no valid bill-to email, so it can’t be emailed. Download the PDF and send it yourself.';
  if (isHttpError(error) && error.status === 404) return 'This invoice no longer exists.';
  return errorMessage(error, fallback);
}
