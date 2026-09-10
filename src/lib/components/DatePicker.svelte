<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';

  interface Props {
    id?: string;
    name?: string;
    value?: string;
    min?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    class?: string;
    align?: 'left' | 'right';
  }

  let {
    id = '',
    name = '',
    value = $bindable(''),
    min = '',
    required = false,
    disabled = false,
    placeholder = 'YYYY-MM-DD',
    class: customClass = '',
    align = 'left'
  }: Props = $props();

  let isOpen = $state(false);
  let containerRef: HTMLDivElement | null = $state(null);

  // Helper to get local date as YYYY-MM-DD
  function getTodayString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const todayStr = getTodayString();

  // Parse initial view year and month
  let viewYear = $state(new Date().getFullYear());
  let viewMonth = $state(new Date().getMonth()); // 0-indexed

  // Sync view when value changes or when opened
  $effect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        viewYear = y;
        viewMonth = m - 1;
      }
    } else {
      const d = new Date();
      viewYear = d.getFullYear();
      viewMonth = d.getMonth();
    }
  });

  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthName = $derived(
    i18n.locale === 'en' ? monthNamesEn[viewMonth] : monthNamesFr[viewMonth]
  );

  const weekdays = $derived(
    i18n.locale === 'en'
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  );

  // Compute days for current viewMonth and viewYear
  interface CalendarDay {
    dayNumber: number;
    dateStr: string;
    isPast: boolean;
    isDisabled: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  const calendarDays = $derived.by(() => {
    const days: (CalendarDay | null)[] = [];

    // Starting day of week for the 1st of this month (Monday = 0 ... Sunday = 6)
    const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      const isBeforeMin = min ? dateStr < min : false;
      const isDisabled = isPast || isBeforeMin;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === value;

      days.push({
        dayNumber: d,
        dateStr,
        isPast,
        isDisabled,
        isToday,
        isSelected
      });
    }

    return days;
  });

  function toggleCalendar(event?: MouseEvent) {
    if (disabled) return;
    event?.stopPropagation();
    isOpen = !isOpen;
  }

  function openCalendar() {
    if (disabled) return;
    isOpen = true;
  }

  function selectDate(dateStr: string) {
    value = dateStr;
    isOpen = false;
  }

  function prevMonth(event: MouseEvent) {
    event.stopPropagation();
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function nextMonth(event: MouseEvent) {
    event.stopPropagation();
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  function handleWindowClick(event: MouseEvent) {
    if (isOpen && containerRef && !containerRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  function handleWindowKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }

  function handleControlKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      openCalendar();
    }
  }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeyDown} />

