import { Markup, Telegraf } from 'telegraf';
import { config } from 'dotenv';

config();
const bot = new Telegraf(process.env.BOT_TOKEN!);
const textStep1En = `Hello. I am Tina international booker\n(INTERMODEL'S).\nI'm looking for new faces. Choose a langage please.`;
const textStep1Uk = `Привіт. Я — Тіна, міжнародний букер\nINTERMODEL'S).\nЯ шукаю нові обличчя. Будь ласка, оберіть мову.`;

const ukText =
  "Мене звати Тіна. Міжнародний букер в агенції INTERMODEL'S. Шукаю нові обличчя на моделей із досвідом для просування та побудови карʼєри в модельному бізнесі";
const enText =
  "My name is Tina. I am an international booker at INTERMODEL'S agency. I am looking for new faces and experienced models for promotion and building a career in the modeling business.";
const photoAgencyUrl = 'https://images.pexels.com/photos/4023351/pexels-photo-4023351.jpeg';

const castingTextEn =
  'If you are interested in the modeling industry\nand your height is above 170\nPlease fill out the casting form.';
const castingTextUa = 'Якщо Ви зацікавлені у модельній сфері\nта ваш зріст вище 170 см\nЗаповніть анкету на кастинг';

const ADMIN_ID = process.env.ADMIN_ID!;

const formFields = [
  { key: 'name', question_en: 'What is your Name?', question_uk: 'Як вас звати?' },
  { key: 'age', question_en: 'How old are you?', question_uk: 'Скільки вам років?' },
  { key: 'country', question_en: 'Which country are you from?', question_uk: 'З якої ви країни?' },
  { key: 'height', question_en: 'What is your height (in cm)?', question_uk: 'Який у вас зріст (у см)?' },
  {
    key: 'measurements',
    question_en: 'What are your measurements (bust, waist, hips)?',
    question_uk: 'Які у вас параметри (груди, талія, стегна)?',
  },
  { key: 'instagram', question_en: 'Your Instagram handle?', question_uk: 'Ваш Instagram?' },
  { key: 'telegram', question_en: 'Your Telegram username?', question_uk: 'Ваш Telegram username?' },
  {
    key: 'experience',
    question_en: 'Do you have work experience? (describe)',
    question_uk: 'Чи є у вас досвід роботи? (опишіть)',
  },
  {
    key: 'portfolio',
    question_en: 'Portfolio link (if available, else type "none")',
    question_uk: 'Посилання на портфоліо (якщо є, або напишіть "немає")',
  },
  {
    key: 'photo',
    question_en:
      'Also, please attach a photo of your face without makeup or filters to your application. You can take it during the daytime (face the window for natural light).',
    question_uk:
      'Також, до заявки прикріпіть фото Вашого обличчя без макіяжу та фільтрів. Зробити його можна у денний час (поверніть обличчя до вікна).',
    isPhoto: true,
  },
];

const userStates: Record<number, { step: number; data: any; lang: 'en' | 'uk' }> = {};

bot.start((ctx) =>
  ctx.reply(
    textStep1En,
    Markup.inlineKeyboard([
      Markup.button.callback('🇺🇸 English', 'english'),
      Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
    ]),
  ),
);

bot.action('english', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: photoAgencyUrl },
    {
      caption: enText,
      ...Markup.inlineKeyboard([[Markup.button.callback('Back', 'back_en')]]),
    },
  );
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

bot.action('back_en', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    textStep1En,
    Markup.inlineKeyboard([
      Markup.button.callback('🇺🇸 English', 'english'),
      Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
    ]),
  );
});

bot.action('back_uk', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    textStep1Uk,
    Markup.inlineKeyboard([
      Markup.button.callback('🇺🇸 English', 'english'),
      Markup.button.callback('🇺🇦 Українська', 'ukrainian'),
    ]),
  );
});

bot.action(['casting_en', 'casting_uk'], async (ctx) => {
  await ctx.answerCbQuery();
  const lang = ctx.match[0] === 'casting_en' ? 'en' : 'uk';
  userStates[ctx.from.id] = { step: 0, data: {}, lang };
  const question = formFields[0][`question_${lang}`];
  await ctx.reply(question);
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
      if (value.trim().toLowerCase() === 'none' || value.trim().toLowerCase() === 'немає') return null;
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
        await ctx.reply((state.lang === 'en' ? 'Error: ' : 'Помилка: ') + validationError);
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
      state.lang === 'en' ? 'Thank you! Your application has been sent.' : 'Дякуємо! Вашу анкету надіслано.',
    );
    try {
      if (state.data.photoFileId) {
        await bot.telegram.sendPhoto(ADMIN_ID, state.data.photoFileId, {
          caption: `New casting application (${state.lang === 'en' ? 'English' : 'Ukrainian'}):\n${messageText}`,
        });
      } else {
        await bot.telegram.sendMessage(
          ADMIN_ID,
          `New casting application (${state.lang === 'en' ? 'English' : 'Ukrainian'}):\n${messageText}`,
        );
      }
    } catch (err) {
      console.error('Failed to send message to admin:', err);
    }
    delete userStates[ctx.from.id];
  }
});

bot.launch().then(() => {
  console.log('Bot is running...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
