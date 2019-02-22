interface IBezier {
  cp0: IPoint;
  cp1: IPoint;
}

interface IPointBezierPair {
  point: IPoint;
  bezier: IBezier;
}

interface IGeometry extends IPoint {
  z: number;
}

interface ITransform {
  m11: number;
  m12: number;
  m13: number;
  m21: number;
  m22: number;
  m23: number;
  m31: number;
  m32: number;
  m33: number;
}

interface ITransformGeometry extends IGeometry {
  transform: ITransform;
}

interface IWireGeometry extends IGeometry {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  wireFlags: number;
}

interface ITitleGeometry extends IGeometry {
  visible: boolean;
  offsetX: number;
  offsetY: number;
  textColor: string;
  fontSize: string;
  visibleProperties: string[];
}

interface IInstanceConnectorReference {
  id: string;
  modelIndex: number;
  layer: string;
}

interface IInstanceConnector {
  id: string;
  layer: string;
  geometry: IGeometry;
  leg: IPointBezierPair[];
  connectsTo: IInstanceConnectorReference[];
}

interface IInstanceViewSettings {
  name: string;
  layer: string;
  geometry: IGeometry;
  titleGeometry: ITitleGeometry;
  connectors: IInstanceConnector[];
  bottom: boolean;
  locked: boolean;
  layerHidden: boolean;
}

interface IWireExtras {
  mils: number;
  color: string;
  opacity: number;
  banded: boolean;
  bezier: IBezier;
}

interface IWireInstanceViewSettings {
  wireExtras: IWireExtras;
}

interface ILocalConnector {
  id: string;
  name: string;
}

interface IInstance {
  moduleIdRef: string;
  modelIndex: string;
  path: string;
  properties: IProperty[] | any[];
  title: string;
  viewSettings: IInstanceViewSettings[] | any[];
  text: string;
  flippedSMD: boolean;
  localConnectors: ILocalConnector[] | any[];
}

interface IProgram {
  pid: string;
  language: string;
  author: string;
  path: string;
}

interface IBoard {
  moduleId: string;
  title: string;
  instance: string;
  width: string;
  height: string;
}

interface ISketchViewSettings {
  name: string;
  backgroundColor: string;
  gridSize: string;
  showGrid: boolean;
  alignToGrid: boolean;
  viewFromBelow: boolean;
}

interface ISketchPCBViewSettings extends ISketchViewSettings {
  arHoleSize: string;
  arTraceWidth: string;
  arRingWidth: string;
  keepoutDRC: string;
  keepoutGPG: string;
}

interface ISketch {
  fritzingVersion: string;
  programs: IProgram[];
  boards: IBoard[];
  viewSettings: ISketchViewSettings[];
  instances: IInstance[];
}
