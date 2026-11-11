/** What the contact panels need to know about a contact (a subset of contacts' Contact). */
export interface ContactRef {
  id: string;
  fullName: string;
  mobile: string;
  alternateMobile: string;
}
