import httpStatus from "http-status";
import { ApiError } from ".";

export const ERROR_GENERAL_SUGGESTION = new ApiError({
    name: 'ERROR_GENERAL_SUGGESTION',
    message: 'Error during general suggestion',
    status: httpStatus.INTERNAL_SERVER_ERROR
})