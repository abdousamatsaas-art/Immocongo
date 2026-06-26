import { sqliteTable, text, integer } from '@netlify/base/persistence';

// NOTE:
// Netlify Database + Drizzle schema.
// We store arrays as JSON text (equipements/images).

export const announcements = sqliteTable('announcements', {
  id: text('id').primaryKey(),
  createdAt: integer('createdAt', { mode: 'number' }).notNull(),

  titre: text('titre').notNull(),
  type: text('type').notNull(), // 'vente' | 'location'
  description: text('description').notNull(),

  quartier: text('quartier').notNull(),
  adresse: text('adresse').notNull(),

  prix: text('prix').notNull(), // keep as text to preserve formatting from UI
  statut: text('statut').notNull(),

  chambres: integer('chambres', { mode: 'number' }).notNull().default(0),
  sallesDeBain: integer('sallesDeBain', { mode: 'number' }).notNull().default(0),
  capacite: integer('capacite', { mode: 'number' }).notNull().default(1),
  surface: integer('surface', { mode: 'number' }).notNull().default(0),

  note: integer('note', { mode: 'number' }).notNull().default(0),
  nombreAvis: integer('nombreAvis', { mode: 'number' }).notNull().default(0),

  urgent: integer('urgent', { mode: 'number' }).notNull().default(0),

  equipements: text('equipements').notNull().default('[]'), // JSON string
  images: text('images').notNull().default('[]'), // JSON string
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  createdAt: integer('createdAt', { mode: 'number' }).notNull(),

  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),

  quartier: text('quartier').notNull().default(''),
});

