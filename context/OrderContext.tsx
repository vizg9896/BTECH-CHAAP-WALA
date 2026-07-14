"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerCoords?: { lat: number; lon: number };
  type: "Pickup" | "Delivery";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "Pending" | "Preparing" | "Out for Delivery" | "Completed" | "Cancelled";
  timestamp: string;
  notes?: string;
  isRead: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface CrmConfig {
  whatsappGroupLink: string;
  whatsappMessageTemplate: string;
  publicWebsiteUrl?: string;
}

interface OrderContextProps {
  orders: Order[];
  addOrder: (orderData: Omit<Order, "id" | "status" | "timestamp" | "isRead">) => Promise<string>;
  importOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  markOrderAsRead: (id: string) => void;
  isRestaurantOpen: boolean;
  openingTime: string;
  closingTime: string;
  updateRestaurantSettings: (isOpen: boolean, openTime: string, closeTime: string) => Promise<void>;
  isSupabaseConnected: boolean;
  menuOverrides: { [id: string]: { price?: number; image?: string } };
  updateMenuOverride: (id: string, price?: number, image?: string) => Promise<void>;
  resetMenuOverride: (id: string) => Promise<void>;
  expenses: Expense[];
  crmConfig: CrmConfig;
  addExpense: (amount: number, category: string, description: string, date: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateCrmConfig: (config: CrmConfig) => Promise<void>;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

// Helper: map Supabase row to Order object
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address ?? undefined,
    customerCoords: row.customer_coords ?? undefined,
    type: row.type,
    items: row.items,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    status: row.status,
    timestamp: row.timestamp,
    notes: row.notes ?? undefined,
    isRead: row.is_read,
  };
}

// Helper: map Order to Supabase row
function orderToRow(order: Order) {
  return {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress ?? null,
    customer_coords: order.customerCoords ?? null,
    type: order.type,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    timestamp: order.timestamp,
    notes: order.notes ?? null,
    is_read: order.isRead,
  };
}

// LocalStorage fallback keys
const LS_ORDERS = "btech_orders";
const LS_OPEN = "btech_restaurant_open";
const LS_OPENING = "btech_restaurant_opening";
const LS_CLOSING = "btech_restaurant_closing";

