import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Grid from '@mui/material/Grid';
import Collapse from '@mui/material/Collapse';
import Icon from '@mui/material/Icon';
import Autocomplete from '@mui/material/Autocomplete';
import { useRecoilState, useSetRecoilState } from 'recoil';
import ContentComment from './ContentComment';
import ContentTable from './ContentTable';
import ContentImage from './ContentImage';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import {
    contentCommentRecoilState,
    contentImageRecoilState,
    contentRecoilState,
    contentSavedFlagRecoilState,
    contentStateRecoilState,
    contentTableRecoilState,
    focusedRectRecoilState,
    pageRecoilState,
    rectanglesRecoilState,
    selectedLabelRecoilState,
} from '../../../store/recoilState';
import { getCodeListForInput, TASK_STATUS } from '../../../common/Constant';
import { DefaultResponse, PinnedState } from '../../../common/Types';
import ContentService from '../../../service/ContentService';
import { base64ToFile } from '../../../common/Base64ToFileUtil';
import { TextField, Typography } from '@mui/material';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const DocInfoMetaDataContainer = styled(Grid)`
    font-size: 15px;
    font-weight: bold;
    white-space: nowrap;

    & > .title-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 12px;
        box-sizing: border-box;
        background-color: #e0eaf4;

        & > .input-area {
            min-width: 45px;
            display: flex;
            align-items: center;
            gap: 12px;

            & > .label-selector-area {
                display: flex;
                align-items: center;
                font-size: 13px;
                height: 37px;
                gap: 12px;
                margin-left: 24px;

                & .MuiAutocomplete-root {
                    height: 35px;
                }
            }

            & > .pin-icon-button {
                height: 22px;
            }
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

    & > .title-wrapper.sub {
        background-color: #8fb7da;
        margin: 0 12px;
        border-radius: 6px;
    }

    & .grid-container {
        font-size: 13px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        & > .grid-items {
            display: flex;
            gap: 8px;

            & .input-items {
                display: flex;
                flex: 1;
                align-items: center;
                gap: 12px;
                position: relative;

                & > .pin-icon-button {
                    position: absolute;
                    right: 3px;
                    z-index: 10;
                    height: 20px;
                    cursor: pointer;
                }

                & > .pin-icon-button.select {
                    right: -2px;
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
    }
`;

