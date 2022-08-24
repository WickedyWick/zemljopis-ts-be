import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('word_suggestions', (t) => {
        t.increments('id').primary()
        t.foreign('category_id').references('id').inTable('category')
        t.string('word')
        t.unique(['category_id', 'word'], 'word_suggestions_category_id_word_unique')
        t.timestamps()
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('word_suggestions')
}