export const OrderContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>("11:00");
  const [closingTime, setClosingTime] = useState<string>("23:00");
  const [menuOverrides, setMenuOverrides] = useState<{ [id: string]: { price?: number; image?: string } }>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [crmConfig, setCrmConfig] = useState<CrmConfig>({
    whatsappGroupLink: "",
    whatsappMessageTemplate: "🌟 *Welcome to BTECH CHAAP WALA!* 🌟\nDear *{customerName}*,\n\nThank you for choosing us! We are absolutely thrilled to serve you today. Your order has been freshly prepared with love. ❤️\n\nHere is a copy of your invoice for *Order #{orderId}* (placed at {orderTime}):\n----------------------------------------\n{itemsList}\n----------------------------------------\n*Subtotal:* ₹{subtotal}\n*Delivery Fee:* ₹{deliveryFee}\n*Total Amount:* ₹{total}\n\n📄 *View & Download Digital Bill:* {receiptUrl}\n\nJoin our WhatsApp Community for exclusive offers, discounts, and secret menu items! 🎁👇\n👉 {whatsappGroupLink}\n\nThank you for ordering! Have a wonderful day! 🏪✨",
    publicWebsiteUrl: ""
  });
  const isSupabaseConnected = supabase !== null;

  // ─── SUPABASE LOAD ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConnected) {
      // Fallback to localStorage
      loadFromLocalStorage();
      return;
    }

    // Fetch orders from Supabase
    const fetchOrders = async () => {
      const { data, error } = await supabase!
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch orders error:", error);
        loadFromLocalStorage();
      } else {
        setOrders((data || []).map(rowToOrder));
      }
    };

    // Fetch operational settings
    const fetchSettings = async () => {
      const { data, error } = await supabase!
        .from("settings")
        .select("value")
        .eq("key", "restaurant_status")
        .single();

      if (!error && data?.value) {
        const val = data.value as any;
        setIsRestaurantOpen(val.isOpen ?? true);
        setOpeningTime(val.openingTime ?? "11:00");
        setClosingTime(val.closingTime ?? "23:00");
      }
    };

    // Fetch menu overrides
    const fetchMenuOverrides = async () => {
      const { data, error } = await supabase!
        .from("settings")
        .select("value")
        .eq("key", "menu_overrides")
        .single();

      if (!error && data?.value) {
        setMenuOverrides(data.value as any);
      }
    };

    // Fetch business expenses
    const fetchExpenses = async () => {
      const { data, error } = await supabase!
        .from("settings")
        .select("value")
        .eq("key", "expenses")
        .single();

      if (!error && data?.value) {
        setExpenses(data.value as any);
      }
    };

    // Fetch CRM settings
    const fetchCrmConfig = async () => {
      const { data, error } = await supabase!
        .from("settings")
        .select("value")
        .eq("key", "crm_config")
        .single();

      if (!error && data?.value) {
        setCrmConfig(data.value as any);
      }
    };

    fetchOrders();
    fetchSettings();
    fetchMenuOverrides();
    fetchExpenses();
    fetchCrmConfig();

    // ─── SUPABASE REALTIME SUBSCRIPTION ────────────────────────────────────
    const channel = supabase!
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = rowToOrder(payload.new);
          setOrders((prev) => {
            if (prev.some((o) => o.id === newOrder.id)) return prev;
            return [newOrder, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = rowToOrder(payload.new);
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "settings" },
        (payload) => {
          if ((payload.new as any).key === "restaurant_status") {
            const val = (payload.new as any).value;
            setIsRestaurantOpen(val.isOpen ?? true);
            setOpeningTime(val.openingTime ?? "11:00");
            setClosingTime(val.closingTime ?? "23:00");
          } else if ((payload.new as any).key === "menu_overrides") {
            const val = (payload.new as any).value;
            setMenuOverrides(val || {});
          } else if ((payload.new as any).key === "expenses") {
            const val = (payload.new as any).value;
            setExpenses(val || []);
          } else if ((payload.new as any).key === "crm_config") {
            const val = (payload.new as any).value;
            setCrmConfig(val || { whatsappGroupLink: "", whatsappMessageTemplate: "" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabaseConnected]);

  // ─── LOCALSTORAGE FALLBACK ────────────────────────────────────────────────
  const loadFromLocalStorage = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(LS_ORDERS);
    if (stored) {
      try { setOrders(JSON.parse(stored)); } catch {}
    }
    const storedOpen = localStorage.getItem(LS_OPEN);
    const storedOpening = localStorage.getItem(LS_OPENING);
    const storedClosing = localStorage.getItem(LS_CLOSING);
    if (storedOpen !== null) setIsRestaurantOpen(storedOpen === "true");
    if (storedOpening !== null) setOpeningTime(storedOpening);
    if (storedClosing !== null) setClosingTime(storedClosing);

    const storedOverrides = localStorage.getItem("btech_menu_overrides");
    if (storedOverrides) {
      try { setMenuOverrides(JSON.parse(storedOverrides)); } catch {}
    }
    const storedExpenses = localStorage.getItem("btech_expenses");
    if (storedExpenses) {
      try { setExpenses(JSON.parse(storedExpenses)); } catch {}
    }
    const storedCrmConfig = localStorage.getItem("btech_crm_config");
    if (storedCrmConfig) {
      try { setCrmConfig(JSON.parse(storedCrmConfig)); } catch {}
    }
  };

  // Listen for localStorage changes across same-device tabs (fallback mode)
  useEffect(() => {
    if (isSupabaseConnected || typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === LS_ORDERS && e.newValue) {
        try { setOrders(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === LS_OPEN && e.newValue !== null) setIsRestaurantOpen(e.newValue === "true");
      if (e.key === LS_OPENING && e.newValue !== null) setOpeningTime(e.newValue);
      if (e.key === LS_CLOSING && e.newValue !== null) setClosingTime(e.newValue);
      if (e.key === "btech_menu_overrides" && e.newValue) {
        try { setMenuOverrides(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "btech_expenses" && e.newValue) {
        try { setExpenses(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "btech_crm_config" && e.newValue) {
        try { setCrmConfig(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [isSupabaseConnected]);

  const saveLocalOrders = (updated: Order[]) => {
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
    }
  };

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  const addOrder = useCallback(async (orderData: Omit<Order, "id" | "status" | "timestamp" | "isRead">): Promise<string> => {
    let newId = "";
    if (isSupabaseConnected) {
      const { data, error } = await supabase!.rpc("get_next_order_id");
      if (!error && data) {
        newId = data as string;
      } else {
        // Fallback if RPC fails or table is empty
        const rand = Math.floor(100 + Math.random() * 900);
        newId = `BTW-F${rand}`;
      }
    } else {
      const orderSeq = 1000 + orders.length + 1;
      newId = `BTW-${orderSeq}`;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

    const newOrder: Order = {
      ...orderData,
      id: newId,
      status: "Pending",
      timestamp: formattedDate,
      isRead: false,
    };

    if (isSupabaseConnected) {
      const { error } = await supabase!.from("orders").insert([orderToRow(newOrder)]);
      if (error) {
        console.error("Supabase insert error:", error);
        saveLocalOrders([newOrder, ...orders]);
      }
    } else {
      saveLocalOrders([newOrder, ...orders]);
    }

    return newId;
  }, [isSupabaseConnected, orders]);

  const importOrder = useCallback(async (newOrder: Order) => {
    if (isSupabaseConnected) {
      // Check for duplicate
      const { data } = await supabase!
        .from("orders")
        .select("id")
        .eq("id", newOrder.id)
        .single();
      if (!data) {
        const { error } = await supabase!.from("orders").insert([orderToRow(newOrder)]);
        if (error) console.error("Supabase import error:", error);
      }
    } else {
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        const updated = [newOrder, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [isSupabaseConnected]);

  const updateOrderStatus = useCallback(async (id: string, status: Order["status"]) => {
    if (isSupabaseConnected) {
      const { error } = await supabase!
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) console.error("Supabase update status error:", error);
      // Realtime subscription will update UI automatically
    } else {
      const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
      saveLocalOrders(updated);
    }
  }, [isSupabaseConnected, orders]);

  const markOrderAsRead = useCallback((id: string) => {
    if (isSupabaseConnected) {
      supabase!.from("orders").update({ is_read: true }).eq("id", id);
      // Optimistic update
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, isRead: true } : o)));
    } else {
      const updated = orders.map((o) => (o.id === id ? { ...o, isRead: true } : o));
      saveLocalOrders(updated);
    }
  }, [isSupabaseConnected, orders]);

  const updateRestaurantSettings = useCallback(async (isOpen: boolean, openTime: string, closeTime: string) => {
    setIsRestaurantOpen(isOpen);
    setOpeningTime(openTime);
    setClosingTime(closeTime);

    if (isSupabaseConnected) {
      const { error } = await supabase!
        .from("settings")
        .update({ value: { isOpen, openingTime: openTime, closingTime: closeTime } })
        .eq("key", "restaurant_status");
      if (error) console.error("Supabase settings update error:", error);
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_OPEN, String(isOpen));
        localStorage.setItem(LS_OPENING, openTime);
        localStorage.setItem(LS_CLOSING, closeTime);
      }
    }
  }, [isSupabaseConnected]);

  // Helper to save settings row in Supabase
  const saveSupabaseSetting = async (key: string, value: any) => {
    const { data } = await supabase!
      .from("settings")
      .select("key")
      .eq("key", key);

    if (data && data.length > 0) {
      await supabase!.from("settings").update({ value }).eq("key", key);
    } else {
      await supabase!.from("settings").insert({ key, value });
    }
  };

  const updateMenuOverride = useCallback(async (id: string, price?: number, image?: string) => {
    setMenuOverrides((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          ...(price !== undefined ? { price } : {}),
          ...(image !== undefined ? { image } : {}),
        }
      };

      // If price and image overrides are both empty/undefined, remove override for this item
      if (updated[id].price === undefined && updated[id].image === undefined) {
        delete updated[id];
      }

      if (isSupabaseConnected) {
        saveSupabaseSetting("menu_overrides", updated);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("btech_menu_overrides", JSON.stringify(updated));
        }
      }

      return updated;
    });
  }, [isSupabaseConnected]);

  const resetMenuOverride = useCallback(async (id: string) => {
    setMenuOverrides((prev) => {
      const updated = { ...prev };
      delete updated[id];

      if (isSupabaseConnected) {
        saveSupabaseSetting("menu_overrides", updated);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("btech_menu_overrides", JSON.stringify(updated));
        }
      }

      return updated;
    });
  }, [isSupabaseConnected]);

  const addExpense = useCallback(async (amount: number, category: string, description: string, date: string) => {
    const newExpense: Expense = {
      id: "EXP-" + Date.now(),
      amount,
      category,
      description,
      date
    };
    setExpenses(prev => {
      const updated = [newExpense, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("btech_expenses", JSON.stringify(updated));
      }
      if (isSupabaseConnected) {
        supabase!.from("settings").upsert({ key: "expenses", value: updated }).then();
      }
      return updated;
    });
  }, [isSupabaseConnected]);

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("btech_expenses", JSON.stringify(updated));
      }
      if (isSupabaseConnected) {
        supabase!.from("settings").upsert({ key: "expenses", value: updated }).then();
      }
      return updated;
    });
  }, [isSupabaseConnected]);

  const updateCrmConfig = useCallback(async (config: CrmConfig) => {
    setCrmConfig(config);
    if (typeof window !== "undefined") {
      localStorage.setItem("btech_crm_config", JSON.stringify(config));
    }
    if (isSupabaseConnected) {
      await supabase!.from("settings").upsert({ key: "crm_config", value: config });
    }
  }, [isSupabaseConnected]);

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      importOrder,
      updateOrderStatus,
      markOrderAsRead,
      isRestaurantOpen,
      openingTime,
      closingTime,
      updateRestaurantSettings,
      isSupabaseConnected,
      menuOverrides,
      updateMenuOverride,
      resetMenuOverride,
      expenses,
      crmConfig,
      addExpense,
      deleteExpense,
      updateCrmConfig,
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderContextProvider");
  }
  return context;
};
