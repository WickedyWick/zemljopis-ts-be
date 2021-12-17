import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (t) => {
        t.increments('id')
        t.string('email')
        t.string('password')
        t.string('username')
        t.boolean('verified')
        t.timestamp('created_at', { useTz: false, precision: 3 }).defaultTo(knex.fn.now(3))
        t.timestamp('updated_at', { useTz: false, precision: 3 }).defaultTo(knex.fn.now(3))
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users')
}

