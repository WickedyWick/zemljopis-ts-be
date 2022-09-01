import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('general_suggestions', (t) => {
        t.increments('id').primary()
        t.text('suggestion_text')
        t.timestamps()

    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('general_suggestions')
}

