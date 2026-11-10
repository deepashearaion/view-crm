import {
  CircleCheckBig,
  CircleX,
  Flame,
  Hourglass,
  Percent,
  ReceiptIndianRupee,
  Repeat,
  Scale,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';

import { StatCard } from '@/components/data/stat-card';
import { formatPaise, plural } from '@/lib/format';

import { formatNumber, formatPercent } from '../report-format';
import type { DashboardReport } from '../types';

interface ReportKpisProps {
  report: DashboardReport | undefined;
  loading: boolean;
}

/** The dashboard report as KPI tiles. Money is paise. */
export function ReportKpis({ report, loading }: ReportKpisProps) {
  const tiles = [
    {
      label: 'Open deals',
      icon: Wallet,
      value: formatPaise(report?.openDeals.valuePaise ?? 0),
      hint: plural(report?.openDeals.count ?? 0, 'open deal'),
    },
    {
      label: 'Won',
      icon: CircleCheckBig,
      value: formatPaise(report?.won.valuePaise ?? 0),
      hint: plural(report?.won.count ?? 0, 'deal'),
    },
    {
      label: 'Lost',
      icon: CircleX,
      value: formatPaise(report?.lost.valuePaise ?? 0),
      hint: plural(report?.lost.count ?? 0, 'deal'),
    },
    {
      label: 'Win rate',
      icon: Percent,
      value: formatPercent(report?.winRatePercent ?? 0),
      hint: 'Of closed deals',
    },
    {
      label: 'Avg deal size',
      icon: Scale,
      value: formatPaise(report?.avgDealSizePaise ?? 0),
    },
    {
      label: 'Avg sales cycle',
      icon: Hourglass,
      value: `${formatNumber(report?.avgSalesCycleDays ?? 0)} days`,
    },
    { label: 'New leads', icon: Users, value: formatNumber(report?.newLeads ?? 0) },
    { label: 'Hot leads', icon: Flame, value: formatNumber(report?.hotLeads ?? 0) },
    { label: 'New customers', icon: UserPlus, value: formatNumber(report?.newCustomers ?? 0) },
    {
      label: 'Invoiced',
      icon: ReceiptIndianRupee,
      value: formatPaise(report?.invoicedPaise ?? 0),
    },
    { label: 'ARR', icon: TrendingUp, value: formatPaise(report?.arrPaise ?? 0) },
    { label: 'MRR', icon: Repeat, value: formatPaise(report?.mrrPaise ?? 0) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {tiles.map((tile) => (
        <StatCard
          key={tile.label}
          label={tile.label}
          icon={tile.icon}
          loading={loading}
          value={tile.value}
          hint={tile.hint}
        />
      ))}
    </div>
  );
}
