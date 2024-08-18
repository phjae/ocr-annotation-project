import file from '../../assets/example.pdf';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Canvas from './Canvas';
import React, { useEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import styled from '@emotion/styled';
import Icon from '@mui/material/Icon';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { useParams } from 'react-router-dom';
import { contentStateRecoilState, ocrDataRecoilState } from '../../store/recoilState';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import OcrService from '../../service/OcrService';
import { DefaultResponse } from '../../common/Types';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

pdfjs.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

const PdfViewerContainer = styled(Grid)`
    & > .controls {
        width: 100%;
        display: flex;
        justify-content: space-between;

        & .controls-input {
            display: flex;
            align-items: center;
            font-size: 14px;
            gap: 12px;
        }

        & > button {
            padding: 0 12px;
            height: 35px !important;
        }
    }
`;

function PdfViewer(): JSX.Element {
    //const file = useRecoilValue(fileRecoilState);
    const contentState = useRecoilValue(contentStateRecoilState);
    const { id: taskID } = useParams();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [subPageNumber, setSubPageNumber] = useState<number>(1);
    const setOcrData = useSetRecoilState(ocrDataRecoilState);
    const [pdfViewport, setPdfViewport] = useState<any>(undefined);
    const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<any>(null);
    const [hiddenPageRendered, setHiddenPageRendered] = useState<boolean>(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (page: { getViewport: (arg0: { scale: number }) => any }) => {
        const viewport = page.getViewport({ scale: 1 });
        setPdfViewport(viewport);
    };

    const { refetch: getOcr } = useQuery<DefaultResponse, AxiosError>(
        ['getOcr'],
        () => OcrService.getOcr(1, +pageNumber - 1),
        {
            onSuccess: (res: DefaultResponse) => {
                if (res.code === 200 && res.subCode === 0) {
                    setOcrData(res.data);
                }
            },
        },
    );

    useEffect(() => {
        if (taskID && pageNumber) {
            console.log('getting ocr data============>');
            getOcr();
        }
    }, [taskID, pageNumber]);

    useEffect(() => {
        if (contentState.activatedState !== undefined && contentState.activatedPage !== undefined) {
            setPageNumber(contentState.activatedPage);
        }
    }, [contentState]);

    useEffect(() => {
        setPageNumber(1);
        setSubPageNumber(1);
    }, [numPages]);

    const goToPreviousPage = () => {
        if (+pageNumber > 1) {
            setPageNumber(+pageNumber - 1);
            setHiddenPageRendered(false);
        }
    };

    const goToNextPage = () => {
        if (subPageNumber < numPages) {
            setPageNumber(+pageNumber + 1);
            setHiddenPageRendered(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        let renderTask: any = null;

        const loadPdfPage = async () => {
            try {
                if (!file) return;
                const loadingTask = pdfjs.getDocument(file);
                const pdf = await loadingTask.promise;
                if (!mounted) return;
                const page = await pdf.getPage(+pageNumber);
                if (!mounted) return;
                renderPageOnCanvas(page);
            } catch (error) {
                console.error('Error loading PDF or page:', error);
            }
        };

        const renderPageOnCanvas = (page: PDFPageProxy) => {
            if (renderTask) {
                renderTask.cancel();
            }

            const canvas = hiddenCanvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext('2d');
            if (!context) return;

            const viewport = page.getViewport({ scale: 1 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            renderTask = page.render({
                canvasContext: context,
                viewport: viewport,
            });

            renderTask.promise
                .then(() => {
                    console.log('PDF page rendered on hidden canvas');
                    renderTask = null;
                    setHiddenPageRendered(true);
                })
                .catch((error: any) => {
                    if (error?.name !== 'RenderingCancelledException') {
                        console.error('Error rendering page:', error);
                    }
                    renderTask = null;
                });
        };

        loadPdfPage();
        return () => {
            mounted = false;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pageNumber, pdfViewport, file]);

    const captureRectangleImage = (rect: { startX: number; startY: number; width: number; height: number }) => {
        const canvas = hiddenCanvasRef?.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            const { startX, startY, width, height } = rect;
            const imageData = context?.getImageData(startX, startY, width, height);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempContext = tempCanvas.getContext('2d');
            if (!imageData) {
                console.error('no image data');
                return;
            }
            tempContext?.putImageData(imageData, 0, 0);

            const dataUrl = tempCanvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
        }
    };

    return (
        <PdfViewerContainer className='pdf-viewer'>
            <div className='controls'>
                <CustomButton variant='outlined' color='primary' onClick={goToPreviousPage} disabled={pageNumber === 1}>
                    {/*<Icon sx={{ fontWeight: 'bold' }}>arrow_backward</Icon>*/}
                    <ChevronLeftRoundedIcon />
                    이전 페이지
                </CustomButton>
                <div className='controls-input'>
                    <CustomInput value={pageNumber} style={{ width: '50px' }} size='small' readOnly />
                    &#47;{numPages}
                </div>
                <CustomButton
                    variant='outlined'
                    color='primary'
                    onClick={goToNextPage}
                    disabled={pageNumber === numPages}
                >
                    다음 페이지
                    <ChevronRightRoundedIcon />
                </CustomButton>
            </div>
            <div className='pdf-container'>
                <Document file={file} renderMode='canvas' onLoadSuccess={onDocumentLoadSuccess}>
                    <Page className='pdf-page' pageNumber={+pageNumber} onLoadSuccess={onPageLoadSuccess}>
                        {/* Canvas 오버레이 */}
                        <canvas ref={hiddenCanvasRef} style={{ display: 'none' }}></canvas>
                        <Canvas
                            pageNumber={+pageNumber}
                            viewport={pdfViewport}
                            captureRectangleImage={captureRectangleImage}
                            capturedImage={capturedImage}
                            setCapturedImage={setCapturedImage}
                            hiddenPageRendered={hiddenPageRendered}
                        />
                    </Page>
                </Document>
            </div>
        </PdfViewerContainer>
    );
}

export default PdfViewer;
