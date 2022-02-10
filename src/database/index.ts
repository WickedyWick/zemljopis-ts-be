import knex from 'knex'
import { attachPaginate } from "knex-paginate"

export const db = knex({
    client: process.env.DB_CLIENT,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    },
    pool: { min:0, max: 99 },
    postProcessResponse: async (result, queryContext) => {
        if (!queryContext?.prep) return result

        if (Array.isArray(result)) {
            return await Promise.all(result.map(row => queryContext.prep(row)))
        } else {
            const d = await queryContext.prep(result)
            return d
        }
    }
})

attachPaginate()