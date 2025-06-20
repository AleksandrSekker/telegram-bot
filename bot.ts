import { Markup, Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const textStep1En = `Hi,\nwe're Sekker Model Group.\nScouting new faces, freelancers, and model couples for global placements and exclusive project work.\nLet's start — choose your language.`;
const textStep1Uk = `Привіт!\nМи — Sekker Model Group.\nШукаємо нові обличчя, фриланс-моделей та модельні пари для міжнародних контрактів і ексклюзивних проєктів.\nПочнемо — оберіть мову.`;
const textStep1It = `Ciao!\nSiamo Sekker Model Group.\nCerchiamo nuovi volti, modelli freelance e coppie di modelli per progetti esclusivi e collaborazioni internazionali.\nIniziamo — scegli la tua lingua.`;

const ukText =
  'Ми працюємо з новими обличчями, фрилансерами та модельними парами. Допомагаємо знайти\nміжнародні контракти та роботу в локальних проєктах.\nЯкщо твій зріст від 170 см і тобі цікаво працювати моделлю — заповни форму, щоб продовжити';
const enText =
  "We develop and manage new faces, freelancers, and model couples, creating tailored pathways through\nglobal placements and exclusive projects.\nIf you're 170 cm or taller and interested in modeling, fill out the form to apply.";
const itText =
  'Sviluppiamo e rappresentiamo nuovi volti, modelli freelance e coppie di modelli, creando percorsi\npersonalizzati attraverso collaborazioni internazionali e progetti esclusivi.\nSe sei alto/a almeno 170 cm e sei interessato/a al mondo della moda, compila il modulo per candidarti.';

const photoAgencyUrl = 'https://i.postimg.cc/mrb8gJFt/2025-06-19-20-27-17.png';

const ADMIN_ID = process.env.ADMIN_ID!;

const PURPOSE_OPTIONS = {
  en: [
    "I'm looking for a mother agency",
    'I want to be added to your model database',
    "I'm part of a model couple",
    'Other (please specify)',
  ],
  uk: [
    'Я шукаю материнську-агенцію',
    'Хочу потрапити до вашої бази моделей',
    'Ми — модельна пара',
    'Інше (вкажіть, будь ласка)',
  ],
  it: [
    'Cerco una mother agency',
    'Voglio essere inserito/a nel vostro database di modelli',
    'Siamo una coppia di modelli',
    'Altro (specifica per favore)',
  ],
};

const formFields = [
  {
    key: 'purpose',
    question_en: 'What are you applying for? (Choose one or describe briefly)',
    question_uk: 'З якою метою ви заповнюєте анкету? (Оберіть один варіант або опишіть коротко)',
    question_it: "Per quale motivo stai inviando la candidatura? (Scegli un'opzione o descrivi brevemente)",
    isPurpose: true,
  },
  { key: 'name', question_en: 'What is your Name?', question_uk: 'Як вас звати?', question_it: 'Come ti chiami?' },
  { key: 'age', question_en: 'How old are you?', question_uk: 'Скільки вам років?', question_it: 'Quanti anni hai?' },
  {
    key: 'country',
    question_en: 'Which country are you from?',
    question_uk: 'З якої ви країни?',
    question_it: 'Da quale paese vieni?',
  },
  {
    key: 'height',
    question_en: 'What is your height (in cm)?',
    question_uk: 'Який у вас зріст (у см)?',
    question_it: 'Qual è la tua altezza (in cm)?',
  },
  {
    key: 'measurements',
    question_en: 'What are your measurements (bust, waist, hips)?',
    question_uk: 'Які у вас параметри (груди, талія, стегна)?',
    question_it: 'Quali sono le tue misure (busto, vita, fianchi)?',
  },
  {
    key: 'instagram',
    question_en: 'Your Instagram handle?',
    question_uk: 'Ваш Instagram?',
    question_it: 'Il tuo profilo Instagram?',
  },
  {
    key: 'telegram',
    question_en: 'Your Telegram username?',
    question_uk: 'Ваш Telegram username?',
    question_it: 'Il tuo username Telegram?',
  },
  {
    key: 'experience',
    question_en: 'Do you have work experience? (describe)',
    question_uk: 'Чи є у вас досвід роботи? (опишіть)',
    question_it: 'Hai esperienza lavorativa? (descrivi)',
  },
  {
    key: 'portfolio',
    question_en: 'Portfolio link (if available, else type "none")',
    question_uk: 'Посилання на портфоліо (якщо є, або напишіть "немає")',
    question_it: 'Link al portfolio (se disponibile, altrimenti scrivi "nessuno")',
  },
  {
    key: 'photo',
    question_en:
      'Please attach a photo of your face without makeup or filters.\nTake it during the day, facing a window in natural light.',
    question_uk:
      'Будь ласка, прикріпіть фото вашого обличчя без макіяжу та фільтрів.\nЗробіть його вдень, повернувши обличчя до вікна при природному освітленні.',
    question_it:
      'Ti preghiamo di allegare una foto del tuo viso senza trucco né filtri.\nScattala durante il giorno, rivolto/a verso una finestra con luce naturale.',
    isPhoto: true,
  },
];

const userStates: Record<
  number,
  {
    step: number;
    data: any;
    lang: 'en' | 'uk' | 'it';
    awaitingPurposeText: boolean;
    waitingForForm: boolean;
    waitingForPurpose?: boolean;
    waitingForPhoto?: boolean;
  }
> = {};

bot.start((ctx) =>
  ctx.reply(
    textStep1En,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🇺🇸 English', 'english'),
        Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
        Markup.button.callback('🇮🇹 Italiano', 'italian'),
      ],
    ]),
  ),
);

