'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Order } from '@/types/metrics';

type OrdersTableProps = {
  orders: Order[];
};

export const OrdersTable = ({ orders }: OrdersTableProps) => {
  if (orders.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Filled</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>
                {new Date(order.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{order.tradingPair}</TableCell>
              <TableCell className="uppercase">{order.orderType}</TableCell>
              <TableCell className="uppercase">{order.orderSide}</TableCell>
              <TableCell>
                {order.price ? `$${order.price.toFixed(8)}` : '-'}
              </TableCell>
              <TableCell>
                {order.quantity ? order.quantity.toFixed(8) : '-'}
              </TableCell>
              <TableCell>
                {order.filledQuantity ? order.filledQuantity.toFixed(8) : '-'}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === 'filled'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'open'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
