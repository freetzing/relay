import ADMZip from "adm-zip";
import { Part } from "./part.model";

export class PartReference {
  public fileName: string;
  public part: Part;

  constructor(params?: PartReference) {
    this.fileName = params.fileName || "";
    this.part = params.part || new Part();
  }
}

/**
 * @classdesc A collection of {@link Part}s.
 * @param {{fileName: string, part: Part}} [parts = {}] A collection of {@link Part}s referenced by file name.
 */
export class PartBin {
  /**
   * @static
   * Returns the given PartBin as a zip file buffer
   * @param {PartBin} bin The given PartBin
   * @return {Buffer} The given PartBin as a zip file buffer
   */
  public static toFZB(bin: PartBin): Buffer {
    return bin.toFZB();
  }

  public parts: PartReference;

  constructor(params?: PartBin) {
    this.parts = params.parts || new PartReference();
  }

  /**
   * Returns the {@link Part} with the given file name.
   * @param {string} fileName The file name of the {@link Part}.
   * @return {Part} The {@link Part} with the given file name.
   */
  public getPart(fileName: string): Part {
    return this.parts[fileName];
  }

  /**
   * Adds a {@link Part} to this PartBin on the condition that another {@link Part} with the same file name does not already exist.
   * @param {string} fileName The file name of the {@link Part} to be added.
   * @param {Part} part The {@link Part} to be added.
   */
  public setPart(fileName: string, part: Part): void {
    this.parts[fileName] = part;
  }

  /**
   * Returns whether this PartBin has a {@link Part} with the given file name
   * @param {string} fileName The given file name to search for
   * @return {boolean} Whether this PartBin has a {@link Part} with the given file name
   */
  public hasPart(fileName: string): boolean {
    return this.parts.hasOwnProperty(fileName);
  }

  /**
   * Removes the {@link Part} with the given file name
   * @param {string} fileName The file name of the {@link Part}
   */
  public removePart(fileName: string): void {
    delete this.parts[fileName];
  }

  /**
   * Returns this PartBin as a zip file buffer
   * @return {Buffer} This PartBin as a zip file buffer
   */
  public toFZB(): Buffer {
    const partNames = Object.keys(this.parts);
    const fzb = new ADMZip();
    for (const partName of partNames) {
      fzb.addFile(partName + ".fzp", Buffer.from(this.parts[partName].toFZP()));
    }
    return fzb.toBuffer();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link PartBin} object converted from the given zip file buffer.
   * @param {Buffer} fzb A FZB zip file buffer.
   * @return {Promise} A Promise that resolves with a {@link PartBin} object converted from the given zip file buffer.
   */
  public fromFZB(fzb: Buffer): Promise<PartBin> {
    return new Promise((resolve, reject) => {
      const unzipped = new ADMZip(fzb);
      const entries = unzipped.getEntries();
      const parts = new PartBin();
      const promises = [];
      for (const entryItem of entries) {
        promises.push(new Promise((subresolve, subreject) => {
          unzipped.readAsTextAsync(entryItem, (data: string) => {
            if (data !== "") {
              parts[entryItem.entryName.split(".")[0]] = Part.fromFZP(data);
              subresolve();
            } else {
              subreject(new Error('There was an error while reading "' + entryItem.entryName + '" from the FZB file.'));
            }
          });
        }));
      }
      Promise.all(promises)
        .then(() => {
          resolve(new PartBin(parts));
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
