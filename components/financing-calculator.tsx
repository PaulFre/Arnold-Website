"use client";

import { useMemo, useState } from "react";

type Props = {
  vehiclePrice: number;
  vehicleLabel: string;
};

const NOMINAL_INTEREST_PCT = 6.99;
const EFFECTIVE_INTEREST_PCT = 7.21;
const PROCESSING_FEE_EUR = 0;

const MIN_TERM_MONTHS = 24;
const MAX_TERM_MONTHS = 84;
const STEP_TERM_MONTHS = 12;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const calculateMonthlyRate = (principal: number, months: number, annualInterestPercent: number): number => {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyInterest = annualInterestPercent / 100 / 12;
  if (monthlyInterest <= 0) return principal / months;

  const factor = Math.pow(1 + monthlyInterest, months);
  return (principal * monthlyInterest * factor) / (factor - 1);
};

export function FinancingCalculator({ vehiclePrice, vehicleLabel }: Props) {
  const [downPayment, setDownPayment] = useState<number>(Math.round(vehiclePrice * 0.2));
  const [termMonths, setTermMonths] = useState<number>(48);

  const maxDownPayment = vehiclePrice;
  const normalizedDownPayment = clamp(downPayment, 0, maxDownPayment);

  const result = useMemo(() => {
    const principal = Math.max(vehiclePrice - normalizedDownPayment + PROCESSING_FEE_EUR, 0);
    const monthlyRate = calculateMonthlyRate(principal, termMonths, NOMINAL_INTEREST_PCT);
    const totalAmount = monthlyRate * termMonths;
    const totalInterest = Math.max(totalAmount - principal, 0);

    return {
      principal,
      monthlyRate,
      totalAmount,
      totalInterest
    };
  }, [vehiclePrice, normalizedDownPayment, termMonths]);

  return (
    <section className="finance-card" aria-label="Beispielhafte Finanzierung">
      <div className="finance-head">
        <h2>Finanzierungsbeispiel</h2>
        <p>
          Beispielrechnung für {vehicleLabel} mit realistischen Bankkonditionen. Unverbindlich, vorbehaltlich Bonitätsprüfung
          und finaler Freigabe durch die Santander.
        </p>
      </div>

      <div className="finance-grid">
        <label>
          Anzahlung in EUR
          <input
            type="number"
            min={0}
            max={maxDownPayment}
            step={100}
            value={normalizedDownPayment}
            onChange={(event) => setDownPayment(Number(event.target.value || 0))}
          />
        </label>

        <label>
          Laufzeit in Monaten
          <select value={termMonths} onChange={(event) => setTermMonths(Number(event.target.value))}>
            {Array.from({ length: (MAX_TERM_MONTHS - MIN_TERM_MONTHS) / STEP_TERM_MONTHS + 1 }, (_, index) => {
              const value = MIN_TERM_MONTHS + index * STEP_TERM_MONTHS;
              return (
                <option key={value} value={value}>
                  {value} Monate
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="finance-result-grid">
        <p>
          <span>Kaufpreis</span>
          {formatCurrency(vehiclePrice)}
        </p>
        <p>
          <span>Darlehenssumme</span>
          {formatCurrency(result.principal)}
        </p>
        <p>
          <span>Monatsrate</span>
          {formatCurrency(result.monthlyRate)}
        </p>
        <p>
          <span>Gesamtbetrag</span>
          {formatCurrency(result.totalAmount)}
        </p>
        <p>
          <span>Zinskosten gesamt</span>
          {formatCurrency(result.totalInterest)}
        </p>
      </div>

      <div className="finance-footnote">
        <p>
          Sollzinssatz p.a. (gebunden): {NOMINAL_INTEREST_PCT.toFixed(2).replace(".", ",")}% | Effektiver Jahreszins: {EFFECTIVE_INTEREST_PCT
            .toFixed(2)
            .replace(".", ",")}% | Bearbeitungsgebühr: {formatCurrency(PROCESSING_FEE_EUR)}
        </p>
      </div>
    </section>
  );
}
