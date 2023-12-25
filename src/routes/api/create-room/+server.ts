import type { CreateRoomDto } from '$lib/types/types';
import { createRoomValidator } from '$lib'
import { createRoomService } from '$lib/server'
import type { RequestHandler } from './$types';
import { redisDb } from '$lib/server/db';
export const POST: RequestHandler = async ({request}) => {
    try {
        const body: CreateRoomDto = await request.json() as CreateRoomDto
        const isValid: boolean | undefined = createRoomValidator(body)
        if (isValid == undefined)
            return new Response(null, {status: 500})
        if (isValid == false)
            return new Response(null, {status: 400})

        let res: string | undefined = await createRoomService(body)
        if (!res)
            return new Response(null, {status: 500})
        return new Response(res, {status: 201})
    } catch(err) {
        console.log(err)
        // if body is not valid json
        if (err instanceof SyntaxError) {
            return new Response(null, {status: 400})
        }
        return new Response(null, {status: 500})
    }

    
};