import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import TaskService from '../../../service/TaskService';

function CapturedImageViewer(props: any): JSX.Element {
    const { path } = props;
    const [file, setFile] = useState<any>(undefined);

    const { refetch: getTaskFile } = useQuery<Blob, AxiosError>(
        ['getTaskFile', path],
        () => TaskService.getTaskFile(path), {
        onSuccess: (res: Blob) => {
            if (res) {
                const correctedBlob = new Blob([res], { type: 'image/png' });
                const imageObjectURL = URL.createObjectURL(correctedBlob);
                setFile(imageObjectURL);
            }
        },
    });

    useEffect(() => {
        if (!path) return;
        getTaskFile(path);
    }, [path]);

    return (
        <>
            {file && (
                <img src={file} alt='Captured' style={{ maxWidth: '140px', maxHeight: '64px' }} />
            )}
        </>
    );
}

export default React.memo(CapturedImageViewer);
