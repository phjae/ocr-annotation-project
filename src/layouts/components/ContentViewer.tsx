import Grid from '@mui/material/Grid';
import React, { useEffect, useMemo, useState } from 'react';
import DocInfoMetaDataInput from './labelInputs/DocInfoMetaDataInput';
import styled from '@emotion/styled';
import Icon from '@mui/material/Icon';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import DocContentDataInput12 from './labelInputs/DocContentDataInput12';
import { useParams } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import { CONTENT_TYPE, ROLE_CODE, TASK_STATUS, USER_ID } from '../../common/Constant';
import ContentList from './ContentList';
import {
    contentSavedFlagRecoilState,
    contentStateRecoilState,
    contentTypeRecoilState,
    convertedDimensionRecoilState, fileRecoilState,
    pageRecoilState, subFileRecoilState,
} from '../../store/recoilState';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { DefaultResponse } from '../../common/Types';
import ContentService from '../../service/ContentService';
import TaskService from '../../service/TaskService';
import { ContentConstructor } from '../../common/Content';

interface LabelViewerProps {
    collapse: string;
}

const LabelViewerContainer = styled(Grid)<LabelViewerProps>`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    overflow: hidden;
    height: 100vh;
    max-height: 1200px;

    & > .button-wrapper {
        & > div {
            min-width: 600px;
            display: flex;
            justify-content: flex-end;

            & > button:first-of-type {
                width: 150px;
                margin-right: 24px;
            }
        }
    }

    & > .label-container {
        border: 1px solid gray;
        width: 100%;
        height: 100%;
        background-color: #fff;
        display: flex;
        flex-wrap: nowrap;
        overflow: auto;

        & > .label-detail {
            min-width: 600px;
            overflow: auto;
        }

        & .label-list {
            transition: all ease 0.5s;
            min-width: ${(props) => (props.collapse === 'true' ? '190px' : '0%')};
            border-left: ${(props) => (props.collapse === 'true' ? '1px solid gray' : 'none')};
            overflow: auto;
        }
    }
`;

