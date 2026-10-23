(function () {
  'use strict';

  const script = document.currentScript;
  const artworkBase = script ? new URL('tarot/', script.src).href : '/wp-content/mu-plugins/medium-psychic-tools/assets/tarot/';
  const artworkVersion = script ? new URL(script.src).search : '';

  // Авторські короткі значення карт. Питання лишається в браузері.
  const deck = [
    { name: 'The Fool', symbol: '✦', theme: 'a new beginning', action: 'try a small, reversible first step', tone: 1 },
    { name: 'The Magician', symbol: '✧', theme: 'resources already available', action: 'use one skill you already trust', tone: 1 },
    { name: 'The High Priestess', symbol: '☾', theme: 'quiet observation', action: 'pause and write down what you notice', tone: 0 },
    { name: 'The Empress', symbol: '❀', theme: 'care and growth', action: 'give steady attention to what matters', tone: 1 },
    { name: 'The Emperor', symbol: '♜', theme: 'structure and boundaries', action: 'set one clear boundary', tone: 1 },
    { name: 'The Hierophant', symbol: '✣', theme: 'shared wisdom', action: 'compare trusted advice with your own experience', tone: 0 },
    { name: 'The Lovers', symbol: '♡', theme: 'a choice shaped by values', action: 'name the value behind your next decision', tone: 1 },
    { name: 'The Chariot', symbol: '✺', theme: 'direction and commitment', action: 'choose one realistic next move', tone: 1 },
    { name: 'Strength', symbol: '☼', theme: 'patient courage', action: 'approach the difficult part calmly', tone: 1 },
    { name: 'The Hermit', symbol: '✶', theme: 'space to reflect', action: 'take a little time away from outside opinions', tone: 0 },
    { name: 'Wheel of Fortune', symbol: '◉', theme: 'changing circumstances', action: 'separate what you control from what you do not', tone: 0 },
    { name: 'Justice', symbol: '⚖', theme: 'fairness and evidence', action: 'check the facts before deciding', tone: 0 },
    { name: 'The Hanged Man', symbol: '◇', theme: 'another point of view', action: 'reframe the situation from a new angle', tone: 0 },
    { name: 'Death', symbol: '☯', theme: 'a transition, not physical death', action: 'notice what you are ready to leave behind', tone: 0 },
    { name: 'Temperance', symbol: '✳', theme: 'balance and adjustment', action: 'make one modest change', tone: 1 },
    { name: 'The Devil', symbol: '⬡', theme: 'a restrictive pattern', action: 'identify a pressure you can question', tone: -1 },
    { name: 'The Tower', symbol: '⚡', theme: 'an assumption worth testing', action: 'check whether your old plan still fits', tone: -1 },
    { name: 'The Star', symbol: '☆', theme: 'hope grounded in care', action: 'do one thing that makes tomorrow easier', tone: 1 },
    { name: 'The Moon', symbol: '☽', theme: 'uncertainty and impressions', action: 'ask what is known and what remains unclear', tone: 0 },
    { name: 'The Sun', symbol: '☀', theme: 'clarity and appreciation', action: 'support something that is already working', tone: 1 },
    { name: 'Judgement', symbol: '⌁', theme: 'review and renewal', action: 'learn from the past without blaming yourself', tone: 0 },
    { name: 'The World', symbol: '◎', theme: 'completion and integration', action: 'recognize what has already been achieved', tone: 1 }
  ];

  const modes = {
    general: {
      title: 'Your three-card reflection',
      positions: ['Where you are', 'What to notice', 'A possible next step'],
      frame: 'your current situation'
    },
    yesno: {
      title: 'Your yes or no reflection',
      positions: ['A perspective on your question'],
      frame: 'the decision in front of you'
    },
    love: {
      title: 'Your relationship reflection',
      positions: ['Your feelings', 'The connection', 'A healthy next step'],
      frame: 'communication and boundaries in this relationship'
    },
    career: {
      title: 'Your career reflection',
      positions: ['Current energy', 'Resources or friction', 'A practical next step'],
      frame: 'your work and available choices'
    }
  };

  function randomIndex(maximum) {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      const limit = Math.floor(4294967296 / maximum) * maximum;
      do { window.crypto.getRandomValues(value); } while (value[0] >= limit);
      return value[0] % maximum;
    }
    return Math.floor(Math.random() * maximum);
  }

  function draw(count) {
    const available = deck.slice();
    const chosen = [];
    for (let index = 0; index < count; index += 1) {
      chosen.push(available.splice(randomIndex(available.length), 1)[0]);
    }
    return chosen;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function artwork(card) {
    return artworkBase + card.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '').replace(/^the-/, '') + '.jpg' + artworkVersion;
  }

  function cardSide(className, source, alt) {
    const side = element('div', 'mp-card-side ' + className);
    const image = element('img');
    image.src = source;
    image.alt = alt;
    image.width = 360;
    image.height = 604;
    side.appendChild(image);
    return side;
  }

  function cardVisual(card) {
    const visual = element('div', 'mp-card-visual');
    const inner = element('div', 'mp-card-inner');
    inner.appendChild(cardSide('mp-card-back', artworkBase + 'card-back.svg' + artworkVersion, ''));
    inner.appendChild(cardSide('mp-card-front', artwork(card), card.name + ' tarot card artwork'));
    visual.appendChild(inner);
    return visual;
  }

  function initialize(root, index) {
    const mode = modes[root.dataset.mpTarot] || modes.general;
    const input = root.querySelector('textarea');
    const drawButton = root.querySelector('[data-draw]');
    const resetButton = root.querySelector('[data-reset]');
    const result = root.querySelector('.mp-results');
    const cards = root.querySelector('.mp-drawn');
    const outcome = root.querySelector('.mp-outcome');
    const status = root.querySelector('[role="status"]');
    const heading = result.querySelector('h3');
    const inputId = 'mp-question-' + index;
    input.id = inputId;
    root.querySelector('label').htmlFor = inputId;

    const preview = element('div', 'mp-card-preview');
    preview.setAttribute('aria-hidden', 'true');
    for (let cardIndex = 0; cardIndex < mode.positions.length; cardIndex += 1) {
      const back = element('img');
      back.src = artworkBase + 'card-back.svg' + artworkVersion;
      back.alt = '';
      back.width = 360;
      back.height = 604;
      preview.appendChild(back);
    }
    drawButton.insertAdjacentElement('afterend', preview);

    root.querySelectorAll('[data-suggestion]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.dataset.suggestion;
        input.focus();
      });
    });

    drawButton.addEventListener('click', function () {
      const chosen = draw(mode.positions.length);
      const question = input.value.trim();
      cards.replaceChildren();
      chosen.forEach(function (card, cardIndex) {
        const article = element('article');
        const visual = cardVisual(card);
        const copy = element('div', 'mp-card-copy');
        copy.appendChild(element('p', 'mp-position', mode.positions[cardIndex]));
        copy.appendChild(element('h4', '', card.name));
        copy.appendChild(element('p', '', 'This card points to ' + card.theme + '. For ' + mode.frame + ', consider this: ' + card.action + '.'));
        article.appendChild(visual);
        article.appendChild(copy);
        cards.appendChild(article);
        window.setTimeout(function () { visual.classList.add('is-revealed'); }, 110 + cardIndex * 180);
      });
      heading.textContent = mode.title;
      if (root.dataset.mpTarot === 'yesno') {
        const tone = chosen[0].tone;
        outcome.textContent = (tone > 0 ? 'Leaning yes' : tone < 0 ? 'Leaning no' : 'Unclear for now') +
          '. Treat this as a prompt to check your options, not a prediction.';
      } else {
        outcome.textContent = question ? 'Your question: ' + question : 'Hold your own question in mind as you read.';
      }
      result.hidden = false;
      preview.hidden = true;
      status.textContent = 'Cards revealed. Your reflection is ready.';
      heading.focus();
    });

    resetButton.addEventListener('click', function () {
      input.value = '';
      cards.replaceChildren();
      outcome.textContent = '';
      result.hidden = true;
      preview.hidden = false;
      status.textContent = 'Reading cleared.';
      input.focus();
    });
  }

  function start() {
    document.querySelectorAll('[data-mp-tarot]').forEach(initialize);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
