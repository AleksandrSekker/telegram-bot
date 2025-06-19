import { Markup, Telegraf } from 'telegraf';
import { config } from 'dotenv';
import axios from 'axios';
import sharp from 'sharp';

config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const textStep1En = `Hi, we're Sekker Model Group.\nScouting new faces, freelancers, and model couples for global placements and exclusive project work.\nLet's start — choose your language.`;
const textStep1Uk = `Привіт! Ми — Sekker Model Group.\nШукаємо нові обличчя, фриланс-моделей та модельні пари для міжнародних контрактів і ексклюзивних проєктів.\nПочнемо — оберіть мову.`;
const textStep1It = `Ciao! Siamo Sekker Model Group.\nCerchiamo nuovi volti, modelli freelance e coppie di modelli per progetti esclusivi e collaborazioni internazionali.\nIniziamo — scegli la tua lingua.`;

const ukText =
  'Ми працюємо з новими обличчями, фрилансерами та модельними парами. Допомагаємо знайти\nміжнародні контракти та роботу в локальних проєктах.';
const enText =
  'We develop and manage new faces, freelancers, and model couples, creating tailored pathways through\nglobal placements and exclusive projects.';
const itText =
  'Sviluppiamo e rappresentiamo nuovi volti, modelli freelance e coppie di modelli, creando percorsi\npersonalizzati attraverso collaborazioni internazionali e progetti esclusivi.';

const photoAgencyUrl = process.env.PHOTO_AGENCY_URL!;

const castingTextEn = "If you're 170 cm or taller and interested in modeling, fill out the form to apply.";
const castingTextUa = 'Якщо твій зріст від 170 см і тобі цікаво працювати моделлю — заповни форму, щоб продовжити:';
const castingTextIt =
  'Se sei alto/a almeno 170 cm e sei interessato/a al mondo della moda, compila il modulo per candidarti.';

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

const userStates: Record<number, { step: number; data: any; lang: 'en' | 'uk' | 'it'; awaitingPurposeText: boolean }> =
  {};

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

// Helper to download and round an image from a URL
async function getRoundedImageBuffer(imageUrl: string, size = 500): Promise<Buffer> {
  // Download image
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const inputBuffer = Buffer.from(response.data);
  // Create a circular mask SVG
  const svg = `<svg width='${size}' height='${size}'><circle cx='${size / 2}' cy='${size / 2}' r='${
    size / 2
  }' fill='white'/></svg>`;
  // Process image with sharp
  return sharp(inputBuffer)
    .resize(size, size)
    .composite([{ input: Buffer.from(svg), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

bot.action('english', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const roundedBuffer = await getRoundedImageBuffer(photoAgencyUrl, 500);
    await ctx.replyWithPhoto(
      { source: roundedBuffer },
      {
        caption: enText,
        ...Markup.inlineKeyboard([[Markup.button.callback('Back', 'back_en')]]),
      },
    );
  } catch (err) {
    // fallback to original image if processing fails
    await ctx.replyWithPhoto(
      { url: photoAgencyUrl },
      {
        caption: enText,
        ...Markup.inlineKeyboard([[Markup.button.callback('Back', 'back_en')]]),
      },
    );
  }
  await ctx.reply(castingTextEn, Markup.inlineKeyboard([Markup.button.callback('Casting', 'casting_en')]));
});

bot.action('ukrainian', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: ukText,
      ...Markup.inlineKeyboard([[Markup.button.callback('Назад', 'back_uk')]]),
    },
  );
  await ctx.reply(castingTextUa, Markup.inlineKeyboard([Markup.button.callback('Кастинг', 'casting_uk')]));
});

bot.action('italian', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: itText,
      ...Markup.inlineKeyboard([[Markup.button.callback('Indietro', 'back_it')]]),
    },
  );
  await ctx.reply(castingTextIt, Markup.inlineKeyboard([Markup.button.callback('Candidati', 'casting_it')]));
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
  userStates[ctx.from.id] = { step: 0, data: {}, lang, awaitingPurposeText: false };
  const field = formFields[0];
  if (field.isPurpose) {
    const options = PURPOSE_OPTIONS[lang];
    await ctx.reply(
      field[`question_${lang}`],
      Markup.inlineKeyboard([
        [Markup.button.callback(options[0], 'purpose_0')],
        [Markup.button.callback(options[1], 'purpose_1')],
        [Markup.button.callback(options[2], 'purpose_2')],
        [Markup.button.callback(options[3], 'purpose_other')],
      ]),
    );
  } else {
    const question = field[`question_${lang}`];
    await ctx.reply(question);
  }
});