function ContentViewer(): JSX.Element {
    const userId = useMemo(() => localStorage.getItem(USER_ID), []);
    const roleCode = useMemo(() => localStorage.getItem(ROLE_CODE), []);
    const [collapse, setCollapse] = useState<boolean>(true);
    const contentType = useRecoilValue(contentTypeRecoilState);
    const { id: taskID } = useParams();
    const pageSet = useRecoilValue(pageRecoilState);
    const [contentState, setContentState] = useRecoilState(contentStateRecoilState);
    const convertedDimension = useRecoilValue(convertedDimensionRecoilState);
    const [response, setResponse] = useState<any>(undefined);
    const [isCalled, setIsCalled] = useState<boolean>(false);
    const contentSavedFlag = useRecoilValue(contentSavedFlagRecoilState);
    const [taskMeta, setTaskMeta] = useState<any>(null);
    const [filePath, setFilePath] = useState<string>('');
    const [subFilePath, setSubFilePath] = useState<string>('');
    const setFile = useSetRecoilState(fileRecoilState);
    const setSubFile = useSetRecoilState(subFileRecoilState);
    const [confirmMsg, setConfirmMsg] = useState<string>('');
    const [openConfirmMsg, setOpenConfirmMsg] = useState(false);
    const [changeStatus, setChangeStatus] = useState<string>('');
    const checkList = new Set<any>([taskID]);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [openSuccessMsg, setOpenSuccessMsg] = useState(false);

    const { refetch: getTask } = useQuery<any, AxiosError>(['getTask', taskID], () => TaskService.getTask(1), {
        onSuccess: (res: DefaultResponse) => {
            if (res.code === 200 && res.subCode === 0) {
                setTaskMeta(res.data);
            }
        },
    });

    useEffect(() => {
        setTaskMeta(null);
        getTask();
    }, []);

    useEffect(() => {
        if (taskMeta) {
            setFilePath(taskMeta.mainFilePath);
            setSubFilePath(taskMeta.subFilePath);
        }
    }, [taskMeta]);

    const { refetch: getContents } = useQuery<DefaultResponse, AxiosError>(
        ['getContents'],
        () => ContentService.getContents(1, +pageSet.page),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setResponse(res.data);
                    setIsCalled(true);
                }
            },
        },
    );

    useEffect(() => {
        if (+pageSet.page !== undefined) {
            getContents();
        }
    }, [+pageSet.page, contentSavedFlag]);

    useEffect(() => {
        getTaskFile();
    }, [filePath]);

    useEffect(() => {
        getTaskFile();
    }, [subFilePath]);

    const fetchFiles = async () => {
        const mainFile = taskMeta?.mainFilePath ? await TaskService.getTaskFile(taskMeta.mainFilePath) : null;
        const subFile = taskMeta?.subFilePath ? await TaskService.getTaskFile(taskMeta.subFilePath) : null;
        return { mainFile, subFile };
    };

    const { refetch: getTaskFile } = useQuery<
        {
            mainFile: DefaultResponse | null;
            subFile: DefaultResponse | null;
        },
        AxiosError
    >(['getTaskFile', taskMeta?.mainFilePath, taskMeta?.subFilePath], fetchFiles, {
        enabled: false,
        onSuccess: (res) => {
            if (res.mainFile) {
                setFile(res.mainFile);
                console.log('Main file fetched successfully', res);
            }
            if (res.subFile) {
                setSubFile(res.subFile);
                console.log('Sub-file fetched successfully', res);
            }
        },
        onError: (err) => {
            alert('파일을 불러오는데 실패하였습니다. 다시 시도해주세요.');
            console.error('Failed to load a file', err);
        },
    });

    useEffect(() => {
        if (response === undefined || !convertedDimension.convertedWidth || !isCalled) return;
        const instances = response.map((item: any) => {
            item.contentType = contentType;
            return new ContentConstructor(item, convertedDimension);
        });
        if (instances.length > 0) {
            setContentState({
                activatedState: contentState.activatedState,
                activatedPage: contentState.activatedPage,
                contents: instances,
            });
            setIsCalled(false);
        } else {
            setContentState({
                activatedState: undefined,
                activatedPage: undefined,
                contents: [],
            });
            setIsCalled(false);
            return;
        }
    }, [response, convertedDimension, isCalled, contentState.activatedState]);

    const { refetch: changeTasks } = useQuery<DefaultResponse, AxiosError>(
        ['changeTasks', changeStatus],
        () => TaskService.changeTasks(checkList, '', '', changeStatus),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setSuccessMsg('상태 변경이 완료되었습니다.');
                    setOpenSuccessMsg(true);
                    getTask();
                }
            },
        },
    );

    const handleUpdateStatusClick = () => {
        setOpenConfirmMsg(true);
        setConfirmMsg('상태 변경 시 다시 되돌릴 수 없습니다. 변경하시겠습니까?');
    };

    const handleYes = () => {
        if (taskMeta.status === TASK_STATUS.READY) {
            setChangeStatus(TASK_STATUS.ANNOTATION);
        }
        if (taskMeta.status === TASK_STATUS.ANNOTATION) {
            setChangeStatus(TASK_STATUS.REVIEW);
        }
        if (taskMeta.status === TASK_STATUS.REVIEW) {
            setChangeStatus(TASK_STATUS.COMPLETE);
        }
    };

    useEffect(() => {
        if (changeStatus && taskMeta.status !== changeStatus) {
            changeTasks();
            setOpenConfirmMsg(false);
        }
    }, [changeStatus]);

    return (
        <LabelViewerContainer className='label-viewer' collapse={collapse.toString()}>
            <Grid className='button-wrapper' container>
                <Grid item xs={collapse ? 9 : 12}>
                    {roleCode === 'ADMIN' ? (
                        <CustomButton
                            color='info'
                            disabled={
                                ![TASK_STATUS.READY, TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskMeta?.status)
                            }
                            onClick={handleUpdateStatusClick}
                        >
                            <Icon style={{fontWeight: 'bold'}}>task_alt</Icon>&nbsp;
                            {taskMeta?.status === TASK_STATUS.READY && '작업시작'}
                            {taskMeta?.status === TASK_STATUS.ANNOTATION && '검수요청'}
                            {taskMeta?.status === TASK_STATUS.REVIEW && '검수완료'}
                            {taskMeta?.status === TASK_STATUS.COMPLETE && '검수완료'}
                        </CustomButton>
                    ) : (
                        <CustomButton
                            color='info'
                            disabled={
                                (userId === taskMeta?.workerUserId?.toString() && ![TASK_STATUS.READY, TASK_STATUS.ANNOTATION].includes(taskMeta?.status)) ||
                                (userId === taskMeta?.reviewerUserId?.toString() && ![TASK_STATUS.REVIEW].includes(taskMeta?.status)) ||
                                ![TASK_STATUS.READY, TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskMeta?.status)
                            }
                            onClick={handleUpdateStatusClick}
                        >
                            <Icon style={{fontWeight: 'bold'}}>task_alt</Icon>&nbsp;
                            {taskMeta?.status === TASK_STATUS.READY && '작업시작'}
                            {taskMeta?.status === TASK_STATUS.ANNOTATION && '검수요청'}
                            {taskMeta?.status === TASK_STATUS.REVIEW && '검수완료'}
                            {taskMeta?.status === TASK_STATUS.COMPLETE && '검수완료'}
                        </CustomButton>
                    )}
                    <CustomButton color='primary' variant='outlined' onClick={() => setCollapse(!collapse)} iconOnly>
                        {collapse ? (
                            <Icon style={{ fontWeight: 'bold' }}>open_in_full</Icon>
                        ) : (
                            <Icon style={{ fontWeight: 'bold' }}>close_fullscreen</Icon>
                        )}
                    </CustomButton>
                </Grid>
            </Grid>
            <Grid className='label-container' container>
                <Grid item className='label-detail' xs={collapse ? 9 : 12}>
                    {/*<DocInfoMetaDataInput taskMeta={taskMeta} />*/}
                        <DocContentDataInput12 taskStatus={taskMeta?.status} />
                </Grid>
                <Grid item className='label-list' xs={collapse ? 3 : 0}>
                    {collapse ? <ContentList isCalled={isCalled} taskID={taskID} /> : <></>}
                </Grid>
            </Grid>
            {/*<MDSnackbar*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    color='success'*/}
            {/*    icon='notifications'*/}
            {/*    title={BRAND_NAME}*/}
            {/*    content={successMsg}*/}
            {/*    dateTime=''*/}
            {/*    open={openSuccessMsg}*/}
            {/*    close={() => {*/}
            {/*        setOpenSuccessMsg(!openSuccessMsg);*/}
            {/*    }}*/}
            {/*    autoHideDuration={3000}*/}
            {/*/>*/}
            {/*<ConfirmationDialog*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    open={openConfirmMsg}*/}
            {/*    close={() => setOpenConfirmMsg(!openConfirmMsg)}*/}
            {/*    content={confirmMsg}*/}
            {/*    color='secondary'*/}
            {/*    handleYes={handleYes}*/}
            {/*    handleNo={() => setOpenConfirmMsg(!openConfirmMsg)}*/}
            {/*/>*/}
        </LabelViewerContainer>
    );
}

export default React.memo(ContentViewer);
