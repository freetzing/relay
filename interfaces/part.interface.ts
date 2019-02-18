import { IProperty } from "./global.interface";

export interface IPartProperty extends IProperty {
    showInLabel: boolean;
}

export interface IPartLayer {
    id: string;
    sticky: boolean;
}

export interface IPartViewSettings {
    name: string;
    image: string;
    layers: IPartLayer[];
    flipHorizontal: boolean;
    flipVertical: boolean;
}
