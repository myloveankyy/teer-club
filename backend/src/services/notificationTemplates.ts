// backend/src/services/notificationTemplates.ts

export type NotificationCategory = 
  | 'morning_prediction'
  | 'midday_engagement'
  | 'post_result_celebration'
  | 'evening_preview';

interface NotificationTemplate {
  title: string;
  body: string;
  url: string;
}

export function getRandomTemplate(category: NotificationCategory, data?: any): NotificationTemplate {
  const templates = TEMPLATES[category];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace dynamic tokens
  const title = replaceTokens(template.title, data);
  const body = replaceTokens(template.body, data);
  const url = replaceTokens(template.url, data);

  return { title, body, url };
}

function replaceTokens(str: string, data?: any): string {
  if (!data) return str;
  return str.replace(/{{(\w+)}}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

const TEMPLATES: Record<NotificationCategory, NotificationTemplate[]> = {
  morning_prediction: [
    {
      title: "🎯 Today's Targets Are Ready!",
      body: "We've crunched the numbers. Get your 100% verified Common Numbers for today before the counter closes.",
      url: "/common-numbers"
    },
    {
      title: "☕ Good Morning, Teer Champion!",
      body: "Grab your tea and your targets! Today's Shillong & Khanapara predictions are live and looking solid.",
      url: "/common-numbers"
    },
    {
      title: "🔥 Hot Numbers Just Dropped",
      body: "Don't guess blindly today. We've analyzed the patterns and found the strongest House & Ending targets.",
      url: "/common-numbers"
    },
    {
      title: "📊 The Math Doesn't Lie",
      body: "Our prediction engine found an interesting pattern for today's draw. Check the Common Numbers now.",
      url: "/common-numbers"
    },
    {
      title: "💸 Ready for a Hit Today?",
      body: "Stop relying on luck. See our calculated Direct Number predictions for today's game.",
      url: "/common-numbers"
    }
  ],
  
  midday_engagement: [
    {
      title: "🤔 Did you see that dream?",
      body: "A dream about water? Snake? Translate your dreams into winning numbers using our Dream Book.",
      url: "/dreams"
    },
    {
      title: "🏆 Is Your Prediction Accurate?",
      body: "Check out our Jackpot Proofs to see how many Direct Hits we've landed this week.",
      url: "/jackpot"
    },
    {
      title: "⏳ The Clock is Ticking",
      body: "Only a few hours left until the first result. Did you check today's Common Numbers yet?",
      url: "/common-numbers"
    },
    {
      title: "📈 Trends Are Shifting",
      body: "We noticed some interesting patterns in recent Shillong results. See what the data says.",
      url: "/results/shillong/previous-results"
    },
    {
      title: "🧠 Strategy Over Luck",
      body: "Read our Ultimate Teer Guide to understand how the experts calculate their targets.",
      url: "/teer-guide"
    }
  ],

  post_result_celebration: [
    {
      title: "🎉 BOOM! {{gameName}} Result is OUT",
      body: "F/R: {{fr}} | S/R: {{sr}}. Did our targets hit the jackpot today? Check the proofs!",
      url: "/match-proofs"
    },
    {
      title: "🎯 Result Declared: {{gameName}}",
      body: "The wait is over! {{fr}} & {{sr}}. Tap here to see if we scored a Direct Hit.",
      url: "/jackpot"
    },
    {
      title: "🔥 Hot Off The Press",
      body: "{{gameName}} results are live. First Round: {{fr}}. Second Round: {{sr}}. Check accuracy now.",
      url: "/results"
    },
    {
      title: "🤑 Did You Win Today?",
      body: "{{gameName}} results just dropped. Tap to see the official numbers and match proofs.",
      url: "/results"
    },
    {
      title: "✅ Official Update: {{gameName}}",
      body: "Results: {{fr}} / {{sr}}. We log every match. See our latest accuracy stats in the Jackpot dashboard.",
      url: "/jackpot"
    }
  ],

  evening_preview: [
    {
      title: "🌙 Rest Up, Play Smart Tomorrow",
      body: "Today's games are over, but tomorrow's targets are already calculating. Get a head start.",
      url: "/common-numbers"
    },
    {
      title: "📊 Analyzing Today's Hits",
      body: "We're feeding today's results back into the engine. Tomorrow's predictions will be even sharper.",
      url: "/jackpot"
    },
    {
      title: "🔮 What's the Play Tomorrow?",
      body: "The algorithms are running. Check back early morning for the most accurate Common Numbers.",
      url: "/"
    },
    {
      title: "🏆 Consistency Wins",
      body: "One loss doesn't end the game. Check our long-term accuracy stats to see why strategy beats luck.",
      url: "/jackpot"
    },
    {
      title: "😴 Dream Big Tonight",
      body: "Remember your dreams! Check our Dream Translator tomorrow morning to turn them into targets.",
      url: "/dreams"
    }
  ]
};
