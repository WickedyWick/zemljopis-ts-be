import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('category').del();

    // Inserts seed entries
    await knex('category').insert([
        { id: 0, category: 'drzava' },
        { id: 1, category: 'grad' },
        { id: 2, category: 'ime' },
        { id: 3, category: 'biljka' },
        { id: 4, category: 'zivotinja' },
        { id: 5, category: 'planina' },
        { id: 6, category: 'reka' },
        { id: 7, category: 'predmet' }
    ]);
};
