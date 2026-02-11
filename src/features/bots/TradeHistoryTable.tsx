'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Trade } from '@/types/metrics';

type TradeHistoryTableProps = {
  trades: Trade[];
};

export const TradeHistoryTable = ({ trades }: TradeHistoryTableProps) => {
  if (trades.length === 0) {
    return (
      <div className="py-8 text-center italic text-muted-foreground">
        No trades recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Time</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Market</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map(trade => (
            <TableRow key={trade.id}>
              <TableCell className="font-mono text-xs">
                {new Date(trade.exchangeTimestamp).toLocaleString()}
              </TableCell>
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold uppercase ${
                    trade.tradeType.toLowerCase() === 'buy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {trade.tradeType}
                </span>
              </TableCell>
              <TableCell className="font-mono">
                $
                {Number(trade.price).toFixed(6)}
              </TableCell>
              <TableCell className="font-mono">
                {Number(trade.amount).toFixed(4)}
              </TableCell>
              <TableCell className="font-mono">
                $
                {(Number(trade.price) * Number(trade.amount)).toFixed(2)}
              </TableCell>
              <TableCell className="text-xs italic text-muted-foreground">
                {trade.market}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
