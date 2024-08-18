import {apiClient, multipartApiClient} from "service/ApiClient";
import {DefaultResponse} from "../common/Types";
import StringUtil from "../common/StringUtil";

const saveTask = async function (data:FormData){
  return await multipartApiClient.post<DefaultResponse>("task", data).then((res:any)=>res.data)
}

const getTask = async function (taskID: number) {
  return await apiClient.get<DefaultResponse>(`task/${taskID}`).then((res: any) => res.data);
};

const getTaskList = async function (page: number,
                                    size: number,
                                    sort: string,
                                    direction: "none" | "ASC" | "DESC",
                                    contentType: string,
                                    status: string,
                                    documentTitle: string,
                                    workerUserId: string,
                                    reviewerUserId: string,
                                    listType: string,

)
{
  let queryParam = `task/taskList?page=${page}&size=${size}&listType=${listType}`;
  if(StringUtil.isNotEmpty(contentType)) queryParam += `&contentType=${contentType}`
  if(StringUtil.isNotEmpty(status)) queryParam += `&status=${status}`
  if(StringUtil.isNotEmpty(documentTitle)) queryParam += `&contentTitle=${documentTitle}`
  if(StringUtil.isNotEmpty(workerUserId)) queryParam += `&workerUserId=${workerUserId}`
  if(StringUtil.isNotEmpty(reviewerUserId)) queryParam += `&reviewerUserId=${reviewerUserId}`
  return await apiClient.post<DefaultResponse>(queryParam).then((res:any)=>res.data)
}

const deleteTasks = async function (checkList:Set<any>)
{
  const taskArray = Array.from(checkList);
  return await apiClient.post<DefaultResponse>(`task/deleteTasks`, taskArray).then((res:any)=>res.data)
}

const changeTasks = async function (checkList:Set<any>, workerUserId:string, reviewerUserId:string, status:string)
{
  const taskArray = Array.from(checkList);
  let queryParam = 'taskIds='+taskArray.toString();
  if(StringUtil.isNotEmpty(workerUserId)) queryParam += `&workerUserId=${workerUserId}`
  if(StringUtil.isNotEmpty(reviewerUserId)) queryParam += `&reviewerUserId=${reviewerUserId}`
  if(StringUtil.isNotEmpty(status)) queryParam += `&status=${status}`
  return await apiClient.post<DefaultResponse>(`task/admin/update?${queryParam}`).then((res:any)=>res.data)
}

const updateTask = async function (taskID: number, data: any) {
  return await apiClient.patch<DefaultResponse>(`task/${taskID}`, data).then((res: any) => res.data);
};

const getTaskFile = async function (path: string) {
  return await apiClient.post<DefaultResponse>(`task/file?path=${path}`, null, {
    responseType: 'blob',
  }).then((res: any) => res.data);
};

const TaskService = {
  saveTask,
  getTask,
  getTaskList,
  deleteTasks,
  updateTask,
  getTaskFile,
  changeTasks,
};

export default TaskService;