<div class="relative w-full" bind:this={containerRef}>
  <!-- Clickable Form Control Input Field (Entire field opens calendar popover) -->
  <div
    role="button"
    tabindex="0"
    class="relative w-full cursor-pointer group"
    onclick={toggleCalendar}
    onkeydown={handleControlKeyDown}
  >
    <input
      {id}
      type="text"
      readonly
      {value}
      {placeholder}
      {required}
      {disabled}
      class="w-full cursor-pointer pr-10 select-none {customClass || 'bg-surface-container dark:bg-neutral-800 border border-outline-variant/40 dark:border-neutral-700 px-4 py-3 text-sm text-deep-charcoal dark:text-neutral-100 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark'}"
      tabindex="-1"
    />
    {#if name}
      <input type="hidden" {name} {value} {required} />
    {/if}
    <!-- Calendar Icon: pointer-events-none ensures clicking on it triggers the whole-field click -->
    <div
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gold dark:text-muted-gold-dark pointer-events-none flex items-center justify-center transition-transform group-hover:scale-105"
      aria-hidden="true"
    >
      <span class="material-symbols-outlined text-lg select-none">calendar_month</span>
    </div>
  </div>

  <!-- Calendar Popover -->
  {#if isOpen}
    <div
      class="absolute top-full mt-2 z-50 bg-[#fdf8f8] dark:bg-[#1c1b1b] border border-outline-variant/60 dark:border-neutral-700 rounded-2xl shadow-2xl p-4 w-[310px] sm:w-[330px] {align === 'right' ? 'right-0' : 'left-0'} select-none"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Date Picker"
      tabindex="-1"
    >
      <!-- Header: Month / Year Navigation -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/30 dark:border-neutral-800">
        <button
          type="button"
          onclick={prevMonth}
          class="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-deep-charcoal dark:text-neutral-200 transition-colors flex items-center justify-center"
          aria-label="Mois précédent"
        >
          <span class="material-symbols-outlined text-xl">chevron_left</span>
        </button>

        <span class="font-headline font-bold text-sm sm:text-base text-deep-charcoal dark:text-neutral-100 capitalize">
          {currentMonthName} {viewYear}
        </span>

        <button
          type="button"
          onclick={nextMonth}
          class="p-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-deep-charcoal dark:text-neutral-200 transition-colors flex items-center justify-center"
          aria-label="Mois suivant"
        >
          <span class="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </div>

      <!-- Weekday Headers -->
      <div class="grid grid-cols-7 gap-1 text-center mb-1">
        {#each weekdays as day}
          <div class="text-[11px] font-label-caps font-semibold text-on-surface-variant dark:text-neutral-400 py-1">
            {day}
          </div>
        {/each}
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 gap-1 text-center">
        {#each calendarDays as day}
          {#if day === null}
            <div class="h-9 w-9"></div>
          {:else if day.isPast}
            <!-- Past Date: Disabled, Visual "X" overlay and strikethrough -->
            <div
              class="relative h-9 w-9 mx-auto flex items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-600 bg-neutral-100/40 dark:bg-neutral-800/30 cursor-not-allowed select-none"
              title={i18n.locale === 'fr' ? 'Date passée - non disponible' : 'Past date - unavailable'}
            >
              <span class="text-xs line-through opacity-50 font-body">{day.dayNumber}</span>
              <!-- Visual X SVG overlay -->
              <svg
                class="absolute inset-0 w-full h-full p-1.5 text-red-500/60 dark:text-red-400/60 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          {:else if day.isDisabled}
            <!-- Disabled Future Date (e.g. before min checkout date) -->
            <div
              class="relative h-9 w-9 mx-auto flex items-center justify-center rounded-lg text-neutral-300 dark:text-neutral-700 cursor-not-allowed select-none"
              title={i18n.locale === 'fr' ? 'Non disponible' : 'Unavailable'}
            >
              <span class="text-xs opacity-40 font-body">{day.dayNumber}</span>
            </div>
          {:else}
            <!-- Selectable Date (Today and future dates) -->
            <button
              type="button"
              onclick={() => selectDate(day.dateStr)}
              class="relative h-9 w-9 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all {
                day.isSelected
                  ? 'bg-brand-maroon text-white font-bold shadow-sm'
                  : day.isToday
                    ? 'border-2 border-muted-gold text-muted-gold dark:text-muted-gold-dark font-bold hover:bg-muted-gold/20'
                    : 'text-deep-charcoal dark:text-neutral-100 hover:bg-muted-gold/20 dark:hover:bg-muted-gold/30'
              }"
            >
              {day.dayNumber}
            </button>
          {/if}
        {/each}
      </div>

      <!-- Footer: Legend & Actions -->
      <div class="mt-3 pt-2.5 border-t border-outline-variant/30 dark:border-neutral-800 flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
          <span class="inline-flex items-center justify-center w-3.5 h-3.5 text-red-500/70 font-bold text-[10px] leading-none">✕</span>
          <span>{i18n.locale === 'fr' ? 'Passé' : 'Past'}</span>
        </div>
        <div class="flex items-center gap-2">
          {#if todayStr >= (min || todayStr)}
            <button
              type="button"
              onclick={() => selectDate(todayStr)}
              class="text-xs font-semibold text-muted-gold hover:text-brand-maroon dark:hover:text-muted-gold-dark transition-colors py-1 px-1.5"
            >
              {i18n.locale === 'fr' ? "Aujourd'hui" : 'Today'}
            </button>
          {/if}
          <button
            type="button"
            onclick={() => isOpen = false}
            class="text-xs font-semibold text-neutral-500 hover:text-deep-charcoal dark:hover:text-neutral-200 transition-colors py-1 px-1.5"
          >
            {i18n.locale === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
