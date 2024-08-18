import StringUtil from "./StringUtil";

type Coordinate = [number, number];

type Box = [Coordinate, Coordinate, Coordinate, Coordinate, number, string];
// 하나의 객체를 나타내는 타입

type Boxes = Box[];
type ExtractResult = Boxes[];

class Dbscan {
  eps: number;
  minPts: number;
  labels: number[];
  noise: number;
  unclassified: number | null;

  constructor(eps: number, minPts: number) {
    this.eps = eps;
    this.minPts = minPts;
    this.labels = [];
    this.noise = -1;
    this.unclassified = null;
  }

  fit(data: number[][]) {
    this.labels = new Array(data.length).fill(this.unclassified);
    let clusterId = 0;
    for (let pointId = 0; pointId < data.length; pointId++) {
      if (this.labels[pointId] === this.unclassified) {
        if (this.expandCluster(data, pointId, clusterId)) {
          clusterId++;
        }
      }
    }
    return this.labels;
  }

  expandCluster(data: number[][], pointId: number, clusterId: number) {
    const seeds = this.regionQuery(data, pointId);
    if (seeds.length < this.minPts) {
      this.labels[pointId] = this.noise;
      return false;
    }

    for (const seedId of seeds) {
      this.labels[seedId] = clusterId;
    }

    seeds.splice(seeds.indexOf(pointId), 1);

    while (seeds.length) {
      const currentP = seeds[0];
      const result = this.regionQuery(data, currentP);

      if (result.length >= this.minPts) {
        for (const resultPointId of result) {
          if (this.labels[resultPointId] === this.unclassified || this.labels[resultPointId] === this.noise) {
            if (this.labels[resultPointId] === this.unclassified) {
              seeds.push(resultPointId);
            }
            this.labels[resultPointId] = clusterId;
          }
        }
      }

      seeds.splice(seeds.indexOf(currentP), 1);
    }

    return true;
  }

  regionQuery(data: number[][], pointId: number) {
    const neighbors: number[] = [];
    for (let id = 0; id < data.length; id++) {
      if (this.distance(data[pointId], data[id]) <= this.eps) {
        neighbors.push(id);
      }
    }
    return neighbors;
  }

  distance(point1: number[], point2: number[]) {
    const dy = point1[0] - point2[0]; // 이 부분이 distance 함수의 구체적인 계산 방식에 따라 변경될 수 있습니다.
    return Math.abs(dy);
  }
}

function extractTextFromOcr(jsonDrawBox: Box, jsonSmallBoxes: Boxes) {
  const a_t_l = jsonDrawBox[0]
  const a_t_r = jsonDrawBox[1]
  const a_b_r = jsonDrawBox[2]
  const a_b_l = jsonDrawBox[3]
  const selectedBoxes:Boxes = []
  let extractResultString = '';

  jsonSmallBoxes.forEach((box: Box) => {
    if (validationX(a_t_l, a_t_r, box) && validationY(a_t_l, a_b_l, box)) {
      selectedBoxes.push(box)
    }
  })

  const extractResult: ExtractResult = sortResultBoxes(selectedBoxes, getEps(selectedBoxes));

  if(extractResult && extractResult.length > 0) {
    extractResult.forEach((lineBoxes: Boxes) => {
      let lineString = ''
      lineBoxes.forEach((box: Box) => {
        if (StringUtil.isNotEmpty(lineString)){
          lineString = lineString+' '+box[5]
        }else{
          lineString += box[5]
        }
      });
      extractResultString = extractResultString + lineString + '\r\n'
    })
  }
  return extractResultString;
}

function getEps(selectedBoxes: Boxes) {
  let result = 20
  const heightArr: number[] = []
  if(selectedBoxes.length > 1) { // 작은 box가 2개부터 줄바꿈 필요함
    selectedBoxes.forEach((box: Box) => {
      heightArr.push(Math.abs(box[0][1]-box[3][1]))
    });
    result = getMedian(heightArr);
  }
  return result/2;
}

function getMedian(arr: number[]) {
  if (arr.length === 0) {
    return 20;
  }

  // 배열을 정렬합니다.
  const sortedArr = arr.slice().sort((a, b) => a - b);

  const mid = Math.floor(sortedArr.length / 2);

  // 배열의 길이가 홀수인 경우
  if (sortedArr.length % 2 !== 0) {
    return sortedArr[mid];
  }

  // 배열의 길이가 짝수인 경우
  return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

function sortResultBoxes(selectedBoxes: Boxes, eps: number, minPts = 1) {
  const dbscan = new Dbscan(eps, minPts);
  const coordinates = selectedBoxes.map((ocrResult: Box) => [(ocrResult[0][1]+ocrResult[3][1])/2]); // (b-t-l의 y좌표, b-b-l의 y좌표)/2
  const labels = dbscan.fit(coordinates);
  const clusteredLines: ExtractResult = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if (!clusteredLines[label]) {
      clusteredLines[label] = [];
    }
    clusteredLines[label].push(selectedBoxes[i]);
  }
  clusteredLines.sort((a, b) => a[0][0][1] - b[0][0][1]); // a,b clust, a[0] 첫번째 작은 박스, a[0][0] btl, , a[0][0][1] btl의 y좌표, 첫번째 box의 btl의 y좌표 순서대로 clust 정력
  clusteredLines.forEach(cluster => {
    cluster.sort((a, b) => a[0][0] - b[0][0]); // clust(line) 안에서 작은 b-t-l의 x 좌표로 가로줄 정렬
  });

  return clusteredLines;
}

function validationX(a_t_l: number[], a_t_r: number[], box: any) {
  // 가로 조건 : B-T-L or B-T-R 의 x 좌표가, A-T-L과 A-T-R 좌표 사이에 위치함
  const b_t_l = box[0]
  const b_t_r = box[1]
  const avgX = (b_t_l[0] + b_t_r[0])/2
  return (a_t_l[0] <= avgX && avgX <= a_t_r[0])
}

function validationY(a_t_l: number[], a_b_l: number[], box: any) {
  // 세로 조건 : B-T-L or B-B-L 의 Y 좌표가, A-T-L과 A-B-L 좌표 사이에 위치함
  const b_t_l = box[0]
  const b_b_l = box[3]
  const avgY = (b_t_l[1] + b_b_l[1])/2
  return (a_t_l[1] <= avgY && avgY <= a_b_l[1])
}

export default { extractTextFromOcr };