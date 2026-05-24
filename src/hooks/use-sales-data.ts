"use client";

import { useState, useCallback } from "react";
import type { SalesRecord } from "@/types";

// Default sample data used until user uploads their own
export const DEFAULT_DATA: SalesRecord[] = [
  { month: "Jan", revenue: 245000, sales: 1240, orders: 892,  profit:  73500, customers:  890 },
  { month: "Feb", revenue: 189000, sales:  986, orders: 712,  profit:  56700, customers:  712 },
  { month: "Mar", revenue: 312000, sales: 1580, orders: 1124, profit:  93600, customers: 1034 },
  { month: "Apr", revenue: 276000, sales: 1390, orders: 1002, profit:  82800, customers:  945 },
  { month: "May", revenue: 398000, sales: 2010, orders: 1456, profit: 119400, customers: 1320 },
  { month: "Jun", revenue: 445000, sales: 2240, orders: 1623, profit: 133500, customers: 1490 },
  { month: "Jul", revenue: 521000, sales: 2630, orders: 1901, profit: 156300, customers: 1756 },
  { month: "Aug", revenue: 487000, sales: 2456, orders: 1778, profit: 146100, customers: 1623 },
  { month: "Sep", revenue: 563000, sales: 2840, orders: 2056, profit: 168900, customers: 1890 },
  { month: "Oct", revenue: 612000, sales: 3090, orders: 2234, profit: 183600, customers: 2056 },
  { month: "Nov", revenue: 698000, sales: 3520, orders: 2567, profit: 209400, customers: 2340 },
  { month: "Dec", revenue: 843000, sales: 4250, orders: 3089, profit: 252900, customers: 2789 },
];

// Simple module-level store (no localStorage, no server)
let globalData: SalesRecord[] = DEFAULT_DATA;
const listeners = new Set<() => void>();

export function setGlobalData(d: SalesRecord[]) {
  globalData = d;
  listeners.forEach(fn => fn());
}

export function useSalesData() {
  const [, rerender] = useState(0);

  const subscribe = useCallback(() => {
    const notify = () => rerender(n => n + 1);
    listeners.add(notify);
    return () => listeners.delete(notify);
  }, []);

  // Subscribe on mount
  useState(subscribe);

  const setData = useCallback((d: SalesRecord[]) => {
    setGlobalData(d);
  }, []);

  return { data: globalData, setData };
}
