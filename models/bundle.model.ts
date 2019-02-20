import ADMZip from "adm-zip";
import { PartBin } from "./bin.model";
import { Part } from "./part.model";
import { Sketch } from "./sketch.model";


/**
 * @classdesc A collection of "primary" Fritzing data and "auxiliary" resource files.
 * @callback Bundle~toFileCallback
 * @callback Bundle~fromFileCallback
 * @callback Bundle~isPrimaryCallback
 * @param {{fileName: string, model: object}} [primary = {}] A collection of Fritzing data referenced by file name.
 * @param {{fileName: string, fileContents: string}} [auxiliary = {}] A collection of resource files referenced by file name.
 * @param {toFileCallback} toFile Converts a Fritzing JavaScript model to its corresponding data file.
 * @param {fromFileCallback} fromFile Converts a data file to its corresponding Fritzing JavaScript model,
 * returning a Promise that will resolve to the generated model.
 * @param {isPrimaryCallback} isPrimary Returns whether or not a given file is classified as Fritzing data using file extensions.
 */
export class Bundle {
  public primary: {[key: string]: any};
  public auxiliary: {[key: string]: any};
  public toFile;
  public fromFile;
  public isPrimary;

  constructor(params: Bundle) {
    this.primary = params.primary || {};
    this.auxiliary = params.auxiliary || {};
    this.toFile = params.toFile;
    this.fromFile = params.fromFile;
    this.isPrimary = params.isPrimary;
  }
}
