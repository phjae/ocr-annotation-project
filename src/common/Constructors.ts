import {ContentData, Rectangle, TestCase} from "./Types";
import {convertStringToNumberPairs, getBoxDimensions} from "./RectangleUtil";

export class UserConstructor{
  userId?:number;
  compId?: number;
  role:string;
  account:string;
  password:string;
  name:string;
  email: string;
  empNo: string;
  mobileNo: string;
  activeStatus: string;

  constructor(
      userId:number,
      compId: number,
      role:string,
      account:string,
      password:string,
      name:string,
      email: string,
      empNo: string,
      mobileNo: string,
      activeStatus: string,
  ) {
    this.userId = userId;
    this.compId = compId;
    this.role = role;
    this.account = account;
    this.password = password;
    this.name = name;
    this.email = email;
    this.empNo = empNo;
    this.mobileNo = mobileNo;
    this.activeStatus = activeStatus;
  }
}

export class UserPasswordConstructor{
  userId : number;
  password: string;

  constructor(
      userId:number,
      password:string
  ) {
    this.userId = userId;
    this.password = password;
  }
}

export class TestSuiteConstructor {
  id?: number;
  name: string;
  domainType: string;
  projectId: number;
  testCaseList: TestCase[];

  constructor(
    id: number,
    name: string,
    domainType: string,
    projectId: number,
    testCaseList: TestCase[],
  ) {
    this.id = id;
    this.name = name;
    this.domainType = domainType;
    this.projectId = projectId;
    this.testCaseList = testCaseList;
  }
}

export class TestExecutionConstructor {
  id: number;
  deviceId: number;

  constructor(
    id: number,
    deviceId: number,
  ) {
    this.id = id;
    this.deviceId = deviceId;
  }
}

export class ModelGenerateConstructor {
  id: number;

  constructor(
      id: number,
  ) {
    this.id = id;
  }
}

export class TestExecutionSaveConstructor {
  id?: number;
  name: string;
  executionType: string;
  domainType: string;
  projectId: number;
  testSuiteId?: number;
  testCaseList: TestCase[];

  constructor(
    id: number,
    name: string,
    executionType: string,
    domainType: string,
    projectId: number,
    testSuiteId: number,
    testCaseList: TestCase[],
  ) {
    this.id = id;
    this.name = name;
    this.executionType = executionType;
    this.domainType = domainType;
    this.projectId = projectId;
    this.testSuiteId = testSuiteId;
    this.testCaseList = testCaseList;

  }
}

export class MLPerfExecutionSaveConstructor {
  id?: number;
  name: string;
  domainType: string;
  projectId: number;
  testCase: TestCase;

  constructor(
      id: number,
      name: string,
      domainType: string,
      projectId: number,
      testCase: TestCase,
  ) {
    this.id = id;
    this.name = name;
    this.domainType = domainType;
    this.projectId = projectId;
    this.testCase = testCase;

  }
}

export class PowerExecutionSaveConstructor {
  id?: number;
  name: string;
  domainType: string;
  projectId: number;
  duration: number;
  interval: number;

  constructor(
      id: number,
      name: string,
      domainType: string,
      projectId: number,
      duration: number,
      interval: number
  ) {
    this.id = id;
    this.name = name;
    this.domainType = domainType;
    this.projectId = projectId;
    this.duration = duration;
    this.interval = interval;

  }
}


export class ModelGenExecutionConstructor {
  id?: number;
  name: string;
  genType: string;
  deviceId: number;
  deviceName: string;
  type: string;
  generateMethod: string;
  inputShape: string;
  iterCnt: number;
  code?: string;

  constructor(
      id: number,
      name: string,
      genType: string,
      deviceId: number,
      deviceName: string,
      type: string,
      generateMethod: string,
      inputShape: string,
      iterCnt: number,
      code: string
  ) {
    this.id = id;
    this.name = name;
    this.genType = genType;
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.type = type;
    this.generateMethod = generateMethod;
    this.inputShape = inputShape;
    this.iterCnt = iterCnt;
    this.code = code;
  }
}

