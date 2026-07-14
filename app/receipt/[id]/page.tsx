"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Printer } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  type: "Pickup" | "Delivery";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  timestamp: string;
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          setErrorMsg("Receipt not found. Please verify the link.");
        } else {
          setOrder({
            id: data.id,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerAddress: data.customer_address || undefined,
            type: data.type,
            items: data.items,
            subtotal: data.subtotal,
            deliveryFee: data.delivery_fee,
            total: data.total,
            status: data.status,
            timestamp: data.timestamp,
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setErrorMsg("Failed to connect and fetch receipt.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ff5a00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Loading Digital Invoice...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans px-4">
        <div className="bg-zinc-900 rounded-[2rem] border border-white/5 p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-red-400 font-black uppercase text-xs tracking-wider">Error Encountered</p>
          <p className="text-sm text-zinc-300 font-semibold">{errorMsg || "Unable to display invoice."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-x-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#ff5a00]/5 blur-[120px] pointer-events-none print:hidden"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#8cff00]/5 blur-[120px] pointer-events-none print:hidden"></div>

      {/* Printable receipt styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-hidden {
            display: none !important;
          }
          #printable-card {
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />

      <div className="max-w-md w-full space-y-6 print:space-y-0 print:m-0 print:max-w-full">
        {/* Receipt Container */}
        <div id="printable-card" className="bg-white text-zinc-800 rounded-[2rem] border border-zinc-200/80 p-6 sm:p-8 shadow-2xl space-y-6 max-w-sm mx-auto print:border-none print:shadow-none print:p-0">
          
          {/* Header */}
          <div className="text-center space-y-1.5 pb-2">
            <h1 className="text-md font-black tracking-wide text-black uppercase">BTECH CHAAP WALA</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">--- Soya Chaap Specialists ---</p>
            <p className="text-[9px] text-zinc-500 mt-1">Bhagat Singh Chowk, Jhajjar, Haryana</p>
            <p className="text-[9px] text-zinc-500">Phone: +91 90531 60031</p>
          </div>

          {/* Separation line */}
          <div className="border-t border-dashed border-zinc-300"></div>

          {/* Invoice summary metadata */}
          <div className="space-y-1.5 font-mono text-[10px]">
            <p className="flex justify-between">
              <span className="font-bold">INVOICE:</span>
              <span className="font-black text-black">{order.id}</span>
            </p>
            <p className="flex justify-between">
              <span>DATE:</span>
              <span>{order.timestamp}</span>
            </p>
            <p className="flex justify-between">
              <span>CUSTOMER:</span>
              <span className="font-bold text-black uppercase">{order.customerName}</span>
            </p>
            <p className="flex justify-between">
              <span>PHONE:</span>
              <span>{order.customerPhone}</span>
            </p>
            <p className="flex justify-between">
              <span>TYPE:</span>
              <span className="font-bold uppercase">{order.type}</span>
            </p>
          </div>

          {/* Separation line */}
          <div className="border-t border-dashed border-zinc-300"></div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between font-black text-black text-[10px] font-mono">
              <span>ITEM DESCRIPTION</span>
              <span className="w-16 text-right">TOTAL</span>
            </div>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] font-mono">
                  <div className="space-y-0.5">
                    <p className="font-bold text-black">{item.name}</p>
                    <p className="text-zinc-500 text-[9px]">{item.qty} x ₹{item.price}</p>
                  </div>
                  <span className="font-bold self-end text-black font-mono">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Separation line */}
          <div className="border-t border-dashed border-zinc-300"></div>

          {/* Bill calculations ledger */}
          <div className="space-y-1.5 text-[10px] text-right font-mono pr-1">
            <p className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>₹{order.subtotal}</span>
            </p>
            {order.deliveryFee > 0 && (
              <p className="flex justify-between">
                <span>DELIVERY FEE:</span>
                <span>₹{order.deliveryFee}</span>
              </p>
            )}
            <p className="flex justify-between font-black text-black text-[11px] pt-1 border-t border-zinc-100">
              <span>GRAND TOTAL:</span>
              <span>₹{order.total}</span>
            </p>
          </div>

          {/* Separation line */}
          <div className="border-t border-dashed border-zinc-300"></div>

          {/* Footer */}
          <div className="text-center space-y-1 pt-1">
            <p className="text-[10px] font-black text-black uppercase">Hope you love our dishes! ❤️</p>
            <p className="text-[8px] text-zinc-500">For home delivery, call us directly.</p>
            <p className="text-[8px] text-zinc-400 font-sans tracking-wide">Btech Chaap Wala Dispatch Hub</p>
          </div>
        </div>

        {/* Action button header for saving PDF */}
        <div className="flex flex-col gap-2.5 max-w-sm mx-auto print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-3.5 bg-[#ff5a00] hover:bg-[#ff5a00]/90 text-black font-extrabold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Printer size={14} />
            <span>Download Invoice PDF / Print</span>
          </button>
          <p className="text-[9px] text-zinc-500 text-center font-sans px-2 leading-relaxed">
            💡 <strong>Saving as PDF:</strong> Click the button above and select <strong>&quot;Save as PDF&quot;</strong> in your printer choices to download your copy.
          </p>
        </div>
      </div>
    </div>
  );
}