bot.action('english', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: enText,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Back', 'back_en'), Markup.button.callback('Casting', 'casting_en')],
      ]),
    },
  );
});

bot.action('ukrainian', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: ukText,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back_uk'), Markup.button.callback('Кастинг', 'casting_uk')],
      ]),
    },
  );
});

bot.action('italian', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: itText,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Indietro', 'back_it'), Markup.button.callback('Candidati', 'casting_it')],
      ]),
    },
  );
});

bot.action('back_en', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    textStep1En,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🇺🇸 English', 'english'),
        Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
        Markup.button.callback('🇮🇹 Italiano', 'italian'),
      ],
    ]),
  );
});

bot.action('back_uk', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    textStep1Uk,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🇺🇸 English', 'english'),
        Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
        Markup.button.callback('🇮🇹 Italiano', 'italian'),
      ],
    ]),
  );
});

bot.action('back_it', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    textStep1It,
    Markup.inlineKeyboard([
      [
        Markup.button.callback('🇺🇸 English', 'english'),
        Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
        Markup.button.callback('🇮🇹 Italiano', 'italian'),
      ],
    ]),
  );
});

bot.action(['casting_en', 'casting_uk', 'casting_it'], async (ctx) => {
  await ctx.answerCbQuery();
  let lang: 'en' | 'uk' | 'it' = 'en';
  if (ctx.match[0] === 'casting_uk') lang = 'uk';
  if (ctx.match[0] === 'casting_it') lang = 'it';
  userStates[ctx.from.id] = { step: 0, data: {}, lang, awaitingPurposeText: false, waitingForForm: true };

  // Form texts for each language
  const formTexts = {
    en:
      'Please answer any of the following questions in one message (all fields are optional):\n' +
      '\nName:' +
      '\nCountry, city:' +
      '\nAge:' +
      '\nHeight:' +
      '\nMeasurements:' +
      '\nShoe size:' +
      '\nEye color:' +
      '\nHair color:' +
      '\nPiercing, tattoo:' +
      '\nYour modeling experience:' +
      '\nInstagram link:' +
      '\nAdd a link to your model book and snaps',
    uk:
      "Відповідайте на будь-які з наступних питань одним повідомленням (усі поля необов'язкові):\n" +
      "\nІм'я:" +
      '\nКраїна, місто:' +
      '\nВік:' +
      '\nЗріст:' +
      '\nПараметри (груди-талія-стегна):' +
      '\nРозмір взуття:' +
      '\nКолір очей:' +
      '\nКолір волосся:' +
      '\nПірсинг, тату:' +
      '\nВаш модельний досвід:' +
      '\nПосилання на Instagram:' +
      '\nДодайте посилання на ваш бук і снепи',
    it:
      'Rispondi a una o più delle seguenti domande in un unico messaggio (tutti i campi sono opzionali):\n' +
      '\nNome:' +
      '\nPaese, città:' +
      '\nEtà:' +
      '\nAltezza:' +
      '\nMisure (busto-vita-fianchi):' +
      '\nNumero di scarpe:' +
      '\nColore degli occhi:' +
      '\nColore dei capelli:' +
      '\nPiercing, tatuaggi:' +
      '\nEsperienza come modello/a:' +
      '\nLink Instagram:' +
      '\nAggiungi un link al tuo book e ai tuoi snaps',
  };

  await ctx.reply(formTexts[lang]);
  await ctx.replyWithPhoto({
    url: 'https://i.postimg.cc/mgF09tjK/IMG-2265.jpg',
  });
  await ctx.replyWithPhoto({
    url: 'https://i.postimg.cc/k53LvqhG/IMG-2267.jpg',
  });
  userStates[ctx.from.id].waitingForForm = true;
});

