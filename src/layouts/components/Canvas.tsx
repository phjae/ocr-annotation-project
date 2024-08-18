import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import {
    contentCommentRecoilState, contentImageRecoilState,
    contentRecoilState,
    contentStateRecoilState, contentTableRecoilState, convertedDimensionRecoilState, focusedRectRecoilState,
    memorizedRectRecoilState,
    ocrDataRecoilState,
    rectanglesRecoilState, replaceCaptureRecoilState,
    selectedLabelRecoilState,
} from '../../store/recoilState';
import { Accumulator, Content, Rectangle } from '../../common/Types';
import { useDeleteCommentary } from '../../common/hook';
import { generateBoxColor, generateNewUniqueID, isUrlPathBase64 } from '../../common/RectangleUtil';
import StringUtil from '../../common/StringUtil';
import OcrUtil from '../../common/OcrUtil';


interface CanvasProps {
    pageNumber: number;
    viewport: any;
    captureRectangleImage: (rect: { startX: any; startY: any; width: any; height: any }) => void;
    capturedImage: any;
    setCapturedImage: (capture: any) => void;
    hiddenPageRendered: boolean;
}

function Canvas(props: CanvasProps): JSX.Element {
    const {
        pageNumber,
        viewport,
        captureRectangleImage,
        capturedImage,
        setCapturedImage,
        hiddenPageRendered = false,
    } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [memorizedRect, setMemorizedRect] = useRecoilState(memorizedRectRecoilState);
    const resetMemorizedRect = useResetRecoilState(memorizedRectRecoilState);
    const [rectangles, setRectangles] = useRecoilState(rectanglesRecoilState);
    const ocrData = useRecoilValue(ocrDataRecoilState);
    const selectedLabel = useRecoilValue(selectedLabelRecoilState);
    const contentState = useRecoilValue(contentStateRecoilState);
    const [tempRect, setTempRect] = useState<Rectangle | null>();
    const [canvasWidth, setCanvasWidth] = useState<number | string>('100%');
    const [canvasHeight, setCanvasHeight] = useState<number | string>('100%');
    const [show, setShow] = useState<boolean>(false);
    const [showMsg, setShowMsg] = useState<string>('');
    const [content, setContent] = useRecoilState(contentRecoilState);
    const [contentComment, setContentComment] = useRecoilState(contentCommentRecoilState);
    const [contentTable, setContentTable] = useRecoilState(contentTableRecoilState);
    const [contentImage, setContentImage] = useRecoilState(contentImageRecoilState);
    const focusedRect = useRecoilValue(focusedRectRecoilState);
    const [convertedDimension, setConvertedDimension] = useRecoilState(convertedDimensionRecoilState);
    const [replaceCapture, setReplaceCapture] = useRecoilState(replaceCaptureRecoilState);
    const deleteCommentary = useDeleteCommentary();

    useEffect(() => {
        const convertedWidth = ocrData?.width / viewport?.width;
        const convertedHeight = ocrData?.height / viewport?.height;
        setConvertedDimension({
            convertedWidth: convertedWidth,
            convertedHeight: convertedHeight,
        });
    }, [ocrData, viewport]);

    useEffect(() => {
        const canvas = canvasRef?.current;
        if (!canvas) {
            console.error('canvas is not ready.');
            return;
        }

        if (canvas) {
            const pageElement = document.querySelector('.react-pdf__Page__canvas');
            if (pageElement) {
                const viewportWidth = pageElement.clientWidth;
                const viewportHeight = pageElement.clientHeight;
                setCanvasWidth(viewportWidth);
                setCanvasHeight(viewportHeight);
            }
        }

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 2) return;
            if (!selectedLabel && !replaceCapture?.selectedLabel) {
                setShow(!show);
                setShowMsg('박스 타입을 선택해 주세요.');
                return;
            }
            setStartX(e.offsetX);
            setStartY(e.offsetY);
            setIsDrawing(true);
            setIsCanceled(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDrawing || isCanceled) return;
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            const width = mouseX - startX;
            const height = mouseY - startY;

            setTempRect({
                id: generateNewUniqueID(),
                x: startX,
                y: startY,
                width,
                height,
                page: pageNumber,
                contentType: selectedLabel || replaceCapture?.selectedLabel,
                points: [
                    [startX * convertedDimension.convertedWidth, startY * convertedDimension.convertedHeight],
                    [(startX + width) * convertedDimension.convertedWidth, startY * convertedDimension.convertedHeight],
                    [
                        (startX + width) * convertedDimension.convertedWidth,
                        (startY + height) * convertedDimension.convertedHeight,
                    ],
                    [
                        startX * convertedDimension.convertedWidth,
                        (startY + height) * convertedDimension.convertedHeight,
                    ],
                ],
            });
        };

        const handleKeydown = (e: KeyboardEvent) => {
            if (e.code === 'Escape') {
                setIsCanceled(true);
                setIsDrawing(false);
                setTempRect(null);
                setStartX(0);
                setStartY(0);
            }
        }

        const handleMouseUp = () => {
            if (isCanceled) return;
            if (tempRect) {
                console.log(tempRect)
                setRectangles([...rectangles, tempRect]);
                setMemorizedRect(tempRect);
                setTempRect(undefined);
                if (
                    ['image', 'table'].includes(selectedLabel as string) ||
                    ['image', 'table'].includes(replaceCapture?.selectedLabel)
                ) {
                    const rect = {
                        startX: tempRect.x,
                        startY: tempRect.y,
                        width: tempRect.width,
                        height: tempRect.height,
                    };
                    captureRectangleImage(rect);
                }
            }
            setIsDrawing(false);
        };

        const handleDeleteClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            const { remainingRectangles, deletedRectangles } = rectangles.reduce<Accumulator>(
                (acc, rect) => {
                    const withinX = mouseX >= rect.x && mouseX <= rect.x + rect.width;
                    const withinY = mouseY >= rect.y && mouseY <= rect.y + rect.height;

                    if (withinX && withinY) {
                        acc.deletedRectangles.push(rect);
                    } else {
                        acc.remainingRectangles.push(rect);
                    }

                    return acc;
                },
                { remainingRectangles: [], deletedRectangles: [] },
            );
            if (deletedRectangles.length > 0) {
                const rect = deletedRectangles[0];
                switch (rect?.contentType) {
                    case 'content':
                    case 'CONTENT':
                        setContent({
                            boxID: content?.boxID.filter((id) => id !== rect.id) || [],
                            title: content?.title || '',
                            description: content?.description || '',
                        });
                        break;
                    case 'comment':
                    case 'COMMENTARY': {
                        const [deleteCom] = contentComment.filter((com) => com.boxID === rect.id);
                        if (deleteCom.id !== -1) {
                            deleteCommentary({ contentID: contentState.activatedState, deleteID: deleteCom.id });
                        }
                        setContentComment(contentComment.filter((com) => com.boxID !== rect.id));
                        break;
                    }
                    case 'table':
                    case 'TABLE': {
                        const deleteTableIndex = contentTable.findIndex((table) => table.boxID === rect.id);
                        const deleteTable = contentTable[deleteTableIndex];
                        const newContentTable = [...contentTable];
                        newContentTable[deleteTableIndex] = {
                            id: newContentTable[deleteTableIndex].id,
                            boxID: !deleteTable.boxID ? -99 : newContentTable[deleteTableIndex].boxID,
                            path: '',
                            keyword: newContentTable[deleteTableIndex].keyword,
                            title: newContentTable[deleteTableIndex].title,
                            description: newContentTable[deleteTableIndex].description,
                            isModified: !isUrlPathBase64(deleteTable.path),
                        };
                        setContentTable(newContentTable);
                        break;
                    }
                    case 'image':
                    case 'IMAGE': {
                        const deleteImgIndex = contentImage.findIndex((img) => img.boxID === rect.id);
                        const deleteImg = contentImage[deleteImgIndex];
                        const newContentImage = [...contentImage];
                        newContentImage[deleteImgIndex] = {
                            id: newContentImage[deleteImgIndex].id,
                            boxID: !deleteImg.boxID ? -99 : newContentImage[deleteImgIndex].boxID,
                            path: '',
                            keyword: newContentImage[deleteImgIndex].keyword,
                            title: newContentImage[deleteImgIndex].title,
                            description: newContentImage[deleteImgIndex].description,
                            isModified: !isUrlPathBase64(deleteImg.path),
                        };
                        setContentTable(newContentImage);
                        break;
                    }
                    default:
                        break;
                }
            }
            setRectangles(remainingRectangles);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('contextmenu', handleDeleteClick);
        document.addEventListener('keydown', handleKeydown);


        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('contextmenu', handleDeleteClick);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [
        isDrawing,
        startX,
        startY,
        tempRect,
        rectangles,
        pageNumber,
        selectedLabel,
        content,
        contentImage,
        contentComment,
        contentTable,
        convertedDimension,
        capturedImage?.selectedLabel,
        isCanceled,
    ]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx?.clearRect(0, 0, canvas?.width, canvas?.height);

        rectangles.forEach((rect) => {
            if (rect.page === pageNumber) {
                ctx.fillStyle = 'rgba(250,245,38,0.35)';
                ctx.strokeStyle = generateBoxColor(rect.contentType);
                ctx.lineWidth = 2;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                if (focusedRect?.includes(rect.id)) {
                    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                }
            }
        });

        if (tempRect) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.fillStyle = 'rgba(255,255,255,0.43)';
            ctx.strokeRect(tempRect.x, tempRect.y, tempRect.width, tempRect.height);
            ctx.fillRect(tempRect.x, tempRect.y, tempRect.width, tempRect.height);
        }
    }, [rectangles, tempRect, pageNumber, focusedRect, hiddenPageRendered]);

    useEffect(() => {
        if (!replaceCapture?.selectedLabel || !memorizedRect || !capturedImage) return;
        switch (replaceCapture.selectedLabel) {
            case 'image':
            case 'IMAGE': {
                const updateContentImage = [...contentImage];
                const index = updateContentImage.findIndex((image) => image.boxID === replaceCapture.boxID);
                if (index === -1) {
                    setShow(!show);
                    setShowMsg('변경할 캡쳐를 찾지 못했습니다. 다시 시도하세요.');
                    return;
                }
                updateContentImage[index] = {
                    id: updateContentImage[index].id,
                    boxID: memorizedRect.id,
                    path: capturedImage,
                    keyword: updateContentImage[index].keyword,
                    title: updateContentImage[index].title,
                    description: updateContentImage[index].description,
                    isModified: updateContentImage[index].isModified,
                };
                setContentImage(updateContentImage);
                break;
            }
            case 'table':
            case 'TABLE': {
                const updateContentTable = [...contentTable];
                const index = updateContentTable.findIndex((image) => image.boxID === replaceCapture.boxID);
                if (index === -1) {
                    setShow(!show);
                    setShowMsg('변경할 캡쳐를 찾지 못했습니다. 다시 시도하세요.');
                    return;
                }
                updateContentTable[index] = {
                    id: updateContentTable[index].id,
                    boxID: memorizedRect.id,
                    path: capturedImage,
                    keyword: updateContentTable[index].keyword,
                    title: updateContentTable[index].title,
                    description: updateContentTable[index].description,
                    isModified: updateContentTable[index].isModified,
                };
                setContentTable(updateContentTable);
                break;
            }
            default:
                break;
        }
        setReplaceCapture(null);
        resetMemorizedRect();
        setCapturedImage(null);
    }, [replaceCapture, memorizedRect, capturedImage, contentImage]);

    useEffect(() => {
        if (replaceCapture?.selectedLabel) return;
        if ((StringUtil.isNotEmpty(JSON.stringify(memorizedRect?.points)) && StringUtil.isNotEmpty(ocrData))) {
            const jsonDrawBox = JSON.parse(JSON.stringify(memorizedRect?.points));
            const jsonSmallBoxes = JSON.parse(ocrData.boxes);
            if (jsonDrawBox && jsonSmallBoxes) {
                const boxedText = OcrUtil.extractTextFromOcr(jsonDrawBox, jsonSmallBoxes);
                if (selectedLabel) {
                    switch (selectedLabel) {
                        case 'content': {
                            if (content?.boxID.includes(memorizedRect.id)) return;
                            const newContent: Content = {
                                boxID: content?.boxID ? [...content.boxID, memorizedRect.id] : [memorizedRect.id],
                                title: content?.title ? content.title : '',
                                description: content?.description
                                    ? content.description.concat('\n', boxedText)
                                    : boxedText,
                            };
                            if (content?.answer) {
                                newContent.answer = content.answer;
                            }
                            setContent(newContent);
                            break;
                        }
                        case 'comment':
                            if (contentComment?.map((com) => com.boxID).includes(memorizedRect.id)) return;
                            setContentComment([
                                ...contentComment,
                                {
                                    id: -1,
                                    boxID: memorizedRect.id,
                                    commentId: '',
                                    comment: boxedText,
                                },
                            ]);
                            break;
                        case 'table':
                            if (contentTable?.map((com) => com.boxID).includes(memorizedRect.id)) return;
                            setContentTable([
                                ...contentTable,
                                {
                                    id: -1,
                                    boxID: memorizedRect.id,
                                    path: capturedImage,
                                    keyword: '',
                                    title: '',
                                    description: '',
                                    isModified: true,
                                },
                            ]);
                            setCapturedImage(null);
                            break;
                        case 'image':
                            console.log('here', contentImage);
                            if (contentImage?.map((com) => com.boxID).includes(memorizedRect.id)) return;
                            setContentImage([
                                ...contentImage,
                                {
                                    id: -1,
                                    boxID: memorizedRect.id,
                                    path: capturedImage,
                                    keyword: '',
                                    title: '',
                                    description: '',
                                    isModified: true,
                                },
                            ]);
                            setCapturedImage(null);
                            break;
                        default:
                            break;
                    }
                    resetMemorizedRect();
                }
            }
        }
    }, [ocrData, memorizedRect, capturedImage]);

    return (
        <>
            <canvas
                className='canvas-overlay'
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    cursor: 'crosshair',
                }}
            />
            {/*<ConfirmationDialog*/}
            {/*    anchorOrigin={{ horizontal: 'center', vertical: 'top' }}*/}
            {/*    open={show}*/}
            {/*    close={() => setShow(!show)}*/}
            {/*    content={showMsg}*/}
            {/*    color='secondary'*/}
            {/*    handleYes={() => setShow(!show)}*/}
            {/*    handleNo={() => setShow(!show)}*/}
            {/*/>*/}
        </>
    );
}

export default React.memo(Canvas);
