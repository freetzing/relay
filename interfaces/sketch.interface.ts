import {
  Geometry,
  InstanceConnector,
  InstanceViewSettings,
  TitleGeometry,
} from "../models/sketch.model";
import { IPoint, IProperty } from "./global.interface";

export interface IBezier {
  cp0: IPoint;
  cp1: IPoint;
}

export interface IPointBezierPair {
  point: IPoint;
  bezier: IBezier;
}

export interface IGeometry extends IPoint {
  z: number;
}

export interface ITransform {
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

export interface ITransformGeometry extends IGeometry {
  transform: ITransform;
}

export interface IWireGeometry extends IGeometry {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  wireFlags: number;
}

export interface ITitleGeometry extends IGeometry {
  visible: boolean;
  offsetX: number;
  offsetY: number;
  textColor: string;
  fontSize: string;
  visibleProperties: string[];
}

export interface IInstanceConnectorReference {
  id: string;
  modelIndex: number;
  layer: string;
}

export interface IInstanceConnector {
  id: string;
  layer: string;
  geometry: IGeometry;
  leg: IPointBezierPair[];
  connectsTo: IInstanceConnectorReference[];
}

export interface IInstanceViewSettings {
  name: string;
  layer: string;
  geometry: Geometry;
  titleGeometry: TitleGeometry;
  connectors: InstanceConnector[];
  bottom: boolean;
  locked: boolean;
  layerHidden: boolean;
}

export interface IWireExtras {
  mils: number;
  color: string;
  opacity: number;
  banded: boolean;
  bezier: IBezier;
}

export interface IWireInstanceViewSettings {
  wireExtras: IWireExtras;
}

export interface ILocalConnector {
  id: string;
  name: string;
}

export interface IInstance {
  moduleIdRef: string;
  modelIndex: string;
  path: string;
  properties: IProperty[] | any[];
  title: string;
  viewSettings: InstanceViewSettings[] | any[];
  text: string;
  flippedSMD: boolean;
  localConnectors: ILocalConnector[] | any[];
}

export interface IProgram {
  pid: string;
  language: string;
  author: string;
  path: string;
}

export interface IBoard {
  moduleId: string;
  title: string;
  instance: string;
  width: string;
  height: string;
}

export interface ISketchViewSettings {
  name: string;
  backgroundColor: string;
  gridSize: string;
  showGrid: boolean;
  alignToGrid: boolean;
  viewFromBelow: boolean;
}

export interface ISketchPCBViewSettings extends ISketchViewSettings {
  arHoleSize: string;
  arTraceWidth: string;
  arRingWidth: string;
  keepoutDRC: string;
  keepoutGPG: string;
}

export interface ISketch {
  fritzingVersion: string;
  programs: IProgram[];
  boards: IBoard[];
  viewSettings: ISketchViewSettings[];
  instances: IInstance[];
}
