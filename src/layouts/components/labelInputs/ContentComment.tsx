import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Collapse from '@mui/material/Collapse';
import { useRecoilState, useSetRecoilState } from 'recoil';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { contentCommentRecoilState, focusedRectRecoilState, rectanglesRecoilState } from '../../../store/recoilState';
import { useDeleteCommentary } from '../../../common/hook';
import { Typography } from '@mui/material';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';

export const ContentSubTitleContainer = styled(Grid)`
    width: 100%;

    & > .title-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 12px;
        box-sizing: border-box;
        background-color: #8fb7da;
        margin: 0 12px 12px 12px;
        border-radius: 6px;
        & > .input-area {
            display: flex;
            align-items: center;
            gap: 8px;
            & > .pin-icon-button {
                height: 20px;
                cursor: pointer;
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

    & .grid-container {
        box-sizing: border-box;
        border-radius: 6px;
        background-color: #ecedef;
        margin: 0 12px 12px 12px;
        padding: 12px;
        width: auto;
        & > .grid-items {
            box-sizing: border-box;
            & > .input-items {
                box-sizing: border-box;
                & > .pin-icon-button-attch {
                    height: 23px;
                    cursor: pointer;
                }
                & > .path-delete-button {
                    position: absolute;
                    top: 0;
                    right: 0;
                    border-radius: 50%;
                }
            }
        }
    }
`

export interface SubContentProps {
    contentID: number;
    pinnedComment?: number[];
    setPinnedComment?: React.Dispatch<React.SetStateAction<number[]>>;
    pinnedTable?: number[];
    setPinnedTable?: React.Dispatch<React.SetStateAction<number[]>>;
    pinnedImage?: number[];
    setPinnedImage?: React.Dispatch<React.SetStateAction<number[]>>;
}

function ContentComment(props: SubContentProps): JSX.Element {
    const { contentID, pinnedComment, setPinnedComment } = props;
    const [collapse, setCollapse] = useState<boolean>(true);
    const [contentComment, setContentComment] = useRecoilState(contentCommentRecoilState);
    const [retangles, setRectangles] = useRecoilState(rectanglesRecoilState);
    const setFocusedRect = useSetRecoilState(focusedRectRecoilState);
    const deleteCommentary = useDeleteCommentary();
    const [pinned, setPinned] = useState<boolean>(false);

    const onClickAddComment = () => {
        const insertComment = {
            id: -1,
            commentId: '',
            comment: '',
            boxID: 0,
        }
        setContentComment([...contentComment, insertComment]);
    };
    const onClickDeleteComment = (_index: number, com: any) => {
        if (com.id !== -1) {
            deleteCommentary({ contentID, deleteID: com.id  });
        }
        setContentComment(contentComment.filter((_, index) => index !== _index));
        if (com.boxID) {
            setRectangles(retangles.filter((rect) => rect.id !== com.boxID));
        }
    };

    const handleIDChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentComment = [...contentComment];
        newContentComment[index] = {
            id: newContentComment[index].id,
            boxID: newContentComment[index].boxID,
            commentId:  e.target.value,
            comment: newContentComment[index].comment,
        };
        setContentComment(newContentComment);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentComment = [...contentComment];
        newContentComment[index] = {
            id: newContentComment[index].id,
            boxID: newContentComment[index].boxID,
            commentId: newContentComment[index].commentId,
            comment: e.target.value,
        };
        setContentComment(newContentComment);
    };

    const handlePinnedChange = (com: any) => {
        if (!pinnedComment || !setPinnedComment) return;
        if (pinnedComment.includes(com.boxID)) {
            console.log('is ehre')
            setPinnedComment((prevState) => [...prevState.filter((id) => id !== com.boxID)]);
        } else {
            setPinnedComment((prevState) => [...prevState, com.boxID]);
        }
    };

    useEffect(() => {
        if (!setPinnedComment) return;
        if (pinned) {
            const newValue = contentComment.map((_com) => _com.boxID)
            setPinnedComment(newValue)
        } else {
            setPinnedComment([]);
        }
    }, [pinned]);

    return (
        <ContentSubTitleContainer>
            <Grid className='title-wrapper sub'>
                <div className='input-area'>
                    <Typography variant='body2'>주석</Typography>
                    <div
                        className='pin-icon-button'
                        onClick={() => setPinned(!pinned)}
                    >
                        {(pinnedComment as any[])?.length > 0 ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                    </div>
                </div>
                <div className='button-area'>
                    <CustomButton size='small' color='info' variant='outlined' iconOnly onClick={onClickAddComment}>
                        <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                            add
                        </Icon>
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
                {contentComment.map((com, index) => (
                    <Grid
                        className='grid-container'
                        container
                        item={true}
                        xs={12}
                        key={index}
                        onMouseEnter={() => setFocusedRect([com.boxID])}
                        onMouseLeave={() => setFocusedRect(undefined)}
                    >
                        <Grid className='grid-items'>
                            <div className='input-items'>
                                <Typography variant='body2'>주석 번호</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleIDChange(e, index)}
                                    value={com.commentId}
                                    style={{ width: '80%' }}
                                    size='small'
                                />
                                <div
                                    className='pin-icon-button-attch'
                                    onClick={() => handlePinnedChange(com)}
                                >
                                    {pinnedComment?.includes(com.boxID)? (
                                        <LockIcon fontSize='small' />
                                    ) : (
                                        <LockOpenIcon fontSize='small' />
                                    )}
                                </div>
                                <CustomButton
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    iconOnly
                                    onClick={() => onClickDeleteComment(index, com)}
                                >
                                    <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                        close
                                    </Icon>
                                </CustomButton>
                            </div>
                        </Grid>
                        <Grid className='grid-items'>
                            <div className='input-items'>
                                <Typography variant='body2'>내용</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCommentChange(e, index)}
                                    value={com.comment}
                                    multiline
                                    rows={2}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Grid>
                    </Grid>
                ))}
            </Collapse>
        </ContentSubTitleContainer>
    );
}
export default React.memo(ContentComment);