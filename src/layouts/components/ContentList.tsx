import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import { useRecoilState, useRecoilValue } from 'recoil';
import { CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DefaultResponse } from '../../common/Types';
import ContentService from '../../service/ContentService';
import { contentSavedFlagRecoilState, contentStateRecoilState, pageRecoilState } from '../../store/recoilState';
import Collapse from '@mui/material/Collapse';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const ContentListContainer = styled(Grid)`
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #091e420f;
    height: 100%;

    & > .list-header {
        width: 100%;
        height: 45px;
        background-color: #fff;
        display: flex;
        align-items: center;
        padding: 8px;
        font-size: 14px;
        justify-content: space-between;
    }

    & > .content-card-area {
        width: 100%;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        & > .progress-wrapper {
            width: 100%;
            display: flex;
            margin-top: 50px;
            justify-content: center;
            font-size: 13px;
        }

        & > .content-card-wrapper {
            cursor: pointer;
            box-sizing: border-box;
            background-color: #fff;
            border-radius: 6px;
            padding: 12px;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            box-shadow: rgba(0, 0, 0, 0.16) 0 1px 4px;

            & > .button-area {
                font-weight: bold;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;

                & > div {
                    height: 24px;
                }
            }

            & > .issue-area {
                & .issue-button-area {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 6px;

                    & button {
                        font-size: 10px;
                        min-width: 35px;
                        min-height: 28px;
                    }
                }
            }
        }
    }
`;

function ContentCard(props: any): JSX.Element {
    const { content, page } = props;
    const [collapse, setCollapse] = useState<boolean>(false);
    const [reviewComment, setReviewComment] = useState<string>(content?.comment || '');
    const [reviewReply, setReviewReply] = useState<string>(content?.reply || '');
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [contentState, setContentState] = useRecoilState(contentStateRecoilState);
    const [disabled, setDisabled] = useState<boolean>(true);

    const { refetch: saveComment } = useQuery<DefaultResponse, AxiosError>(
        ['saveComment'],
        () =>
            ContentService.saveComment(+content.contentId, {
                comment: reviewComment,
                reply: reviewReply,
            }),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setDisabled(true);
                }
            },
        },
    );

    const handleContentClick = (id: number, page: number) => {
        setContentState({
            activatedState: id,
            activatedPage: page,
            contents: contentState.contents,
        });
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisabled(false);
        setReviewComment(e.currentTarget.value);
    };
    const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisabled(false);
        setReviewReply(e.currentTarget.value);
    };

    useEffect(() => {
        if (contentState.activatedState === content.contentId) {
            setIsActivated(true);
            return;
        }
        setIsActivated(false);
    }, [contentState, content]);

    const handleCommentSaveClick = () => {
        saveComment();
    };

    return (
        <Grid
            className='content-card-wrapper'
            style={{ backgroundColor: isActivated ? '#E9F2FF' : 'white' }}
            onClick={() => handleContentClick(content.contentId, page)}
        >
            <div>{content.contentId}</div>
            <div className='button-area'>
                검수 내용
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
            <Collapse in={collapse} className='issue-area'>
                <Grid className='grid-items'>
                    <div className='input-items'>
                        <Typography variant='body2'>검수자</Typography>
                        <CustomInput
                            onChange={handleCommentChange}
                            value={reviewComment || ''}
                            multiline
                            rows={2}
                            style={{ width: '100%' }}
                        />
                    </div>
                </Grid>
                <Grid className='grid-items'>
                    <div className='input-items'>
                        <Typography variant='body2'>작업자</Typography>
                        <CustomInput
                            onChange={handleReplyChange}
                            value={reviewReply || ''}
                            multiline
                            rows={2}
                            style={{ width: '100%' }}
                        />
                    </div>
                </Grid>
                <Grid className='issue-button-area'>
                    <CustomButton
                        style={{ alignSelf: 'flex-end' }}
                        size='small'
                        color='secondary'
                        onClick={handleCommentSaveClick}
                        disabled={disabled}
                    >
                        저장
                    </CustomButton>
                </Grid>
            </Collapse>
        </Grid>
    );
}

function ContentList(props: any): JSX.Element {
    const { isCalled = false, taskID } = props;
    const [contentPages, setContentPages] = useState<number[]>([]);
    const [pageSet, setPageSet] = useRecoilState(pageRecoilState);
    const contentState = useRecoilValue(contentStateRecoilState);
    const contentSavedFlag = useRecoilValue(contentSavedFlagRecoilState);

    const { refetch: getContentPages } = useQuery<DefaultResponse, AxiosError>(
        ['getContentPages'],
        () => ContentService.getContentPages(+taskID),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setContentPages(res.data.split(',').map((num: string) => Number(num)));
                }
            },
        },
    );

    useEffect(() => {
        getContentPages();
    }, [contentSavedFlag]);

    useEffect(() => {
        setPageSet({
            page: contentState?.activatedPage - 1 || contentPages[0],
            numberOfPages: contentPages.length,
            isResetFlag: false,
        });
    }, [contentPages]);

    const goToPreviousPage = () => {
        const currentPageIndex = contentPages.indexOf(+pageSet.page);

        if (currentPageIndex > 0) {
            setPageSet({
                page: contentPages[currentPageIndex - 1],
                numberOfPages: pageSet.numberOfPages,
                isResetFlag: true,
            });
        }
    };

    const goToNextPage = () => {
        const currentPageIndex = contentPages.indexOf(+pageSet.page);

        if (currentPageIndex !== -1 && currentPageIndex < contentPages.length - 1) {
            setPageSet({
                page: contentPages[currentPageIndex + 1],
                numberOfPages: pageSet.numberOfPages,
                isResetFlag: true,
            });
        }
    };

    return (
        <ContentListContainer>
            <Grid className='list-header'>
                <div>{`콘텐츠: ${contentState.contents.length}개`}</div>
                <CustomButton
                    variant='text'
                    color='primary'
                    onClick={goToPreviousPage}
                    disabled={contentPages.indexOf(+pageSet.page) === 0}
                    iconOnly
                >
                    <Icon sx={{ fontWeight: 'bold' }}>arrow_backward</Icon>
                </CustomButton>
                <div className='controls-input'>
                    <CustomInput value={+pageSet.page + 1 || 0} style={{ width: '50px' }} size='small' readOnly />
                </div>
                <CustomButton
                    variant='text'
                    color='primary'
                    onClick={goToNextPage}
                    disabled={+pageSet.page === contentPages[contentPages.length - 1]}
                    iconOnly
                >
                    <Icon sx={{ fontWeight: 'bold' }}>arrow_forward</Icon>
                </CustomButton>
            </Grid>
            <Grid className='content-card-area'>
                {contentState.contents.length === 0 && (
                    <div className='progress-wrapper'>
                        {isCalled ? (
                            <CircularProgress color='inherit' size={25} />
                        ) : (
                            <>{`${pageSet.page + 1}페이지에 콘텐츠가 없습니다.`}</>
                        )}
                    </div>
                )}
                {contentState.contents.map((item: any) => (
                    <ContentCard key={item.contentId} content={item} page={+pageSet.page + 1} />
                ))}
            </Grid>
        </ContentListContainer>
    );
}

export default React.memo(ContentList);
