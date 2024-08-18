import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import Icon from '@mui/material/Icon';
import Autocomplete from '@mui/material/Autocomplete';
import { useRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { contentTypeRecoilState } from '../../../store/recoilState';
import { getCodeListForInput, TASK_STATUS } from '../../../common/Constant';
import { DefaultResponse } from '../../../common/Types';
import TaskService from '../../../service/TaskService';
import { TextField, Typography } from '@mui/material';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';

const DocInfoMetaDataContainer = styled(Grid)`
    font-size: 15px;
    font-weight: bold;
    white-space: nowrap;
    border-bottom: 1px solid gray;

    & > .title-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 12px;
        box-sizing: border-box;
        background-color: #e0eaf4;
        min-width: 45px;

        & > .input-area {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        & > .button-area {
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;

            & > div {
                height: 24px;
            }
        }
    }

    & .grid-container {
        font-size: 13px;
        padding: 24px 12px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;

        & > .grid-items {
            display: flex;
            gap: 8px;
            flex-direction: column;
            align-items: flex-end;
            width: 48%;
            min-width: 310px;

            & .input-items {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;

                & > .MuiTypography-root {
                    min-width: 50px;
                }
            }
        }
    }

    & .contents-selector {
        font-size: 13px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
    }
`;

function DocInfoMetaDataInput(props: any): JSX.Element {
    const { taskMeta } = props;
    const [collapse, setCollapse] = useState<boolean>(true);
    const { id: taskID } = useParams();
    const [title, setTitle] = useState<string>('');
    const [size, setSize] = useState<string>('');
    const [documentSizeType, setDocumentSizeType] = useState<{ id: string; label: string } | any>(null);
    const [publisher, setPublisher] = useState<{ id: string; label: string } | any>(null);
    const [publishDate, setPublishDate] = useState<any>('');
    const [subPublishDate, setSubPublishDate] = useState<any>('');
    const [format, setFormat] = useState<{ id: string; label: string } | any>(null);
    const [tempContentType, setTempContentType] = useState<{ id: string; label: string } | any>(null);
    const [contentType, setContentType] = useRecoilState(contentTypeRecoilState);
    const publisherList = getCodeListForInput('PUBLISHER');
    const contentsTypeList = getCodeListForInput('CONTENT_TYPE');
    const formatList = getCodeListForInput('DOCUMENT_TYPE');
    const fileSizeTyperList = getCodeListForInput('FILE_SIZE_TYPE');
    const [apiReq, setApiReq] = useState<Boolean>(false);
    const [formData, setFormData] = useState<any>(undefined);
    const [errMsg, setErrMsg] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [openErrMsg, setOpenErrMsg] = useState(false);
    const [openSuccessMsg, setOpenSuccessMsg] = useState(false);
    const [confirmMsg, setConfirmMsg] = useState<string>('');
    const [openConfirmMsg, setOpenConfirmMsg] = useState(false);

    useEffect(() => {
        if (!taskMeta) return;
        // if (+taskID !== taskMeta.taskId) {
        //     alert('잘못된 접근입니다. 다시시도하세요.');
        //     return;
        // }
        setTitle(taskMeta.documentTitle);
        setSize(taskMeta.documentSize);
        setDocumentSizeType(fileSizeTyperList.find((item) => item.id === taskMeta.documentSizeType));
        setPublisher(publisherList.find((item) => item.id === taskMeta.publisher));
        setPublishDate(taskMeta.publishDate);
        setFormat(formatList.find((item) => item.id === taskMeta.documentType));
        setTempContentType(contentsTypeList.find((item) => item.id === taskMeta.contentType));
        setContentType(taskMeta.contentType);
        setSubPublishDate(taskMeta.subPublishDate || '');
    }, [contentsTypeList, fileSizeTyperList, formatList, publisherList, taskMeta]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };
    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setSize(numericValue);
    };
    const handleMainFileSizeTypeChange = (_: any, value: any) => {
        if (value === null) {
            setDocumentSizeType(null);
            return;
        }
        setDocumentSizeType(value);
    };
    const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPublishDate(e.target.value);
    };
    const handleSubPublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubPublishDate(e.target.value);
    };
    const handlePublisherChange = (_: any, value: any) => {
        if (value === null) {
            setPublisher(null);
            return;
        }
        setPublisher(value);
    };
    const handleFormatChange = (_: any, value: any) => {
        if (value === null) {
            setFormat(null);
            return;
        }
        setFormat(value);
    };

    const openConfirm = (msg: string) => {
        setConfirmMsg(msg);
        setOpenConfirmMsg(true);
    };
    const toggleDialog = () => {
        setOpenConfirmMsg(!openConfirmMsg);
    };
    const handleYes = () => {
        if (formData) {
            setApiReq(true);
            toggleDialog();
            updateTask();
        }
    };
    const handleNo = () => {
        toggleDialog();
    };

    const executeSave = () => {
        if (apiReq) return;
        let data = {};
        let pass = true;
        let errorMsg = '';
        const validations = [
            { name: '발행기관', value: publisher?.id, dataName: 'publisher' },
            { name: '문서 크기', value: size, dataName: 'documentSize' },
            { name: '문서 크기 유형', value: documentSizeType?.id, dataName: 'documentSizeType' },
            { name: '문서 제목', value: title, dataName: 'documentTitle' },
            { name: '발간일', value: publishDate, dataName: 'publishDate' },
            { name: '문서 형식', value: format?.id, dataName: 'documentType' },
        ];

        if (contentType && tempContentType.id === 'EVALUATION') {
            const subValidation = [{ name: '답안작성일', value: subPublishDate, dataName: 'subPublishDate' }];
            validations.push(...subValidation);
        }

        validations.forEach((v) => {
            if (pass) {
                if (!v.value || v.value === '') {
                    errorMsg = v.name + '를 입력하세요.';
                    pass = false;
                    return;
                } else {
                    data = { ...data, [v.dataName]: v.value };
                }
            }
        });

        if (pass) {
            setFormData(data);
            openConfirm('정말로 문서 정보를 변경하시겠습니까?');
        } else {
            setErrMsg(errorMsg);
            setOpenErrMsg(true);
        }
    };

    const { refetch: updateTask } = useQuery<DefaultResponse, AxiosError>(
        ['updateTask'],
        () => TaskService.updateTask(1, formData),
        {
            onSuccess: (res: DefaultResponse) => {
                setSuccessMsg('업데이트에 성공하였습니다.');
                setOpenSuccessMsg(true);
                setApiReq(false);
                if (res.code === 200 && res.subCode === 0) {
                    setApiReq(false);
                }
            },
        },
    );

    return (
        <DocInfoMetaDataContainer>
            <Grid className='title-wrapper'>
                <div className='input-area'>
                    <Typography variant='body1'>문서 정보</Typography>
                    <CustomInput value={taskID} style={{ width: '400px' }} size='small' readOnly />
                </div>
                <div className='button-area'>
                    <CustomButton
                        size='small'
                        color='secondary'
                        onClick={executeSave}
                        disabled={!([TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskMeta?.status))}
                    >
                        저장
                    </CustomButton>
                    <div onClick={() => setCollapse(!collapse)}>
                        {collapse ? (
                            <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                arrow_drop_up
                            </Icon>
                        ) : (
                            <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                arrow_drop_down
                            </Icon>
                        )}
                    </div>
                </div>
            </Grid>
            <Collapse in={collapse} style={{ width: '100%' }}>
                <Grid className='grid-container' container item={true} xs={12}>
                    <Grid className='grid-items' item xs={6}>
                        <div className='input-items'>
                            <Typography variant='body1'>문서 제목</Typography>
                            <CustomInput
                                onChange={handleTitleChange}
                                value={title}
                                style={{ minWidth: '250px', width: '100%' }}
                                size='small'
                            />
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>문서 크기</Typography>
                            <CustomInput
                                onChange={handleSizeChange}
                                value={size}
                                style={{ minWidth: '150px', width: '100%' }}
                                size='small'
                            />
                            <Autocomplete
                                style={{ width: '90px', height: '37px' }}
                                value={documentSizeType || null}
                                options={fileSizeTyperList}
                                onChange={handleMainFileSizeTypeChange}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                size='small'
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </div>
                        {contentType && tempContentType?.id === 'EVALUATION' && (
                            <div className='input-items'>
                                <Typography variant='body1'>답안작성일</Typography>
                                <CustomInput
                                    type='date'
                                    onChange={handleSubPublishDateChange}
                                    value={subPublishDate}
                                    style={{ width: '250px' }}
                                    size='small'
                                />
                            </div>
                        )}
                    </Grid>
                    <Grid className='grid-items' item xs={6}>
                        <div className='input-items'>
                            <Typography variant='body1'>발행기관</Typography>
                            <Autocomplete
                                style={{ minWidth: '250px', width: '100%', height: '37px' }}
                                value={publisher || null}
                                options={publisherList}
                                onChange={handlePublisherChange}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                size='small'
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>발간일</Typography>
                            <CustomInput
                                onChange={handlePublishDateChange}
                                value={publishDate || ''}
                                type='date'
                                style={{ minWidth: '250px', width: '100%' }}
                                size='small'
                            />
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>문서 형식</Typography>
                            <Autocomplete
                                style={{ minWidth: '250px', width: '100%', height: '37px' }}
                                value={format || null}
                                options={formatList}
                                onChange={handleFormatChange}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                size='small'
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </div>
                    </Grid>
                </Grid>
                <div className='contents-selector'>
                    <Typography variant='body1'>콘텐츠 유형</Typography>
                    <Autocomplete
                        style={{ width: '250px', height: '37px' }}
                        value={tempContentType || null}
                        options={contentsTypeList}
                        //onChange={handleContentTypeChange}
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        size='small'
                        renderInput={(params) => <TextField {...params} />}
                        readOnly
                    />
                </div>
            </Collapse>
            {/*<MDSnackbar*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    color='error'*/}
            {/*    icon='notifications'*/}
            {/*    title={BRAND_NAME}*/}
            {/*    content={errMsg}*/}
            {/*    dateTime=''*/}
            {/*    open={openErrMsg}*/}
            {/*    close={() => setOpenErrMsg(!openErrMsg)}*/}
            {/*    autoHideDuration={3000}*/}
            {/*/>*/}
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
            {/*    close={toggleDialog}*/}
            {/*    content={confirmMsg}*/}
            {/*    color='secondary'*/}
            {/*    handleYes={handleYes}*/}
            {/*    handleNo={handleNo}*/}
            {/*/>*/}
        </DocInfoMetaDataContainer>
    );
}

export default React.memo(DocInfoMetaDataInput);
