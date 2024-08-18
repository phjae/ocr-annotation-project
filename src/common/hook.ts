import { DefaultResponse } from './Types';
import ContentService from '../service/ContentService';
import { useQueryClient } from '@tanstack/react-query';

type UseDeleteProps = {
    contentID: number;
    deleteID: number;
    onSuccess?: (res: DefaultResponse) => void;
};

export const useDeleteCommentary = () => {
    const queryClient = useQueryClient();
    return async ({ contentID, deleteID, onSuccess }: UseDeleteProps) => {
        try {
            const response = await ContentService.deleteCommentary(contentID, deleteID);
            if (response.code === 200 && response.subCode === 0) {
                onSuccess && onSuccess(response);
                await queryClient.invalidateQueries(['deleteCommentary', deleteID]);
            }
        } catch (error) {
            console.error(error);
        }
    };
};

export const useDeleteImage = () => {
    const queryClient = useQueryClient();
    return async ({ contentID, deleteID, onSuccess }: UseDeleteProps) => {
        try {
            const response = await ContentService.deleteImage(contentID, deleteID);
            if (response.code === 200 && response.subCode === 0) {
                onSuccess && onSuccess(response);
                await queryClient.invalidateQueries(['deleteImage', deleteID]);
            }
        } catch (error) {
            console.error(error);
        }
    };
};