// Handle answers for the form (single message)
bot.on(['text', 'photo'], async (ctx) => {
  const state = userStates[ctx.from.id];
  if (!state || !state.waitingForForm) return;

  let text = '';
  let photoFileId: string | undefined = undefined;

  if ('photo' in ctx.message && ctx.message.photo && ctx.message.photo.length > 0) {
    photoFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    if ('caption' in ctx.message && ctx.message.caption) {
      text = ctx.message.caption;
    }
  } else if ('text' in ctx.message && ctx.message.text) {
    text = ctx.message.text;
  }

  if (!text.trim()) {
    await ctx.reply(
      state.lang === 'en'
        ? 'Please answer at least one question in text.'
        : state.lang === 'uk'
        ? 'Будь ласка, дайте відповідь хоча б на одне питання текстом.'
        : 'Per favore, rispondi almeno a una domanda in testo.',
    );
    return;
  }

  // Save user's answers in state, move to photo step
  state.data.formText = text;
  state.waitingForForm = false;
  state.waitingForPhoto = true;

  // Prompt for photo with language-specific text and show example photos
  const photoPrompt =
    state.lang === 'en'
      ? 'Please attach a photo of your face without makeup or filters.\nTake it during the day, facing a window in natural light.'
      : state.lang === 'uk'
      ? 'Будь ласка, прикріпіть фото вашого обличчя без макіяжу та фільтрів.\nЗробіть його вдень, повернувши обличчя до вікна при природному освітленні.'
      : 'Ti preghiamo di allegare una foto del tuo viso senza trucco né filtri.\nScattala durante il giorno, rivolto/a verso una finestra con luce naturale.';
  await ctx.reply(photoPrompt);
  await ctx.replyWithPhoto({ url: 'https://i.postimg.cc/mgF09tjK/IMG-2265.jpg' });
  await ctx.replyWithPhoto({ url: 'https://i.postimg.cc/k53LvqhG/IMG-2267.jpg' });
});

// Handle photo upload after form
bot.on('photo', async (ctx) => {
  const state = userStates[ctx.from.id];
  if (!state || !state.waitingForPhoto) return;
  const photoFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  state.data.photoFileId = photoFileId;
  state.waitingForPhoto = false;
  state.waitingForPurpose = true;

  // Show purpose options as inline keyboard
  const options = PURPOSE_OPTIONS[state.lang];
  await ctx.reply(
    state.lang === 'en'
      ? 'What are you applying for? (Choose one or skip)'
      : state.lang === 'uk'
      ? 'З якою метою ви заповнюєте анкету? (Оберіть один варіант або пропустіть)'
      : "Per quale motivo stai inviando la candidatura? (Scegli un'opzione o salta)",
    Markup.inlineKeyboard([
      [Markup.button.callback(options[0], 'purpose_0')],
      [Markup.button.callback(options[1], 'purpose_1')],
      [Markup.button.callback(options[2], 'purpose_2')],
      [Markup.button.callback(options[3], 'purpose_other')],
      [
        Markup.button.callback(
          state.lang === 'en' ? 'Skip' : state.lang === 'uk' ? 'Пропустити' : 'Salta',
          'purpose_skip',
        ),
      ],
    ]),
  );
});

