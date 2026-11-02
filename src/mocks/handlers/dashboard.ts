import type { SalesDashboardDto } from '@/features/dashboard';

import { db } from '../db';
import { mock } from '../router';

/** Mirrors the Go backend's sales summary, computed from the mock deals. */
mock('GET', '/api/dashboard/sales', (): SalesDashboardDto => {
  const kindOf = new Map(db.stages.map((stage) => [stage.id, stage.kind]));
  const open = db.deals.filter((deal) => kindOf.get(deal.stage_id) === 'open');
  const won = db.deals.filter((deal) => kindOf.get(deal.stage_id) === 'won');
  const wonValue = won.reduce((sum, deal) => sum + deal.value, 0);
  return {
    total_open_deals: open.length,
    total_open_deal_value: open.reduce((sum, deal) => sum + deal.value, 0),
    total_won: won.length,
    total_loss: db.deals.filter((deal) => kindOf.get(deal.stage_id) === 'lost').length,
    total_new_customers: won.length,
    total_arr: wonValue,
    total_mrr: Math.round(wonValue / 12),
  };
});
