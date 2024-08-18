import React from 'react';
import Grid from '@mui/material/Grid';
import PdfViewer from './components/PdfViewer';
import ContentViewer from './components/ContentViewer';
import styled from '@emotion/styled';

const AnnotationViewContainer = styled(Grid)`
    width: 100%;
    display: flex;
`;

function AnnotationView(): JSX.Element {

    return (
        <>
            <AnnotationViewContainer className='annotation-view'>
                <PdfViewer />
                <ContentViewer />
            </AnnotationViewContainer>
        </>
    );
}

export default React.memo(AnnotationView);
