<script lang="ts">
  import { i18n } from '$lib/i18n.svelte';
  import {
    BOOKING_KNOWLEDGE_BASE,
    QUICK_TOPIC_CHIPS,
    matchBookingIntent,
    formatLiveRoomPricing,
    formatLiveHallPricing,
    type KnowledgeTopic
  } from '$lib/data/bookingKnowledgeBase';
  import { tick } from 'svelte';

  interface ChatMessage {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    topicId?: string;
    action?: {
      label: string;
      href: string;
      isExternal?: boolean;
      icon?: string;
    };
    isFallback?: boolean;
    timestamp: string;
  }

  let isOpen = $state(false);
  let inputText = $state('');
  let messages = $state<ChatMessage[]>([]);
  let chatContainer = $state<HTMLDivElement | null>(null);

  function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Initialize greeting on open if empty
  function initGreeting() {
    if (messages.length === 0) {
      messages = [
        {
          id: 'welcome-msg',
          sender: 'bot',
          text: i18n.t.chatbot.welcome,
          timestamp: getCurrentTime()
        }
      ];
    }
  }

  async function scrollToBottom() {
    await tick();
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  function handleOpen() {
    isOpen = !isOpen;
    if (isOpen) {
      initGreeting();
      scrollToBottom();
    }
  }

  function clearChat() {
    messages = [
      {
        id: 'welcome-msg-' + Date.now(),
        sender: 'bot',
        text: i18n.t.chatbot.welcome,
        timestamp: getCurrentTime()
      }
    ];
    scrollToBottom();
  }

  async function resolveTopicAnswer(topicId: string, defaultAnswer: string): Promise<string> {
    if (topicId === 'room-types-pricing' || topicId === 'event-halls') {
      try {
        const res = await fetch(`/api/rooms?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const rooms = await res.json();
          if (topicId === 'room-types-pricing') {
            return formatLiveRoomPricing(rooms, i18n.locale);
          } else if (topicId === 'event-halls') {
            return formatLiveHallPricing(rooms, i18n.locale);
          }
        }
      } catch (err) {
        console.error('Failed to fetch live rooms at response time:', err);
      }
    }
    return defaultAnswer;
  }

  async function selectChip(chipId: string) {
    const topic = BOOKING_KNOWLEDGE_BASE.find(t => t.id === chipId);
    if (!topic) return;

    const userLabel = i18n.locale === 'fr' 
      ? QUICK_TOPIC_CHIPS.find(c => c.id === chipId)?.labelFr || topic.question.fr
      : QUICK_TOPIC_CHIPS.find(c => c.id === chipId)?.labelEn || topic.question.en;

    // Add user message
    messages.push({
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userLabel,
      timestamp: getCurrentTime()
    });
    scrollToBottom();

    // Fetch live response if pricing/capacity topic
    const baseText = i18n.locale === 'fr' ? topic.shortAnswer.fr : topic.shortAnswer.en;
    const botText = await resolveTopicAnswer(topic.id, baseText);

    const action = topic.action
      ? {
          label: i18n.locale === 'fr' ? topic.action.label.fr : topic.action.label.en,
          href: topic.action.href,
          isExternal: topic.action.isExternal,
          icon: topic.action.icon
        }
      : undefined;

    messages.push({
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: botText,
      topicId: topic.id,
      action,
      timestamp: getCurrentTime()
    });

    scrollToBottom();
  }

  async function handleSendMessage(e?: Event) {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    inputText = '';

    // Add user message
    messages.push({
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: getCurrentTime()
    });
    scrollToBottom();

    // Deterministic Rule-Based Intent Matching
    const matchedTopic = matchBookingIntent(query);

    if (matchedTopic) {
      const baseText = i18n.locale === 'fr' ? matchedTopic.shortAnswer.fr : matchedTopic.shortAnswer.en;
      const botText = await resolveTopicAnswer(matchedTopic.id, baseText);

      const action = matchedTopic.action
        ? {
            label: i18n.locale === 'fr' ? matchedTopic.action.label.fr : matchedTopic.action.label.en,
            href: matchedTopic.action.href,
            isExternal: matchedTopic.action.isExternal,
            icon: matchedTopic.action.icon
          }
        : undefined;

      messages.push({
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botText,
        topicId: matchedTopic.id,
        action,
        timestamp: getCurrentTime()
      });
    } else {
      // Out of scope fallback strictly pointing to WhatsApp / Contact
      messages.push({
        id: 'bot-fallback-' + Date.now(),
        sender: 'bot',
        text: i18n.t.chatbot.fallbackMessage,
        isFallback: true,
        timestamp: getCurrentTime()
      });
    }

    scrollToBottom();
  }
</script>

<!-- Floating Concierge Chatbot Widget -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
  {#if isOpen}
    <div
      class="mb-4 w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] bg-surface-container-lowest dark:bg-neutral-900 border border-outline-variant/40 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-up text-on-surface dark:text-neutral-100"
      role="dialog"
      aria-label={i18n.t.chatbot.title}
    >
      <!-- Chat Header -->
      <div class="px-4 py-3.5 bg-deep-charcoal dark:bg-neutral-950 text-soft-cream flex items-center justify-between border-b border-white/10 dark:border-neutral-800 shrink-0">
        <div class="flex items-center gap-3">
          <div class="relative w-10 h-10 rounded-full bg-muted-gold/20 dark:bg-muted-gold-dark/20 flex items-center justify-center text-muted-gold dark:text-muted-gold-dark shrink-0">
            <span class="material-symbols-outlined text-2xl">concierge</span>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-deep-charcoal"></span>
          </div>
          <div>
            <h4 class="font-headline font-bold text-sm text-soft-cream leading-tight">{i18n.t.chatbot.title}</h4>
            <span class="text-[11px] text-soft-cream/70 flex items-center gap-1">
              <span class="text-emerald-400 font-medium">●</span>
              {i18n.t.chatbot.subtitle}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button
            type="button"
            onclick={clearChat}
            class="text-soft-cream/70 hover:text-soft-cream p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={i18n.t.chatbot.resetBtn}
            aria-label={i18n.t.chatbot.resetBtn}
          >
            <span class="material-symbols-outlined text-lg">restart_alt</span>
          </button>
          <button
            type="button"
            onclick={() => (isOpen = false)}
            class="text-soft-cream/70 hover:text-soft-cream p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={i18n.t.concierge.available}
            aria-label="Fermer"
          >
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      <!-- Quick Topic Chips Bar -->
      <div class="p-2.5 bg-surface-container dark:bg-neutral-850 border-b border-outline-variant/30 dark:border-neutral-800 overflow-x-auto no-scrollbar shrink-0">
        <div class="flex items-center gap-1.5 whitespace-nowrap">
          {#each QUICK_TOPIC_CHIPS as chip}
            <button
              type="button"
              onclick={() => selectChip(chip.id)}
              class="px-2.5 py-1 text-[11px] font-medium rounded-full bg-surface-container-lowest dark:bg-neutral-800 text-deep-charcoal dark:text-neutral-200 border border-outline-variant/40 dark:border-neutral-700 hover:border-muted-gold dark:hover:border-muted-gold-dark hover:bg-muted-gold/10 dark:hover:bg-muted-gold-dark/15 transition-all flex items-center gap-1 shrink-0"
            >
              <span class="material-symbols-outlined text-[13px] text-muted-gold dark:text-muted-gold-dark">{chip.icon}</span>
              <span>{i18n.locale === 'fr' ? chip.labelFr : chip.labelEn}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Chat Thread Area -->
      <div
        bind:this={chatContainer}
        class="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface-container-lowest dark:bg-neutral-900 scroll-smooth"
      >
        {#each messages as msg (msg.id)}
          {#if msg.sender === 'bot'}
            <div class="flex items-start gap-2.5 max-w-[92%]">
              <div class="w-7 h-7 rounded-full bg-muted-gold/20 dark:bg-muted-gold-dark/20 text-muted-gold dark:text-muted-gold-dark flex items-center justify-center shrink-0 mt-0.5">
                <span class="material-symbols-outlined text-sm">room_service</span>
              </div>
              <div class="space-y-1.5 flex-1">
                <div class="p-3 rounded-2xl rounded-tl-sm bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-neutral-100 text-xs sm:text-[13px] leading-relaxed border border-outline-variant/30 dark:border-neutral-700 shadow-sm">
                  <p class="whitespace-pre-line">{msg.text}</p>

                  {#if msg.action}
                    <div class="mt-2.5 pt-2 border-t border-outline-variant/20 dark:border-neutral-700">
                      <a
                        href={msg.action.href}
                        onclick={() => (isOpen = false)}
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-900 text-[11px] font-semibold hover:bg-muted-gold dark:hover:bg-muted-gold-dark hover:text-deep-charcoal transition-colors shadow-sm"
                      >
                        {#if msg.action.icon}
                          <span class="material-symbols-outlined text-xs">{msg.action.icon}</span>
                        {/if}
                        <span>{msg.action.label}</span>
                      </a>
                    </div>
                  {/if}

                  {#if msg.isFallback}
                    <div class="mt-3 pt-2.5 border-t border-outline-variant/20 dark:border-neutral-700 flex flex-col gap-1.5">
                      <a
                        href="https://wa.me/237699000000?text=Bonjour%20Madadjeu,%20je%20souhaite%20une%20assistance."
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 font-medium text-[11px] hover:bg-emerald-600/25 transition-colors border border-emerald-600/30"
                      >
                        <span class="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">chat</span>
                        <span>{i18n.t.chatbot.whatsappAction}</span>
                      </a>

                      <a
                        href="tel:+237699000000"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-neutral-700 text-deep-charcoal dark:text-neutral-200 font-medium text-[11px] hover:bg-surface-variant dark:hover:bg-neutral-600 transition-colors border border-outline-variant/30"
                      >
                        <span class="material-symbols-outlined text-sm text-muted-gold dark:text-muted-gold-dark">call</span>
                        <span>{i18n.t.chatbot.callAction}</span>
                      </a>

                      <a
                        href="/faq"
                        onclick={() => (isOpen = false)}
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high dark:bg-neutral-700 text-deep-charcoal dark:text-neutral-200 font-medium text-[11px] hover:bg-surface-variant dark:hover:bg-neutral-600 transition-colors border border-outline-variant/30"
                      >
                        <span class="material-symbols-outlined text-sm text-muted-gold dark:text-muted-gold-dark">quiz</span>
                        <span>{i18n.t.chatbot.viewAllFaq}</span>
                      </a>
                    </div>
                  {/if}
                </div>
                <span class="text-[10px] text-on-surface-variant/60 dark:text-neutral-400 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          {:else}
            <!-- User Message -->
            <div class="flex flex-col items-end ml-auto max-w-[85%] space-y-1">
              <div class="p-3 rounded-2xl rounded-tr-sm bg-deep-charcoal dark:bg-neutral-200 text-soft-cream dark:text-neutral-900 text-xs sm:text-[13px] leading-relaxed shadow-sm">
                <p>{msg.text}</p>
              </div>
              <span class="text-[10px] text-on-surface-variant/60 dark:text-neutral-400 block px-1">{msg.timestamp}</span>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Input Bar -->
      <form
        onsubmit={handleSendMessage}
        class="p-2.5 bg-surface-container dark:bg-neutral-950 border-t border-outline-variant/30 dark:border-neutral-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          bind:value={inputText}
          placeholder={i18n.t.chatbot.inputPlaceholder}
          class="flex-1 bg-surface-container-lowest dark:bg-neutral-900 text-on-surface dark:text-neutral-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-outline-variant/40 dark:border-neutral-700 focus:outline-none focus:border-muted-gold dark:focus:border-muted-gold-dark transition-colors placeholder:text-on-surface-variant/50 dark:placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          class="w-10 h-10 rounded-xl bg-deep-charcoal dark:bg-neutral-100 text-soft-cream dark:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted-gold dark:hover:bg-muted-gold-dark hover:text-deep-charcoal flex items-center justify-center transition-colors shrink-0"
          aria-label={i18n.t.chatbot.sendBtn}
        >
          <span class="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  {/if}

  <!-- Toggle Bubble Button -->
  <button
    type="button"
    onclick={handleOpen}
    class="w-14 h-14 bg-muted-gold dark:bg-muted-gold-dark text-deep-charcoal dark:text-neutral-900 hover:bg-deep-charcoal dark:hover:bg-neutral-100 hover:text-soft-cream dark:hover:text-neutral-900 rounded-full flex items-center justify-center shadow-[0_6px_25px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-soft-cream dark:border-neutral-800"
    aria-label={isOpen ? (i18n.locale === 'fr' ? 'Fermer' : 'Close') : (i18n.locale === 'fr' ? 'Ouvrir la conciergerie' : 'Open Concierge')}
    title={i18n.t.chatbot.title}
  >
    <span class="material-symbols-outlined text-[26px]">
      {isOpen ? 'close' : 'chat_bubble'}
    </span>
  </button>
</div>
