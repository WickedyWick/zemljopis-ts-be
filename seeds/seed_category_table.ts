import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('category').del();

    // Inserts seed entries
    await knex('category').insert([
        { id: 0, category: 'Drzava' },
        { id: 1, category: 'Grad' },
        { id: 2, category: 'Ime' },
        { id: 3, category: 'Biljka' },
        { id: 4, category: 'Zivotinja' },
        { id: 5, category: 'Planina' },
        { id: 6, category: 'Reka' },
        { id: 7, category: 'Predmet' }
    ]);
};
