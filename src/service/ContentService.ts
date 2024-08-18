import {apiClient, multipartApiClient} from "./ApiClient";
import {DefaultResponse} from "../common/Types";

const createContent = async function(content: FormData | undefined) {
    return await multipartApiClient.post<DefaultResponse>('content', content).then((res: any) => res.data);
};

const getContents = async function (taskID: number, page: number) {
    return await apiClient.get<DefaultResponse>(`content/${taskID}/${page}`).then((res: any) => res.data);
};

const saveComment = async function (contentID: number, data: any) {
    return await apiClient.post<DefaultResponse>(`content/${contentID}/comment`, data).then((res: any) => res.data);
};

const deleteContent = async function (contentID: number) {
    return await apiClient.delete<DefaultResponse>(`content/${contentID}`).then((res: any) => res.data);
};

const deleteCommentary = async function (contentID: number, commentaryID: number) {
    return await apiClient.delete<DefaultResponse>(`content/${contentID}/commentary/${commentaryID}`).then((res: any) => res.data);
};

const deleteImage = async function (contentID: number, attchID: number) {
    return await apiClient.delete<DefaultResponse>(`content/${contentID}/attch/${attchID}`).then((res: any) => res.data);
};

const getContentPages = async function (taskID: number) {
    return await apiClient.get<DefaultResponse>(`content/${taskID}/content-pages`).then((res: any) => res.data);
};

const ContentService = {
    createContent,
    getContents,
    saveComment,
    deleteContent,
    deleteCommentary,
    deleteImage,
    getContentPages,
};

export default ContentService;