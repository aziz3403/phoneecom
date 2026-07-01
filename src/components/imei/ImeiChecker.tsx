"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Client-side IMEI format validator (length + Luhn check digit). The
 * blacklist lookup itself lives with the industry registry — we validate the
 * number so users don't waste a lookup on a typo, then link them to the
 * CTIA's official Stolen Phone Checker.
 */

function luhnOk(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits.charCodeAt(digits.length - 1 - i) - 48;
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function ImeiChecker() {
  const [raw, setRaw] = useState("");
  const [checked, setChecked] = useState<"valid" | "invalid" | null>(null);

  const digits = raw.replace(/\D/g, "");

  function check() {
    setChecked(digits.length === 15 && luhnOk(digits) ? "valid" : "invalid");
  }

  return (
    <div className="scard-bord">
      <label className="flabel" htmlFor="imei">IMEI number (15 digits)</label>
      <div className="flex gap-2.5">
        <input
          id="imei"
          inputMode="numeric"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setChecked(null); }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="inpt flex-1 font-mono"
          placeholder="35 675905 891234 5"
          maxLength={20}
        />
        <button onClick={check} disabled={digits.length < 15} className={cn("btn", digits.length < 15 && "opacity-50")}>
          Check
        </button>
      </div>

      {checked === "invalid" && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-[13.5px] leading-relaxed text-[#b23b3b]">
          <XCircle className="mt-0.5 h-4 w-4 flex-none" />
          That&apos;s not a valid IMEI — it should be exactly 15 digits and this one fails the
          check-digit test. Re-check for typos (dial *#06# on the phone to see it).
        </p>
      )}

      {checked === "valid" && (
        <div className="mt-3 rounded-[13px] bg-[#edf6f0] px-4 py-3.5">
          <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#0a7d61]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
            Valid IMEI format. Now run it through the industry&apos;s official lost/stolen registry —
            free, run by the CTIA, same database we use:
          </p>
          <a
            href="https://www.stolenphonechecker.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-3 !h-10 !text-[14px]"
          >
            Check on stolenphonechecker.org <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <p className="mt-3 text-[12px] leading-relaxed text-[#b0b0b6]">
        We don&apos;t store numbers you type here. A clean registry result doesn&apos;t rule out carrier
        financing or activation locks — check those before handing over money.
      </p>
    </div>
  );
}
