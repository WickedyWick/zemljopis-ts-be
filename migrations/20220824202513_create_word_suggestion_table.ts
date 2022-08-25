import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('word_suggestions', (t) => {
        t.increments('id').primary()
        t.integer('category_id').notNullable()
        t.string('word')
        t.string('letter')
        t.unique(['category_id', 'word', 'letter'], 'word_suggestions_category_id_word_letter_unique')
        t.timestamps()
        t.foreign('category_id').references('id').inTable('category')
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('word_suggestions')
}