export class CurrentModelTestConstructor {
  modelId: number;
  refDeviceId: number;
  constructor(
      modelId: number,
      refDeviceId: number
  ) {
    this.modelId = modelId;
    this.refDeviceId = refDeviceId;
  }
}
export class NoticeConstructor {
  id?: number;
  title: string;
  content: string;
  type: string;
  state: boolean;

  constructor(
      id: number,
      title: string,
      content: string,
      type: string,
      state:boolean,
  ) {
    this.id = id
    this.title = title;
    this.content = content;
    this.type = type;
    this.state = state
  }
}

export class DeviceConfigConstructor {
  deviceId?: number;
  deviceType: string;
  nodeId?: number;
  pduId: string;
  deviceName: string;
  serialNo: string;
  acceleratorActive?: boolean;
  acceleratorCnt?: number;
  buildType: string;
  deviceProductName: string;
  vendorId?: string;
  productId?: string;
  ttyUSBSyLink?: string;
  fusingImage?: string;
  interfaceType: string;
  serialCableKeyNo?: string;
  usable: string;
  containerIp: string;
  dutIp: string;
  pduSlot: string;
  sshExternalPort: string;

  constructor(
      deviceId: number,
      deviceType: string,
      nodeId: number,
      pduId: string,
      deviceName: string,
      serialNo: string,
      acceleratorActive: boolean,
      acceleratorCnt: number,
      buildType: string,
      deviceProductName: string,
      vendorId: string,
      productId: string,
      ttyUSBSyLink: string,
      fusingImage: string,
      interfaceType: string,
      serialCableKeyNo: string,
      usable: string,
      containerIp: string,
      dutIp: string,
      pduSlot: string,
      sshExternalPort: string,
  ) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.nodeId = nodeId;
    this.pduId = pduId;
    this.deviceName = deviceName;
    this.serialNo = serialNo;
    this.acceleratorActive = acceleratorActive;
    this.acceleratorCnt = acceleratorCnt;
    this.buildType = buildType;
    this.deviceProductName = deviceProductName;
    this.vendorId = vendorId;
    this.productId = productId;
    this.ttyUSBSyLink = ttyUSBSyLink;
    this.fusingImage = fusingImage;
    this.interfaceType = interfaceType;
    this.serialCableKeyNo = serialCableKeyNo;
    this.usable = usable;
    this.containerIp = containerIp;
    this.dutIp = dutIp;
    this.pduSlot = pduSlot;
    this.sshExternalPort = sshExternalPort;
  }
}
export class NodeConstructor{
  nodeId:number
  nodeType:string
  nodeName:string
  description:string
  userName:string
  farmId:string
  nodeIp:string
  availability:string

  constructor(
      nodeId:number,
      nodeType:string,
      nodeName:string,
      description:string,
      userName:string,
      farmId:string,
      nodeIp:string,
      availability:string) {
    this.nodeId = nodeId
    this.nodeType = nodeType
    this.nodeName = nodeName;
    this.description = description;
    this.userName = userName;
    this.farmId = farmId;
    this.nodeIp = nodeIp;
    this.availability = availability;
  }
}

export class PduConstructor{
  pduId:number
  pduName:string
  description:string
  farmId:string
  pduIp:string
  slotCnt:string

  constructor(
      pduId:number,
      pduName:string,
      description:string,
      farmId:string,
      pduIp:string,
      slotCnt:string) {
    this.pduId = pduId
    this.pduName = pduName;
    this.description = description;
    this.farmId = farmId;
    this.pduIp = pduIp;
    this.slotCnt = slotCnt;
  }
}
export class FarmConstructor{
  id:number
  name:string
  description:string
  unitCnt:number

  constructor(
      id:number,
      name:string,
      description:string,
      unitCnt:number) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.unitCnt = unitCnt
  }
}

