export interface TestCase {
  id: number
  fileName?: string
  projectId?: string
  category?: string

  isSelected?: boolean
  orderSeq?: number

}

export interface DefaultResponse {
  code: number,
  subCode: number,
  data: any,
  error: string
}

export interface ContentData {
  taskId: number | undefined;
  chapter: string | undefined;
  section: string | undefined;
  article: string | undefined;
  paragraph: string | undefined;
  line: string | undefined;
  indices: any[] | undefined;
  startPage: number | undefined;
  endPage: number | undefined;
  categories: string | undefined;
  contentTitle: string | undefined;
  content: string | undefined;
  question: string | undefined;
  answer: string | undefined;
  example: string | undefined;
  commentaries: any[] | undefined;
  tables: any[] | undefined;
  images: any[] | undefined;
  boxes: any[] | undefined;
  modUserId: number | undefined;
}

export interface Rectangle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  contentType: string;
  points: number[][];
}

export interface Content {
  boxID: number[];
  title: string;
  description: string;
  answer?: string;
}

export interface Comment {
  id: number;
  boxID: number;
  commentId: string;
  comment: string;
}

export interface Image {
  id: number;
  boxID: number;
  path: string;
  keyword: string;
  title: string;
  description: string;
  isModified: boolean;
}

export interface PinnedState {
  chapter: boolean;
  section: boolean;
  clause: boolean;
  item: boolean;
  row: boolean;
  index: boolean;
  startPage: boolean;
  endPage: boolean;
  category: boolean;
  commentary: boolean;
  table: boolean;
  image: boolean;
}

export type Accumulator = {
  remainingRectangles: Rectangle[];
  deletedRectangles: Rectangle[];
};