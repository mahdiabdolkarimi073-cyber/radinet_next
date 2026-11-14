'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  jalaliMonthNames,
  jalaliWeekDayNames,
  toJalali,
  daysInJalaliMonth,
  jalaliToGregorian,
  formatJalaliIso,
  toPersianDigits,
} from '@/lib/jalali-date';

export type PersianDatePickerProps = {
  value: string;
  onChange: (isoString: string) => void;
  placeholder?: string;
  label?: string;
};

export function PersianDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ...',
  label,
}: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or use today
  const initialDate = value ? new Date(value) : new Date();
  const currentJalali = toJalali(isNaN(initialDate.getTime()) ? new Date() : initialDate);

  const [viewYear, setViewYear] = useState<number>(currentJalali.year);
  const [viewMonth, setViewMonth] = useState<number>(currentJalali.month);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // When value changes from outside, sync view
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const j = toJalali(d);
        setViewYear(j.year);
        setViewMonth(j.month);
      }
    }
  }, [value]);

  function prevMonth() {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDay(day: number) {
    const greg = jalaliToGregorian(viewYear, viewMonth, day);
    const iso = greg.toISOString().slice(0, 10);
    onChange(iso);
    setOpen(false);
  }

  function selectToday() {
    const today = new Date();
    const j = toJalali(today);
    const greg = jalaliToGregorian(j.year, j.month, j.day);
    onChange(greg.toISOString().slice(0, 10));
    setOpen(false);
  }

  function clearValue() {
    onChange('');
    setOpen(false);
  }

  // Calculate day of week of the 1st of the current month
  const firstOfMonthGreg = jalaliToGregorian(viewYear, viewMonth, 1);
  // In JS: 0 = Sun, 1 = Mon, ..., 6 = Sat
  // In Persian: Saturday = 0, Sunday = 1, ..., Friday = 6
  const jsDay = firstOfMonthGreg.getUTCDay();
  const startDayOffset = (jsDay + 1) % 7; // Saturday -> 0, Sunday -> 1, ...
  const numDays = daysInJalaliMonth(viewYear, viewMonth);

  // Selected day match
  let selectedYear = 0;
  let selectedMonth = 0;
  let selectedDayNum = 0;
  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const j = toJalali(d);
      selectedYear = j.year;
      selectedMonth = j.month;
      selectedDayNum = j.day;
    }
  }

  const displayText = value ? formatJalaliIso(value) : '';

  return (
    <div className="persian-date-picker-wrap" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{label}</span>}
      <div
        className="referrals-date-input"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          minHeight: '42px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <CalendarDays size={18} style={{ color: '#64748b', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: displayText ? '#0f172a' : '#94a3b8', fontWeight: displayText ? 600 : 400 }}>
            {displayText || placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearValue();
            }}
            aria-label="پاک کردن"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div
          className="persian-calendar-popup"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 100,
            width: '280px',
            background: '#ffffff',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
            border: '1px solid #e2e8f0',
            padding: '14px',
            direction: 'rtl',
            fontFamily: 'inherit',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#334155',
              }}
              title="ماه قبل"
            >
              <ChevronRight size={18} />
            </button>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
              {jalaliMonthNames[viewMonth - 1]} {toPersianDigits(viewYear)}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#334155',
              }}
              title="ماه بعد"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#64748b',
              marginBottom: '8px',
            }}
          >
            {jalaliWeekDayNames.map((w, idx) => (
              <div key={idx} style={{ color: idx === 6 ? '#ef4444' : '#64748b' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: numDays }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedYear === viewYear && selectedMonth === viewMonth && selectedDayNum === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  style={{
                    background: isSelected ? '#1456c3' : 'transparent',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    height: '32px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={selectToday}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1456c3',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              امروز
            </button>
            <button
              type="button"
              onClick={clearValue}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              پاک کردن تاریخ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