function DocContentDataInput12(props: any): JSX.Element {
    const { taskStatus } = props;
    const [collapse, setCollapse] = useState<boolean>(true);
    const [selectedContent, setSelectedContent] = useState<any>(undefined);
    const [chapter, setChapter] = useState<string>('');
    const [section, setSection] = useState<string>('');
    const [clause, setClause] = useState<string>('');
    const [item, setItem] = useState<string>('');
    const [row, setRow] = useState<string>('');
    const [index, setIndex] = useState<string>('');
    const [startPage, setStartPage] = useState<string>('');
    const [endPage, setEndPage] = useState<string>('');
    const [category, setCategory] = useState<{ id: string; label: string } | any>(null);
    const [label, setLabel] = useState<{ key: string; label: string } | any>(null);
    const setSelectedLabel = useSetRecoilState(selectedLabelRecoilState);
    const [rectangles, setRectangles] = useRecoilState(rectanglesRecoilState);
    const [content, setContent] = useRecoilState(contentRecoilState);
    const [contentComment, setContentComment] = useRecoilState(contentCommentRecoilState);
    const [contentTable, setContentTable] = useRecoilState(contentTableRecoilState);
    const [contentImage, setContentImage] = useRecoilState(contentImageRecoilState);
    const setFocusedRect = useSetRecoilState(focusedRectRecoilState);
    const categoryList = getCodeListForInput('DOCUMENT_CLASS');
    const labelingType = [
        { key: 'content', label: '콘텐츠' },
        { key: 'comment', label: '주석' },
        { key: 'table', label: '표' },
        { key: 'image', label: '이미지' },
    ];
    const [contentData, setContentData] = useState<FormData>();
    const [errMsg, setErrMsg] = useState<string>('');
    const [openErrMsg, setOpenErrMsg] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [openSuccessMsg, setOpenSuccessMsg] = useState(false);
    const [confirmMsg, setConfirmMsg] = useState<string>('');
    const [openConfirmMsg, setOpenConfirmMsg] = useState(false);
    const [apiReq, setApiReq] = useState<Boolean>(false);
    const [isAddNew, setIsAddNew] = useState<boolean>(false);
    const [contentState, setContentState] = useRecoilState(contentStateRecoilState);
    const [pageSet, setPageSet] = useRecoilState(pageRecoilState);
    const [page, setPage] = useState<number>(0);
    const [contentSavedFlag, setContentSavedFlag] = useRecoilState(contentSavedFlagRecoilState);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [pinnedState, setPinnedState] = useState<any>({
        chapter: false,
        section: false,
        clause: false,
        item: false,
        row: false,
        index: false,
        startPage: false,
        endPage: false,
        category: false,
    });
    const [pinnedComment, setPinnedComment] = useState<number[]>([]);
    const [pinnedImage, setPinnedImage] = useState<number[]>([]);
    const [pinnedTable, setPinnedTable] = useState<number[]>([]);
    const initialPinnedState: PinnedState = Object.keys(pinnedState).reduce((acc, key) => {
        acc[key as keyof PinnedState] = false;
        return acc;
    }, {} as PinnedState);

    useEffect(() => {
        setSelectedContent(
            contentState.contents.filter((item: any) => item.contentId === contentState.activatedState)[0],
        );
    }, [contentState]);

    useEffect(() => {
        if (selectedContent) {
            setChapter(selectedContent.chapter);
            setSection(selectedContent.section);
            setClause(selectedContent.article);
            setItem(selectedContent.paragraph);
            setRow(selectedContent.line);
            setIndex(selectedContent.indices);
            setStartPage(selectedContent.startPage);
            setEndPage(selectedContent.endPage);
            setCategory(categoryList.find((c) => c.id === selectedContent.categories));
            setSelectedLabel(undefined);
            setLabel(null);
            setContent(selectedContent.contentInfo);
            setContentComment(selectedContent.commentaries);
            setContentTable(selectedContent.tables);
            setContentImage(selectedContent.images);
            setRectangles(selectedContent.boxes);
            setPinnedState(initialPinnedState);
            setPinnedComment([]);
            setPinnedTable([]);
            setPinnedImage([]);
        }
    }, [selectedContent]);

    const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setChapter(numericValue);
    };
    const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setSection(numericValue);
    };
    const handleClauseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setClause(numericValue);
    };
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setItem(numericValue);
    };
    const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setRow(numericValue);
    };
    const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIndex(e.target.value);
    };
    const handleStartPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setStartPage(numericValue);
    };
    const handleEndPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/\D/g, '');
        setEndPage(numericValue);
    };

    const handleLabelChange = (_: any, value: any) => {
        if (value === null) {
            setLabel(null);
            setSelectedLabel('');
            return;
        }
        setLabel(value);
        setSelectedLabel(value.key);
    };
    const handleCategoryChange = (_: any, value: any) => {
        if (value === null) {
            setCategory(null);
            return;
        }
        setCategory(value);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent((prevContent: any) => ({
            boxID: prevContent?.boxID || [],
            title: e.target.value,
            description: prevContent?.description || '',
        }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent((prevContent: any) => ({
            boxID: prevContent?.boxID || [],
            title: prevContent?.title || '',
            description: e.target.value,
        }));
    };

    const { refetch: deleteContent } = useQuery<DefaultResponse, AxiosError>(
        ['getContents'],
        () => ContentService.deleteContent(+selectedContent.contentId),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setContentSavedFlag(!contentSavedFlag);
                    setIsDelete(false);
                }
            },
        },
    );

    const resetContent = () => {
        if (!pinnedState.chapter) setChapter('');
        if (!pinnedState.section) setSection('');
        if (!pinnedState.clause) setClause('');
        if (!pinnedState.item) setItem('');
        if (!pinnedState.row) setRow('');
        if (!pinnedState.index) setIndex('');
        if (!pinnedState.startPage) setStartPage('');
        if (!pinnedState.endPage) setEndPage('');
        if (!pinnedState.category) setCategory(null);
        setLabel(null);
        setSelectedLabel(undefined);
        setContent(undefined);
        if (pinnedComment.length > 0) {
            const pinnedComArray = contentComment?.filter((com) => pinnedComment?.includes(com.boxID));
            const updatedPinnedComArray = pinnedComArray.map((com) => ({
                ...com,
                id: -1,
            }));
            setContentComment(updatedPinnedComArray);
        } else {
            setContentComment([]);
        }
        if (pinnedTable.length > 0) {
            const pinnedTabArray = contentTable?.filter((tab) => pinnedTable?.includes(tab.boxID));
            const updatedPinnedTabArray = pinnedTabArray.map((tab) => ({
                ...tab,
                id: -1,
            }));
            setContentTable(updatedPinnedTabArray);
        } else {
            setContentTable([]);
        }
        if (pinnedImage.length > 0) {
            const pinnedImgArray = contentImage?.filter((img) => pinnedImage?.includes(img.boxID));
            const updatedPinnedImgArray = pinnedImgArray.map((img) => ({
                ...img,
                id: -1,
            }));
            setContentImage(updatedPinnedImgArray);
        } else {
            setContentImage([]);
        }
        if (pinnedComment?.length > 0 || pinnedTable?.length > 0 || pinnedImage?.length > 0) {
            const combinedPinnedBoxes = [...pinnedComment, ...pinnedTable, ...pinnedImage];
            const pinnedBox = rectangles.filter((rec) => combinedPinnedBoxes.includes(rec.id));
            setRectangles(pinnedBox);
        } else {
            setRectangles([]);
        }
        setContentState({
            activatedState: undefined,
            activatedPage: undefined,
            contents: contentState.contents,
        });
    };

    useEffect(() => {
        resetContent();
        setPinnedState(initialPinnedState);
        setPinnedComment([]);
        setPinnedTable([]);
        setPinnedImage([]);
    }, []);

    useEffect(() => {
        if (pageSet.isResetFlag) {
            resetContent();
        }
    }, [pageSet.page, pageSet.isResetFlag]);

    const handleYes = () => {
        if (isAddNew) {
            resetContent();
            setIsAddNew(!isAddNew);
            setOpenConfirmMsg(false);
            return;
        }
        if (contentData) {
            setApiReq(true);
            createContent();
        }
        if (isDelete) {
            resetContent();
            setIsDelete(false);
            deleteContent();
        }
        setOpenConfirmMsg(false);
    };
    const handleNo = () => {
        setOpenConfirmMsg(false);
        setIsAddNew(false);
        setIsDelete(false);
    };
    const openConfirm = (msg: string) => {
        setConfirmMsg(msg);
        setOpenConfirmMsg(true);
    };

    const handleNewContent = () => {
        setIsAddNew(true);
        openConfirm('저장되지 않은 컨텐츠는 사라집니다. 계속하시겠습니까?');
    };

    const handleDeleteClick = () => {
        setIsDelete(true);
        openConfirm('삭제하시겠습니까?');
    };

    const togglePinnedState = () => {
        const allPinned = Object.values(pinnedState).every((value) => value);
        const newPinnedState: PinnedState = Object.keys(pinnedState).reduce((acc, key) => {
            acc[key as keyof PinnedState] = !allPinned;
            return acc;
        }, {} as PinnedState);
        setPinnedState(newPinnedState);
    };

    const handleCreateContent = () => {
        if (apiReq) return;
        const _formData = new FormData();
        let contentReq: any = {};
        try {
            const contentBoxIDs = content?.boxID;
            const contentBoxes = rectangles
                .filter((rec) => contentBoxIDs?.includes(rec.id))
                .map((_rect) => ({
                    points: _rect.points.flat(),
                    page: _rect.page - 1,
                }));
            if (contentBoxes.length === 0) {
                setErrMsg('콘텐츠 박스를 그리세요.');
                setOpenErrMsg(true);
                return;
            }
            contentReq = {
                taskId: 1, //필수
                chapter,
                section,
                article: clause,
                paragraph: item,
                line: row,
                indices: index,
                startPage: +startPage, //필수
                endPage: +endPage, //필수
                categories: category?.id, //필수
                modUserId: 1, // 필수
                contentTitle: content?.title,
                content: content?.description, //필수
                boxes: contentBoxes.length > 0 ? contentBoxes : [], //필수
                page: contentBoxes[0].page, //필수
            };
            setPage(contentBoxes[0].page);
            if (contentComment.length > 0) {
                const commentaries = contentComment
                    .map((comment) => {
                        const rect = rectangles.find((rect) => rect.id === comment.boxID);
                        if (rect) {
                            return {
                                commentaryId: comment.id,
                                commentaryNo: comment.commentId,
                                commentary: comment.comment,
                                boxes: [
                                    {
                                        points: rect.points.flat(),
                                        page: rect.page - 1,
                                    },
                                ],
                            };
                        } else {
                            return {
                                commentaryId: comment.id,
                                commentaryNo: comment.commentId,
                                commentary: comment.comment,
                                boxes: [],
                            };
                        }
                    })
                    .filter((commentary) => commentary !== null);
                contentReq = { ...contentReq, commentaries };
            } else {
                contentReq = { ...contentReq, commentaries: [] };
            }
            if (contentTable.length > 0) {
                const tableFileList: File[] = [];
                const tables = contentTable.map((table) => {
                    const rect = rectangles.find((rect) => rect.id === table.boxID);
                    if (rect) {
                        if (table.isModified) {
                            const file = base64ToFile(table.path, `${rect.id}.png`);
                            if (file) tableFileList.push(file);
                        }
                        return {
                            taskAttachId: table.id,
                            title: table.title,
                            content: table.description,
                            keyWord: table.keyword,
                            fileIndex: tableFileList.length - 1,
                            fileModified: table.isModified,
                            boxes: [
                                {
                                    points: rect.points.flat(),
                                    page: rect.page - 1,
                                },
                            ],
                        };
                    } else {
                        return {
                            taskAttachId: table.id,
                            title: table.title,
                            content: table.description,
                            keyWord: table.keyword,
                            boxes: [],
                        };
                    }
                });
                contentReq = { ...contentReq, tables };
                tableFileList.forEach((table) => {
                    _formData.append('tableFileList', table);
                });
            } else {
                contentReq = { ...contentReq, tables: [] };
            }
            if (contentImage.length > 0) {
                const imageFileList: File[] = [];
                const images = contentImage.map((image) => {
                    const rect = rectangles.find((rect) => rect.id === image.boxID);
                    if (rect) {
                        if (image.isModified) {
                            const file = base64ToFile(image.path, `${rect.id}.png`);
                            if (file) imageFileList.push(file);
                        }
                        return {
                            taskAttachId: image.id,
                            title: image.title,
                            content: image.description,
                            keyWord: image.keyword,
                            fileIndex: imageFileList.length - 1,
                            fileModified: image.isModified,
                            boxes: [
                                {
                                    points: rect.points.flat(),
                                    page: rect.page - 1,
                                },
                            ],
                        };
                    } else {
                        return {
                            taskAttachId: image.id,
                            title: image.title,
                            content: image.description,
                            keyWord: image.keyword,
                            boxes: [],
                        };
                    }
                });
                contentReq = { ...contentReq, images };
                imageFileList.forEach((img) => {
                    _formData.append('imageFileList', img);
                });
            } else {
                contentReq = { ...contentReq, images: [] };
            }
            if (selectedContent && selectedContent.contentId) {
                contentReq = { ...contentReq, contentId: selectedContent.contentId };
            }
            if (!contentReq.taskId) {
                setErrMsg('잘못된 접근입니다. 다시 시도하세요.');
                setOpenErrMsg(true);
                return;
            }
            if (!contentReq.startPage) {
                setErrMsg('시작페이지를 입력하세요.');
                setOpenErrMsg(true);
                return;
            }
            if (!contentReq.endPage) {
                setErrMsg('종료페이지를 입력하세요.');
                setOpenErrMsg(true);
                return;
            }
            if (!contentReq.categories) {
                setErrMsg('문서 유형을 선택하세요.');
                setOpenErrMsg(true);
                return;
            }
            if (!contentReq.modUserId) {
                setErrMsg('유저 정보가 없습니다. 다시 로그인하세요.');
                setOpenErrMsg(true);
                return;
            }
            if (!contentReq.content) {
                setErrMsg('콘텐츠 내용을 입력하세요.');
                setOpenErrMsg(true);
                return;
            }
            _formData.append('contentReq', JSON.stringify(contentReq));
            setContentData(_formData);
            openConfirm('저장하시겠습니까?');
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        }
    };

    const { refetch: createContent } = useQuery<DefaultResponse, AxiosError>(
        ['createContent', contentData],
        () => ContentService.createContent(contentData),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setSuccessMsg('콘텐츠 정보 저장에 성공하였습니다.');
                    setOpenSuccessMsg(true);
                    setApiReq(false);
                    setPageSet({
                        page: page,
                        numberOfPages: pageSet.numberOfPages,
                        isResetFlag: false,
                    });
                    setContentState({
                        activatedState: res.data.content.contentId,
                        activatedPage: page + 1,
                        contents: contentState.contents,
                    });
                    setContentSavedFlag(!contentSavedFlag);
                    setPinnedState(initialPinnedState);
                    setPinnedComment([]);
                    setPinnedTable([]);
                    setPinnedImage([]);
                }
            },
            onError: (res: AxiosError) => {
                setApiReq(false);
                setErrMsg('콘텐츠 정보 저장에 실패하였습니다.');
                setOpenErrMsg(true);
            },
        },
    );

    return (
        <DocInfoMetaDataContainer>
            <Grid className='title-wrapper'>
                <div className='input-area'>
                    <Typography variant='body1'>콘텐츠 정보</Typography>
                    <div className='pin-icon-button' onClick={togglePinnedState}>
                        {Object.values(pinnedState).some((value) => value) ? (
                            <LockIcon fontSize='small' />
                        ) : (
                            <LockOpenIcon fontSize='small' />
                        )}
                    </div>
                    <div className='label-selector-area'>
                        <Typography variant='body1'>박스 타입</Typography>
                        <Autocomplete
                            style={{ width: '120px', height: '37px' }}
                            value={label || null}
                            options={labelingType}
                            onChange={handleLabelChange}
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            size='small'
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </div>
                </div>
                <div className='button-area'>
                    <CustomButton
                        size='small'
                        color='primary'
                        variant='outlined'
                        onClick={handleDeleteClick}
                        disabled={
                            !selectedContent || ![TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskStatus)
                        }
                    >
                        삭제
                    </CustomButton>
                    <CustomButton
                        size='small'
                        color='info'
                        variant='outlined'
                        onClick={handleNewContent}
                        disabled={![TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskStatus)}
                    >
                        추가
                    </CustomButton>
                    <CustomButton
                        style={{ marginLeft: '12px' }}
                        size='small'
                        color='secondary'
                        onClick={handleCreateContent}
                        disabled={![TASK_STATUS.ANNOTATION, TASK_STATUS.REVIEW].includes(taskStatus)}
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
                    <Grid item className='grid-items'>
                        <div className='input-items'>
                            <Typography variant='body1'>장</Typography>
                            <CustomInput onChange={handleChapterChange} value={chapter} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { chapter: any }) => ({
                                        ...pin,
                                        chapter: !pin.chapter,
                                    }))
                                }
                            >
                                {pinnedState.chapter ? (
                                    <LockIcon fontSize='small' />
                                ) : (
                                    <LockOpenIcon fontSize='small' />
                                )}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>절</Typography>
                            <CustomInput onChange={handleSectionChange} value={section} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { section: any }) => ({
                                        ...pin,
                                        section: !pin.section,
                                    }))
                                }
                            >
                                {pinnedState.section ? (
                                    <LockIcon fontSize='small' />
                                ) : (
                                    <LockOpenIcon fontSize='small' />
                                )}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>항</Typography>
                            <CustomInput onChange={handleClauseChange} value={clause} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { clause: any }) => ({
                                        ...pin,
                                        clause: !pin.clause,
                                    }))
                                }
                            >
                                {pinnedState.clause ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>목</Typography>
                            <CustomInput onChange={handleItemChange} value={item} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { item: any }) => ({
                                        ...pin,
                                        item: !pin.item,
                                    }))
                                }
                            >
                                {pinnedState.item ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>행</Typography>
                            <CustomInput onChange={handleRowChange} value={row} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { row: any }) => ({
                                        ...pin,
                                        row: !pin.row,
                                    }))
                                }
                            >
                                {pinnedState.row ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                            </div>
                        </div>
                    </Grid>
                    <Grid item className='grid-items'>
                        <div className='input-items'>
                            <Typography variant='body1'>색인</Typography>
                            <CustomInput onChange={handleIndexChange} value={index} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { index: any }) => ({
                                        ...pin,
                                        index: !pin.index,
                                    }))
                                }
                            >
                                {pinnedState.index ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>시작페이지</Typography>
                            <CustomInput onChange={handleStartPageChange} value={startPage} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { startPage: any }) => ({
                                        ...pin,
                                        startPage: !pin.startPage,
                                    }))
                                }
                            >
                                {pinnedState.startPage ? (
                                    <LockIcon fontSize='small' />
                                ) : (
                                    <LockOpenIcon fontSize='small' />
                                )}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>종료페이지</Typography>
                            <CustomInput onChange={handleEndPageChange} value={endPage} size='small' />
                            <div
                                className='pin-icon-button'
                                onClick={() =>
                                    setPinnedState((pin: { endPage: any }) => ({
                                        ...pin,
                                        endPage: !pin.endPage,
                                    }))
                                }
                            >
                                {pinnedState.endPage ? (
                                    <LockIcon fontSize='small' />
                                ) : (
                                    <LockOpenIcon fontSize='small' />
                                )}
                            </div>
                        </div>
                        <div className='input-items'>
                            <Typography variant='body1'>문서 유형</Typography>
                            <Autocomplete
                                style={{ minWidth: '150px', width: '100%', height: '37px' }}
                                value={category || null}
                                options={categoryList}
                                onChange={handleCategoryChange}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                size='small'
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <div
                                className='pin-icon-button select'
                                onClick={() =>
                                    setPinnedState((pin: { category: any }) => ({
                                        ...pin,
                                        category: !pin.category,
                                    }))
                                }
                            >
                                {pinnedState.category ? (
                                    <LockIcon fontSize='small' />
                                ) : (
                                    <LockOpenIcon fontSize='small' />
                                )}
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </Collapse>
            <Grid className='title-wrapper'>
                <div className='input-area'>
                    <Typography variant='body1'>콘텐츠 내용</Typography>
                </div>
                <div className='button-area'>
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
                <Grid
                    className='grid-container'
                    container
                    item={true}
                    xs={12}
                    onMouseEnter={() => setFocusedRect(content?.boxID)}
                    onMouseLeave={() => setFocusedRect(undefined)}
                >
                    <Grid item className='grid-items'>
                        <div className='input-items'>
                            <Typography variant='body1'>제목</Typography>
                            <CustomInput
                                onChange={handleTitleChange}
                                value={content?.title || ''}
                                style={{ width: '100%' }}
                                size='small'
                            />
                        </div>
                    </Grid>
                    <Grid item className='grid-items'>
                        <div className='input-items'>
                            <Typography variant='body1'>내용</Typography>
                            <CustomInput
                                onChange={handleDescriptionChange}
                                value={content?.description || ''}
                                multiline
                                rows={5}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Grid>
                </Grid>
            </Collapse>
            <ContentComment
                pinnedComment={pinnedComment}
                setPinnedComment={setPinnedComment}
                contentID={selectedContent?.contentId || -1}
            />
            <ContentTable
                pinnedTable={pinnedTable}
                setPinnedTable={setPinnedTable}
                contentID={selectedContent?.contentId || -1}
            />
            <ContentImage
                pinnedImage={pinnedImage}
                setPinnedImage={setPinnedImage}
                contentID={selectedContent?.contentId || -1}
            />
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
            {/*    close={() => setOpenSuccessMsg(!openSuccessMsg)}*/}
            {/*    autoHideDuration={3000}*/}
            {/*/>*/}
            {/*<ConfirmationDialog*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    open={openConfirmMsg}*/}
            {/*    close={() => setOpenConfirmMsg(!openConfirmMsg)}*/}
            {/*    content={confirmMsg}*/}
            {/*    color='secondary'*/}
            {/*    handleYes={handleYes}*/}
            {/*    handleNo={handleNo}*/}
            {/*/>*/}
        </DocInfoMetaDataContainer>
    );
}

export default React.memo(DocContentDataInput12);
