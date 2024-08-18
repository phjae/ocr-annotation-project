import { apiClient } from './ApiClient';
import { DefaultResponse } from '../common/Types';

const getOcr = async function (taskID: number, page: number) {
    return await apiClient.get<DefaultResponse>(`ocr/task?taskId=${taskID}&page=${page}`).then((res: any) => res.data);
};

// const getOcr = async function (taskID: number, page: number, data: FormData) {
//     return await multipartApiClient.post<DefaultResponse>(`ocr/request?taskId=${taskID}&page=${page}&fileSave=false`, data).then((res: any) => res.data);
// };

const OcrService = {
    getOcr,
};

export default OcrService;
