import React from 'react';
import AnnotationView from './layouts/AnnotationView';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import GlobalTheme from './components/GlobalTheme';


function TestPdfViewer(): JSX.Element {
    return <div>PdfViewer Component</div>;
}

function TestContentViewer(): JSX.Element {
    return <div>ContentViewer Component</div>;
}

function App() {

    const queryClient = new QueryClient(
        {
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    cacheTime: 0, // 시간안에 같은 key로 요청오면 캐싱된 데이터 리턴 1000 -> 1초, default: 0초, 공지사항, FAQ: 1시간(1000 * 60 * 60) 으로 오버라이딩 해서 사용
                    retry: false, // false: 에러시 재시도 없음. 1: 재시도 1회
                    enabled: false, // true: mount시 함수 호출, false mount시 함수 호출 되지 않음
                    // onError: (response: any) => {
                    //     console.log(response)
                    //     // setErrMsg(response?.data?.error?response.data.error: MESSAGE.ERROR)
                    //     // setOpenErrMsg(true)
                    //     // if(response?.status === 401 || response?.status === 403){
                    //     //     StorageUtil.initStorage()
                    //     //     navigate("/authentication/sign-in")
                    //     // }
                    // }
                },
            }
        }
    )


    return (
        <div className='App'>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={GlobalTheme}>
                    <AnnotationView />
                </ThemeProvider>
            </QueryClientProvider>
        </div>
    );
}

export default App;
