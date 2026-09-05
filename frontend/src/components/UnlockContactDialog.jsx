import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { UNLOCK } from "@/constants/testIds";
import { Lock, Phone, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { paymentsApi, listingsApi } from "@/api/client";

export const UnlockContactDialog = ({ open, onOpenChange, listing, onUnlocked }) => {
  const { t } = useLanguage();
  const [stage, setStage] = useState("idle"); // idle | processing | success
  const [orderId, setOrderId] = useState(null);
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [demoMode, setDemoMode] = useState(true);

  const reset = () => {
    setStage("idle");
    setOrderId(null);
    setRevealedPhone(null);
    setDemoMode(true);
  };

  const handleClose = (o) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const startPayment = async () => {
    setStage("processing");
    try {
      const data = await paymentsApi.createPayment(
        listing.id,
        `${listing.name} · ${listing.district}`
      );
      setOrderId(data.order_id);
      setDemoMode(data.demo_mode);

      if (data.demo_mode) {
        // Simulated payment flow for preview / testing
        await new Promise((r) => setTimeout(r, 1400));
        await paymentsApi.completeDemo(data.order_id);

        // Fetch securely unlocked contact from backend!
        const contact = await listingsApi.getUnlockedContact(listing.id, data.order_id);
        setRevealedPhone(contact.phone);
        setStage("success");
      } else if (data.payhere && window.payhere) {
        // Real PayHere gateway flow
        window.payhere.onCompleted = async () => {
          for (let i = 0; i < 20; i++) {
            const s = await paymentsApi.getStatus(data.order_id);
            if (s.unlocked) {
              const contact = await listingsApi.getUnlockedContact(listing.id, data.order_id);
              setRevealedPhone(contact.phone);
              setStage("success");
              return;
            }
            await new Promise((r) => setTimeout(r, 1200));
          }
          setStage("idle");
        };
        window.payhere.onDismissed = () => setStage("idle");
        window.payhere.onError = () => setStage("idle");
        window.payhere.startPayment(data.payhere);
      } else {
        setStage("idle");
      }
    } catch (e) {
      console.error(e);
      setStage("idle");
    }
  };

  const reveal = () => {
    if (revealedPhone) {
      onUnlocked?.(listing.id, revealedPhone);
    }
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent data-testid={UNLOCK.dialog} className="max-w-sm rounded-3xl bg-white border border-stone-200 text-stone-900 shadow-2xl p-6">
        <DialogHeader className="text-left">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 bg-[#E8F1EC] text-[#004236] border border-[#D0E2D6]">
            {stage === "success" ? (
              <CheckCircle2 size={24} className="text-[#004236]" />
            ) : (
              <Lock size={22} className="text-[#004236]" />
            )}
          </div>
          <DialogTitle className="font-display text-xl font-black tracking-tight text-[#004236] uppercase">
            {stage === "success" ? t("dialog_success") : t("dialog_title")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-stone-600 font-medium">
            {stage === "success"
              ? `${listing?.name} · ${listing?.district}`
              : t("dialog_desc")}
          </DialogDescription>
        </DialogHeader>

        {stage === "processing" && (
          <div
            className="flex items-center gap-3 rounded-2xl p-3.5 bg-[#E8F1EC] border border-[#D0E2D6] text-[#004236]"
            data-testid={UNLOCK.processing}
          >
            <Loader2 className="animate-spin text-[#004236]" size={20} />
            <div className="text-xs sm:text-sm font-bold">{t("dialog_processing")}</div>
          </div>
        )}

        {stage === "success" && (
          <div
            className="rounded-2xl p-4 text-center bg-[#E8F1EC] border border-[#D0E2D6] shadow-xs"
            data-testid={UNLOCK.success}
          >
            <ShieldCheck className="mx-auto text-[#004236]" size={30} />
            <div className="mt-2 text-lg font-black font-numeric text-[#004236] tracking-wide">
              {revealedPhone}
            </div>
            <div className="mt-1 text-[11px] text-stone-500 font-mono">
              Order: {orderId}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col pt-1">
          {stage === "idle" && (
            <>
              <Button
                data-testid={UNLOCK.payBtn}
                className="w-full font-black h-11 rounded-xl shadow-sm bg-[#FFCE00] hover:bg-[#E6B800] text-stone-900 border-none uppercase tracking-wider"
                onClick={startPayment}
              >
                <Lock size={15} className="mr-2 text-stone-900" />
                {t("dialog_pay")}
              </Button>
              {demoMode && (
                <div className="text-[11px] text-center text-stone-500">
                  {t("dialog_demo_note")}
                </div>
              )}
              <Button
                data-testid={UNLOCK.cancelBtn}
                variant="ghost"
                className="w-full h-10 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs font-bold"
                onClick={() => handleClose(false)}
              >
                {t("dialog_cancel")}
              </Button>
            </>
          )}
          {stage === "success" && (
            <Button
              data-testid={UNLOCK.revealBtn}
              className="w-full font-black h-11 rounded-xl shadow-sm bg-[#004236] hover:bg-[#002D24] text-white border-none uppercase tracking-wider"
              onClick={reveal}
            >
              <Phone size={16} className="mr-2 text-[#FFCE00]" />
              {t("dialog_reveal")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
