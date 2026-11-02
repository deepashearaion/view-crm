/** GET /api/dashboard/sales (Go backend). */
export interface SalesDashboardDto {
  total_open_deals: number;
  total_open_deal_value: number;
  total_won: number;
  total_loss: number;
  total_new_customers: number;
  total_arr: number;
  total_mrr: number;
}

export interface SalesDashboard {
  openDeals: number;
  openDealValue: number;
  won: number;
  lost: number;
  newCustomers: number;
  arr: number;
  mrr: number;
}