function validateField(key: string, value: string): string | null {
  switch (key) {
    case 'name':
      return value.trim().length > 0 ? null : 'Name cannot be empty.';
    case 'age': {
      const age = Number(value);
      if (!/^[0-9]+$/.test(value)) return 'Age must be a number.';
      if (age < 10 || age > 100) return 'Age must be between 10 and 100.';
      return null;
    }
    case 'country':
      return value.trim().length > 0 ? null : 'Country cannot be empty.';
    case 'height': {
      const height = Number(value);
      if (!/^[0-9]+$/.test(value)) return 'Height must be a number.';
      if (height < 170 || height > 220) return 'Height must be between 170 and 220 cm.';
      return null;
    }
    case 'measurements': {
      const parts = value
        .trim()
        .split(/[,\s]+/)
        .filter(Boolean);
      if (parts.length !== 3 || !parts.every((p) => /^\d{2,3}$/.test(p))) {
        return 'Please enter measurements as three numbers (bust, waist, hips) separated by commas and/or spaces.';
      }
      return null;
    }
    case 'instagram':
      if (!/^@?\w{3,}$/.test(value.trim()))
        return 'Please enter a valid Instagram username (at least 3 characters, may start with @).';
      return null;
    case 'telegram':
      if (!/^@?\w{3,}$/.test(value.trim()))
        return 'Please enter a valid Telegram username (at least 3 characters, may start with @).';
      return null;
    case 'experience':
      return value.trim().length > 0 ? null : 'Work experience cannot be empty.';
    case 'portfolio':
      if (value.trim().toLowerCase() === 'none' || value.trim().toLowerCase() === 'nessuno') return null;
      if (!/^https?:\/\/.+\..+/.test(value.trim())) return 'Please enter a valid URL or type "none".';
      return null;
    default:
      return null;
  }
}

// Handle answers for the form
bot.on(['text', 'photo'], async (ctx) => {
  const state = userStates[ctx.from.id];
  if (!state) return;

  const field = formFields[state.step];

  // Special handling for 'purpose' field
  if (field.isPurpose && !state.awaitingPurposeText) {
    // Do nothing, wait for button press
    return;
  }

  if (state.awaitingPurposeText) {
    // Save the custom text for 'purpose'
    if ('text' in ctx.message && typeof ctx.message.text === 'string') {
      state.data.purpose = ctx.message.text.trim();
      state.step++;
      state.awaitingPurposeText = false;
      // Ask next question
      if (state.step < formFields.length) {
        const nextField = formFields[state.step];
        const question = nextField[`question_${state.lang}`];
        await ctx.reply(question);
      }
    }
    return;
  }

  if (field.isPhoto) {
    if (!('photo' in ctx.message) || !ctx.message.photo || ctx.message.photo.length === 0) {
      await ctx.reply(field[`question_${state.lang}`]);
      return;
    }
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    state.data.photoFileId = photo.file_id;
    state.step++;
  } else {
    if ('text' in ctx.message && typeof ctx.message.text === 'string') {
      const value = ctx.message.text.trim();
      const validationError = validateField(field.key, value);
      if (validationError) {
        await ctx.reply(
          (state.lang === 'en' ? 'Error: ' : state.lang === 'uk' ? 'Помилка: ' : 'Errore: ') + validationError,
        );
        await ctx.reply(field[`question_${state.lang}`]);
        return;
      }
      state.data[field.key] = value;
      state.step++;
    } else {
      await ctx.reply(field[`question_${state.lang}`]);
      return;
    }
  }

  if (state.step < formFields.length) {
    const nextField = formFields[state.step];
    const question = nextField[`question_${state.lang}`];
    await ctx.reply(question);
  } else {
    const messageText = Object.entries(state.data)
      .filter(([key]) => key !== 'photoFileId')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    await ctx.reply(
      state.lang === 'en'
        ? 'Your application has been received.\nFeel free to reach out if you have any questions.'
        : state.lang === 'uk'
        ? 'Вашу заявку прийнято.\nЯкщо у вас виникнуть запитання — не соромтеся звертатися.'
        : 'La tua candidatura è stata ricevuta.\nPer qualsiasi domanda, non esitare a contattarci.',
    );
    try {
      if (state.data.photoFileId) {
        await bot.telegram.sendPhoto(ADMIN_ID, state.data.photoFileId, {
          caption: `New casting application (${
            state.lang === 'en' ? 'English' : state.lang === 'uk' ? 'Ukrainian' : 'Italian'
          }):\n${messageText}`,
        });
      } else {
        await bot.telegram.sendMessage(
          ADMIN_ID,
          `New casting application (${
            state.lang === 'en' ? 'English' : state.lang === 'uk' ? 'Ukrainian' : 'Italian'
          }):\n${messageText}`,
        );
      }
    } catch (err) {
      console.error('Failed to send message to admin:', err);
    }
    delete userStates[ctx.from.id];
  }
});

// Handle purpose button actions
['purpose_0', 'purpose_1', 'purpose_2', 'purpose_other'].forEach((action, idx) => {
  bot.action(action, async (ctx) => {
    const state = userStates[ctx.from.id];
    if (!state) return;
    await ctx.answerCbQuery();
    const options = PURPOSE_OPTIONS[state.lang];
    if (action === 'purpose_other') {
      state.awaitingPurposeText = true;
      await ctx.reply(
        state.lang === 'en'
          ? 'Please describe your purpose:'
          : state.lang === 'uk'
          ? 'Будь ласка, опишіть вашу мету:'
          : 'Per favore, descrivi il motivo:',
      );
    } else {
      state.data.purpose = options[idx];
      state.step++;
      // Ask next question
      if (state.step < formFields.length) {
        const nextField = formFields[state.step];
        const question = nextField[`question_${state.lang}`];
        await ctx.reply(question);
      }
    }
  });
});

bot.launch().then(() => {
  console.log('Bot is running...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
