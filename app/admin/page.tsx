"use client";

import { useOrders, Order } from "@/context/OrderContext";
import Link from "next/link";
import { MENU_ITEMS } from "../page";
import { 
  ArrowLeft, 
  ClipboardList, 
  TrendingUp, 
  Truck, 
  Bell, 
  User, 
  MapPin, 
  Phone,
  CheckCircle2,
  Inbox,
  Shield,
  Clock,
  Power,
  Navigation,
  Search,
  Upload,
  RefreshCw,
  Sliders,
  Eye,
  Check,
  Download,
  Trash2,
  Printer,
  MessageSquare,
  X,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { 
    orders, 
    updateOrderStatus, 
    importOrder,
    markOrderAsRead,
    isRestaurantOpen,
    openingTime,
    closingTime,
    updateRestaurantSettings,
    menuOverrides,
    updateMenuOverride,
    resetMenuOverride,
    expenses,
    crmConfig,
    addExpense,
    deleteExpense,
    updateCrmConfig,
    deleteOrder
  } = useOrders();

  // Admin authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [salesPeriod, setSalesPeriod] = useState<'today' | 'yesterday' | 'weekly' | 'monthly'>('today');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Local settings states
  const [localOpen, setLocalOpen] = useState<boolean>(true);
  const [localOpening, setLocalOpening] = useState<string>("11:00");
  const [localClosing, setLocalClosing] = useState<string>("23:00");

  // Local tab selection state
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'crm'>('orders');

  // Local menu editing states
  const [editedPrices, setEditedPrices] = useState<{ [id: string]: number }>({});
  const [editedImages, setEditedImages] = useState<{ [id: string]: string }>({});
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<{ [id: string]: boolean }>({});
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCatFilter, setMenuCatFilter] = useState("all");

  // CRM States
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Ingredients & Inventory");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [crmDateRange, setCrmDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [whatsappGroupInput, setWhatsappGroupInput] = useState("");
  const [whatsappTemplateInput, setWhatsappTemplateInput] = useState("");
  const [crmPublicUrlInput, setCrmPublicUrlInput] = useState("");
  const [isCrmSaving, setIsCrmSaving] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [crmSearchQuery, setCrmSearchQuery] = useState("");

  // POS (Manual Billing) States
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posOrderType, setPosOrderType] = useState<"Pickup" | "Delivery">("Pickup");
  const [posCart, setPosCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [posSelectedItemId, setPosSelectedItemId] = useState("");
  const [posSelectedQty, setPosSelectedQty] = useState(1);
  const [isPosSubmitting, setIsPosSubmitting] = useState(false);
  const [posOrderDateTime, setPosOrderDateTime] = useState("");

  // Load authentication status on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("admin_authenticated");
      if (isAuth === "true") {
        setIsAdminAuthenticated(true);
      }
    }
  }, []);

  // Pre-select first menu item as default for manual billing POS dropdown
  useEffect(() => {
    if (MENU_ITEMS.length > 0 && !posSelectedItemId) {
      setPosSelectedItemId(MENU_ITEMS[0].id);
    }
  }, [posSelectedItemId]);

  const openPosModal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setPosOrderDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    setIsPosModalOpen(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "btechadmin") {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Access Denied.");
    }
  };

  // Helper to parse order date
  const parseOrderDate = (timestampStr: string): Date => {
    try {
      const [datePart, timePart, ampm] = timestampStr.split(" ");
      const [day, month, year] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      
      let finalHours = hours;
      if (ampm === "PM" && hours < 12) finalHours += 12;
      if (ampm === "AM" && hours === 12) finalHours = 0;
      
      return new Date(year, month - 1, day, finalHours, minutes);
    } catch (e) {
      return new Date();
    }
  };
 
  // CRM Configuration sync hook
  useEffect(() => {
    if (crmConfig) {
      setWhatsappGroupInput(crmConfig.whatsappGroupLink || "");
      let template = crmConfig.whatsappMessageTemplate || "";
      // If template is empty or missing customerName placeholder, default to the welcome template
      if (!template || !template.includes("{customerName}")) {
        template = "🌟 *Welcome to BTECH CHAAP WALA!* 🌟\nDear *{customerName}*,\n\nThank you for choosing us! We are absolutely thrilled to serve you today. Your order has been freshly prepared with love. ❤️\n\nHere is a copy of your invoice for *Order #{orderId}* (placed at {orderTime}):\n----------------------------------------\n{itemsList}\n----------------------------------------\n*Subtotal:* ₹{subtotal}\n*Delivery Fee:* ₹{deliveryFee}\n*Total Amount:* ₹{total}\n\n📄 *View & Download Digital Bill:* {receiptUrl}\n\nJoin our WhatsApp Community for exclusive offers, discounts, and secret menu items! 🎁👇\n👉 {whatsappGroupLink}\n\nThank you for ordering! Have a wonderful day! 🏪✨";
      }
      setWhatsappTemplateInput(template);
      setCrmPublicUrlInput(crmConfig.publicWebsiteUrl || "");
    }
  }, [crmConfig]);

  // CRM date range parser
  const parseDateOnly = (timestampStr: string): Date => {
    try {
      const [datePart] = timestampStr.split(" ");
      const [day, month, year] = datePart.split("-").map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return new Date();
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    // Start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const filteredSales = orders.filter(order => {
      if (order.status !== "Completed") return false;
      const orderDate = parseDateOnly(order.timestamp);
      
      if (crmDateRange === "today") {
        return orderDate.getTime() === today.getTime();
      } else if (crmDateRange === "week") {
        return orderDate.getTime() >= startOfWeek.getTime();
      } else if (crmDateRange === "month") {
        return orderDate.getTime() >= startOfMonth.getTime();
      }
      return true;
    });

    const filteredExpenses = expenses.filter(exp => {
      if (!exp.date) return false;
      const [year, month, day] = exp.date.split("-").map(Number);
      const expDateTime = new Date(year, month - 1, day).getTime();

      if (crmDateRange === "today") {
        return expDateTime === today.getTime();
      } else if (crmDateRange === "week") {
        return expDateTime >= startOfWeek.getTime();
      } else if (crmDateRange === "month") {
        return expDateTime >= startOfMonth.getTime();
      }
      return true;
    });

    return { filteredSales, filteredExpenses };
  };

  const { filteredSales, filteredExpenses } = getFilteredData();

  const totalSalesRevenue = filteredSales.reduce((sum, o) => sum + o.total, 0);
  const totalExpensesAmt = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfitAmt = totalSalesRevenue - totalExpensesAmt;
  const crmOrdersCount = filteredSales.length;
  const averageOrderValue = crmOrdersCount > 0 ? Math.round(totalSalesRevenue / crmOrdersCount) : 0;

  const handleSendWhatsAppBill = (order: Order) => {
    const itemsList = order.items.map(item => `• ${item.name} (x${item.qty}) - ₹${item.price * item.qty}`).join("\n");
    let text = whatsappTemplateInput || "";

    // If WhatsApp group link configuration is empty, dynamically strip any lines containing the group link tag or invite text
    if (!whatsappGroupInput.trim()) {
      text = text.split("\n")
        .filter(line => !line.includes("{whatsappGroupLink}") && !line.includes("WhatsApp Community") && !line.includes("WhatsApp Group"))
        .join("\n");
    }

    const currentSentTime = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).replace(/\//g, "-").replace(",", "");

    text = text.replace(/{customerName}/g, order.customerName);
    text = text.replace(/{orderId}/g, order.id);
    text = text.replace(/{itemsList}/g, itemsList);
    text = text.replace(/{subtotal}/g, order.subtotal.toString());
    text = text.replace(/{deliveryFee}/g, order.deliveryFee.toString());
    text = text.replace(/{total}/g, order.total.toString());
    text = text.replace(/{whatsappGroupLink}/g, whatsappGroupInput || "");
    text = text.replace(/{orderTime}/g, order.timestamp);
    text = text.replace(/{sentTime}/g, currentSentTime);

    const baseOrigin = crmConfig?.publicWebsiteUrl?.trim() || window.location.origin;
    const receiptUrl = `${baseOrigin}/receipt/${order.id}`;
    if (text.includes("{receiptUrl}")) {
      text = text.replace(/{receiptUrl}/g, receiptUrl);
    } else {
      text = text + `\n\n📄 *View & Download PDF Invoice:* ${receiptUrl}`;
    }

    let cleanPhone = order.customerPhone.replace(/\s+/g, "");
    if (!cleanPhone.startsWith("+") && cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    cleanPhone = cleanPhone.replace("+", "");

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }
    try {
      await addExpense(amt, expenseCategory, expenseDescription.trim(), expenseDate);
      setExpenseAmount("");
      setExpenseDescription("");
      alert("Expense logged successfully!");
    } catch (err) {
      alert("Error adding expense.");
    }
  };

  const handleSaveCrmSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCrmSaving(true);
    try {
      await updateCrmConfig({
        whatsappGroupLink: whatsappGroupInput.trim(),
        whatsappMessageTemplate: whatsappTemplateInput,
        publicWebsiteUrl: crmPublicUrlInput.trim()
      });
      alert("CRM and WhatsApp settings saved!");
    } catch (err) {
      alert("Error saving CRM configurations.");
    } finally {
      setIsCrmSaving(false);
    }
  };

  // POS Actions
  const handleAddPosItem = () => {
    if (!posSelectedItemId) return;
    // Map with dynamic menu overrides
    const baseItem = MENU_ITEMS.find(i => i.id === posSelectedItemId);
    if (!baseItem) return;

    const override = menuOverrides?.[baseItem.id];
    const resolvedPrice = override?.price !== undefined ? override.price : baseItem.price;

    setPosCart(prev => {
      const exists = prev.find(i => i.id === posSelectedItemId);
      if (exists) {
        return prev.map(i => i.id === posSelectedItemId ? { ...i, qty: i.qty + posSelectedQty } : i);
      }
      return [...prev, { id: baseItem.id, name: baseItem.name, price: resolvedPrice, qty: posSelectedQty }];
    });
    setPosSelectedQty(1);
  };

  const handleRemovePosItem = (id: string) => {
    setPosCart(prev => prev.filter(i => i.id !== id));
  };

  const handlePosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert("Please add at least one item to the order.");
      return;
    }
    const name = posCustomerName.trim() || "Offline Customer";
    const phone = posCustomerPhone.trim() || "9999999999";
    
    setIsPosSubmitting(true);
    try {
      const subtotal = posCart.reduce((sum, i) => sum + i.price * i.qty, 0);
      const deliveryFee = posOrderType === "Delivery" ? 40 : 0;
      const total = subtotal + deliveryFee;

      const orderId = `BTW-${Math.floor(100 + Math.random() * 900)}`;
      
      let timestamp = "";
      if (posOrderDateTime) {
        const d = new Date(posOrderDateTime);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        let hour = d.getHours();
        const min = String(d.getMinutes()).padStart(2, "0");
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = String(hour % 12 || 12).padStart(2, "0");
        timestamp = `${day}-${month}-${year} ${displayHour}:${min} ${ampm}`;
      } else {
        timestamp = new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }).replace(/\//g, "-").replace(",", "");
      }

      const newOrder: Order = {
        id: orderId,
        customerName: name,
        customerPhone: phone,
        type: posOrderType,
        items: posCart,
        subtotal,
        deliveryFee,
        total,
        status: "Completed",
        timestamp,
        isRead: true
      };

      await importOrder(newOrder);

      // Reset fields
      setPosCustomerName("");
      setPosCustomerPhone("");
      setPosCart([]);
      setIsPosModalOpen(false);

      // Open printable receipt automatically!
      setInvoiceOrder(newOrder);
      
      alert(`POS Invoice ${orderId} created successfully!`);
    } catch (err) {
      console.error("POS order submit error:", err);
      alert("Error generating manual POS order.");
    } finally {
      setIsPosSubmitting(false);
    }
  };

  // Hook to detect and parse order verification/import links
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("import");

    if (orderId) {
      // Check if duplicate first
      const exists = orders.some(o => o.id === orderId);
      if (exists) {
        // Clear params to avoid alerts on refresh
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
        return;
      }

      // Parse fields
      const name = params.get("name") || "Customer";
      const phone = params.get("phone") || "";
      const type = (params.get("type") as "Pickup" | "Delivery") || "Pickup";
      const total = Number(params.get("total") || 0);
      const itemsStr = params.get("items") || "";
      const notes = params.get("notes") || undefined;
      const address = params.get("address") || undefined;
      const lat = params.get("lat") ? Number(params.get("lat")) : undefined;
      const lon = params.get("lon") ? Number(params.get("lon")) : undefined;

      // Reconstruct order items with active overrides
      const parsedItems = itemsStr.split(",").map(part => {
        const [id, qtyStr] = part.split(":");
        const qty = Number(qtyStr || 1);
        const catalogItem = MENU_ITEMS.find(item => item.id === id);
        const override = menuOverrides?.[id];
        const activePrice = override?.price !== undefined ? override.price : (catalogItem ? catalogItem.price : 0);
        const activeName = catalogItem ? catalogItem.name : id;
        return {
          id,
          name: activeName,
          price: activePrice,
          qty
        };
      }).filter(item => item.id);

      const subtotal = parsedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      const deliveryFee = type === "Delivery" ? total - subtotal : 0;

      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

      const newOrder: Order = {
        id: orderId,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        customerCoords: lat && lon ? { lat, lon } : undefined,
        type,
        items: parsedItems,
        subtotal,
        deliveryFee,
        total,
        status: "Pending",
        timestamp: formattedDate,
        notes,
        isRead: false
      };

      // Import the order using context
      importOrder(newOrder);

      // Clean up URL parameters immediately
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, "", cleanUrl);

      // Alert confirmation
      alert(`✅ Order ${orderId} verified and logged successfully in the Dispatch Log!`);
    }
  }, [orders, importOrder]);

  // Sync local state when context mounts/changes
  useEffect(() => {
    setLocalOpen(isRestaurantOpen);
    setLocalOpening(openingTime);
    setLocalClosing(closingTime);
  }, [isRestaurantOpen, openingTime, closingTime]);

  // Save operational status trigger
  const handleSaveSettings = () => {
    updateRestaurantSettings(localOpen, localOpening, localClosing);
    alert("Operational settings updated successfully! Storefront has been synchronized.");
  };

  const handleSaveOverride = async (id: string) => {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (!item) return;

    const newPrice = editedPrices[id] !== undefined ? editedPrices[id] : (menuOverrides[id]?.price !== undefined ? menuOverrides[id].price : item.price);
    const newImage = editedImages[id] !== undefined ? editedImages[id] : (menuOverrides[id]?.image !== undefined ? menuOverrides[id].image : item.image);

    try {
      await updateMenuOverride(id, newPrice, newImage);
      
      setEditedPrices(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setEditedImages(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setSavedItems(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedItems(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (e) {
      alert("Error saving override changes.");
    }
  };

  const handleResetOverride = async (id: string) => {
    try {
      await resetMenuOverride(id);

      setEditedPrices(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setEditedImages(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setSavedItems(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedItems(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (e) {
      alert("Error resetting to default.");
    }
  };

  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploadingItem(id);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setEditedImages(prev => ({ ...prev, [id]: data.imageUrl }));
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading image file.");
    } finally {
      setUploadingItem(null);
    }
  };

  const handleDownloadImage = (url: string) => {
    let cleanUrl = url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        const parsed = new URL(url);
        cleanUrl = parsed.pathname;
      } catch {}
    }
    window.location.href = `/api/download-image?path=${encodeURIComponent(cleanUrl)}`;
  };

  // Mark unread orders as read when admin panel is mounted
  useEffect(() => {
    orders.forEach(order => {
      if (!order.isRead) {
        markOrderAsRead(order.id);
      }
    });
  }, [orders, markOrderAsRead]);

  // KPI Calculations
  const liveOrdersCount = orders.filter(o => o.status !== "Completed" && o.status !== "Cancelled").length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending").length;
  const completedOrdersCount = orders.filter(o => o.status === "Completed").length;
  const cancelledOrdersCount = orders.filter(o => o.status === "Cancelled").length;
  
  // Date-filtered orders for Sales Metrics
  const now = new Date();
  const todayStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;

  const filteredSalesOrders = orders.filter(order => {
    if (order.status === "Completed" || order.status === "Preparing" || order.status === "Out for Delivery" || order.status === "Pending") {
      const orderDateStr = order.timestamp.split(" ")[0]; // DD-MM-YYYY
      
      if (salesPeriod === 'today') {
        return orderDateStr === todayStr;
      } else if (salesPeriod === 'yesterday') {
        return orderDateStr === yesterdayStr;
      } else {
        const orderDate = parseOrderDate(order.timestamp);
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (salesPeriod === 'weekly') {
          return diffDays <= 7;
        } else if (salesPeriod === 'monthly') {
          return diffDays <= 30;
        }
      }
    }
    return false;
  });

  const grossSales = filteredSalesOrders.reduce((sum, o) => sum + o.total, 0);
  const salesCount = filteredSalesOrders.length;

  const activeDeliveriesCount = orders.filter(
    o => o.type === "Delivery" && o.status !== "Completed"
  ).length;

  const unreadOrdersCount = orders.filter(o => !o.isRead).length;

  // Sorting & Queue Sequence Logic
  // Active orders: newest first (latest order = highest queue number)
  // Completed & Cancelled orders: at bottom, newest first
  const isInactive = (status: string) => status === "Completed" || status === "Cancelled";
  const sortedOrders = [...orders].sort((a, b) => {
    const aActive = !isInactive(a.status);
    const bActive = !isInactive(b.status);

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    // Both active OR both inactive: newest first
    return parseOrderDate(b.timestamp).getTime() - parseOrderDate(a.timestamp).getTime();
  });

  const activeQueue = sortedOrders.filter(o => !isInactive(o.status));

  const displayedOrders = statusFilter 
    ? sortedOrders.filter(o => o.status === statusFilter)
    : sortedOrders;

  // Status helper colors
  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "Preparing":
        return "bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-orange-glow";
      case "Out for Delivery":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Completed":
        return "bg-brand-lime/10 text-brand-lime border border-brand-lime/20 shadow-lime-glow";
      case "Cancelled":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuCatFilter === "all" || item.category === menuCatFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-black text-brand-text flex items-center justify-center p-4 relative font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_60%)]"></div>
        
        <div className="glass rounded-[2rem] p-8 max-w-md w-full border border-white/10 shadow-glow text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-brand-orange/15 border border-brand-orange/30 mx-auto flex items-center justify-center text-brand-orange shadow-orange-glow animate-pulse">
            <Shield size={28} />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide">
              ADMIN ACCESS REQUIRED
            </h1>
            <p className="text-xs text-brand-text-muted">
              Please enter the administrator password to access the order panel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Admin Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-surface border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-orange text-white"
                required
                autoFocus
              />
            </div>
            
            {authError && (
              <p className="text-xs text-red-500 font-semibold mt-1">
                ❌ {authError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Link 
                href="/"
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-full text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Storefront</span>
              </Link>
              <button 
                type="submit"
                className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold py-3 rounded-full text-xs shadow-orange-glow transition-all duration-200"
              >
                Authenticate
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-text flex flex-col font-sans">
      
      {/* Admin Navbar - Glass Curved Header matching frbfitness.in */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 rounded-b-[1.5rem] px-4 py-4 shadow-glow">
        <div className="w-full px-4 md:px-8 lg:px-12 mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="w-9 h-9 rounded-full bg-brand-surface border border-white/10 hover:bg-brand-orange hover:text-black flex items-center justify-center text-brand-text-muted transition-all duration-300"
              aria-label="Back to Storefront"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <Link href="/">
                <h1 className="text-md md:text-lg font-semibold tracking-wide-brand font-heading flex items-center gap-2 hover:text-brand-orange transition-colors cursor-pointer">
                  BTECH CHAAP WALA <span className="text-brand-lime text-[10px] font-bold px-2 py-0.5 bg-brand-lime/10 rounded-full border border-brand-lime/20">Admin Panel</span>
                </h1>
              </Link>
              <p className="text-[9px] tracking-sub-brand uppercase text-brand-text-muted font-bold mt-1">Real-Time Order Monitoring Hub</p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-brand-text-muted font-medium">Jhajjar Station Hub</p>
            <p className="text-[10px] text-brand-lime font-bold uppercase tracking-wider">Live &amp; Connected</p>
          </div>
        </div>
      </nav>

      {/* Main Container - Full Bleed Grid */}
      <main className="w-full px-4 md:px-8 lg:px-12 mx-auto pt-28 pb-12 flex-1 space-y-8">
        
        {/* Dynamic Tab Switcher Header */}
        <div className="flex gap-2 border-b border-white/5 pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3.5 rounded-t-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders' 
                ? "bg-brand-surface border-t-2 border-brand-orange text-brand-orange shadow-orange-glow" 
                : "text-brand-text-muted hover:text-white"
            }`}
          >
            <ClipboardList size={14} />
            <span>Dispatch &amp; Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-3.5 rounded-t-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'menu' 
                ? "bg-brand-surface border-t-2 border-brand-lime text-brand-lime shadow-lime-glow" 
                : "text-brand-text-muted hover:text-white"
            }`}
          >
            <Sliders size={14} />
            <span>Menu Control Panel</span>
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-5 py-3.5 rounded-t-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === 'crm' 
                ? "bg-brand-surface border-t-2 border-brand-orange text-brand-orange shadow-orange-glow" 
                : "text-brand-text-muted hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            <span>CRM &amp; Analytics</span>
          </button>
        </div>

        {activeTab === 'orders' && (
          <>
        
        {/* Restaurant Status Controls (Shut Down and Operating Hours) */}
        <div className="glass rounded-[1.5rem] p-6 shadow-glow border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-orange flex items-center gap-2">
                <Clock size={16} />
                <span>Restaurant Operational Settings</span>
              </h2>
              <p className="text-xs text-brand-text-muted">Shut down order placement or adjust operational hours dynamically.</p>
            </div>
            
            {/* Status indicator */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold self-start uppercase tracking-wider border ${isRestaurantOpen ? "bg-brand-lime/15 text-brand-lime border-brand-lime/30 shadow-lime-glow" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
              {isRestaurantOpen ? "🟢 ACTIVE & OPEN" : "🔴 CLOSED / SHUT DOWN"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 1. Toggle Switch */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Manual Force Shut Down</label>
              <button 
                type="button"
                onClick={() => setLocalOpen(!localOpen)}
                className={`w-full py-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${localOpen ? "bg-brand-lime/10 text-brand-lime border-brand-lime/30 hover:bg-brand-lime/20" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"}`}
              >
                <Power size={14} />
                <span>{localOpen ? "OPEN FOR ORDERING" : "SHUT DOWN CLOSED"}</span>
              </button>
            </div>

            {/* 2. Opening Hour input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Open Timing (Daily)</label>
              <input 
                type="time" 
                value={localOpening}
                onChange={e => setLocalOpening(e.target.value)}
                className="w-full bg-brand-surface border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-orange text-white"
              />
            </div>

            {/* 3. Closing Hour input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider block">Closing Timing (Daily)</label>
              <input 
                type="time" 
                value={localClosing}
                onChange={e => setLocalClosing(e.target.value)}
                className="w-full bg-brand-surface border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-brand-orange text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold px-6 py-3 rounded-full text-xs shadow-orange-glow transition-all duration-200"
            >
              Save Operational Controls
            </button>
          </div>
        </div>

        {/* KPI Dashboard Header with Period Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-2">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-orange">
              KPI Dashboard Analytics
            </h2>
            <p className="text-xs text-brand-text-muted">Real-time revenue metrics and order dispatch counters.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Sales Filter:</span>
            <select
              value={salesPeriod}
              onChange={e => setSalesPeriod(e.target.value as any)}
              className="bg-brand-surface border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-brand-orange transition-colors cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="weekly">This Week (7 Days)</option>
              <option value="monthly">This Month (30 Days)</option>
            </select>
          </div>
        </div>

        {/* KPI Dashboard Cards Grid - Zinc rounded-[1.5rem] cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Live Orders */}
          <div className="glass rounded-[1.5rem] p-5 flex items-center justify-between shadow-glow">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block">Live Orders</span>
              <span className="text-3xl font-black font-heading text-white">{liveOrdersCount}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
              <ClipboardList size={20} />
            </div>
          </div>

          {/* Card 2: Sales (Date Filtered) */}
          <div className="glass rounded-[1.5rem] p-5 flex items-center justify-between shadow-glow">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block">
                {salesPeriod === 'today' ? "Today's Sales" : salesPeriod === 'yesterday' ? "Yesterday's Sales" : salesPeriod === 'weekly' ? "Weekly Sales" : "Monthly Sales"}
              </span>
              <span className="text-3xl font-black font-heading text-brand-orange block">₹{grossSales}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
              <TrendingUp size={20} />
            </div>
          </div>

          {/* Card 3: Active Deliveries */}
          <div className="glass rounded-[1.5rem] p-5 flex items-center justify-between shadow-glow">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block">Active Deliveries</span>
              <span className="text-3xl font-black font-heading text-white">{activeDeliveriesCount}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
              <Truck size={20} />
            </div>
          </div>

          {/* Card 4: Unread Incoming */}
          <div className="glass rounded-[1.5rem] p-5 flex items-center justify-between shadow-glow">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block">Unread Orders</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black font-heading text-white">{unreadOrdersCount}</span>
                {unreadOrdersCount > 0 && (
                  <span className="h-4.5 w-4.5 rounded-full bg-brand-lime text-brand-black text-[9px] font-black flex items-center justify-center animate-bounce shadow-lime-glow">
                    !
                  </span>
                )}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime border border-brand-lime/25">
              <Bell size={20} className={unreadOrdersCount > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
        </div>

        {/* Live Orders Table view - Glass layout */}
        <div className="glass rounded-[1.5rem] shadow-glow overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-lime flex items-center gap-2">
                <Inbox size={16} />
                <span>Incoming Order Dispatch Log</span>
              </h2>
              <button
                type="button"
                onClick={openPosModal}
                className="bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold px-4 py-2 rounded-xl text-[10px] shadow-orange-glow transition-all duration-200 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus size={12} className="stroke-[3]" />
                <span>Create Manual Order (POS)</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setStatusFilter(statusFilter === "Pending" ? null : "Pending")}
                className={`text-[10px] border px-2.5 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                  statusFilter === "Pending" 
                    ? "bg-yellow-500 text-brand-black border-yellow-500 shadow-yellow-glow" 
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                }`}
              >
                Pending: {pendingOrdersCount}
              </button>
              <button 
                onClick={() => setStatusFilter(statusFilter === "Completed" ? null : "Completed")}
                className={`text-[10px] border px-2.5 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                  statusFilter === "Completed" 
                    ? "bg-brand-lime text-brand-black border-brand-lime shadow-lime-glow" 
                    : "bg-brand-lime/10 border-brand-lime/20 text-brand-lime"
                }`}
              >
                Completed: {completedOrdersCount}
              </button>
              <button 
                onClick={() => setStatusFilter(statusFilter === "Cancelled" ? null : "Cancelled")}
                className={`text-[10px] border px-2.5 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                  statusFilter === "Cancelled" 
                    ? "bg-red-500 text-white border-red-500" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                Cancelled: {cancelledOrdersCount}
              </button>
              <button 
                onClick={() => setStatusFilter(null)}
                className={`text-[10px] border px-3 py-1 rounded-full font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                  statusFilter === null 
                    ? "bg-white text-brand-black border-white" 
                    : "bg-brand-black/50 border-white/10 text-brand-text-muted"
                }`}
              >
                All: {orders.length}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-brand-text-muted space-y-3">
                <CheckCircle2 size={42} className="mx-auto text-brand-lime/55 animate-pulse" />
                <p className="text-sm font-semibold">No live orders logged yet.</p>
                <p className="text-xs">Incoming orders from the website will automatically sync here in real time.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-brand-black/40 text-[10px] font-extrabold uppercase text-brand-text-muted tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Order Items &amp; Qty</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayedOrders.map(order => {
                    const queuePos = activeQueue.findIndex(o => o.id === order.id);

                    return (
                      <tr 
                        key={order.id}
                        className={`hover:bg-white/[0.01] transition-colors text-xs ${!order.isRead ? "bg-brand-lime/5" : ""}`}
                      >
                        {/* ID */}
                        <td className="px-6 py-5 font-mono font-bold text-brand-orange">
                          {order.id}
                          <span className="text-[9px] text-brand-text-muted block font-sans font-medium mt-1">
                            {order.timestamp}
                          </span>
                          {order.status === "Cancelled" ? (
                            <span className="bg-red-500/10 text-red-400 text-[9px] px-2 py-0.5 rounded-full font-black border border-red-500/20 block w-max mt-2">
                              ❌ Cancelled
                            </span>
                          ) : order.status === "Completed" ? (
                            <span className="bg-brand-lime/10 text-brand-lime text-[9px] px-2 py-0.5 rounded-full font-black border border-brand-lime/20 block w-max mt-2 shadow-lime-glow">
                              ✅ Completed
                            </span>
                          ) : (
                            <span className="bg-brand-orange/15 text-brand-orange text-[9px] px-2 py-0.5 rounded-full font-black border border-brand-orange/25 block w-max mt-2 shadow-orange-glow animate-pulse">
                              Queue #{activeQueue.length - queuePos}
                            </span>
                          )}
                        </td>

                        {/* Customer info */}
                        <td className="px-6 py-5">
                          <div className="space-y-1.5 max-w-[220px]">
                            <div className="font-bold flex items-center gap-1.5 text-white">
                              <User size={13} className="text-brand-orange" />
                              <span>{order.customerName}</span>
                            </div>
                            <div className="text-[10px] text-brand-text-muted flex items-center gap-1.5 font-mono">
                              <Phone size={11} className="text-brand-text-muted" />
                              <span>{order.customerPhone}</span>
                            </div>
                            {order.type === "Delivery" && order.customerAddress && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress + ", Jhajjar, Haryana")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-brand-text-muted flex items-start gap-1.5 mt-2 bg-brand-black/40 p-2 rounded-xl border border-white/5 leading-relaxed hover:border-brand-orange/45 hover:text-white transition-colors block cursor-pointer"
                                title="Click to search address in Google Maps"
                              >
                                <MapPin size={10} className="text-brand-orange mt-0.5 flex-shrink-0" />
                                <span className="break-all">{order.customerAddress} ↗</span>
                              </a>
                            )}
                            
                            {/* Navigation button if GPS coords are present */}
                            {order.type === "Delivery" && order.customerCoords && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${order.customerCoords.lat},${order.customerCoords.lon}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-brand-orange bg-brand-orange/10 border border-brand-orange/20 px-2.5 py-1.5 rounded-lg hover:bg-brand-orange hover:text-black transition-all mt-2.5 duration-200"
                              >
                                <Navigation size={10} className="animate-pulse" />
                                <span>Navigate GPS Location</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Items lists */}
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center gap-4 bg-brand-black/40 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/90 border border-white/5">
                                <span>{item.name}</span>
                                <span className="text-brand-orange font-bold font-mono">x{item.qty}</span>
                              </div>
                            ))}
                            {order.notes && (
                              <div className="text-[10px] text-yellow-400/90 italic mt-2 leading-tight">
                                📝 Notes: "{order.notes}"
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${order.type === "Delivery" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                            {order.type === "Delivery" ? "🛵 Delivery" : "Store"}
                          </span>
                        </td>

                        {/* Total price */}
                        <td className="px-6 py-5 font-black text-brand-orange text-sm font-heading">
                          ₹{order.total}
                        </td>

                        {/* Action status selector */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className={`text-[11px] font-extrabold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer border hover:border-brand-orange transition-all bg-brand-surface-elevated ${getStatusBadgeClass(order.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Completed">✅ Completed</option>
                              <option value="Cancelled">❌ Cancelled</option>
                            </select>

                            <div className="flex gap-1.5 mt-1 sm:mt-0">
                              <button
                                type="button"
                                onClick={() => setInvoiceOrder(order)}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-white/5 cursor-pointer"
                                title="Print Invoice"
                              >
                                <Printer size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppBill(order)}
                                className="p-2 rounded-lg bg-brand-lime/10 hover:bg-brand-lime hover:text-black text-brand-lime transition-all border border-brand-lime/20 cursor-pointer shadow-lime-glow"
                                title="Send WhatsApp Bill"
                              >
                                <MessageSquare size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrderToDelete(order)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all border border-red-500/20 cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            {/* Header controls card */}
            <div className="glass rounded-[1.5rem] p-6 shadow-glow border border-white/5 space-y-5">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-orange flex items-center gap-2">
                  <Sliders size={16} />
                  <span>Menu Price &amp; Image Editor</span>
                </h2>
                <p className="text-xs text-brand-text-muted">Customize product prices and imagery. Changes synchronize immediately across storefront users.</p>
              </div>

              {/* Filters search */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center pt-2">
                <div className="relative max-w-md w-full">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-muted">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search catalog items..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-brand-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-brand-text-muted outline-none focus:border-brand-orange transition-colors"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3.5 py-1.5 rounded-full shadow-orange-glow">
                    Showing {filteredMenuItems.length} / {MENU_ITEMS.length} Items
                  </span>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-white/5 pt-4">
                {[
                  { id: "all", label: "All Items" },
                  { id: "specials", label: "Specials" },
                  { id: "chaap", label: "Chaap" },
                  { id: "salad", label: "Salad" },
                  { id: "starters", label: "Starters" },
                  { id: "main", label: "Main" },
                  { id: "breads", label: "Breads" },
                  { id: "snack", label: "Snack" },
                  { id: "rolls", label: "Rolls" },
                  { id: "accompaniments", label: "Accompaniments" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMenuCatFilter(tab.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      menuCatFilter === tab.id 
                        ? "bg-brand-surface border-brand-lime text-brand-lime shadow-lime-glow" 
                        : "glass text-brand-text-muted border-white/5 hover:border-white/15"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="glass rounded-[1.5rem] p-20 text-center text-brand-text-muted space-y-2">
                <Search size={32} className="mx-auto text-brand-text-muted/40" />
                <p className="text-sm font-semibold">No catalog items found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMenuItems.map(item => {
                  const activePrice = editedPrices[item.id] !== undefined 
                    ? editedPrices[item.id] 
                    : (menuOverrides[item.id]?.price !== undefined ? menuOverrides[item.id].price : item.price);

                  const activeImage = editedImages[item.id] !== undefined 
                    ? editedImages[item.id] 
                    : (menuOverrides[item.id]?.image !== undefined ? menuOverrides[item.id].image : item.image);

                  const isEdited = menuOverrides[item.id]?.price !== undefined || menuOverrides[item.id]?.image !== undefined;
                  const isPendingSave = editedPrices[item.id] !== undefined || editedImages[item.id] !== undefined;

                  return (
                    <div 
                      key={item.id} 
                      className="glass rounded-[1.5rem] p-5 flex flex-col justify-between shadow-glow relative border border-white/5 hover:border-white/10 transition-all duration-300 group"
                    >
                      {/* Overrides indicators */}
                      <div className="absolute top-3 right-3 flex gap-1 z-10">
                        {isEdited && (
                          <span className="bg-brand-lime/10 text-brand-lime text-[9px] px-2 py-0.5 rounded-full font-black border border-brand-lime/20 shadow-lime-glow">
                            Custom
                          </span>
                        )}
                        {isPendingSave && (
                          <span className="bg-yellow-500/10 text-yellow-400 text-[9px] px-2 py-0.5 rounded-full font-black border border-yellow-500/20 animate-pulse">
                            Edited
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Image Preview & Upload overlay */}
                        <div className="relative w-full h-36 bg-brand-black/60 rounded-xl overflow-hidden border border-white/5">
                          <img 
                            src={activeImage} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/soya_roll.png";
                            }}
                          />
                          
                          {/* Image Upload Button Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`upload-${item.id}`)?.click()}
                              className="p-2 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-black transition-colors flex items-center justify-center cursor-pointer shadow-orange-glow"
                              title="Upload Photo"
                            >
                              <Upload size={14} />
                            </button>
                            <input
                              type="file"
                              id={`upload-${item.id}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(item.id, e)}
                            />

                            <button
                              type="button"
                              onClick={() => handleDownloadImage(activeImage)}
                              className="p-2 rounded-full bg-brand-lime hover:bg-brand-lime/80 text-black transition-colors flex items-center justify-center cursor-pointer shadow-lime-glow"
                              title="Download Photo"
                            >
                              <Download size={14} />
                            </button>
                          </div>

                          {uploadingItem === item.id && (
                            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-[10px] text-brand-orange font-bold gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-brand-orange"></div>
                              <span>Uploading...</span>
                            </div>
                          )}
                        </div>

                        {/* Title details */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold uppercase text-brand-lime bg-brand-lime/10 px-2 py-0.5 rounded border border-brand-lime/20 inline-block">
                            {item.category}
                          </span>
                          <h3 className="text-[11px] font-bold text-white leading-relaxed line-clamp-1" title={item.name}>
                            {item.name}
                          </h3>
                          <p className="text-[9px] text-brand-text-muted">
                            Default: ₹{item.price}
                          </p>
                        </div>

                        {/* Control fields */}
                        <div className="space-y-3.5 pt-2 border-t border-white/5">
                          {/* Edit price */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={editedPrices[item.id] !== undefined ? editedPrices[item.id] : (menuOverrides[item.id]?.price !== undefined ? menuOverrides[item.id].price : item.price)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditedPrices(prev => ({ ...prev, [item.id]: val }));
                              }}
                              className="w-full bg-brand-surface border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-brand-orange"
                            />
                          </div>

                          {/* Edit image URL */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-brand-text-muted uppercase tracking-wider block">Image path</label>
                            <input
                              type="text"
                              value={editedImages[item.id] !== undefined ? editedImages[item.id] : (menuOverrides[item.id]?.image !== undefined ? menuOverrides[item.id].image : item.image)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditedImages(prev => ({ ...prev, [item.id]: val }));
                              }}
                              placeholder="/image.png"
                              className="w-full bg-brand-surface border border-white/10 rounded-xl p-2 text-[10px] text-white placeholder-brand-text-muted outline-none focus:border-brand-orange"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-3.5 mt-3.5 border-t border-white/5">
                        {isEdited && (
                          <button
                            type="button"
                            onClick={() => handleResetOverride(item.id)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2.5 rounded-xl text-[10px] transition-colors flex items-center justify-center cursor-pointer"
                            title="Reset to original default specs"
                          >
                            <RefreshCw size={11} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSaveOverride(item.id)}
                          disabled={!isPendingSave && !isEdited}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                            savedItems[item.id]
                              ? "bg-brand-lime text-black shadow-lime-glow font-black"
                              : isPendingSave
                              ? "bg-brand-orange text-black hover:bg-brand-orange-hover shadow-orange-glow"
                              : "bg-zinc-800/40 text-brand-text-muted border border-white/5 cursor-not-allowed"
                          }`}
                        >
                          {savedItems[item.id] ? (
                            <>
                              <Check size={11} />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Sliders size={11} />
                              <span>Save changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CRM & Analytics Panel */}
        {activeTab === 'crm' && (
          <div className="space-y-8 animate-fade-in">
            {/* Analytics Date Selector Header */}
            <div className="glass rounded-[1.5rem] p-6 shadow-glow border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-orange flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>CRM &amp; Sales Analytics</span>
                </h2>
                <p className="text-xs text-brand-text-muted mt-1">Real-time dynamic breakdown of revenues, profits, and expense reports.</p>
              </div>
              <div className="flex gap-1.5 bg-brand-black/60 border border-white/5 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' }
                ].map(period => (
                  <button
                    key={period.id}
                    onClick={() => setCrmDateRange(period.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-200 cursor-pointer ${
                      crmDateRange === period.id 
                        ? "bg-brand-orange text-black shadow-orange-glow" 
                        : "text-brand-text-muted hover:text-white"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass rounded-[1.25rem] p-4 border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-brand-orange/20"><TrendingUp size={36} /></div>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Gross Revenue</p>
                <p className="text-xl font-black text-white font-mono">₹{totalSalesRevenue}</p>
              </div>

              <div className="glass rounded-[1.25rem] p-4 border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-brand-lime/20"><Sliders size={36} /></div>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Expenses</p>
                <p className="text-xl font-black text-white font-mono">₹{totalExpensesAmt}</p>
              </div>

              <div className={`glass rounded-[1.25rem] p-4 border space-y-2 relative overflow-hidden ${netProfitAmt >= 0 ? "border-brand-lime/10 shadow-lime-glow/10" : "border-red-500/10 shadow-red-glow/10"}`}>
                <div className="absolute top-2 right-2 text-brand-lime/20"><CheckCircle2 size={36} /></div>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Net Profit</p>
                <p className={`text-xl font-black font-mono ${netProfitAmt >= 0 ? "text-brand-lime shadow-lime-glow" : "text-red-400"}`}>
                  {netProfitAmt >= 0 ? "+" : ""}₹{netProfitAmt}
                </p>
              </div>

              <div className="glass rounded-[1.25rem] p-4 border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-brand-orange/20"><ClipboardList size={36} /></div>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Orders Completed</p>
                <p className="text-xl font-black text-white font-mono">{crmOrdersCount}</p>
              </div>

              <div className="glass rounded-[1.25rem] p-4 border border-white/5 space-y-2 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-brand-lime/20"><User size={36} /></div>
                <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Avg Order Value</p>
                <p className="text-xl font-black text-white font-mono">₹{averageOrderValue}</p>
              </div>
            </div>

            {/* Split Screen Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Expense Logging & Logs (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="glass rounded-[1.5rem] p-6 border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-orange flex items-center gap-2 border-b border-white/5 pb-3">
                    <span>Log Business Expense</span>
                  </h3>
                  <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-text-muted uppercase">Expense Date</label>
                        <input
                          type="date"
                          value={expenseDate}
                          onChange={(e) => setExpenseDate(e.target.value)}
                          className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-text-muted uppercase">Amount (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1500"
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-text-muted uppercase">Category</label>
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                      >
                        <option value="Ingredients & Inventory">Ingredients &amp; Inventory</option>
                        <option value="Rent">Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-text-muted uppercase">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Gas cylinder, Rent advance, etc."
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold rounded-xl text-xs shadow-orange-glow transition-all"
                    >
                      Log Expense Entry
                    </button>
                  </form>
                </div>

                {/* Expense List Table */}
                <div className="glass rounded-[1.5rem] p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Expense History Ledger</h3>
                    <span className="text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded text-brand-text-muted">
                      {filteredExpenses.length} Records
                    </span>
                  </div>
                  
                  {filteredExpenses.length === 0 ? (
                    <p className="text-center py-8 text-xs text-brand-text-muted font-medium">No expenses logged for this range.</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 select-none">
                      {filteredExpenses.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-brand-black/40 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-white">{exp.description}</span>
                              <span className="text-[8px] bg-brand-orange/15 text-brand-orange border border-brand-orange/25 px-1.5 py-0.2 rounded font-black uppercase">
                                {exp.category}
                              </span>
                            </div>
                            <p className="text-[8px] text-brand-text-muted font-mono">{exp.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-white font-mono">₹{exp.amount}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this expense record?")) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: CRM settings & Customer base (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* CRM Settings configuration */}
                <div className="glass rounded-[1.5rem] p-6 border border-white/5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-lime flex items-center gap-2 border-b border-white/5 pb-3">
                    <span>WhatsApp CRM Configuration</span>
                  </h3>
                  <form onSubmit={handleSaveCrmSettings} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-text-muted uppercase">WhatsApp Community Group Link</label>
                      <input
                        type="url"
                        placeholder="https://chat.whatsapp.com/..."
                        value={whatsappGroupInput}
                        onChange={(e) => setWhatsappGroupInput(e.target.value)}
                        className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-lime"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-text-muted uppercase">Public Website URL (for billing links)</label>
                      <input
                        type="url"
                        placeholder="e.g. https://btechchaapwala.vercel.app or https://your-ngrok.ngrok-free.app"
                        value={crmPublicUrlInput}
                        onChange={(e) => setCrmPublicUrlInput(e.target.value)}
                        className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-lime"
                      />
                      <p className="text-[8px] text-brand-text-muted">Input your public domain or ngrok tunnel URL so your customers can view the bill on their phone. Defaults to local server if left blank.</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-brand-text-muted uppercase">WhatsApp Invoice Message Template</label>
                        <span className="text-[8px] text-brand-text-muted">Placeholders: {"{customerName}, {orderId}, {itemsList}, {total}, {whatsappGroupLink}, {receiptUrl}, {orderTime}, {sentTime}"}</span>
                      </div>
                      <textarea
                        value={whatsappTemplateInput}
                        onChange={(e) => setWhatsappTemplateInput(e.target.value)}
                        rows={6}
                        className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-lime font-sans resize-y"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setWhatsappTemplateInput("🌟 *Welcome to BTECH CHAAP WALA!* 🌟\nDear *{customerName}*,\n\nThank you for choosing us! We are absolutely thrilled to serve you today. Your order has been freshly prepared with love. ❤️\n\nHere is a copy of your invoice for *Order #{orderId}* (placed at {orderTime}):\n----------------------------------------\n{itemsList}\n----------------------------------------\n*Subtotal:* ₹{subtotal}\n*Delivery Fee:* ₹{deliveryFee}\n*Total Amount:* ₹{total}\n\n📄 *View & Download Digital Bill:* {receiptUrl}\n\nJoin our WhatsApp Community for exclusive offers, discounts, and secret menu items! 🎁👇\n👉 {whatsappGroupLink}\n\nThank you for ordering! Have a wonderful day! 🏪✨");
                          alert("Template reset to default. Click 'Save CRM Configurations' to save changes.");
                        }}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Reset Template
                      </button>
                      <button
                        type="submit"
                        disabled={isCrmSaving}
                        className="flex-1 py-3 bg-brand-lime hover:bg-brand-lime/80 text-black font-extrabold rounded-xl text-xs shadow-lime-glow transition-all cursor-pointer"
                      >
                        {isCrmSaving ? "Saving Config..." : "Save CRM Configurations"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Customer Database summary */}
                <div className="glass rounded-[1.5rem] p-6 border border-white/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Loyal Customer Base</h3>
                    <input
                      type="text"
                      placeholder="Search customer name/phone..."
                      value={crmSearchQuery}
                      onChange={(e) => setCrmSearchQuery(e.target.value)}
                      className="bg-brand-black border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white outline-none focus:border-brand-orange placeholder-brand-text-muted"
                    />
                  </div>

                  {/* Extract unique customers list dynamically */}
                  {(() => {
                    const customerMap: { [phone: string]: { name: string; count: number; spend: number; lastOrder: Order } } = {};
                    orders.forEach(order => {
                      if (order.status !== "Completed") return;
                      const cleanPhone = order.customerPhone.trim();
                      if (!customerMap[cleanPhone]) {
                        customerMap[cleanPhone] = { name: order.customerName, count: 0, spend: 0, lastOrder: order };
                      }
                      customerMap[cleanPhone].count += 1;
                      customerMap[cleanPhone].spend += order.total;
                      if (parseDateOnly(order.timestamp) >= parseDateOnly(customerMap[cleanPhone].lastOrder.timestamp)) {
                        customerMap[cleanPhone].lastOrder = order;
                      }
                    });

                    const customersList = Object.entries(customerMap).map(([phone, info]) => ({
                      phone,
                      ...info
                    })).filter(c => {
                      const q = crmSearchQuery.toLowerCase().trim();
                      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
                    }).sort((a, b) => b.spend - a.spend);

                    if (customersList.length === 0) {
                      return <p className="text-center py-8 text-xs text-brand-text-muted font-medium">No loyal customers detected yet.</p>;
                    }

                    return (
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                        {customersList.map((customer) => (
                          <div key={customer.phone} className="flex justify-between items-center p-3 rounded-xl bg-brand-black/40 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-white flex items-center gap-1.5">
                                <User size={10} className="text-brand-orange" />
                                <span>{customer.name}</span>
                              </p>
                              <p className="text-[8px] text-brand-text-muted font-mono">{customer.phone}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-[9px] font-bold space-y-0.5">
                                <p className="text-white">{customer.count} Order(s)</p>
                                <p className="text-brand-lime font-mono">₹{customer.spend} Total Spend</p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceOrder(customer.lastOrder)}
                                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer border border-white/5"
                                  title="Print Last Invoice"
                                >
                                  <Printer size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsAppBill(customer.lastOrder)}
                                  className="p-2 rounded-lg bg-brand-lime/10 hover:bg-brand-lime hover:text-black text-brand-lime transition-all border border-brand-lime/20 cursor-pointer shadow-lime-glow"
                                  title="WhatsApp Last Bill"
                                >
                                  <MessageSquare size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invoice HTML Print-friendly Modal overlay */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .print-hidden {
                display: none !important;
                visibility: hidden !important;
              }
              #thermal-receipt, #thermal-receipt * {
                visibility: visible !important;
              }
              #thermal-receipt {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `}} />

          <div className="bg-white text-black rounded-2xl border border-zinc-200 p-6 max-w-sm w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setInvoiceOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer print-hidden"
              title="Close modal"
            >
              <X size={16} />
            </button>

            {/* Print Area container */}
            <div id="thermal-receipt" className="space-y-5 font-mono text-[11px] text-zinc-800 pt-2 leading-relaxed">
              {/* Logo / Header */}
              <div className="text-center space-y-1">
                <h1 className="text-sm font-black tracking-wide text-black uppercase">BTECH CHAAP WALA</h1>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">--- Soya Chaap Specialists ---</p>
                <p className="text-[9px] text-zinc-500 mt-1">Bhagat Singh Chowk, Jhajjar, Haryana</p>
                <p className="text-[9px] text-zinc-500">Phone: +91 90531 60031</p>
              </div>

              {/* Dotted line */}
              <div className="border-t border-dashed border-zinc-300"></div>

              {/* Order Info */}
              <div className="space-y-1 text-[10px]">
                <p className="flex justify-between">
                  <span className="font-bold">INVOICE:</span>
                  <span className="font-black text-black">{invoiceOrder.id}</span>
                </p>
                <p className="flex justify-between">
                  <span>DATE:</span>
                  <span>{invoiceOrder.timestamp}</span>
                </p>
                <p className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-bold text-black uppercase">{invoiceOrder.customerName}</span>
                </p>
                <p className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{invoiceOrder.customerPhone}</span>
                </p>
                <p className="flex justify-between">
                  <span>TYPE:</span>
                  <span className="font-bold">{invoiceOrder.type.toUpperCase()}</span>
                </p>
              </div>

              {/* Dotted line */}
              <div className="border-t border-dashed border-zinc-300"></div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between font-black text-black text-[10px]">
                  <span>ITEM DESCRIPTION</span>
                  <span className="w-16 text-right">TOTAL</span>
                </div>
                {invoiceOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <div className="space-y-0.5">
                      <p className="font-bold text-black">{item.name}</p>
                      <p className="text-zinc-500 text-[9px]">{item.qty} x ₹{item.price}</p>
                    </div>
                    <span className="font-bold font-mono self-end">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Dotted line */}
              <div className="border-t border-dashed border-zinc-300"></div>

              {/* Bill Totals Summary */}
              <div className="space-y-1 text-[10px] text-right font-mono pr-1">
                <p className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>₹{invoiceOrder.subtotal}</span>
                </p>
                {invoiceOrder.deliveryFee > 0 && (
                  <p className="flex justify-between">
                    <span>DELIVERY FEE:</span>
                    <span>₹{invoiceOrder.deliveryFee}</span>
                  </p>
                )}
                <p className="flex justify-between font-black text-black text-[11px] pt-1">
                  <span>GRAND TOTAL:</span>
                  <span>₹{invoiceOrder.total}</span>
                </p>
              </div>

              {/* Dotted line */}
              <div className="border-t border-dashed border-zinc-300"></div>

              {/* Footer */}
              <div className="text-center space-y-1 pt-1.5">
                <p className="text-[10px] font-black text-black uppercase">Hope you love our dishes! ❤️</p>
                <p className="text-[8px] text-zinc-500">For home delivery, call us directly.</p>
                <p className="text-[8px] text-zinc-400 font-sans tracking-wide">Btech Chaap Wala Dispatch Hub</p>
              </div>
            </div>

            {/* Print Action Trigger Buttons */}
            <div className="flex flex-col gap-2 mt-6 print-hidden">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="flex-1 py-3 border border-zinc-300 hover:bg-zinc-50 font-bold rounded-xl text-xs text-zinc-700 transition-colors cursor-pointer"
                >
                  Close Receipt
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold rounded-xl text-xs shadow-orange-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print Receipt</span>
                </button>
              </div>
              <p className="text-[9px] text-zinc-400 text-center font-sans mt-1.5 leading-relaxed bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                ℹ️ <strong>Sending PDF on WhatsApp:</strong> Click <strong>Print Receipt</strong> &rarr; change Destination printer to <strong>Save as PDF</strong>. Once saved, drag &amp; drop the PDF file into your WhatsApp chat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal Overlay */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in print-hidden">
          <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-6 max-w-sm w-full shadow-glow space-y-6 relative text-center">
            <button
              type="button"
              onClick={() => setOrderToDelete(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
              title="Cancel"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 mx-auto flex items-center justify-center text-red-500 shadow-red-glow animate-pulse">
              <Trash2 size={24} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-md font-bold uppercase text-white tracking-wide font-heading">
                Delete Order
              </h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Are you sure you want to permanently delete order <span className="text-brand-orange font-bold font-mono">{orderToDelete.id}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-red-glow cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Manual Billing Modal Overlay */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in print-hidden">
          <div className="bg-brand-surface border border-white/10 rounded-[2rem] p-6 max-w-2xl w-full shadow-glow space-y-6 relative max-h-[90vh] overflow-y-auto scrollbar-hide text-left">
            <button
              type="button"
              onClick={() => setIsPosModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full hover:bg-white/10 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
              title="Close POS"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h2 className="text-md sm:text-lg font-black uppercase text-brand-orange flex items-center gap-2">
                <Plus size={18} className="stroke-[3]" />
                <span>Create Manual Order (POS)</span>
              </h2>
              <p className="text-xs text-brand-text-muted">Place offline order to generate invoice and record transaction.</p>
            </div>

            <form onSubmit={handlePosSubmit} className="space-y-6">
              {/* Customer Details block */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-black/40 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-brand-text-muted uppercase">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in Customer"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-brand-text-muted uppercase">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9053160031"
                    value={posCustomerPhone}
                    onChange={(e) => setPosCustomerPhone(e.target.value)}
                    className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-brand-text-muted uppercase">Order Type</label>
                  <select
                    value={posOrderType}
                    onChange={(e) => setPosOrderType(e.target.value as any)}
                    className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                  >
                    <option value="Pickup">Self-Pickup / Dining</option>
                    <option value="Delivery">Home Delivery (adds ₹40)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-brand-text-muted uppercase">Order Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={posOrderDateTime}
                    onChange={(e) => setPosOrderDateTime(e.target.value)}
                    className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-orange"
                    required
                  />
                </div>
              </div>

              {/* Item Selection block */}
              <div className="glass p-5 rounded-2xl border border-white/5 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-lime">Add Items to Bill</h4>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-[9px] font-bold text-brand-text-muted uppercase">Select Soya Speciality Dish</label>
                    <select
                      value={posSelectedItemId}
                      onChange={(e) => setPosSelectedItemId(e.target.value)}
                      className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-lime"
                    >
                      {MENU_ITEMS.map(item => {
                        const override = menuOverrides?.[item.id];
                        const price = override?.price !== undefined ? override.price : item.price;
                        return (
                          <option key={item.id} value={item.id}>
                            {item.name} - ₹{price} ({item.category.toUpperCase()})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[9px] font-bold text-brand-text-muted uppercase">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={posSelectedQty}
                      onChange={(e) => setPosSelectedQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-brand-surface border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-lime font-mono text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPosItem}
                    className="px-6 py-2.5 bg-brand-lime hover:bg-brand-lime/80 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lime-glow flex-shrink-0"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* POS Cart Ledger */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Basket items list</h4>
                {posCart.length === 0 ? (
                  <p className="text-center py-6 text-xs text-brand-text-muted border border-dashed border-white/10 rounded-2xl">
                    No items added to basket yet.
                  </p>
                ) : (
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-brand-black/20">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white/[0.02] border-b border-white/5 font-bold uppercase text-[9px] text-brand-text-muted">
                        <tr>
                          <th className="px-4 py-3">Item Description</th>
                          <th className="px-4 py-3 text-center">Unit Price</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                          <th className="px-4 py-3 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-white/95">
                        {posCart.map(item => (
                          <tr key={item.id} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-3 font-bold">{item.name}</td>
                            <td className="px-4 py-3 text-center font-mono">₹{item.price}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.qty}</td>
                            <td className="px-4 py-3 text-right font-black text-brand-orange font-mono">₹{item.price * item.qty}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemovePosItem(item.id)}
                                className="text-red-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Checkout Math calculation */}
              {posCart.length > 0 && (
                <div className="bg-brand-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-end gap-1.5 text-xs text-right pr-4">
                  <p className="flex justify-between w-64">
                    <span className="text-brand-text-muted">Subtotal:</span>
                    <span className="font-mono text-white font-bold">₹{posCart.reduce((sum, i) => sum + i.price * i.qty, 0)}</span>
                  </p>
                  {posOrderType === "Delivery" && (
                    <p className="flex justify-between w-64">
                      <span className="text-brand-text-muted">Delivery Fee:</span>
                      <span className="font-mono text-white font-bold">₹40</span>
                    </p>
                  )}
                  <div className="border-t border-white/5 w-64 my-1"></div>
                  <p className="flex justify-between w-64 text-sm font-black text-brand-orange">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{posCart.reduce((sum, i) => sum + i.price * i.qty, 0) + (posOrderType === "Delivery" ? 40 : 0)}</span>
                  </p>
                </div>
              )}

              {/* Form submit actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPosModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosSubmitting || posCart.length === 0}
                  className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-hover text-black font-extrabold rounded-xl text-xs shadow-orange-glow transition-all duration-200 cursor-pointer"
                >
                  {isPosSubmitting ? "Generating Bill..." : "Generate &amp; Print Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="bg-brand-surface border-t border-white/5 px-4 py-6 text-center text-xs text-brand-text-muted">
        <p>BTECH CHAAP WALA Admin Dashboard &copy; 2026. SECURED PORTAL.</p>
      </footer>
    </div>
  );
}
