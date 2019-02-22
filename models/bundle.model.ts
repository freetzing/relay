import ADMZip = require("adm-zip");
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
  /**
   * @static
   * Returns the given Bundle as a zip file buffer
   * @param {Bundle} bundle The given Bundle
   * @return {Buffer} The given Bundle as a zip file buffer
   */
  public static toZip(bundle: Bundle): Buffer {
    return bundle.toZip();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link Bundle} object converted from the given zip file buffer
   * @param {Buffer} zip A zip file buffer
   * @return {Promise} A Promise that resolves with a {@link Bundle} object converted from the given zip file buffer
   */
  public static fromZip(zip: Buffer): Promise<Bundle> {
    return new Promise((resolve, reject) => {
      const primaryData: {[key: string]: any} = {};
      const auxiliaryData: {[key: string]: any} = {};
      const promises: Array<Promise<{}>> = [];
      const unzipped = new ADMZip(zip);
      const entries = unzipped.getEntries();
      for (const entryItem of entries) {
        promises.push(new Promise((subresolve, subreject) => {
          if (new Bundle(null).isPrimary(entryItem)) {
            const data = entryItem.getData();
            if (data.length > 0) {
              new Bundle(null).fromFile(data).then((primaryObject: any) => {
                primaryData[entryItem.entryName] = primaryObject;
                subresolve();
              }).catch((err: any) => {
                subreject(err);
              });
            } else {
              reject(new Error('There was an error while reading "' + entryItem.entryName + '" from the bundle file.'));
            }
          } else {
            unzipped.readAsTextAsync(entryItem, (data: string) => {
              if (data !== "") {
                auxiliaryData[entryItem.entryName] = data;
                resolve();
              } else {
                reject(new Error('There was an error while reading "' + entryItem.entryName + '" from the bundle file.'));
              }
            });
          }
        }));
      }

      Promise.all(promises)
        .then(() => {
          // Not sure if that was the purpose of this line.
          resolve(new Bundle({primary: primaryData, auxiliary: auxiliaryData} as Bundle));
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  public primary: {[key: string]: any};
  public auxiliary: {[key: string]: any};
  public toFile: (name: any) => any;
  public fromFile: (name: any) => any;
  public isPrimary: (name: any) => any;

  constructor(params: Bundle) {
    this.primary = params.primary || {};
    this.auxiliary = params.auxiliary || {};
    this.toFile = params.toFile;
    this.fromFile = params.fromFile;
    this.isPrimary = params.isPrimary;
  }

  /**
   * Returns the primary with the given file name
   * @param {string} fileName The file name of the primary
   * @return {object} The primary with the given file name
   */
  public getPrimary(fileName: string): any {
    return this.primary[fileName];
  }

  /**
   * Adds a primary to this Bundle on the condition that another primary with the same file name does not already exist
   * @param {string} fileName The file name of the primary to be added
   * @param {object} primary The primary to be added
   */
  public setPrimary(fileName: string, primary: object): void {
    this.primary[fileName] = primary;
  }

  /**
   * Returns whether this Bundle has a primary with the given file name
   * @param {string} fileName The given file name to search for
   * @return {boolean} Whether this Bundle has a primary with the given file name
   */
  public hasPrimary(fileName: string): boolean {
    return this.primary.hasOwnProperty(fileName);
  }

  /**
   * Removes the primary with the given file name
   * @param {string} fileName The file name of the primary
   */
  public removePrimary(fileName: string): void {
    delete this.primary[fileName];
  }

  /**
   * Returns this Bundle as a zip file buffer
   * @return {Buffer} This Bundle as a zip file buffer
   */
  public toZip(): Buffer {
    const zip = new ADMZip();
    for (const primaryFile of Object.keys(this.primary)) {
      zip.addFile(primaryFile, Buffer.from(this.toFile(this.primary[primaryFile])));
    }
    for (const auxiliaryFile of Object.keys(this.auxiliary)) {
      zip.addFile(auxiliaryFile, Buffer.from(this.toFile(this.primary[auxiliaryFile])));
    }
    return zip.toBuffer();
  }

}

/**
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link Sketch}es and their auxiliary files
 * @param {{fileName: string, model: Sketch}} primary A collection of {@link Sketch}es
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link Sketch}es
 */
export class SketchBundle extends Bundle {

  public static toFile(sketch: Sketch): string {
    return sketch.toFZ();
  }

  /**
   * @static
   * Returns the given SketchBundle as a zip file buffer
   * @param {SketchBundle} sketchBundle The given SketchBundle
   */
  public static toFZZ(sketchBundle: SketchBundle): Buffer {
    return sketchBundle.toFZZ();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link SketchBundle} object converted from the given zip file buffer
   * @param {Buffer} fzz A FZZ zip file buffer
   */
  public static fromFZZ(fzz: Buffer): Promise<Bundle> {
    return Bundle.fromZip(fzz);
  }

  constructor(params: SketchBundle) {
    super(params);
  }

  /**
   * Returns the {@link Sketch} with the given file name
   * @param {string} fileName The file name of the {@link Sketch}
   * @return {Sketch} The {@link Sketch} with the given file name
   */
  public getSketch(fileName: string): Sketch {
    return this.getPrimary(fileName);
  }

  /**
   * Adds a {@link Sketch} to this SketchBundle on the condition that another {@link Sketch} with the same file name does not already exist
   * @param {string} fileName The file name of the {@link Sketch} to be added
   * @param {Sketch} sketch The {@link Sketch} to be added
   */
  public setSketch(fileName: string, sketch: Sketch): void {
    this.setPrimary(fileName, sketch);
  }

  /**
   * Returns whether this SketchBundle has a {@link Sketch} with the given file name
   * @param {string} fileName The given file name to search for
   * @return {boolean} Whether this SketchBundle has a {@link Sketch} with the given file name
   */
  public hasSketch(fileName: string): boolean {
    return this.hasPrimary(fileName);
  }

  /**
   * Removes the {@link Sketch} with the given file name
   * @param {string} fileName The file name of the {@link Sketch}
   */
  public removeSketch(fileName: string): void {
    this.removePrimary(fileName);
  }

  public fromFile = (data: Buffer) => {
    Sketch.fromFZ(data.toString());
  }

  public isPrimary = (entryName: string) => {
    entryName.endsWith(".fz");
  }

  /**
   * Returns this SketchBundle as a zip file buffer
   */
  public toFZZ(): Buffer {
    return this.toZip();
  }

}

/**
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link Part}s and their auxiliary files
 * @param {{fileName: string, model: Part}} primary A collection of {@link Part}s
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link Part}s
 */
export class PartBundle extends Bundle {
  public static toFile(part: Part): any {
    return part.toFZP();
  }

  /**
   * @static
   * Returns the given PartBundle as a zip file buffer
   * @param {PartBundle} partBundle The given PartBundle
   */
  public static toFZPZ(partBundle: PartBundle): Buffer {
    return partBundle.toFZPZ();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link PartBundle} object converted from the given zip file buffer
   * @param {Buffer} fzpz A FZP zip file buffer
   */
  public static fromFZPZ(fzpz: Buffer): Promise<Bundle> {
    return Bundle.fromZip(fzpz);
  }

  constructor(params: PartBundle) {
    super(params);
  }

  /**
   * Returns the {@link Part} with the given file name
   * @param {string} fileName The file name of the {@link Part}
   * @return {Part} The {@link Part} with the given file name
   */
  public getPart(fileName: string): Part {
    return this.getPrimary(fileName);
  }

  /**
   * Adds a {@link Part} to this PartBundle on the condition that another {@link Part} with the same file name does not already exist
   * @param {string} fileName The file name of the {@link Part} to be added
   * @param {Part} part The {@link Part} to be added
   */
  public setPart(fileName: string, part: Part): void {
    this.setPrimary(fileName, part);
  }

  /**
   * Returns whether this PartBundle has a {@link Part} with the given file name
   * @param {string} fileName The given file name to search for
   * @return {boolean} Whether this PartBundle has a {@link Part} with the given file name
   */
  public hasPart(fileName: string): boolean {
    return this.hasPrimary(fileName);
  }

  /**
   * Removes the {@link Part} with the given file name
   * @param {string} fileName The file name of the {@link Part}
   */
  public removePart(fileName: string): void {
    this.removePrimary(fileName);
  }

  public fromFile = (data: Buffer) => {
    return Part.fromFZP(data.toString());
  }

  public isPrimary = (entryName: string) => {
    return entryName.endsWith(".fzp");
  }

  /**
   * Returns this PartBundle as a zip file buffer
   */
  public toFZPZ(): Buffer {
    return this.toZip();
  }

}

/**
 * @extends Bundle
 * @classdesc A {@link Bundle} of {@link PartBin}s and their auxiliary files
 * @param {{fileName: string, model: PartBinBundle}} primary A collection of {@link PartBin}s
 * @param {{fileName: string, fileContents: string}} auxiliary A collection of auxiliary files for {@link PartBin}s
 */
export class PartBinBundle extends Bundle {

  public static toFile(bin: PartBin): Buffer {
    return bin.toFZB();
  }

  /**
   * @static
   * Returns the given PartBinBundle as a zip file buffer
   * @param {PartBinBundle} partBinBundle The given PartBinBundle
   */
  public static toFZBZ(partBinBundle: PartBinBundle): Buffer {
    return partBinBundle.toFZBZ();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link PartBinBundle} object converted from the given zip file buffer
   * @param {Buffer} fzbz A FZBZ zip file buffer
   */
  public static fromFZBZ(fzbz: Buffer): Promise<Bundle> {
    return Bundle.fromZip(fzbz);
  }

  constructor(params: PartBinBundle) {
    super(params);
  }

  /**
   * Returns the {@link PartBin} with the given file name
   * @param {string} fileName The file name of the {@link PartBin}
   * @return {PartBin} The {@link PartBin} with the given file name
   */
  public getPartBin(fileName: string): PartBin {
    return this.getPrimary(fileName);
  }

  /**
   * Adds a {@link PartBin} to this PartBinBundle on the condition that another {@link PartBin} with the same file name does not already exist
   * @param {string} fileName The file name of the {@link PartBin} to be added
   * @param {PartBin} bin The {@link PartBin} to be added
   */
  public setPartBin(fileName: string, bin: PartBin): void {
    this.setPrimary(fileName, bin);
  }

  /**
   * Returns whether this PartBinBundle has a {@link PartBin} with the given file name
   * @param {string} fileName The given file name to search for
   * @return {boolean} Whether this PartBinBundle has a {@link PartBin} with the given file name
   */
  public hasPartBin(fileName: string): boolean {
    return this.hasPrimary(fileName);
  }

  /**
   * Removes the {@link PartBin} with the given file name
   * @param {string} fileName The file name of the {@link PartBin}
   */
  public removePartBin(fileName: string): void {
    this.removePrimary(fileName);
  }

  public fromFile = (data: Buffer) => {
    return PartBin.fromFZB(data);
  }

  public isPrimary = (entryName: string) => {
    return entryName.endsWith(".fzb");
  }

  /**
   * Returns this PartBinBundle as a zip file buffer
   */
  public toFZBZ(): Buffer {
    return this.toZip();
  }

}
