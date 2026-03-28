"use client";

import { create } from "zustand";
import { PriceAlert } from "./types";

interface AlertStore {
  alerts: PriceAlert[];
  addAlert: (alert: PriceAlert) => void;
  removeAlert: (id: string) => void;
  getAlertsByProduct: (productId: string) => PriceAlert[];
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),
  removeAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  getAlertsByProduct: (productId) =>
    get().alerts.filter((a) => a.productId === productId),
}));
