import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Collapse from '@mui/material/Collapse';
import { ContentSubTitleContainer, SubContentProps } from './ContentComment';
import { useRecoilState, useSetRecoilState } from 'recoil';
import CapturedImageViewer from './CapturedImageViewer';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    contentTableRecoilState,
    focusedRectRecoilState,
    rectanglesRecoilState,
    replaceCaptureRecoilState,
} from '../../../store/recoilState';
import { useDeleteImage } from '../../../common/hook';
import { Image } from '../../../common/Types';
import { isUrlPathBase64 } from '../../../common/RectangleUtil';
import { Typography } from '@mui/material';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';

function ContentTable(props: SubContentProps): JSX.Element {
    const { contentID, pinnedTable, setPinnedTable } = props;
    const [collapse, setCollapse] = useState<boolean>(true);
    const [contentTable, setContentTable] = useRecoilState(contentTableRecoilState);
    const [retangles, setRectangles] = useRecoilState(rectanglesRecoilState);
    const setFocusedRect = useSetRecoilState(focusedRectRecoilState);
    const setReplaceCapture = useSetRecoilState(replaceCaptureRecoilState);
    const [openConfirmMsg, setOpenConfirmMsg] = useState(false);
    const [confirmMsg, setConfirmMsg] = useState('');
    const deleteImage = useDeleteImage();
    const [isReplace, setIsReplace] = useState<boolean>(false);
    const [replaceImage, setReplaceImage] = useState<{
        index: number;
        image: any;
    } | null>(null);
    const [isDeleteTable, setIsDeleteTable] = useState(false);
    const [pinned, setPinned] = useState<boolean>(false);

    const onClickAddTable = () => {
        const insertComment: Image = {
            id: -1,
            path: '',
            keyword: '',
            title: '',
            description: '',
            boxID: 0,
            isModified: false,
        };
        setContentTable([...contentTable, insertComment]);
    };
    const onClickDeleteTable = (_index: number, table: any) => {
        setOpenConfirmMsg(!openConfirmMsg);
        setConfirmMsg('해당 작업을 되돌릴 수 없습니다. 삭제하시겠습니까?');
        setReplaceImage({ index: _index, image: table });
        setIsDeleteTable(true);
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentTable = [...contentTable];
        newContentTable[index] = {
            id: newContentTable[index].id,
            boxID: newContentTable[index].boxID,
            path: newContentTable[index].path,
            keyword: e.target.value,
            title: newContentTable[index].title,
            description: newContentTable[index].description,
            isModified: newContentTable[index].isModified,
        };
        setContentTable(newContentTable);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentTable = [...contentTable];
        newContentTable[index] = {
            id: newContentTable[index].id,
            boxID: newContentTable[index].boxID,
            path: newContentTable[index].path,
            keyword: newContentTable[index].keyword,
            title: e.target.value,
            description: newContentTable[index].description,
            isModified: newContentTable[index].isModified,
        };
        setContentTable(newContentTable);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentTable = [...contentTable];
        newContentTable[index] = {
            id: newContentTable[index].id,
            boxID: newContentTable[index].boxID,
            path: newContentTable[index].path,
            keyword: newContentTable[index].keyword,
            title: newContentTable[index].title,
            description: e.target.value,
            isModified: newContentTable[index].isModified,
        };
        setContentTable(newContentTable);
    };

    const handleChangeCaptureClick = (img: any, index: number) => {
        setOpenConfirmMsg(!openConfirmMsg);
        setConfirmMsg(
            replaceImage?.image?.path
                ? '캡처 삭제 후 즉시 새로운 박스를 생성해야 합니다. 삭제하시겠습니까?'
                : '즉시 새로운 박스를 생성해야 합니다. 추가하시겠습니까?',
        );
        setReplaceImage({ index: index, image: img });
        setIsReplace(true);
    };

    const handleYes = () => {
        if (isReplace) {
            if (!replaceImage) return;
            setRectangles(retangles.filter((rect) => rect.id !== replaceImage.image.boxID));
            const newContentTable = [...contentTable];
            newContentTable[replaceImage.index] = {
                id: newContentTable[replaceImage.index].id,
                boxID: !replaceImage.image.boxID ? -99 : newContentTable[replaceImage.index].boxID,
                path: '',
                keyword: newContentTable[replaceImage.index].keyword,
                title: newContentTable[replaceImage.index].title,
                description: newContentTable[replaceImage.index].description,
                isModified: !isUrlPathBase64(replaceImage.image.path),
            };
            setContentTable(newContentTable);
            setReplaceCapture({
                selectedLabel: 'table',
                boxID: !replaceImage.image.boxID ? -99 : replaceImage.image.boxID,
            });
            setIsReplace(false);
        }
        if (isDeleteTable) {
            if (!replaceImage) return;
            if (replaceImage.image.id !== -1) {
                deleteImage({ contentID, deleteID: replaceImage.image.id });
            }
            setContentTable(contentTable.filter((_, index) => index !== replaceImage.index));
            if (replaceImage.image.boxID) {
                setRectangles(retangles.filter((rect) => rect.id !== replaceImage.image.boxID));
            }
            setIsDeleteTable(false);
        }
        setReplaceImage(null);
        setOpenConfirmMsg(!openConfirmMsg);
    };

    const handlePinnedChange = (com: any) => {
        if (!pinnedTable || !setPinnedTable) return;
        if (pinnedTable.includes(com.boxID)) {
            console.log('is ehre')
            setPinnedTable((prevState) => [...prevState.filter((id) => id !== com.boxID)]);
        } else {
            setPinnedTable((prevState) => [...prevState, com.boxID]);
        }
    };

    useEffect(() => {
        if (!setPinnedTable) return;
        if (pinned) {
            const newValue = contentTable.map((_tab) => _tab.boxID)
            setPinnedTable(newValue)
        } else {
            setPinnedTable([]);
        }
    }, [pinned]);

    return (
        <ContentSubTitleContainer>
            <Grid className='title-wrapper sub'>
                <div className='input-area'>
                    <Typography variant='body2'>표</Typography>
                    <div
                        className='pin-icon-button'
                        onClick={() => setPinned(!pinned)}
                    >
                        {(pinnedTable as any[])?.length > 0 ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                    </div>
                </div>
                <div className='button-area'>
                    <CustomButton size='small' color='info' variant='outlined' iconOnly onClick={onClickAddTable}>
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
                {contentTable.map((table, index) => (
                    <Grid
                        className='grid-container'
                        container
                        item={true}
                        xs={12}
                        key={index}
                        onMouseEnter={() => setFocusedRect([table.boxID])}
                        onMouseLeave={() => setFocusedRect(undefined)}
                    >
                        <Grid className='grid-items'>
                            <div className='input-items'>
                                <Typography variant='body2'>키워드</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleKeywordChange(e, index)}
                                    value={table.keyword}
                                    style={{ width: '100%' }}
                                    size='small'
                                />
                                <div className='pin-icon-button-attch' onClick={() => handlePinnedChange(table)}>
                                    {pinnedTable?.includes(table.boxID) ? (
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
                                    onClick={() => onClickDeleteTable(index, table)}
                                >
                                    <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                        close
                                    </Icon>
                                </CustomButton>
                            </div>
                        </Grid>
                        <Grid className='grid-items'>
                            <div className='input-items'>
                                <Typography variant='body2'>제목</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e, index)}
                                    value={table.title}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Grid>
                        <Grid className='grid-items' style={{ display: 'flex' }}>
                            <div className='input-items capture' style={{ flex: 1, position: 'relative' }}>
                                <Typography variant='body2'>갭쳐</Typography>
                                <div>
                                    {table.path && isUrlPathBase64(table.path) && (
                                        <img
                                            src={table.path}
                                            alt='Captured'
                                            style={{ maxWidth: '140px', maxHeight: '64px' }}
                                        />
                                    )}
                                    {table.path && !isUrlPathBase64(table.path) && (
                                        <CapturedImageViewer path={table.path} />
                                    )}
                                </div>
                                <CustomButton
                                    size='small'
                                    color='secondary'
                                    variant='contained'
                                    className='path-delete-button'
                                    iconOnly
                                    onClick={() => handleChangeCaptureClick(table, index)}
                                >
                                    <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                        {table.path ? 'close' : 'add'}
                                    </Icon>
                                </CustomButton>
                            </div>
                            <div className='input-items description' style={{ flex: 4 }}>
                                <Typography variant='body2'>설명</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleDescriptionChange(e, index)
                                    }
                                    value={table.description}
                                    multiline
                                    rows={2}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Grid>
                    </Grid>
                ))}
            </Collapse>
            {/*<ConfirmationDialog*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    open={openConfirmMsg}*/}
            {/*    close={() => {*/}
            {/*        setOpenConfirmMsg(!openConfirmMsg);*/}
            {/*        setIsReplace(false);*/}
            {/*        setReplaceImage(null);*/}
            {/*        setIsDeleteTable(false);*/}
            {/*    }}*/}
            {/*    content={confirmMsg}*/}
            {/*    color='secondary'*/}
            {/*    handleYes={handleYes}*/}
            {/*    handleNo={() => setOpenConfirmMsg(!openConfirmMsg)}*/}
            {/*/>*/}
        </ContentSubTitleContainer>
    );
}

export default React.memo(ContentTable);
