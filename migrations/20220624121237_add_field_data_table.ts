import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('field_data', (t) => {
        t.increments('id').primary()
        t.string('data')
        t.string('letter')
        t.integer('category_id').references('id').inTable('category')
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('field_data')
}

