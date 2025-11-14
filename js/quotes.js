(function () {

  if (typeof window.QUOTES_DISABLED === "undefined") {
    window.QUOTES_DISABLED = false;
  }

  const sweetQuotes = [
    "You make ordinary moments feel special.","Your laugh is my favorite sound.","I’m grateful for you every day.","You’re my calm in the chaos.",
    "I love the way you care.","You’re my soft place to land.","Thank you for choosing me.","Your smile makes everything lighter.",
    "Being with you feels like home.","You’re the best part of my day.","You make life taste sweeter.","I cherish our quiet minutes.",
    "Every little thing with you matters.","You’re my favorite comfort.","I adore your kind heart.","We’re a team, and we win together.",
    "You matter. Your voice matters. Your life matters.","Every little victory is worth celebrating.",
    "The person you were is the reason I get to love the person you are.","You make even the dullest days shine.",
    "Your voice is my favorite comfort.","I love the way you listen to me.","Being around you feels effortless.",
    "You always know how to make me smile.","You turn small moments into treasures.","My heart feels lighter when you’re here.",
    "You’re the calm after every storm.","I love how you notice the little things.","Just thinking of you makes me happy."
  ];
  const romanticQuotes = [
    "In every version of my life, I find you.","With you, I am home.","You’re my favorite place to be.","I fall for you over and over.",
    "You’re the chapter I never want to end.","My heart knows your name.","You are my quietest poem.","You’re my always and my again.",
    "I love you more than yesterday, less than tomorrow.","You’re my wish come true.","You light up the in-between.",
    "Your happiness is my favorite thing to protect.","Your hand fits mine like it was meant to.","You’re my favorite hello.",
    "Loving you is my best habit.","I love you for who you are, not just for your best days.",
    "I choose you over and over, in every version of this life."
  ];
  const supportiveQuotes = [
    "We’re a team, always.","You’ve got this, and I’ve got you.","I believe in you completely.","You’re stronger than you think.",
    "One step at a time, together.","I’m proud of how far you’ve come.","Your effort matters, I see it.","Breathe, you’re doing great.",
    "I trust your pace.","Whatever happens, i’m here.","We’ll figure it out side by side.","Progress, not perfection.",
    "You are capable of so much.","On hard days, lean on me.","I won’t let you do this alone.",
    "Every day may not be good, but there’s something good in every day.","Choose hope, even when it’s hard to find.",
    "It’s okay to rest. Resting is part of the journey.","Believe in yourself a little more today than you did yesterday.",
    "You are enough.Always have been, always will be.","Change doesn’t erase you, it adds depth to who you are.",
    "The past shaped you, but the present is where you shine.","Change doesn’t erase you, it adds depth to who you are.",
    "You haven’t lost yourself, you’ve just grown into new parts of you.","Your soul is the same, only touched by deeper colors now."
  ];
  const quoteColors = ["#246B3E","#27658A","#453299"];

  const allQuotes = [...sweetQuotes, ...romanticQuotes, ...supportiveQuotes];
  const STATE_KEY = "dailyQuoteState_v1";
  const MS_24H = 24 * 60 * 60 * 1000;

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {
      
    }
  }

  function pickQuoteIndex() {
    const now = Date.now();
    const state = loadState();
    if (state && typeof state.index === "number" && typeof state.timestamp === "number") {
      const age = now - state.timestamp;
      if (age < MS_24H && state.index >= 0 && state.index < allQuotes.length) {
        return state.index;
      }
    }
   
    let idx = Math.floor(Math.random() * allQuotes.length);
    saveState({ index: idx, timestamp: now });
    return idx;
  }

  function showDailyQuote() {
    if (window.QUOTES_DISABLED) return;
    if (!allQuotes.length) return;

    const idx = pickQuoteIndex();
    const text = allQuotes[idx];
    const color = quoteColors[Math.floor(Math.random() * quoteColors.length)];


    const old = document.querySelector(".quote-box");
    if (old) old.remove();

    const box = document.createElement("div");
    box.className = "quote-box";
    box.textContent = text;
    box.style.textShadow = `0 0 10px ${color}, 0 0 18px ${color}55`;
    box.style.boxShadow = `0 8px 30px ${color}55`;
    box.style.borderColor = `${color}80`;

    document.body.appendChild(box);


    requestAnimationFrame(() => {
      box.classList.add("show");
    });

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showDailyQuote);
  } else {
    showDailyQuote();
  }
})();
