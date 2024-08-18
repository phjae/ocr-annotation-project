import React, { useEffect, useState } from 'react';
import { ContentSubTitleContainer, SubContentProps } from './ContentComment';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Collapse from '@mui/material/Collapse';
import { useRecoilState, useSetRecoilState } from 'recoil';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
    contentImageRecoilState,
    focusedRectRecoilState,
    rectanglesRecoilState,
    replaceCaptureRecoilState,
} from '../../../store/recoilState';
import { useDeleteImage } from '../../../common/hook';
import { Image } from '../../../common/Types';
import { isUrlPathBase64 } from '../../../common/RectangleUtil';
import { Typography } from '@mui/material';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import CapturedImageViewer from './CapturedImageViewer';

interface Props extends SubContentProps {
    isTemplate?: boolean;
}

function ContentImage(props: Props): JSX.Element {
    const { isTemplate = false, contentID, pinnedImage, setPinnedImage } = props;
    const [collapse, setCollapse] = useState<boolean>(true);
    const [contentImage, setContentImage] = useRecoilState(contentImageRecoilState);
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

    const onClickAddImage = () => {
        const insertComment: Image = {
            id: -1,
            boxID: 0,
            path: '',
            keyword: '',
            title: '',
            description: '',
            isModified: true,
        };
        setContentImage([...contentImage, insertComment]);
    };
    const onClickDeleteImage = (_index: number, img: any) => {
        setOpenConfirmMsg(!openConfirmMsg);
        setConfirmMsg('해당 작업을 되돌릴 수 없습니다. 삭제하시겠습니까?')
        setReplaceImage({ index: _index, image: img });
        setIsDeleteTable(true);
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentImage = [...contentImage];
        newContentImage[index] = {
            id: newContentImage[index].id,
            boxID: newContentImage[index].boxID,
            path: newContentImage[index].path,
            keyword: e.target.value,
            title: newContentImage[index].title,
            description: newContentImage[index].description,
            isModified: newContentImage[index].isModified,
        };
        setContentImage(newContentImage);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentImage = [...contentImage];
        newContentImage[index] = {
            id: newContentImage[index].id,
            boxID: newContentImage[index].boxID,
            path: newContentImage[index].path,
            keyword: newContentImage[index].keyword,
            title: e.target.value,
            description: newContentImage[index].description,
            isModified: newContentImage[index].isModified,
        };
        setContentImage(newContentImage);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newContentImage = [...contentImage];
        newContentImage[index] = {
            id: newContentImage[index].id,
            boxID: newContentImage[index].boxID,
            path: newContentImage[index].path,
            keyword: newContentImage[index].keyword,
            title: newContentImage[index].title,
            description: e.target.value,
            isModified: newContentImage[index].isModified,
        };
        setContentImage(newContentImage);
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
            const newContentImage = [...contentImage];
            newContentImage[replaceImage.index] = {
                id: newContentImage[replaceImage.index].id,
                boxID: newContentImage[replaceImage.index].boxID,
                path: '',
                keyword: newContentImage[replaceImage.index].keyword,
                title: newContentImage[replaceImage.index].title,
                description: newContentImage[replaceImage.index].description,
                isModified: !isUrlPathBase64(replaceImage.image.path),
            };
            setContentImage(newContentImage);
            setReplaceCapture({
                selectedLabel: 'image',
                boxID: replaceImage.image.boxID,
            });
            setIsReplace(false);
        }

        if (isDeleteTable) {
            if (!replaceImage) return;
            if (replaceImage.image.id !== -1) {
                deleteImage({ contentID, deleteID: replaceImage.image.id });
            }
            setContentImage(contentImage.filter((_, index) => index !== replaceImage.index));
            if (replaceImage.image.boxID) {
                setRectangles(retangles.filter((rect) => rect.id !== replaceImage.image.boxID));
            }
            setIsDeleteTable(false);
        }

        setReplaceImage(null);
        setOpenConfirmMsg(!openConfirmMsg);
    };

    const handlePinnedChange = (com: any) => {
        if (!pinnedImage || !setPinnedImage) return;
        if (pinnedImage.includes(com.boxID)) {
            console.log('is ehre')
            setPinnedImage((prevState) => [...prevState.filter((id) => id !== com.boxID)]);
        } else {
            setPinnedImage((prevState) => [...prevState, com.boxID]);
        }
    };

    useEffect(() => {
        if (!setPinnedImage) return;
        if (pinned) {
            const newValue = contentImage.map((_img) => _img.boxID)
            setPinnedImage(newValue)
        } else {
            setPinnedImage([]);
        }
    }, [pinned]);

    return (
        <ContentSubTitleContainer>
            <Grid className='title-wrapper sub'>
                <div className='input-area'>
                    <Typography variant='body2'>{isTemplate ? '서식' : '이미지'}</Typography>
                    <div
                        className='pin-icon-button'
                        onClick={() => setPinned(!pinned)}
                    >
                        {(pinnedImage as any[])?.length > 0 ? <LockIcon fontSize='small' /> : <LockOpenIcon fontSize='small' />}
                    </div>
                </div>
                <div className='button-area'>
                    <CustomButton size='small' color='info' variant='outlined' iconOnly onClick={onClickAddImage}>
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
                {contentImage.map((img, index) => (
                    <Grid
                        className='grid-container'
                        container
                        item={true}
                        xs={12}
                        key={index}
                        onMouseEnter={() => setFocusedRect([img.boxID])}
                        onMouseLeave={() => setFocusedRect(undefined)}
                    >
                        <Grid className='grid-items'>
                            <div className='input-items' style={{ flex: 2 }}>
                                <Typography variant='body2'>키워드</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleKeywordChange(e, index)}
                                    value={img.keyword}
                                    style={{ width: '100%' }}
                                    size='small'
                                />
                                <div className='pin-icon-button-attch' onClick={() => handlePinnedChange(img)}>
                                    {pinnedImage?.includes(img.boxID) ? (
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
                                    onClick={() => onClickDeleteImage(index, img)}
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
                                    value={img.title}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </Grid>
                        <Grid className='grid-items' style={{ display: 'flex' }}>
                            <div className='input-items capture' style={{ flex: 1, position: 'relative' }}>
                                <Typography variant='body2'>갭쳐</Typography>
                                <div>
                                    {img.path && isUrlPathBase64(img.path) && (
                                        <img
                                            src={img.path}
                                            alt='Captured'
                                            style={{ maxWidth: '140px', maxHeight: '64px' }}
                                        />
                                    )}
                                    {img.path && !isUrlPathBase64(img.path) && (
                                        <CapturedImageViewer key={img.path} path={img.path} />
                                    )}
                                </div>
                                <CustomButton
                                    size='small'
                                    color='secondary'
                                    variant='contained'
                                    className='path-delete-button'
                                    iconOnly
                                    onClick={() => handleChangeCaptureClick(img, index)}
                                >
                                    <Icon sx={{ fontWeight: 'bold' }} fontSize='medium'>
                                        {img.path ? 'close' : 'add'}
                                    </Icon>
                                </CustomButton>
                            </div>
                            <div className='input-items' style={{ flex: 4 }}>
                                <Typography variant='body2'>설명</Typography>
                                <CustomInput
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleDescriptionChange(e, index)
                                    }
                                    value={img.description}
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
            {/*        setReplaceImage(null);*/}
            {/*        setIsReplace(false);*/}
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

export default React.memo(ContentImage);