// Handle purpose button actions
['purpose_0', 'purpose_1', 'purpose_2', 'purpose_other', 'purpose_skip'].forEach((action, idx) => {
  bot.action(action, async (ctx) => {
    const state = userStates[ctx.from.id];
    if (!state || !state.waitingForPurpose) return;
    await ctx.answerCbQuery();
    const options = PURPOSE_OPTIONS[state.lang];
    let purpose = '';
    if (action === 'purpose_other') {
      state.awaitingPurposeText = true;
      await ctx.reply(
        state.lang === 'en'
          ? 'Please describe your purpose:'
          : state.lang === 'uk'
          ? 'Будь ласка, опишіть вашу мету:'
          : 'Per favore, descrivi il motivo:',
      );
      return;
    } else if (action === 'purpose_skip') {
      purpose = '';
    } else {
      purpose = options[idx];
    }
    state.data.purpose = purpose;
    state.waitingForPurpose = false;

    // Send to admin
    let adminText = `New casting application (${
      state.lang === 'en' ? 'English' : state.lang === 'uk' ? 'Ukrainian' : 'Italian'
    }):\n`;
    if (state.data.purpose) {
      adminText += `Purpose: ${state.data.purpose}\n`;
    }
    adminText += state.data.formText || '';
    try {
      if (state.data.photoFileId) {
        await bot.telegram.sendPhoto(ADMIN_ID, state.data.photoFileId, {
          caption: adminText,
        });
      } else {
        await bot.telegram.sendMessage(ADMIN_ID, adminText);
      }
    } catch (err) {
      console.error('Failed to send message to admin:', err);
    }
    await ctx.reply(
      state.lang === 'en'
        ? 'Your application has been received. Feel free to reach out if you have any questions.'
        : state.lang === 'uk'
        ? 'Вашу заявку прийнято. Якщо у вас виникнуть запитання — не соромтеся звертатися.'
        : 'La tua candidatura è stata ricevuta. Per qualsiasi domanda, non esitare a contattarci.',
    );
    delete userStates[ctx.from.id];
  });
});

// Handle custom purpose text after 'purpose_other'
bot.on('text', async (ctx) => {
  const state = userStates[ctx.from.id];
  if (!state || !state.awaitingPurposeText) return;
  state.data.purpose = ctx.message.text.trim();
  state.awaitingPurposeText = false;
  state.waitingForPurpose = false;

  // Send to admin
  let adminText = `New casting application (${
    state.lang === 'en' ? 'English' : state.lang === 'uk' ? 'Ukrainian' : 'Italian'
  }):\n`;
  if (state.data.purpose) {
    adminText += `Purpose: ${state.data.purpose}\n`;
  }
  adminText += state.data.formText || '';
  try {
    if (state.data.photoFileId) {
      await bot.telegram.sendPhoto(ADMIN_ID, state.data.photoFileId, {
        caption: adminText,
      });
    } else {
      await bot.telegram.sendMessage(ADMIN_ID, adminText);
    }
  } catch (err) {
    console.error('Failed to send message to admin:', err);
  }
  await ctx.reply(
    state.lang === 'en'
      ? 'Your application has been received. Feel free to reach out if you have any questions.'
      : state.lang === 'uk'
      ? 'Вашу заявку прийнято. Якщо у вас виникнуть запитання — не соромтеся звертатися.'
      : 'La tua candidatura è stata ricevuta. Per qualsiasi domanda, non esitare a contattarci.',
  );
  delete userStates[ctx.from.id];
});

bot.launch().then(() => {
  console.log('Bot is running...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
