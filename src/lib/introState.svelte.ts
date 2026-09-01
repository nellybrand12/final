import { browser } from '$app/environment';

class IntroAnimationManager {
  // States: 'centered' -> 'moving' -> 'docked'
  state = $state<'centered' | 'moving' | 'docked'>('docked');
  hasPlayedOnce = $state(false);

  init() {
    if (!browser) return;

    // Check if hard navigation / page reload occurred
    let isHardReload = false;
    try {
      const navEntry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      isHardReload = navEntry ? navEntry.type === 'reload' : false;
    } catch {
      isHardReload = false;
    }

    const sessionPlayed = sessionStorage.getItem('madadjeu_intro_played');

    // Play if fresh session, or hard reload, and hasn't played in this memory lifecycle yet
    if ((!sessionPlayed || isHardReload) && !this.hasPlayedOnce) {
      sessionStorage.setItem('madadjeu_intro_played', 'true');
      this.startSequence();
    } else {
      this.forceDocked();
    }
  }

  startSequence() {
    this.state = 'centered';
    
    // Hold centered for 1.3s
    setTimeout(() => {
      this.state = 'moving';
      
      // Move takes ~1.0s, then dock in navbar
      setTimeout(() => {
        this.state = 'docked';
        this.hasPlayedOnce = true;
      }, 1000);
    }, 1300);
  }

  replay() {
    this.startSequence();
  }

  forceDocked() {
    this.state = 'docked';
    this.hasPlayedOnce = true;
  }
}

export const introManager = new IntroAnimationManager();

