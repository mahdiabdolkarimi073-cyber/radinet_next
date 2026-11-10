'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

export function getCurrentJalali(): [number, number, number] {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export function formatJalali(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}/${mm}/${dd}`;
}

export function parseJalali(val: string): [number, number, number] | null {
  if (!val) return null;
  // Support 1403/08/18 or 1403-08-18 with English or Persian digits
  const eng = val.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  const parts = eng.split(/[\/\-]/);
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (y >= 1350 && y <= 1450 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return [y, m, d];
    }
  }
  return null;
}

function getDaysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  // Is leap year in Jalali:
  const isLeap = ((year - 474) % 2820 + 2820) % 2820 % 4 === 0;
  return isLeap ? 30 : 29;
}

export interface ShamsiDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ShamsiDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ به شمسی (مثال: ۱۴۰۳/۰۸/۱۸)',
  disabled = false,
}: ShamsiDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentY, currentM, currentD] = getCurrentJalali();
  const parsed = parseJalali(value);

  const [viewYear, setViewYear] = useState<number>(parsed ? parsed[0] : currentY);
  const [viewMonth, setViewMonth] = useState<number>(parsed ? parsed[1] : currentM);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth);

  function handleSelectDay(day: number) {
    const formatted = formatJalali(viewYear, viewMonth, day);
    onChange(formatted);
    setIsOpen(false);
  }

  function handlePrevMonth() {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleSelectToday() {
    setViewYear(currentY);
    setViewMonth(currentM);
    onChange(formatJalali(currentY, currentM, currentD));
    setIsOpen(false);
  }

  function handleClear() {
    onChange('');
    setIsOpen(false);
  }

  const displayValue = parsed
    ? `${toPersianDigits(parsed[0])}/${toPersianDigits(String(parsed[1]).padStart(2, '0'))}/${toPersianDigits(String(parsed[2]).padStart(2, '0'))}`
    : value;

  const yearsRange: number[] = [];
  for (let y = currentY - 5; y <= currentY + 2; y++) {
    yearsRange.push(y);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} dir="rtl">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
          background: '#fff',
          border: isOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          borderRadius: 12,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: 14,
          color: displayValue ? '#0f172a' : '#94a3b8',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontWeight: displayValue ? 600 : 400 }}>
          {displayValue ? displayValue : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={18} color={isOpen ? '#2563eb' : '#64748b'} />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            width: 320,
            background: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08)',
            padding: 16,
            fontFamily: 'inherit',
          }}
        >
          {/* Header Month / Year controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="ماه بعد"
            >
              <ChevronRight size={16} color="#475569" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                {PERSIAN_MONTHS.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y}>
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="ماه قبل"
            >
              <ChevronLeft size={16} color="#475569" />
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: '#64748b',
              marginBottom: 8,
            }}
          >
            {PERSIAN_WEEKDAYS.map((wd) => (
              <span key={wd} style={{ padding: '4px 0' }}>
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
            }}
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const isSelected =
                parsed &&
                parsed[0] === viewYear &&
                parsed[1] === viewMonth &&
                parsed[2] === d;
              const isToday =
                currentY === viewYear && currentM === viewMonth && currentD === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  style={{
                    padding: '8px 0',
                    fontSize: 13,
                    fontWeight: isSelected || isToday ? 800 : 500,
                    borderRadius: 10,
                    border: isSelected
                      ? 'none'
                      : isToday
                      ? '1.5px solid #2563eb'
                      : '1px solid transparent',
                    background: isSelected ? '#2563eb' : isToday ? '#eff6ff' : '#f8fafc',
                    color: isSelected ? '#ffffff' : isToday ? '#1d4ed8' : '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday ? '#eff6ff' : '#f8fafc';
                    }
                  }}
                >
                  {toPersianDigits(d)}
                </button>
              );
            })}
          </div>

          {/* Footer Quick actions: Today & Clear */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={handleSelectToday}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                padding: '4px 6px',
              }}
            >
              <RotateCcw size={13} /> انتخاب امروز ({toPersianDigits(currentD)}{' '}
              {PERSIAN_MONTHS[currentM - 1]})
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                پاک کردن
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
